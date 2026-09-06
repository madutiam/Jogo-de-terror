/**
 * Base comum das cenas jogaveis (Fase 1, Tutorial e, mais adiante, Fases 2 e 3).
 *
 * O mundo e um CHAO visto em perspectiva, nao uma linha lateral. A Alice anda
 * livre por ele, para os lados e para o fundo, e o mapa e maior que a tela — a
 * camera acompanha nos dois eixos.
 *
 * Concentra o que toda fase precisa: Alice, obstaculos, camera, HUD, dialogo,
 * controles de toque, dano, morte e checkpoint. As fases herdam daqui e cuidam
 * so do que e proprio delas — cenario, puzzles e pistas.
 *
 * Regra 50: antes de escrever uma funcao nova, olhe se ela ja existe aqui.
 */

import {
  GAME,
  SCENES,
  VIDAS_INICIAIS,
  PROFUNDIDADE,
  escalaPorProfundidade,
  profundidadeDeDesenho,
} from '../core/constants.js';
import { Alice } from '../core/Alice.js';
import { InputManager } from '../core/InputManager.js';
import { AudioManager } from '../core/AudioManager.js';
import { SaveManager } from '../core/SaveManager.js';
import { Hud } from '../ui/Hud.js';
import { DialogBox } from '../ui/DialogBox.js';
import { TouchControls } from '../ui/TouchControls.js';
import { CORES, HEX, FONTE, ESTILO, comSombra } from '../ui/theme.js';
import { dimensoes } from '../core/tela.js';

/**
 * Quanto de cenario fica reservado nas beiradas do mundo, so para a Alice nao
 * poder chegar no fio da tela quando a camera trava no fim da sala.
 */
const MARGEM_LATERAL = 130;
const MARGEM_FRENTE = 40;

export class GameplayScene extends Phaser.Scene {
  /**
   * @param {string} chave
   * @param {{terreno?: string, largura?: number, profundidade?: number}} config
   */
  constructor(chave, config = {}) {
    super(chave);
    this.terreno = config.terreno || 'madeira';
    this.larguraMundo = config.largura || GAME.WIDTH;
    this.profundidadeMundo = config.profundidade || PROFUNDIDADE.FRENTE;
    /** Ate onde a Alice pode ir para o fundo. Fica um pouco depois da parede,
     *  para os pes dela nao entrarem no rodape. */
    this.limiteFundo = config.limiteFundo ?? PROFUNDIDADE.FUNDO;
  }

  // ------------------------------------------------------------------- montagem

  /** Chamar no create() da fase, depois de montar o cenario. */
  montarJogabilidade({ x, y, vidas = VIDAS_INICIAIS } = {}) {
    this.pausado = false;
    this.emCinematica = false;

    // O chao comeca onde a parede do fundo termina.
    //
    // As laterais e a frente ficam com uma margem: a camera para de rolar ao
    // chegar na ponta do mundo, e sem essa margem a Alice continuava andando e
    // acabava colada na borda da tela — metade dela para fora, porque a origem
    // do sprite e (0.5, 1). Com a margem, o cenario ainda existe atras dela
    // quando a camera trava, e ela nunca chega no fio da tela.
    this.physics.world.setBounds(
      MARGEM_LATERAL,
      this.limiteFundo,
      this.larguraMundo - MARGEM_LATERAL * 2,
      this.profundidadeMundo - this.limiteFundo - MARGEM_FRENTE
    );

    this.obstaculos = this.physics.add.staticGroup();
    this.interativos = [];
    this.perigos = [];

    this.alice = new Alice(this, x, y, { terreno: this.terreno });

    // A colisao e ignorada quando a Alice esta mais alta que o obstaculo:
    // e assim que ela sobe na mobilia em vez de esbarrar nela.
    this.physics.add.collider(
      this.alice,
      this.obstaculos,
      null,
      (alice, obstaculo) => alice.altura < (obstaculo.alturaTopo ?? Infinity) - 2
    );

    this.input_ = new InputManager(this);
    this.hud = new Hud(this, vidas);
    this.dialogo = new DialogBox(this);
    this.toque = new TouchControls(this, this.input_, {
      // O modo "seguir o dedo" precisa saber onde a Alice esta NA TELA para
      // calcular a direcao ate o toque.
      alvo: () => ({
        x: this.alice.x - this.cameras.main.scrollX,
        y: this.alice.y - this.cameras.main.scrollY,
      }),
    });

    this.cameras.main.setBounds(0, 0, this.larguraMundo, this.profundidadeMundo);

    // A camera nao aponta para a Alice: aponta 110px ACIMA dela. Assim ela
    // fica no terco de baixo do quadro e sobra parede em cima — sem isso, ao
    // chegar perto do fundo, o relogio e o resto do alto da parede saem de
    // cena, que e justo o que o jogador precisa ver.
    this.cameras.main.startFollow(this.alice, true, 0.14, 0.14, 0, 110);
    // Zona morta menor na vertical: a camera acompanha mais de perto o
    // vai-e-vem de profundidade, que e o eixo em que ela mais se perde.
    this.cameras.main.setDeadzone(220, 70);

    this.pontoDeRetorno = { x, y };

    // Enquanto o dialogo estiver aberto a Alice nao anda (regra 54).
    this.events.on('dialogo:abriu', () => this.alice.congelar());
    this.events.on('dialogo:fechou', () => {
      if (!this.emCinematica) this.alice.descongelar();
    });

    this.montarPausa();
    this.events.once('shutdown', () => this.aoDesligar());
  }

  /**
   * Movel, parede ou qualquer coisa que ocupe chao.
   * As medidas sao a PEGADA no chao — a area que o objeto realmente ocupa —
   * e nao o desenho inteiro.
   *
   * @param {{x:number, y:number, largura:number, profundidade:number,
   *          alturaTopo?:number, visivel?:boolean}} config
   *   alturaTopo: altura da superficie de cima, em pixels. Se a Alice estiver
   *   mais alta que isso, ela passa por cima e pousa ali. Sem esse valor o
   *   obstaculo e intransponivel (parede).
   */
  criarObstaculo(config) {
    const retangulo = this.add.rectangle(
      config.x, config.y, config.largura, config.profundidade, 0x000000, 0
    );

    this.physics.add.existing(retangulo, true);
    retangulo.alturaTopo = config.alturaTopo;
    this.obstaculos.add(retangulo);

    // Nas fases o obstaculo e invisivel: quem o jogador ve e o movel desenhado
    // no cenario. `visivel` e para os trechos que ainda nao tem arte propria —
    // ai desenhamos um bloco de pedra simples, so para o jogador ter no que
    // subir. E provisorio: quando o objeto existir, some daqui.
    if (config.visivel) this.desenharBloco(config);

    return retangulo;
  }

  /** Bloco de pedra em duas faces: o topo em que se pisa e a frente. */
  desenharBloco(config) {
    const altura = config.alturaTopo ?? 40;
    const x1 = config.x - config.largura / 2;
    const x2 = config.x + config.largura / 2;
    const frente = config.y + config.profundidade / 2;
    const fundo = config.y - config.profundidade / 2;

    const g = this.add.graphics().setDepth(profundidadeDeDesenho(frente));

    // Sombra no chao, para o bloco nao parecer flutuando.
    g.fillStyle(0x000000, 0.45);
    g.fillEllipse(config.x, frente - 2, config.largura * 1.05, config.profundidade * 0.9);

    // Face da frente.
    g.fillStyle(0x232a33, 1);
    g.fillRect(x1, frente - altura, config.largura, altura);

    // Face de cima.
    g.fillStyle(0x333c47, 1);
    g.beginPath();
    g.moveTo(x1, frente - altura);
    g.lineTo(x2, frente - altura);
    g.lineTo(x2, fundo - altura);
    g.lineTo(x1, fundo - altura);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, 0x11151a, 0.9);
    g.strokeRect(x1, frente - altura, config.largura, altura);
  }

  /**
   * Area do chao que machuca — assoalho podre, comida estragada, o que for.
   * Nao e obstaculo: da para atravessar, so custa. E pular por cima escapa,
   * porque o dano so conta quando os pes estao no chao.
   *
   * @param {{x:number, y:number, largura:number, profundidade:number,
   *          dano?:number}} config  medidas sao a area no CHAO
   */
  criarPerigo(config) {
    const area = new Phaser.Geom.Rectangle(
      config.x - config.largura / 2,
      config.y - config.profundidade / 2,
      config.largura,
      config.profundidade
    );

    const perigo = { area, dano: config.dano ?? 1 };
    this.perigos.push(perigo);
    return perigo;
  }

  atualizarPerigos() {
    if (!this.alice || this.emCinematica) return;
    // No ar ela passa por cima: e a recompensa de quem juntou correr e pular.
    if (this.alice.altura >= 8) return;

    const pes = this.alice.body;

    for (const perigo of this.perigos) {
      const encosta =
        pes.right > perigo.area.x && pes.left < perigo.area.right &&
        pes.bottom > perigo.area.y && pes.top < perigo.area.bottom;

      if (encosta) {
        this.aplicarDano(perigo.dano);
        return;
      }
    }
  }

  /**
   * Quando a Alice esta sobre um movel, o "chao" dela sobe. Ao sair da borda,
   * volta a zero e ela cai.
   */
  atualizarPiso() {
    const pes = this.alice.body;
    let piso = 0;

    for (const obstaculo of this.obstaculos.getChildren()) {
      const topo = obstaculo.alturaTopo;
      if (!topo) continue;

      const corpo = obstaculo.body;
      const encosta =
        pes.right > corpo.left && pes.left < corpo.right &&
        pes.bottom > corpo.top && pes.top < corpo.bottom;

      // Folga de pouso. MEDIDO: o pulo alcanca 128 px e o topo da comoda esta a
      // 120 — com 6 px de tolerancia, errar por um quadro fazia a Alice
      // escorregar pela lateral do movel sem motivo aparente. 14 px e o
      // bastante para o pouso parecer justo sem deixar ela subir no que nao
      // deveria (o proximo topo so aparece 6 px acima do alcance dela).
      if (encosta && this.alice.altura >= topo - 14) piso = Math.max(piso, topo);
    }

    this.alice.pisoAtual = piso;
  }

  /**
   * Ponto que responde quando a Alice chega perto e o jogador aperta interagir.
   * Nada de seta nem de "aperte E aqui" gigante: so um sinal discreto.
   *
   * @param {{x:number, y:number, raio?:number, alturaMarca?:number,
   *          aoInteragir:Function, umaVez?:boolean}} config
   */
  criarInterativo(config) {
    const raio = config.raio ?? 110;
    // De longe da para PERCEBER que ali tem alguma coisa; so de perto da para
    // usar. Perceber nao e o mesmo que ser levado pela mao — o jogo continua
    // sem dizer para onde ir, mas para de esconder o que existe.
    const raioAviso = config.raioAviso ?? raio * 2.4;

    const marca = this.add
      .text(config.x, config.y - (config.alturaMarca ?? 40), '◆', {
        fontFamily: FONTE, fontSize: '17px', color: HEX.dourado,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      // Acima da penumbra (800): senao a escuridao que segue a Alice engolia a
      // marca e o jogador nunca via que havia algo ali.
      .setDepth(810);

    // Sobe e desce de leve, para o olho pegar no escuro.
    this.tweens.add({
      targets: marca,
      y: marca.y - 5,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const item = { ...config, raio, raioAviso, marca, usado: false };
    this.interativos.push(item);
    return item;
  }

  atualizarInterativos() {
    if (!this.alice) return;

    let maisProximo = null;
    let menorDistancia = Infinity;

    for (const item of this.interativos) {
      if (item.usado && item.umaVez) {
        item.marca.setAlpha(0);
        item.distancia = Infinity;
        continue;
      }

      // Distancia medida no chao: e onde a Alice de fato esta.
      item.distancia = Phaser.Math.Distance.Between(
        this.alice.x, this.alice.y, item.x, item.y
      );

      if (item.distancia < item.raio && item.distancia < menorDistancia) {
        menorDistancia = item.distancia;
        maisProximo = item;
      }
    }

    for (const item of this.interativos) {
      if (item.usado && item.umaVez) continue;

      let alvo = 0;
      if (item === maisProximo) {
        alvo = 0.95;                                    // ao alcance
      } else if (item.distancia < item.raioAviso) {
        // Vai aparecendo conforme ela chega perto.
        const t = 1 - (item.distancia - item.raio) / (item.raioAviso - item.raio);
        alvo = Phaser.Math.Clamp(t, 0, 1) * 0.34;
      }

      if (Math.abs(item.marca.alpha - alvo) > 0.02) {
        item.marca.setAlpha(Phaser.Math.Linear(item.marca.alpha, alvo, 0.15));
      }
    }

    this.interativoAtual = maisProximo;
  }

  /**
   * Coloca um desenho no chao, no tamanho e na ordem certos para a
   * profundidade dele. Serve para qualquer objeto ou personagem da cena.
   */
  porNoChao(imagem, x, y, escalaExtra = 1) {
    imagem.setPosition(x, y);
    imagem.setOrigin(0.5, 1);
    imagem.setScale(escalaPorProfundidade(y) * escalaExtra);
    imagem.setDepth(profundidadeDeDesenho(y));
    return imagem;
  }

  // ------------------------------------------------------------------ cinematica

  /** Desliga o controle do jogador. Usar em cinematica (regra 54). */
  entrarEmCinematica() {
    this.emCinematica = true;
    this.input_.bloquear();
    this.alice.congelar();
    this.hud?.desvanecer(300);
    this.toque?.esconder();
  }

  /** Devolve o controle exatamente no momento planejado. */
  sairDeCinematica() {
    this.emCinematica = false;
    this.input_.liberar();
    this.alice.descongelar();
    this.hud?.reaparecer(300);
    this.toque?.mostrar();
  }

  // ------------------------------------------------------------------ dano/morte

  aplicarDano(quantidade = 1) {
    if (this.emCinematica) return;
    if (!this.alice.tomarDano()) return;

    const restantes = this.hud.perderVida();
    this.cameras.main.shake(180, 0.006);

    if (restantes <= 0) this.morrer();
  }

  morrer() {
    this.entrarEmCinematica();
    AudioManager.silenciar({ fadeMs: 300 });

    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.renascer());
  }

  /** Volta ao checkpoint. Nunca obriga a refazer a investigacao (regra 10). */
  renascer() {
    this.alice.colocarEm(this.pontoDeRetorno.x, this.pontoDeRetorno.y);
    this.hud.definirVidas(VIDAS_INICIAIS);
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.time.delayedCall(600, () => this.sairDeCinematica());
    this.aoRenascer?.();
  }

  /**
   * Marca um checkpoint. So chamar depois de uma conquista de verdade
   * (regra 10): resolveu um puzzle, pegou um item importante, passou de um
   * evento. Nunca so porque um trecho ficou dificil.
   */
  marcarCheckpoint(x, y, id) {
    this.pontoDeRetorno = { x, y };
    if (id) SaveManager.salvarCheckpoint(this.faseNumero ?? 1, id);
  }

  // -------------------------------------------------------------------- tamanho

  /**
   * Come o biscoito contrario ao tamanho atual.
   *
   * Os dois vidros ficam com ela desde a despensa: a escolha nao e QUAL comer,
   * e ONDE. Roteiro, secao 7 — o jogador tem que observar o ambiente para
   * perceber onde cada tamanho serve.
   */
  alternarTamanho() {
    if (!SaveManager.temItem('biscoitos')) return;
    if (this.emCinematica || this.pausado) return;
    if (!this.alice.noChao || this.alice.gesto) return;

    const alvo = this.alice.tamanho.id === 'pequena' ? 'normal' : 'pequena';
    this.entrarEmCinematica();
    this.alice.mudarTamanho(alvo).then(() => this.sairDeCinematica());
  }

  // ---------------------------------------------------------------------- pausa

  montarPausa() {
    const tela = dimensoes(this);

    this.painelPausa = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(false);

    // Um pouco maior que a tela: se o aparelho girar, o escurecimento continua
    // cobrindo tudo sem precisar remontar a fase.
    const fundo = this.add
      .rectangle(tela.meioX, tela.meioY, tela.largura * 2, tela.altura * 2, CORES.preto, 0.82)
      .setScrollFactor(0);

    const titulo = this.add
      .text(tela.meioX, tela.meioY - 56, 'PAUSADO', comSombra(ESTILO.menu))
      .setOrigin(0.5)
      .setScrollFactor(0);

    const continuar = this.add
      .text(tela.meioX, tela.meioY + 10, 'CONTINUAR', comSombra(ESTILO.menu))
      .setOrigin(0.5)
      .setColor(HEX.ossoApagado)
      .setFontSize(21)
      // Preso a camera ANTES de virar interativo. O desenho seguia o container
      // (que ja era 0) e o clique seguia o filho (que era 1): a area clicavel
      // ficava a uma rolagem de camera de distancia do texto, e andava junto
      // com a Alice. Era por isso que os botoes nao respondiam.
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    const sair = this.add
      .text(tela.meioX, tela.meioY + 52, 'VOLTAR AO MENU', comSombra(ESTILO.menu))
      .setOrigin(0.5)
      .setColor(HEX.ossoApagado)
      .setFontSize(21)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    for (const item of [continuar, sair]) {
      item.on('pointerover', () => item.setColor(HEX.dourado));
      item.on('pointerout', () => item.setColor(HEX.ossoApagado));
    }

    continuar.on('pointerdown', () => this.alternarPausa(false));
    sair.on('pointerdown', () => {
      AudioManager.silenciar({ fadeMs: 250 });
      this.scene.start(SCENES.MENU);
    });

    this.painelPausa.add([fundo, titulo, continuar, sair]);
  }

  alternarPausa(forcar) {
    const novo = forcar ?? !this.pausado;
    if (novo === this.pausado) return;

    this.pausado = novo;
    this.painelPausa.setVisible(novo);

    if (novo) {
      this.physics.pause();
      this.alice.pararPassos();
      this.toque?.esconder();
    } else {
      this.physics.resume();
      this.toque?.mostrar();
    }
  }

  // --------------------------------------------------------------------- update

  /** As fases chamam `super.update(...)` no comeco do proprio update. */
  update(tempo, delta) {
    if (this.input_?.consumirPausa()) this.alternarPausa();
    if (this.pausado) return;

    this.atualizarPiso();
    this.alice?.controlar(this.input_, tempo);
    this.atualizarPerigos();
    this.atualizarInterativos();

    if (this.dialogo?.aberta) {
      if (this.input_.consumirInteragir({ mesmoBloqueado: true })) this.dialogo.avancar();
      return;
    }

    // Comer um biscoito. So depois de ter os dois vidros, so no chao, e nunca
    // no meio de outra coisa — trocar de tamanho no ar quebraria a fisica do
    // pulo e a leitura do que esta acontecendo.
    if (this.input_.consumirTamanho()) this.alternarTamanho();

    if (this.interativoAtual && this.input_.consumirInteragir()) {
      const item = this.interativoAtual;
      if (!(item.usado && item.umaVez)) {
        item.usado = true;
        item.aoInteragir(item);
      }
    }
  }

  aoDesligar() {
    this.alice?.pararPassos();
    this.dialogo?.destroy();
    this.toque?.destroy();
  }
}
