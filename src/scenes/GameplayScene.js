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
import { TAMANHOS, TIPOS, LADOS, OPACIDADES } from '../ui/layoutControles.js';
import { CORES, HEX, FONTE, ESTILO, comSombra } from '../ui/theme.js';
import { dimensoes } from '../core/tela.js';
import { ITENS, PISTAS, ORDEM_ITENS, ORDEM_PISTAS } from '../data/inventario.js';
import { MAPA_FASE1, LIGACOES_FASE1, CAMADAS_FASE1 } from '../data/mapa.js';
import { PainelDeAbas } from '../ui/PainelDeAbas.js';

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
      (alice, obstaculo) => {
        // Passagem baixa: barra quem estiver do tamanho normal, deixa passar
        // quem tiver comido o biscoito. E o §7 na fisica — "passar por espacos
        // pequenos" tem que ser uma parede de verdade, nao um texto.
        if (obstaculo.soPequena) return !alice.pequena;
        return alice.altura < (obstaculo.alturaTopo ?? Infinity) - 2;
      }
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
    retangulo.soPequena = !!config.soPequena;
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

      // TOLERANCIA NA PROFUNDIDADE — sem ela o parkour e inescalavel.
      //
      // O teste exigia que a pegada da Alice se SOBREPUSESSE a da peca. Mas o
      // proprio colisor a impede de entrar nessa faixa enquanto ela esta no
      // chao, e as unicas profundidades que ela alcanca sao a de encostar na
      // frente da peca (corpo dela comecando exatamente onde o da peca acaba)
      // e a de passar por tras. Nenhuma das duas se sobrepoe: `pisoAtual`
      // nunca subia, e ela nunca pousava em cima de nada.
      //
      // MEDIDO na despensa: encostada, o topo do corpo dela cai em 588 e o
      // fundo do caixote tambem em 588 — empate, e o teste e estritamente
      // menor. Zero pixel de folga.
      //
      // 20 px fazem quem esta ENCOSTADA contar como em cima. O que decide se
      // ela sobe de verdade continua sendo a altura do pulo, logo abaixo: a
      // tolerancia abre a porta, o pulo e que passa por ela.
      // 4, e nao 20.
      //
      // A folga existe para DESEMPATAR o toque, nao para deixar andar para fora
      // da peca. O colisor impede a Alice de entrar na pegada dela, entao
      // encostada o topo do corpo dela cai exatamente onde o fundo da peca
      // acaba — 588 contra 588 — e o teste e estritamente menor. Sem nenhuma
      // folga ela nunca pousa.
      //
      // Com 20, porem, ela ficava ate 19 px A FRENTE da peca ainda recebendo
      // chao: nessa posicao os pes dela caem 58 px abaixo do topo do caixote na
      // tela, e o que se ve e ela flutuando na frente dele. 4 desempata o toque
      // e mais nada — dar um passo para a frente derruba, que e o certo.
      const FOLGA_DE_PROFUNDIDADE = 4;

      // EM X, O QUE VALE E O CENTRO DELA — nao a ponta do pe.
      //
      // `pes.right > corpo.left` aceita UM pixel de sobreposicao. Com o corpo
      // dela em 58 de largura, isso deixava a Alice ganhar chao boiando quase
      // meia largura ao lado da peca: na tela ela ficava parada no ar, com a
      // tabua comecando so depois dos pes dela. Enquanto ninguem conseguia
      // pousar em nada, o defeito nunca aparecia.
      //
      // A BEIRADA e a gentileza que sobra: da para parar na pontinha da viga,
      // mas nao a meio corpo dela.
      const BEIRADA = 14;
      const centro = (pes.left + pes.right) / 2;

      const encosta =
        centro > corpo.left - BEIRADA && centro < corpo.right + BEIRADA &&
        pes.bottom > corpo.top - FOLGA_DE_PROFUNDIDADE &&
        pes.top < corpo.bottom + FOLGA_DE_PROFUNDIDADE;

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
    //
    // Era 2,4x, e isso dava 264 px de aviso num quarto de 2400: a marca so
    // acendia quando ela ja estava praticamente em cima. Procurar no escuro
    // deixava de ser tensao e virava varredura — andar de ponta a ponta
    // raspando a parede. 4,5x acende de longe sem dizer O QUE e: continua
    // sendo ela quem decide se vale chegar perto (§43).
    const raioAviso = config.raioAviso ?? raio * 4.5;

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
        //
        // O teto era 0,34, e contra a escuridao do quarto isso e quase nada:
        // um ponto que o olho perde. O dourado a 0,55 ainda e um brilho fraco
        // no escuro, nao um icone de HUD — da para nao ver se nao estiver
        // olhando, que e o ponto.
        const t = 1 - (item.distancia - item.raio) / (item.raioAviso - item.raio);
        alvo = Phaser.Math.Clamp(t, 0, 1) * 0.55;
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

    // Guarda o ambiente ANTES de silenciar.
    //
    // `silenciar` corta tudo — e e isso que a morte pede. Mas `renascer` nao
    // devolvia nada, entao o comodo voltava MUDO e ficava assim ate a troca de
    // sala. Some justamente a camada que diz onde ela esta: o tic-tac da sala
    // lateral, o vento do sotao. O silencio aqui e ferramenta (regra 34), nao
    // pode virar estado permanente.
    const amb = AudioManager.ambienteAtual;
    this.ambienteAntesDaMorte =
      amb ? { id: amb.__id, volume: amb.__volumeBase } : null;

    AudioManager.silenciar({ fadeMs: 300 });

    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.renascer());
  }

  /** Volta ao checkpoint. Nunca obriga a refazer a investigacao (regra 10). */
  renascer() {
    this.alice.colocarEm(this.pontoDeRetorno.x, this.pontoDeRetorno.y);
    this.hud.definirVidas(VIDAS_INICIAIS);

    // O peso vai junto: cada comodo tem o seu, e sem ele o ambiente voltaria
    // no volume cheio do catalogo.
    const a = this.ambienteAntesDaMorte;
    if (a) AudioManager.tocarAmbiente(a.id, 900, { volume: a.volume });

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

  // -------------------------------------------------------------------- rastros

  /**
   * O QUE SOBROU NO CHAO
   *
   * Sangue, marca de arrasto, um tufo de pelo, uma pegada. Nao sao enfeite: sao
   * a unica coisa no jogo que diz o que aconteceu aqui antes de a Alice acordar.
   *
   * E sao tambem a direcao. A marca de arrasto vai ficando mais fraca para o
   * oeste, ate a porta do corredor — quem seguir o rastro sai do quarto pelo
   * lado certo sem que ninguem tenha dito nada (roteiro, secao 8: a informacao
   * esta no ambiente, e nao ha seta).
   *
   * Ficam no chao: desenhados abaixo de quem anda, e encolhendo com a
   * profundidade, como todo o resto.
   */
  montarRastros(lista) {
    for (const r of lista) {
      const escala = escalaPorProfundidade(r.y) * (r.escala ?? 1);

      this.add
        .image(r.x, r.y, 'rastro/' + r.chave)
        .setOrigin(0.5, 0.5)
        .setScale(escala)
        .setAngle(r.angulo ?? 0)
        .setFlipX(!!r.virar)
        .setAlpha(r.alpha ?? 1)
        .setDepth(profundidadeDeDesenho(r.y) - 0.5);

      if (!r.texto) continue;

      this.criarInterativo({
        x: r.x,
        y: r.y,
        raio: 110,
        alturaMarca: 34,
        aoInteragir: () => {
          this.dialogo.mostrar(r.texto, {
            rotulo: r.rotulo,
            aoFechar: () => r.pista && SaveManager.registrarPista(r.pista),
          });
        },
      });
    }
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
    // No tutorial ela ganha os biscoitos sem que isso entre no save — senao a
    // despensa da Fase 1 ficaria sem sentido para quem fez o tutorial antes.
    if (!this.podeTrocarTamanho && !SaveManager.temItem('biscoitos')) return;
    if (this.emCinematica || this.pausado) return;
    if (!this.alice.noChao || this.alice.gesto) return;

    const alvo = this.alice.tamanho.id === 'pequena' ? 'normal' : 'pequena';
    this.entrarEmCinematica();
    this.momentoDoBiscoito(alvo);
  }

  /**
   * O MOMENTO DO BISCOITO
   *
   * Nao e uma HIGHSFIELD — sao 5, e continuam 5 (§32). E um MOMENTO: a camera
   * chega perto, o controle sai da mao do jogador (que ja saia) e o ambiente
   * recua, para os dois gestos terem espaco de acontecer.
   *
   * A camera fecha ANTES da mordida e so volta depois que o corpo terminou de
   * mudar. Isso e o que separa "ela comeu um biscoito e algo aconteceu com ela"
   * de "eu apertei Q".
   */
  momentoDoBiscoito(alvo) {
    const cam = this.cameras.main;
    const zoomBase = cam.zoom;

    cam.zoomTo(zoomBase * 1.3, 620, 'Sine.easeInOut');

    // O comodo abaixa e volta. O silencio aqui e o mesmo recurso do §34: por
    // dois segundos a casa para de existir e so ela existe.
    const ambiente = AudioManager.ambienteAtual;
    const eraAmbiente = ambiente
      ? { id: ambiente.__id, volume: ambiente.__volumeBase }
      : null;
    if (eraAmbiente) {
      AudioManager.tocarAmbiente(eraAmbiente.id, 500, {
        volume: eraAmbiente.volume * 0.35,
      });
    }

    this.alice.comerBiscoito(alvo).then(() => {
      cam.zoomTo(zoomBase, 700, 'Sine.easeInOut');
      if (eraAmbiente) {
        AudioManager.tocarAmbiente(eraAmbiente.id, 900, { volume: eraAmbiente.volume });
      }
      this.time.delayedCall(700, () => this.sairDeCinematica());
    });
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
      .text(tela.meioX, tela.meioY - 78, 'PAUSADO', comSombra(ESTILO.menu))
      .setOrigin(0.5)
      .setScrollFactor(0);

    /**
     * As opcoes vem de uma lista para caber uma terceira sem recontar
     * posicao na mao.
     *
     * REINICIAR A FASE recomeca o quarto do zero e NAO apaga nada: pistas e
     * itens continuam com ela. Quem quer perder tudo tem o RECOMECAR do menu,
     * que e onde uma coisa destrutiva deve morar — nao a um clique de distancia
     * de quem so queria despausar.
     */
    const opcoes = [
      { texto: 'CONTINUAR', acao: () => this.alternarPausa(false) },
      {
        texto: 'REINICIAR A FASE',
        acao: () => {
          AudioManager.silenciar({ fadeMs: 250 });
          this.alternarPausa(false);
          this.scene.start(SCENES.PHASE1);
        },
      },
      { texto: 'CADERNO', acao: () => this.abrirInventario() },
      {
        texto: 'VOLTAR AO MENU',
        acao: () => {
          AudioManager.silenciar({ fadeMs: 250 });
          this.scene.start(SCENES.MENU);
        },
      },
    ];

    const itens = opcoes.map((o, i) => {
      const item = this.add
        .text(tela.meioX, tela.meioY - 8 + i * 42, o.texto, comSombra(ESTILO.menu))
        .setOrigin(0.5)
        .setColor(HEX.ossoApagado)
        .setFontSize(21)
        // Preso a camera ANTES de virar interativo. O desenho seguia o
        // container (que ja era 0) e o clique seguia o filho (que era 1): a
        // area clicavel ficava a uma rolagem de camera de distancia do texto,
        // e andava junto com a Alice. Era por isso que os botoes nao respondiam.
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      item.on('pointerover', () => item.setColor(HEX.dourado));
      item.on('pointerout', () => item.setColor(HEX.ossoApagado));
      item.on('pointerdown', o.acao);
      return item;
    });

    this.painelPausa.add([fundo, titulo, ...itens]);
  }

  // ----------------------------------------------------------- mapa: avisos

  /**
   * O MAPA MUDOU — e so isso.
   *
   * Uma linha discreta, embaixo, que some sozinha. Ela NAO diz o que abriu nem
   * para onde ir: dizer "a escada apareceu" seria a seta que o §43 proibe. Diz
   * que vale a pena olhar, e quem olha descobre sozinho.
   *
   * So aparece na primeira vez de cada peca — voltar ao corredor pela quinta vez
   * nao avisa nada, senao o aviso vira ruido e o jogador para de le-lo.
   */
  avisarMapa(texto = 'o mapa mudou') {
    this.aviso?.destroy();

    this.aviso = this.add
      .text(this.tela.largura / 2, this.tela.altura - 76, texto, {
        fontFamily: FONTE, fontSize: '14px', color: HEX.dourado,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1300)
      .setAlpha(0);

    this.tweens.add({
      targets: this.aviso,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      hold: 2600,
      onComplete: () => { this.aviso?.destroy(); this.aviso = null; },
    });
  }

  /** Registra uma sala no mapa e avisa, se for a primeira vez. */
  descobrirSala(id) {
    if (SaveManager.registrarSala(id)) this.time.delayedCall(1400, () => this.avisarMapa());
  }

  /** O mesmo para uma passagem — a fresta, a escada, a porta. */
  descobrirMarco(id) {
    if (SaveManager.registrarMarco(id)) this.time.delayedCall(900, () => this.avisarMapa());
  }

  // ------------------------------------------------------------------ abas

  /**
   * O CADERNO — inventario, diario, mapa e comandos
   *
   * Quatro abas, e quem escolhe o que ver e o jogador. Antes era uma tela so
   * com duas colunas brigando por espaco; com o mapa e o diario entrando, virava
   * lista sem fim.
   *
   * Nada aqui guarda estado: cada aba e montada na hora, a partir do save. Uma
   * pista achada com o caderno aberto aparece na proxima vez que a aba abrir, e
   * nenhuma delas pode mostrar coisa velha.
   */
  abrirCaderno(idInicial, veioDaPausa = false) {
    if (this.caderno?.aberto) return;

    this.veioDaPausa = veioDaPausa;
    if (veioDaPausa) this.painelPausa.setVisible(false);
    else {
      // Ler nao pode custar uma vida.
      this.physics.pause();
      this.alice?.pararPassos();
      this.toque?.esconder();
    }

    this.caderno = new PainelDeAbas(this, [
      { id: 'inventario', nome: 'Inventário', montar: (a, p) => this.abaInventario(a, p) },
      { id: 'diario',     nome: 'Diário',     montar: (a, p) => this.abaDiario(a, p) },
      { id: 'mapa',       nome: 'Mapa',       montar: (a, p) => this.abaMapa(a, p) },
      { id: 'comandos',   nome: 'Comandos',   montar: (a, p) => this.abaComandos(a, p) },
      { id: 'config',     nome: 'Configurações', montar: (a, p) => this.abaConfiguracoes(a, p) },
    ], { aoFechar: () => this.aoFecharCaderno() });

    this.caderno.abrir(idInicial);
  }

  aoFecharCaderno() {
    if (this.veioDaPausa) {
      this.painelPausa.setVisible(true);
    } else {
      this.physics.resume();
      this.toque?.mostrar();
    }
  }

  alternarInventario() {
    if (this.caderno?.aberto) { this.caderno.fechar(); return; }
    if (this.pausado) return;
    this.abrirCaderno('inventario', false);
  }

  /** Aberto pela pausa: o VOLTAR devolve a pausa, que e de onde se veio. */
  abrirInventario() {
    this.abrirCaderno('inventario', true);
  }

  fecharInventario() {
    this.caderno?.fechar();
  }

  // ------------------------------------------------------- lista e detalhe

  /**
   * O formato que o inventario e o diario compartilham: os nomes a esquerda,
   * e o que esta escolhido aberto a direita.
   *
   * Duas colunas e nao uma lista corrida porque a leitura muda: a esquerda e
   * "o que eu tenho", que se percorre com o olho, e a direita e um texto, que
   * se le. Misturar os dois faz a pessoa reler o que ja sabe para achar o que
   * nao sabe.
   */
  listaComDetalhe(area, painel, entradas, vazio) {
    if (!entradas.length) {
      painel.por(this.add
        .text(area.x + 6, area.y + 8, vazio, {
          fontFamily: FONTE, fontSize: '16px', color: HEX.ossoApagado, fontStyle: 'italic',
        }));
      return;
    }

    const larguraLista = Math.min(320, area.largura * 0.38);
    const xDetalhe = area.x + larguraLista + 40;
    const larguraDetalhe = area.largura - larguraLista - 40;

    // O filete entre as colunas. Sem ele as duas viram uma mancha so.
    painel.por(this.add.graphics()
      .lineStyle(1, CORES.dourado, 0.18)
      .lineBetween(area.x + larguraLista + 18, area.y - 2,
                   area.x + larguraLista + 18, area.y + area.altura - 10));

    const detalhe = { titulo: null, texto: null };
    const itens = [];

    const mostrar = (i) => {
      itens.forEach((t, k) => {
        t.setColor(k === i ? HEX.osso : HEX.ossoMorto);
        t.setAlpha(k === i ? 1 : 0.9);
      });
      detalhe.titulo.setText(entradas[i].nome);
      detalhe.texto.setText(entradas[i].texto);

      const chave = 'item/' + entradas[i].id;
      if (entradas[i].id && this.textures.exists(chave)) {
        detalhe.arte.setTexture(chave).setVisible(true);
        const fonte = this.textures.get(chave).getSourceImage();
        const escala = Math.min(
          detalhe.alturaArte / fonte.height,
          (larguraDetalhe * 0.7) / fonte.width
        );
        detalhe.arte.setScale(escala);
      } else {
        detalhe.arte.setVisible(false);
      }
    };

    let y = area.y + 4;
    entradas.forEach((entrada, i) => {
      const t = this.add
        .text(area.x + 6, y, entrada.nome, comSombra({
          fontFamily: FONTE, fontSize: '17px', color: HEX.ossoMorto,
        }))
        .setInteractive({ useHandCursor: true });

      t.on('pointerover', () => t.setColor(HEX.dourado));
      t.on('pointerout', () => mostrar(itens.indexOf(t)));
      t.on('pointerdown', () => mostrar(i));

      itens.push(t);
      painel.por(t);
      y += 32;
    });

    // A ILUSTRACAO
    //
    // Fica em cima do nome, centrada na coluna, e cabe na altura que sobrar. O
    // `setDisplaySize` respeita a proporcao pelo menor lado: um desenho alto
    // como o relogio de pendulo e um largo como os biscoitos ocupam o mesmo
    // espaco sem nenhum dos dois esticar.
    const alturaArte = Math.min(190, area.altura * 0.42);
    detalhe.arte = painel.por(this.add
      .image(xDetalhe + larguraDetalhe / 2, area.y + alturaArte / 2 + 4, '__nada__')
      .setVisible(false));

    detalhe.titulo = painel.por(this.add
      .text(xDetalhe, area.y + alturaArte + 22, '', comSombra({
        fontFamily: FONTE, fontSize: '23px', color: HEX.osso,
      })));

    detalhe.texto = painel.por(this.add
      .text(xDetalhe, area.y + alturaArte + 62, '', {
        fontFamily: FONTE, fontSize: '16px', color: HEX.ossoApagado,
        wordWrap: { width: larguraDetalhe },
        lineSpacing: 5,
      }));

    detalhe.alturaArte = alturaArte;

    mostrar(0);
  }

  // ----------------------------------------------------------------- abas

  abaInventario(area, painel) {
    const p = SaveManager.getProgresso();
    this.listaComDetalhe(
      area, painel,
      ORDEM_ITENS.filter((id) => p.itens.includes(id)).map((id) => ITENS[id]),
      'Nada ainda. Só a roupa do corpo.'
    );
  }

  abaDiario(area, painel) {
    const p = SaveManager.getProgresso();
    // Na ordem em que a fase OFERECE, e nao na que foram achadas: assim a lista
    // conta a historia na ordem certa mesmo para quem explorou fora de ordem.
    this.listaComDetalhe(
      area, painel,
      ORDEM_PISTAS.filter((id) => p.pistas.includes(id)).map((id) => PISTAS[id]),
      'Ela ainda não parou para olhar nada.'
    );
  }

  /**
   * O MAPA, ACESO COMODO A COMODO
   *
   * So aparece o que ela ja pisou, e uma passagem so aparece quando os DOIS
   * lados foram pisados — senao o mapa entregaria que existe algo do outro lado
   * da fresta, que e a descoberta que o §7 guarda.
   */
  /**
   * O MAPA — UM COMODO POR VEZ
   *
   * As plantas sao desenhadas a mao, e o que elas tem de bom e o DETALHE: no
   * quarto da para ver o relogio de parede, o quadro do coelho, o espelho
   * encostado. Espremer as cinco numa folha so transformaria isso em mancha —
   * entao cada uma ocupa a pagina inteira, e a faixa de baixo troca entre elas.
   *
   * A topologia nao se perde: embaixo da planta fica escrito o que sai dali,
   * e para onde. Quem so pisou o quarto le "a oeste, o corredor" e mais nada;
   * a fresta e a escada so entram depois de existirem.
   */
  abaMapa(area, painel) {
    const p = SaveManager.getProgresso();
    const visitadas = p.salas.filter((id) => MAPA_FASE1[id]);

    if (!visitadas.length) {
      painel.por(this.add
        .text(area.x + 6, area.y + 8, 'Ela ainda não saiu de onde acordou.', {
          fontFamily: FONTE, fontSize: '16px', color: HEX.ossoApagado, fontStyle: 'italic',
        }));
      return;
    }

    const aquiAgora = this.nomeDaSala ?? 'quarto';
    // Abre no comodo em que ela esta; depois obedece a ultima escolha.
    if (!visitadas.includes(this.mapaMostrando)) {
      this.mapaMostrando = visitadas.includes(aquiAgora) ? aquiAgora : visitadas[0];
    }
    const mostrando = this.mapaMostrando;

    // ------------------------------------------------------------ a folha
    //
    // Cada comodo agora e uma FOLHA INTEIRA — pergaminho, moldura, rosa dos
    // ventos e planta no mesmo desenho. Antes eram duas imagens empilhadas, um
    // papel comum mais a planta por cima; a arte nova ja vem composta, e
    // sobrepor as duas so daria moldura em cima de moldura.
    //
    // O `mapa-base` continua carregado: ele e o papel em branco que aparece
    // quando um comodo foi pisado mas ainda nao tem folha desenhada.
    const alturaFaixa = 44;
    // A linha "daqui:" ganhou faixa propria. Encostada no pe da folha ela caia
    // em cima da flor-de-lis do rodape do pergaminho, e ficava ilegivel — a
    // folha nova ocupa a altura toda do painel, entao nao ha sobra para tomar
    // emprestada.
    const alturaLinha = 24;
    const alturaFolha = area.altura - alturaFaixa - alturaLinha;

    const chaveFolha = 'mapa/' + mostrando;
    const temFolha = this.textures.exists(chaveFolha);

    const folha = this.add
      .image(0, 0, temFolha ? chaveFolha : 'mapa-base')
      .setOrigin(0.5);
    const escala = Math.min(area.largura / folha.width, alturaFolha / folha.height);
    folha.setScale(escala);
    folha.setPosition(area.x + area.largura / 2, area.y + alturaFolha / 2);
    painel.por(folha);

    if (temFolha) {
      // As passagens que ela ja descobriu, por cima da planta. Vem depois do
      // comodo e antes da espada: o buraco tem que cobrir a parede, e a espada
      // tem que ser vista mesmo caindo dentro dele.
      for (const camada of CAMADAS_FASE1) {
        if (camada.sala !== mostrando) continue;
        if (!SaveManager.temMarco(camada.marco)) continue;
        if (!this.textures.exists(camada.chave)) continue;
        painel.por(this.add
          .image(folha.x, folha.y, camada.chave)
          .setOrigin(0.5)
          .setScale(escala));
      }

      if (mostrando === aquiAgora) {
        painel.por(this.add
          // Abaixo do centro, e nao nele: no corredor o centro e exatamente onde
          // o lustre esta desenhado, e a espada sumia dentro dele.
          .text(folha.x, folha.y + folha.displayHeight * 0.16, '♠', {
            fontFamily: FONTE, fontSize: Math.max(15, Math.round(26 * escala)) + 'px',
            color: '#7a1f22',
          })
          // O contorno claro nao e enfeite: no sotao a espada cai bem na boca do
          // buraco, que e preta, e vinho sobre preto some. O pergaminho e claro
          // em todas as outras plantas, entao um fio cor de papel salva os dois
          // casos sem precisar de uma posicao especial por comodo.
          .setStroke('#e8dcc0', Math.max(2, Math.round(3 * escala)))
          .setOrigin(0.5));
      }
    } else {
      // Comodo pisado mas sem folha desenhada. Diz o que e, sem fingir mapa.
      painel.por(this.add
        .text(folha.x, folha.y, MAPA_FASE1[mostrando].nome, {
          fontFamily: FONTE, fontSize: Math.max(16, Math.round(26 * escala)) + 'px',
          color: '#5a4526',
        })
        .setOrigin(0.5));
      painel.por(this.add
        .text(folha.x, folha.y + 40, 'a planta deste cômodo ainda não foi desenhada', {
          fontFamily: FONTE, fontSize: '14px', color: '#7a6a4a', fontStyle: 'italic',
        })
        .setOrigin(0.5));
    }

    // O que sai daqui. E a topologia que a folha unica dava de graca — aqui ela
    // vira texto, e so mostra vizinho JA pisado.
    const saidas = LIGACOES_FASE1
      .filter((l) => l.de === mostrando || l.para === mostrando)
      .map((l) => ({ id: l.de === mostrando ? l.para : l.de, nota: l.nota }))
      .filter((v) => visitadas.includes(v.id));

    if (saidas.length) {
      const texto = saidas
        .map((v) => MAPA_FASE1[v.id].nome + (v.nota ? ' (' + v.nota + ')' : ''))
        .join('  ·  ');
      painel.por(this.add
        .text(folha.x, area.y + alturaFolha + 2, 'daqui:  ' + texto, {
          fontFamily: FONTE, fontSize: '13px', color: HEX.ossoApagado,
        })
        .setOrigin(0.5, 0));
    }

    // ------------------------------------------------------------- a faixa
    let x = area.x + 6;
    const y = area.y + alturaFolha + alturaLinha + 12;

    for (const id of visitadas) {
      const nome = MAPA_FASE1[id].nome;
      const aberto = id === mostrando;

      const t = painel.por(this.add
        .text(x, y, nome, comSombra({
          fontFamily: FONTE, fontSize: '16px',
          color: aberto ? HEX.dourado : HEX.ossoMorto,
        }))
        .setInteractive({ useHandCursor: true }));

      t.on('pointerover', () => { if (!aberto) t.setColor(HEX.osso); });
      t.on('pointerout', () => t.setColor(aberto ? HEX.dourado : HEX.ossoMorto));
      t.on('pointerdown', () => {
        this.mapaMostrando = id;
        // Remontar a aba inteira e mais simples e mais seguro que remendar o
        // que ja esta na tela — e ela e barata: sao duas imagens e um texto.
        painel.atual = null;
        painel.trocarPara('mapa');
      });

      // Onde ela esta agora ganha a espada, mesmo com outro comodo aberto.
      if (id === aquiAgora) {
        painel.por(this.add
          .text(x + t.width + 6, y + 2, '♠', {
            fontFamily: FONTE, fontSize: '12px', color: HEX.sangue,
          }));
        x += 16;
      }

      x += t.width + 30;
    }
  }

  /**
   * OS COMANDOS, ESCRITOS
   *
   * A dica do comeco da fase some sozinha e nunca falou de Q nem de Y. Adivinhar
   * comando nao e o mesmo que interpretar pista: o §43 pede que o jogador
   * descubra o MUNDO, nao a interface.
   *
   * A lista muda com o aparelho — no celular nao adianta falar de espaco e
   * shift, e no computador nao adianta desenhar botao.
   */
  abaComandos(area, painel) {
    const noToque = !!this.toque?.ativo;

    const lista = noToque
      ? [['analógico', 'andar em qualquer direção'],
         ['⌃', 'pular'], ['◇', 'observar'],
         ['»', 'correr — se estiver ligado'], ['☰', 'este caderno']]
      : [['A D  ← →', 'andar'], ['W S  ↑ ↓', 'fundo e frente'],
         ['espaço', 'pular'], ['shift', 'correr'], ['E', 'observar'],
         ['Q', 'comer o biscoito'], ['Y', 'este caderno'], ['esc', 'pausa']];

    let y = area.y + 4;
    for (const [tecla, oQue] of lista) {
      painel.por(this.add
        .text(area.x + 6, y, tecla, comSombra({
          fontFamily: FONTE, fontSize: '17px', color: HEX.osso,
        })));
      painel.por(this.add
        .text(area.x + 150, y, oQue, {
          fontFamily: FONTE, fontSize: '16px', color: HEX.ossoApagado,
        }));
      y += 30;
    }

    if (!noToque) {
      painel.por(this.add
        .text(area.x + 6, y + 12, 'F11 deixa em tela cheia.', {
          fontFamily: FONTE, fontSize: '13px', color: HEX.ossoMorto, fontStyle: 'italic',
        }));
    }
  }

  alternarPausa(forcar) {
    const novo = forcar ?? !this.pausado;
    if (novo === this.pausado) return;

    this.pausado = novo;

    // Despausar com o caderno aberto deixava o painel na tela por cima do jogo,
    // e o ESC seguinte so reabria a pausa por baixo dele.
    if (!novo && this.caderno?.aberto) {
      this.veioDaPausa = false;   // nao devolve a pausa: ela esta saindo dela
      this.caderno.fechar();
    }
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

    // O caderno responde antes do resto: com ele aberto o jogo esta parado, e a
    // unica coisa que ainda precisa funcionar e fecha-lo.
    if (this.caderno?.aberto && !this.veioDaPausa) {
      if (this.input_?.consumirInventario()) this.caderno.fechar();
      return;
    }
    if (this.pausado) return;
    if (this.input_?.consumirInventario()) { this.alternarInventario(); return; }

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
