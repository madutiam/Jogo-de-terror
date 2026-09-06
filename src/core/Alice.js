/**
 * A Alice jogavel — movimento livre no plano do chao, com profundidade.
 *
 * Como funciona:
 *   - a posicao (x, y) da Alice e o ponto do CHAO onde ela pisa;
 *   - andar para cima na tela = se afastar da camera;
 *   - o tamanho dela vem da profundidade (`escalaPorProfundidade`);
 *   - a ordem de desenho tambem: quem esta mais para a frente cobre quem esta
 *     atras;
 *   - o pulo mora num eixo separado (`altura`), que so levanta o desenho e
 *     encolhe a sombra. E o que deixa ela subir na mobilia sem o jogo virar
 *     plataforma.
 *
 * Por isso a Alice e composta de tres partes:
 *   `this`         — colisor invisivel, do tamanho dos pes, no plano do chao
 *   `this.visual`  — o desenho, posicionado acima dos pes
 *   `this.sombra`  — a sombra no chao, que da o peso e mostra onde ela vai cair
 *
 * ---------------------------------------------------------------------------
 * OS DOIS TAMANHOS (roteiro, secao 7)
 *
 * A Alice pequena NAO e a Alice normal reduzida. Ela tem desenho proprio, feito
 * na mesma folha da normal, ja na proporcao certa — 52% da altura. Encolher
 * troca o CONJUNTO DE QUADROS, a pegada dos pes e a forca do pulo. Nenhum
 * desenho e esticado em momento nenhum.
 *
 * A consequencia de jogo e a que o roteiro pede: pequena passa onde a normal
 * nao cabe, e normal alcanca onde a pequena nao chega.
 * ---------------------------------------------------------------------------
 *
 * Regras que este arquivo faz cumprir:
 *  27/52 — nada de deslizar, flutuar ou olhar para o lado errado
 *     28 — a textura vem do sprite direcional certo; so espelha onde a artista
 *          nao desenhou o outro lado, e nunca contra o sentido do movimento
 *      3 — sem a pose, usa o quadro existente mais proximo SEM deformar, e
 *          registra o pedido em MissingAssets
 */

import {
  PHYSICS,
  ALICE_ANIM,
  ALICE_QUADROS,
  ALICE_COMER_MS,
  ALICE_TAMANHO,
  ALICE_TRANSICAO_MS,
  ALICE_SPRITE,
  ALICE_STATE,
  IDLE_FRONT_DELAY,
  IFRAMES,
  escalaPorProfundidade,
  profundidadeDeDesenho,
} from './constants.js';
import { pedirAsset } from './MissingAssets.js';
import { AudioManager } from './AudioManager.js';

/** Nome da textura de um quadro. */
export function quadro(linha, indice) {
  return 'alice/' + linha + '-' + indice;
}

export class Alice extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} cena
   * @param {number} x
   * @param {number} y  ponto do chao onde ela pisa
   * @param {{terreno?: string, tamanho?: string}} opcoes
   */
  constructor(cena, x, y, opcoes = {}) {
    super(cena, x, y, quadro('grande-parada', 0));

    cena.add.existing(this);
    cena.physics.add.existing(this);

    this.tamanho = ALICE_TAMANHO[opcoes.tamanho || 'normal'];

    // O colisor e so a pegada: invisivel e do tamanho dos pes.
    this.setVisible(false);
    this.setOrigin(0.5, 0.5);
    this.body.setDragX(PHYSICS.DRAG);
    this.body.setDragY(PHYSICS.DRAG);
    this.setCollideWorldBounds(true);
    this.aplicarPegada();

    // Sombra: elipse escura no chao. Nao e um personagem inventado, e
    // iluminacao — e sem ela ninguem entende onde a Alice esta pisando.
    this.sombra = cena.add.ellipse(x, y, 1, 1, 0x000000, 0.42);

    // O desenho, apoiado nos pes.
    this.visual = cena.add
      .image(x, y, quadro('grande-parada', 0))
      .setOrigin(0.5, 1);

    /** 'madeira' | 'floresta' | 'xadrez' — decide o som dos passos. */
    this.terreno = opcoes.terreno || 'madeira';

    this.estado = ALICE_STATE.IDLE;
    this.texturaAtual = null;
    /** Ultima direcao com componente horizontal: 1 direita, -1 esquerda. */
    this.olhandoPara = 1;
    /** Ultima direcao andada, como vetor. */
    this.direcao = new Phaser.Math.Vector2(0, 1);

    /** Eixo do pulo: altura acima do chao e velocidade nesse eixo. */
    this.altura = 0;
    this.velocidadeAltura = 0;
    /** Altura do chao sob os pes (0 = piso; mais que isso = em cima de algo). */
    this.pisoAtual = 0;
    /** Altura que o pulo em curso vai atingir. Escolhe o quadro no ar. */
    this.apiceDoPulo = 1;

    this.paradaDesde = 0;
    this.puloPedidoEm = -9999;
    this.aterrissouEm = -9999;
    this.estavaNoChao = true;

    this.invulneravelAte = 0;
    this.controlavel = true;
    this.ofegante = false;

    /** Animacao de uma vez so em curso (pegar, dano, mudar de tamanho). */
    this.gesto = null;
    this.passosTocando = null;

    this.atualizarVisual();
  }

  // ------------------------------------------------------------------ tamanho

  get pequena() {
    return this.tamanho.id === 'pequena';
  }

  /**
   * Conjunto de animacoes do tamanho atual.
   *
   * NAO chamar isto de `anims`: `anims` ja e o controlador de animacao do
   * proprio Phaser, herdado do Sprite. Sombreando ele, `destroy()` chamava
   * `this.anims.destroy()` num objeto de dados comum e estourava — o jogo
   * inteiro ficava preto ao trocar de cena.
   */
  get animacoes() {
    return ALICE_ANIM[this.tamanho.id];
  }

  /**
   * A colisao acompanha o tamanho. Sem isto, a Alice pequena continuaria com a
   * pegada da grande e nao passaria por baixo de nada — a mecanica inteira
   * seria so um desenho menor.
   */
  aplicarPegada() {
    const pes = this.tamanho.pes;
    this.body.setSize(pes.W, pes.H);
    this.body.setOffset(
      (ALICE_SPRITE.W - pes.W) / 2,
      ALICE_SPRITE.H - pes.H / 2 - ALICE_SPRITE.H / 2
    );
  }

  /**
   * Come um biscoito. `alvo` e 'normal' ou 'pequena'.
   *
   * O controle sai da mao do jogador enquanto a transicao roda — sao 8 quadros
   * desenhados para isso, e crescer e a mesma sequencia de tras para a frente.
   * Devolve uma Promise que fecha quando ela termina de mudar.
   */
  /**
   * COMER O BISCOITO
   *
   * Sao DOIS gestos, nesta ordem: ela tira o biscoito e come (8 quadros), e so
   * entao o corpo muda (8 quadros). Antes so existia o segundo — o biscoito
   * mudava o tamanho sem que ninguem a visse comer, e por isso lia como atalho
   * de teclado em vez de objeto.
   *
   * Cada vidro tem a propria sequencia: no SHRINK ela encolhe os ombros ao
   * engolir, no GROW ela se estica. Sao desenhos diferentes.
   */
  comerBiscoito(alvo) {
    const novo = ALICE_TAMANHO[alvo];
    if (!novo || novo.id === this.tamanho.id) return Promise.resolve(false);

    const anim = novo.id === 'pequena' ? ALICE_ANIM.comeShrink : ALICE_ANIM.comeGrow;

    this.controlavel = false;
    this.estado = ALICE_STATE.TAMANHO;
    this.body.setVelocity(0, 0);
    this.body.setAcceleration(0, 0);
    this.pararPassos();
    AudioManager.tocar('efeito.item');

    return new Promise((resolver) => {
      this.gesto = {
        anim,
        total: ALICE_QUADROS[anim.linha],
        inicio: this.scene.time.now,
        duracao: ALICE_COMER_MS,
        aoTerminar: () => resolver(true),
      };
      // O corpo so comeca a mudar depois que ela engole.
    }).then(() => this.mudarTamanho(alvo, 'efeito.roupa'));
  }

  /**
   * `som` e dito por quem chama porque o gesto de comer ja gastou o
   * `efeito.item` na mordida: repetir o mesmo som na mudanca do corpo soaria
   * como dois itens coletados em vez de uma coisa acontecendo com ela.
   */
  mudarTamanho(alvo, som = 'efeito.item') {
    const novo = ALICE_TAMANHO[alvo];
    if (!novo || novo.id === this.tamanho.id) return Promise.resolve(false);

    const encolhendo = novo.id === 'pequena';
    const anim = ALICE_ANIM.transicao;

    this.controlavel = false;
    this.estado = ALICE_STATE.TAMANHO;
    this.body.setVelocity(0, 0);
    this.body.setAcceleration(0, 0);
    this.pararPassos();
    AudioManager.tocar(som);

    return new Promise((resolver) => {
      this.gesto = {
        anim,
        total: ALICE_QUADROS[anim.linha],
        inicio: this.scene.time.now,
        duracao: ALICE_TRANSICAO_MS,
        invertido: !encolhendo,
        aoTerminar: () => {
          this.tamanho = novo;
          this.aplicarPegada();
          this.controlavel = true;
          resolver(true);
        },
      };
    });
  }

  // ------------------------------------------------------------------ texturas

  /** Troca a textura. Espelha apenas quando a animacao pede. */
  usarQuadro(chave, espelhar) {
    if (this.texturaAtual !== chave) {
      this.texturaAtual = chave;
      this.visual.setTexture(chave);
    }
    this.visual.setFlipX(!!espelhar);
  }

  /**
   * Escolhe a animacao pela direcao andada.
   * O eixo dominante manda: andando mais para os lados usa o perfil; indo para
   * o fundo usa o ciclo de costas; vindo para a frente usa o desenho de frente.
   *
   * @param {string} prefixo 'anda' | 'corre' | 'pula' | 'pega'
   */
  animacaoDirecional(prefixo, dx, dy) {
    const a = this.animacoes;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx < 0 ? a[prefixo + 'Esq'] : a[prefixo + 'Dir'];
    }
    return dy < 0 ? a[prefixo + 'Costas'] : a[prefixo + 'Frente'];
  }

  /** Quantos quadros uma animacao tem. */
  totalDe(anim) {
    return anim.quadros ? anim.quadros.length : ALICE_QUADROS[anim.linha];
  }

  registrarFalta(anim) {
    if (anim.falta) {
      pedirAsset('Alice', anim.falta, anim.falta, 'quadro existente mais proximo');
    }
  }

  /** Aplica uma animacao ciclica, avancando pelo relogio. */
  tocarCiclo(anim) {
    if (!anim) return;
    this.registrarFalta(anim);

    const total = this.totalDe(anim);
    const passo = Math.floor(this.scene.time.now / (anim.ms || 120)) % total;
    const indice = anim.quadros ? anim.quadros[passo] : passo;

    this.usarQuadro(quadro(anim.linha, indice), anim.espelhar);
  }

  /**
   * Aplica uma animacao de PULO: o quadro sai da altura, nao do relogio.
   * Subindo mostra os primeiros quadros; caindo, os ultimos. E o que faz o
   * salto parecer ter peso em vez de rodar um laco no ar.
   */
  tocarPorAltura(anim) {
    if (!anim) return;
    this.registrarFalta(anim);

    const total = this.totalDe(anim);
    const acima = Math.max(0, this.altura - this.pisoAtual);
    const t = Phaser.Math.Clamp(acima / Math.max(1, this.apiceDoPulo), 0, 1);

    const passo = this.velocidadeAltura >= 0
      ? Math.round(t * (total - 1) * 0.5)
      : Math.round((total - 1) * (1 - t * 0.5));
    const limitado = Phaser.Math.Clamp(passo, 0, total - 1);
    const indice = anim.quadros ? anim.quadros[limitado] : limitado;

    this.usarQuadro(quadro(anim.linha, indice), anim.espelhar);
  }

  /** Avanca um gesto de uma vez so. Devolve true enquanto ele durar. */
  avancarGesto(tempo) {
    const g = this.gesto;
    if (!g) return false;

    const t = Phaser.Math.Clamp((tempo - g.inicio) / g.duracao, 0, 1);
    const passo = Phaser.Math.Clamp(Math.floor(t * g.total), 0, g.total - 1);
    const ordem = g.invertido ? g.total - 1 - passo : passo;
    const indice = g.anim.quadros ? g.anim.quadros[ordem] : ordem;

    this.usarQuadro(quadro(g.anim.linha, indice), g.anim.espelhar);

    if (t < 1) return true;

    this.gesto = null;
    if (g.aoTerminar) g.aoTerminar();
    return false;
  }

  /** Toca a animacao de pegar item, na direcao em que ela esta olhando. */
  pegarItem() {
    const anim = this.animacaoDirecional('pega', this.direcao.x, this.direcao.y);
    if (!anim) return Promise.resolve();

    this.controlavel = false;
    this.body.setVelocity(0, 0);
    const total = this.totalDe(anim);

    return new Promise((resolver) => {
      this.gesto = {
        anim,
        total,
        inicio: this.scene.time.now,
        duracao: (anim.ms || 110) * total,
        invertido: false,
        aoTerminar: () => { this.controlavel = true; resolver(); },
      };
    });
  }

  get noChao() {
    return this.altura <= this.pisoAtual + 0.5;
  }

  // ---------------------------------------------------------------- movimentar

  /**
   * @param {import('./InputManager.js').InputManager} input
   * @param {number} tempo  now em ms
   */
  controlar(input, tempo) {
    const corpo = this.body;

    // Gesto em curso (pegar, dano, encolher) manda em tudo.
    if (this.avancarGesto(tempo)) {
      corpo.setAcceleration(0, 0);
      this.atualizarAltura(tempo);
      this.atualizarPassos(0, 0, false);
      this.atualizarVisual();
      return;
    }

    if (!this.controlavel) {
      corpo.setAcceleration(0, 0);
      corpo.setVelocity(0, 0);
      this.atualizarAltura(tempo);
      this.atualizarEstado(tempo, 0, 0, false);
      this.atualizarPassos(0, 0, false);
      this.atualizarVisual();
      return;
    }

    // ---- chao ----
    const eixoX = input.eixoX;
    const eixoY = input.eixoY;
    const intensidade = input.intensidade;
    const andando = eixoX !== 0 || eixoY !== 0;
    const correndo = input.correndo && andando;

    if (andando) {
      // Normaliza para a diagonal nao ser mais rapida que a linha reta.
      const direcao = new Phaser.Math.Vector2(eixoX, eixoY).normalize();
      const base = correndo ? PHYSICS.RUN_SPEED : PHYSICS.WALK_SPEED;
      const velocidade = base * intensidade * this.tamanho.passo;

      corpo.setAcceleration(
        direcao.x * PHYSICS.ACCELERATION,
        direcao.y * PHYSICS.ACCELERATION
      );
      corpo.setMaxVelocity(velocidade, velocidade);

      this.direcao.set(direcao.x, direcao.y);
      if (direcao.x !== 0) this.olhandoPara = Math.sign(direcao.x);
    } else {
      corpo.setAcceleration(0, 0);
      corpo.setMaxVelocity(PHYSICS.RUN_SPEED, PHYSICS.RUN_SPEED);
      // Freia de verdade: sem rastro de deslizamento.
      if (corpo.velocity.length() < 14) corpo.setVelocity(0, 0);
    }

    // ---- pulo ----
    if (input.consumirPulo()) this.puloPedidoEm = tempo;

    const puloNaJanela = tempo - this.puloPedidoEm <= PHYSICS.JUMP_BUFFER;
    if (puloNaJanela && this.noChao) this.pular(tempo);

    if (this.velocidadeAltura > 0 && !input.pulandoSegurado) {
      this.velocidadeAltura *= PHYSICS.JUMP_CUT;
    }

    this.atualizarAltura(tempo);
    this.atualizarEstado(tempo, eixoX, eixoY, correndo);
    this.atualizarPassos(eixoX, eixoY, correndo);
    this.atualizarVisual();
  }

  pular(tempo) {
    const impulso = PHYSICS.IMPULSO_PULO * this.tamanho.impulso;
    this.velocidadeAltura = impulso;
    this.puloPedidoEm = -9999;

    // Altura que este pulo vai atingir, para o quadro no ar sair certo.
    this.apiceDoPulo = (impulso * impulso) / (2 * PHYSICS.GRAVIDADE_PULO);

    AudioManager.tocar('efeito.pulo');
  }

  /** Integra o eixo de altura e detecta a aterrissagem. */
  atualizarAltura(tempo) {
    const dt = this.scene.game.loop.delta / 1000;

    if (!this.noChao || this.velocidadeAltura > 0) {
      this.velocidadeAltura -= PHYSICS.GRAVIDADE_PULO * dt;
      this.altura += this.velocidadeAltura * dt;
    }

    if (this.altura <= this.pisoAtual) {
      const estavaNoAr = !this.estavaNoChao;
      this.altura = this.pisoAtual;
      this.velocidadeAltura = 0;
      if (estavaNoAr) this.aoAterrissar(tempo);
      this.estavaNoChao = true;
    } else {
      this.estavaNoChao = false;
    }
  }

  aoAterrissar(tempo) {
    this.aterrissouEm = tempo;
    AudioManager.tocar('efeito.aterrissagem');
  }

  // ------------------------------------------------------------------- estados

  atualizarEstado(tempo, eixoX, eixoY, correndo) {
    const andando = eixoX !== 0 || eixoY !== 0;

    if (!this.noChao) {
      this.estado = this.velocidadeAltura > 0 ? ALICE_STATE.JUMP : ALICE_STATE.FALL;
      this.tocarPorAltura(
        this.animacaoDirecional('pula', this.direcao.x, this.direcao.y)
      );
      return;
    }

    if (andando) {
      this.paradaDesde = 0;
      this.estado = correndo ? ALICE_STATE.RUN : ALICE_STATE.WALK;
      this.tocarCiclo(
        this.animacaoDirecional(correndo ? 'corre' : 'anda', eixoX, eixoY)
      );
      return;
    }

    // ---- parada ----
    this.estado = this.ofegante ? ALICE_STATE.BREATHLESS : ALICE_STATE.IDLE;
    if (this.paradaDesde === 0) this.paradaDesde = tempo;

    if (this.ofegante) {
      this.tocarCiclo(this.animacoes.ofegante);
      return;
    }

    // Parada olhando para o fundo: existe desenho para isso, entao ela FICA
    // de costas. Virar para a camera aqui seria ela girar sozinha.
    const olhandoParaOFundo =
      this.direcao.y < 0 && Math.abs(this.direcao.y) > Math.abs(this.direcao.x);

    if (olhandoParaOFundo) {
      this.tocarCiclo(this.animacoes.paradaCostas);
      return;
    }

    // De perfil ainda nao existe parada propria. Depois de um instante ela vira
    // para a camera — e o unico desenho de parada que serve, e nao inventa
    // pose. Antes disso, fica no ultimo quadro de caminhada.
    if (tempo - this.paradaDesde >= IDLE_FRONT_DELAY) {
      this.tocarCiclo(this.animacoes.paradaFrente);
      pedirAsset(
        'Alice', 'IDLE de perfil',
        'Alice parada vista de lado, 2 a 4 quadros de respiracao. ' +
        'De frente e de costas ja existem.',
        'parada de frente (ela vira para a camera ao parar)'
      );
    }
  }

  // -------------------------------------------------------------------- visual

  /** Coloca desenho e sombra no lugar, no tamanho certo para a profundidade. */
  atualizarVisual() {
    const escala = escalaPorProfundidade(this.y);

    this.visual.setPosition(this.x, this.y - this.altura);
    this.visual.setScale(escala);
    this.visual.setDepth(profundidadeDeDesenho(this.y));

    // A sombra segue a PEGADA, entao ela encolhe junto com a Alice pequena.
    const pes = this.tamanho.pes;
    const encolhe = Phaser.Math.Clamp(1 - this.altura / 260, 0.55, 1);
    this.sombra.setSize(pes.W + 14, pes.H + 6);
    this.sombra.setPosition(this.x, this.y);
    this.sombra.setScale(escala * encolhe);
    this.sombra.setAlpha(0.42 * encolhe);
    this.sombra.setDepth(profundidadeDeDesenho(this.y) - 0.01);
  }

  // -------------------------------------------------------------------- passos

  atualizarPassos(eixoX, eixoY, correndo) {
    const movendo = this.noChao &&
      (eixoX !== 0 || eixoY !== 0) &&
      this.body.velocity.length() > 22;

    let desejado = null;
    if (movendo) {
      desejado = correndo ? 'passos.corrida' : 'passos.' + this.terreno;
    }

    if (desejado === this.passosTocando) return;

    if (this.passosTocando) AudioManager.pararLoop(this.passosTocando);
    this.passosTocando = desejado;
    if (desejado) AudioManager.iniciarLoop(desejado);
  }

  pararPassos() {
    if (this.passosTocando) {
      AudioManager.pararLoop(this.passosTocando);
      this.passosTocando = null;
    }
  }

  // ---------------------------------------------------------------------- dano

  get invulneravel() {
    return this.scene.time.now < this.invulneravelAte;
  }

  /** @returns {boolean} true se o dano foi aplicado de fato */
  tomarDano() {
    if (this.invulneravel) return false;

    this.invulneravelAte = this.scene.time.now + IFRAMES;
    this.estado = ALICE_STATE.DAMAGE;

    const anim = this.olhandoPara < 0 ? this.animacoes.danoEsq : this.animacoes.danoDir;
    if (anim) {
      this.gesto = {
        anim,
        total: this.totalDe(anim),
        inicio: this.scene.time.now,
        duracao: 300,
        invertido: false,
        aoTerminar: null,
      };
    }

    AudioManager.tocar('efeito.dano');

    // Piscar mexendo so na opacidade. Nao usar tint: mudaria as cores dela.
    this.scene.tweens.add({
      targets: this.visual,
      alpha: 0.25,
      duration: 90,
      yoyo: true,
      repeat: 4,
      onComplete: () => this.visual.setAlpha(1),
    });

    // Empurrao curto no sentido contrario ao que ela andava.
    this.body.setVelocity(-this.direcao.x * 190, -this.direcao.y * 190);

    return true;
  }

  // ------------------------------------------------------------------ controle

  congelar() {
    this.controlavel = false;
    this.body.setAcceleration(0, 0);
    this.body.setVelocity(0, 0);
    this.pararPassos();
    this.tocarCiclo(this.animacoes.paradaFrente);
  }

  descongelar() {
    this.controlavel = true;
  }

  /** Reposiciona sem arrastar velocidade de antes (checkpoint, respawn). */
  colocarEm(x, y) {
    this.setPosition(x, y);
    this.body.reset(x, y);
    this.altura = 0;
    this.velocidadeAltura = 0;
    this.pisoAtual = 0;
    this.paradaDesde = 0;
    this.estavaNoChao = true;
    this.gesto = null;
    this.visual.setAlpha(1);
    this.atualizarVisual();
  }

  destroy(fromScene) {
    this.pararPassos();
    this.visual?.destroy();
    this.sombra?.destroy();
    super.destroy(fromScene);
  }
}

/**
 * Carrega os quadros da Alice. Chamar no preload da cena de carregamento.
 *
 * Sao 163 PNGs, todos ja recortados e normalizados por tools/fatiar-alice.ps1 —
 * mesma tela, pes na base, corpo no centro. Nada e recortado em tempo de
 * execucao e nenhum arquivo em disco e alterado.
 */
export function carregarQuadrosDaAlice(cena) {
  for (const linha of Object.keys(ALICE_QUADROS)) {
    for (let i = 0; i < ALICE_QUADROS[linha]; i++) {
      cena.load.image(
        quadro(linha, i),
        'assets/characters/alice/' + linha + '-' + i + '.png'
      );
    }
  }
}
