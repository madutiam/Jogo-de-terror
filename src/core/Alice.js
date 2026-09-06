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
 * Regras que este arquivo faz cumprir:
 *  27/52 — nada de deslizar, flutuar ou olhar para o lado errado
 *     28 — a textura vem do sprite direcional certo. Sem flip, sem rotacao
 *      3 — sem a pose, usa o frame existente mais proximo SEM deformar, e
 *          registra o pedido em MissingAssets
 *
 * Desenhos que existem hoje: de frente (parada), andando para a direita,
 * andando para a esquerda, e o ciclo completo de COSTAS (parada + 4 quadros),
 * usado quando ela caminha para o fundo da cena.
 */

import {
  PHYSICS,
  ALICE_FONTE,
  ALICE_COSTAS,
  ALICE_ESCALA,
  ALICE_SPRITE,
  ALICE_PES,
  ALICE_STATE,
  IDLE_FRONT_DELAY,
  IFRAMES,
  escalaPorProfundidade,
  profundidadeDeDesenho,
} from './constants.js';
import { pedirAsset } from './MissingAssets.js';
import { AudioManager } from './AudioManager.js';
import { recortarTextura } from './texturas.js';

const TEX = {
  frente: ALICE_FONTE.frames.idle.destino,
  direita: ALICE_FONTE.frames.right.destino,
  esquerda: ALICE_FONTE.frames.left.destino,
};

export class Alice extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} cena
   * @param {number} x
   * @param {number} y  ponto do chao onde ela pisa
   * @param {{terreno?: string}} opcoes
   */
  constructor(cena, x, y, opcoes = {}) {
    super(cena, x, y, TEX.frente);

    cena.add.existing(this);
    cena.physics.add.existing(this);

    // O colisor e so a pegada: invisivel e do tamanho dos pes.
    this.setVisible(false);
    this.setOrigin(0.5, 0.5);
    this.body.setSize(ALICE_PES.W, ALICE_PES.H);
    this.body.setOffset(
      (ALICE_SPRITE.W - ALICE_PES.W) / 2,
      ALICE_SPRITE.H - ALICE_PES.H / 2 - ALICE_SPRITE.H / 2
    );
    this.body.setDragX(PHYSICS.DRAG);
    this.body.setDragY(PHYSICS.DRAG);
    this.setCollideWorldBounds(true);

    // Sombra: elipse escura no chao. Nao e um personagem inventado, e
    // iluminacao — e sem ela ninguem entende onde a Alice esta pisando.
    this.sombra = cena.add.ellipse(x, y, ALICE_PES.W + 14, ALICE_PES.H + 6, 0x000000, 0.42);

    // O desenho, apoiado nos pes.
    this.visual = cena.add.image(x, y, TEX.frente).setOrigin(0.5, 1);

    /** 'madeira' | 'floresta' | 'xadrez' — decide o som dos passos. */
    this.terreno = opcoes.terreno || 'madeira';

    this.estado = ALICE_STATE.IDLE;
    this.texturaAtual = TEX.frente;
    /** Ultima direcao com componente horizontal: 1 direita, -1 esquerda. */
    this.olhandoPara = 1;
    /** Ultima direcao andada, como vetor. */
    this.direcao = new Phaser.Math.Vector2(0, 1);

    /** Eixo do pulo: altura acima do chao e velocidade nesse eixo. */
    this.altura = 0;
    this.velocidadeAltura = 0;
    /** Altura do chao sob os pes (0 = piso; mais que isso = em cima de algo). */
    this.pisoAtual = 0;

    this.paradaDesde = 0;
    this.puloPedidoEm = -9999;
    this.aterrissouEm = -9999;
    this.estavaNoChao = true;

    this.invulneravelAte = 0;
    this.controlavel = true;
    this.ofegante = false;

    this.passosTocando = null;

    this.atualizarVisual();
  }

  // ------------------------------------------------------------------ texturas

  /** Troca a textura sem nunca espelhar nem deformar o desenho. */
  usarTextura(chave) {
    if (this.texturaAtual === chave) return;
    this.texturaAtual = chave;
    this.visual.setTexture(chave);
  }

  /**
   * Escolhe o desenho pela direcao andada.
   * O eixo dominante manda: andando mais para os lados usa o perfil; indo para
   * o fundo usa o ciclo de costas; vindo para a frente usa o desenho de frente.
   */
  texturaParaDirecao(dx, dy, andando = true) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx < 0 ? TEX.esquerda : TEX.direita;
    }

    if (dy < 0) {
      // Indo para o fundo: o unico ciclo de caminhada completo que existe.
      return andando ? this.quadroDeCostas() : ALICE_COSTAS.parada;
    }

    return TEX.frente;
  }

  /** Avanca o ciclo de costas pelo relogio, nao pelo numero de quadros. */
  quadroDeCostas() {
    const agora = this.scene.time.now;
    const passo = Math.floor(agora / ALICE_COSTAS.msPorQuadro) % ALICE_COSTAS.ciclo.length;
    return ALICE_COSTAS.ciclo[passo];
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
      const velocidade = (correndo ? PHYSICS.RUN_SPEED : PHYSICS.WALK_SPEED) * intensidade;

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
    this.velocidadeAltura = PHYSICS.IMPULSO_PULO;
    this.puloPedidoEm = -9999;

    pedirAsset(
      'Alice', 'JUMP',
      'Alice no ar subindo, de perfil e de frente, 1 a 2 frames.',
      'frame de caminhada da direcao atual'
    );
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
    pedirAsset(
      'Alice', 'LAND',
      'Alice tocando o chao, joelhos levemente dobrados. 1 frame.',
      'frame da direcao atual'
    );
    AudioManager.tocar('efeito.aterrissagem');
  }

  // ------------------------------------------------------------------- estados

  atualizarEstado(tempo, eixoX, eixoY, correndo) {
    const andando = eixoX !== 0 || eixoY !== 0;

    if (!this.noChao) {
      this.estado = this.velocidadeAltura > 0 ? ALICE_STATE.JUMP : ALICE_STATE.FALL;
      if (this.estado === ALICE_STATE.FALL) {
        pedirAsset(
          'Alice', 'FALL',
          'Alice caindo, cabelo e saia puxados para cima. 1 a 2 frames.',
          'frame da direcao atual'
        );
      }
      this.usarTextura(this.texturaParaDirecao(this.direcao.x, this.direcao.y, false));
      return;
    }

    if (tempo - this.aterrissouEm < 130) {
      this.estado = ALICE_STATE.LAND;
      return;
    }

    if (andando) {
      this.paradaDesde = 0;
      this.estado = correndo ? ALICE_STATE.RUN : ALICE_STATE.WALK;

      pedirAsset(
        'Alice', correndo ? 'RUN' : 'WALK',
        correndo
          ? 'Ciclo de corrida, 4 a 6 frames por direcao. Essencial na perseguicao da Fase 2.'
          : 'Ciclo de caminhada, 4 a 6 frames por direcao (hoje existe 1 frame por lado).',
        'frame unico'
      );

      this.usarTextura(this.texturaParaDirecao(eixoX, eixoY));
      return;
    }

    // Parada.
    this.estado = this.ofegante ? ALICE_STATE.BREATHLESS : ALICE_STATE.IDLE;

    if (this.paradaDesde === 0) this.paradaDesde = tempo;

    // Parada olhando para o fundo: existe desenho para isso, entao ela FICA
    // de costas. Virar para a camera aqui seria ela girar sozinha.
    const olhandoParaOFundo =
      this.direcao.y < 0 && Math.abs(this.direcao.y) > Math.abs(this.direcao.x);

    if (olhandoParaOFundo) {
      this.usarTextura(ALICE_COSTAS.parada);
    } else if (tempo - this.paradaDesde >= IDLE_FRONT_DELAY) {
      // De perfil ainda nao existe parada. Depois de um instante ela vira para
      // a camera — e o unico desenho de "parada" que serve, e nao inventa pose.
      this.usarTextura(TEX.frente);
      pedirAsset(
        'Alice', 'IDLE de perfil',
        'Alice parada vista de lado, 2 a 4 frames de respiracao. ' +
        'De frente e de costas ja existem.',
        'alice-idle-frente (ela vira para a camera ao parar)'
      );
    }

    if (this.ofegante) {
      pedirAsset(
        'Alice', 'BREATHLESS',
        'Alice ofegante depois da perseguicao: ombros subindo e descendo, 2 a 4 frames.',
        'parada normal'
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

    // A sombra fica no chao e encolhe conforme a Alice sobe: e assim que o
    // jogador enxerga a altura do pulo.
    const encolhe = Phaser.Math.Clamp(1 - this.altura / 260, 0.55, 1);
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
      if (correndo) {
        desejado = 'passos.corrida';
      } else if (this.terreno === 'madeira') {
        desejado = 'passos.madeira';
      } else {
        // Nao existe passo de floresta nem de xadrez: fica em silencio ate o
        // asset chegar, em vez de usar o som errado.
        desejado = 'passos.' + this.terreno;
      }
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

    pedirAsset(
      'Alice', 'DAMAGE',
      'Alice levando dano: corpo recuando. 1 a 2 frames.',
      'frame atual, apenas piscando'
    );
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
    this.usarTextura(TEX.frente);
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
 * Recorta os tres desenhos da Alice para o tamanho util.
 * Chamar uma vez no preload. Depois disso a origem e a colisao ficam exatas,
 * sem depender do vazio que existe dentro dos PNGs de 500x500.
 *
 * Nao altera nenhum arquivo em disco — as texturas nascem so na memoria.
 */
export function prepararTexturasDaAlice(cena) {
  const { LARGURA, ALTURA, TOPO, frames } = ALICE_FONTE;

  for (const nome of Object.keys(frames)) {
    const frame = frames[nome];

    recortarTextura(cena, frame.origem, frame.destino, {
      x: frame.cx - LARGURA / 2,
      y: TOPO,
      largura: LARGURA,
      altura: ALTURA,
      escala: ALICE_ESCALA,
    });
  }
}
