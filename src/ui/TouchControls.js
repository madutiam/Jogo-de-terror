/**
 * Controles de toque (regra 37).
 *
 * O jogador escolhe nas configuracoes:
 *   tamanho    — pequeno, medio ou grande
 *   tipo       — analogico, direcional (cruz) ou seguir o dedo
 *   lado       — destro (andar na esquerda) ou canhoto (tudo espelhado)
 *   opacidade  — quao visiveis os botoes ficam sobre o cenario escuro
 *   correr     — botao dedicado de correr, ligado ou desligado
 *
 * Os tres tipos existem porque nenhum serve para todo mundo: o analogico e
 * preciso mas exige o polegar parado; a cruz e confiavel mas nao tem meio-termo;
 * seguir o dedo e o mais confortavel para explorar, e o unico que funciona bem
 * com o aparelho na mao so.
 *
 * Nao aparecem no computador, a menos que o aparelho tenha tela sensivel ao toque.
 */

import { CORES, HEX, FONTE } from './theme.js';
import { SaveManager } from '../core/SaveManager.js';
import { calcularLayout } from './layoutControles.js';
import { dimensoes } from '../core/tela.js';

const ZONA_MORTA = 0.18;
/** No modo "seguir", mais longe que isto do personagem e corrida. */
const DISTANCIA_PARA_CORRER = 150;
/** E mais perto que isto conta como "chegou": ela para. */
const DISTANCIA_MINIMA = 18;

export function suportaToque() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
}

/**
 * Prende pecas de interface a camera.
 *
 * Um filho de container HERDA o desenho do pai, mas NAO herda o fator de
 * rolagem para efeito de clique: o botao aparece parado na tela e a area
 * clicavel dele fica no mundo, longe, andando com a camera. Por isso cada peca
 * e presa uma a uma, e nao pelo container.
 */
function prenderNaCamera(...pecas) {
  for (const peca of pecas) peca?.setScrollFactor(0);
}

export class TouchControls {
  /**
   * @param {Phaser.Scene} cena
   * @param {import('../core/InputManager.js').InputManager} input
   * @param {{forcar?: boolean, alvo?: () => {x:number, y:number}}} opcoes
   *   alvo: onde o personagem esta NA TELA. So o modo "seguir" precisa disso.
   */
  constructor(cena, input, opcoes = {}) {
    this.cena = cena;
    this.input = input;
    this.alvo = opcoes.alvo || null;
    this.ativo = opcoes.forcar || suportaToque();

    if (!this.ativo) return;

    this.tela = dimensoes(cena);
    this.layout = calcularLayout(SaveManager.getConfig(), this.tela);
    this.container = cena.add.container(0, 0).setScrollFactor(0).setDepth(1100);

    if (this.layout.tipo === 'direcional') this.criarDirecional();
    else if (this.layout.tipo === 'seguir') this.criarSeguir();
    else this.criarAnalogico();

    this.criarBotao(this.layout.pulo, 'pulo');
    this.criarBotao(this.layout.acao, 'interagir');
    if (this.layout.correr) this.criarBotaoCorrer(this.layout.correr);
    if (this.layout.inventario) this.criarBotao(this.layout.inventario, 'inventario');

    // Enquanto o dialogo estiver aberto os controles saem da frente.
    cena.events.on('dialogo:abriu', this.esconder, this);
    cena.events.on('dialogo:fechou', this.mostrar, this);
    cena.events.once('shutdown', this.destroy, this);
  }

  // ------------------------------------------------------------------- area

  /** Retangulo invisivel que capta o toque de andar. */
  criarAreaDeMovimento(usarTelaInteira = false) {
    const area = this.layout.areaMovimento;
    const cena = this.cena;

    this.areaMovimento = cena.add
      .rectangle(
        usarTelaInteira ? 0 : area.x,
        usarTelaInteira ? 0 : area.y,
        usarTelaInteira ? this.tela.largura : area.largura,
        usarTelaInteira ? this.tela.altura : area.altura
      )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1099)
      .setInteractive({ useHandCursor: false });

    this.areaMovimento.setFillStyle(0x000000, 0);
    return this.areaMovimento;
  }

  // ---------------------------------------------------------------- analogico

  criarAnalogico() {
    const cena = this.cena;
    const mov = this.layout.movimento;

    this.base = cena.add.circle(mov.x, mov.y, mov.raio, CORES.osso, this.layout.opacidade);
    this.base.setStrokeStyle(2, CORES.osso, this.layout.opacidadeBorda);

    this.knob = cena.add.circle(mov.x, mov.y, mov.knob, CORES.osso, this.layout.opacidade * 2);
    this.knob.setStrokeStyle(2, CORES.osso, this.layout.opacidadeBorda);

    this.container.add([this.base, this.knob]);
    prenderNaCamera(this.base, this.knob);

    // A metade da tela do lado de andar toda vira area do analogico: o polegar
    // nao precisa acertar o circulo.
    const area = this.criarAreaDeMovimento();
    this.ponteiro = null;

    area.on('pointerdown', (ponteiro) => {
      this.ponteiro = ponteiro.id;
      this.base.setPosition(ponteiro.x, ponteiro.y);
      this.knob.setPosition(ponteiro.x, ponteiro.y);
      this.atualizarAnalogico(ponteiro);
    });

    this.aoMover = (ponteiro) => {
      if (this.ponteiro === ponteiro.id) this.atualizarAnalogico(ponteiro);
    };

    this.aoSoltar = (ponteiro) => {
      if (this.ponteiro !== ponteiro.id) return;
      this.ponteiro = null;
      this.base.setPosition(mov.x, mov.y);
      this.knob.setPosition(mov.x, mov.y);
      this.zerarMovimento();
    };

    cena.input.on('pointermove', this.aoMover);
    cena.input.on('pointerup', this.aoSoltar);
    cena.input.on('pointerupoutside', this.aoSoltar);
  }

  atualizarAnalogico(ponteiro) {
    const mov = this.layout.movimento;
    const dx = ponteiro.x - this.base.x;
    const dy = ponteiro.y - this.base.y;
    const distancia = Math.min(Math.hypot(dx, dy), mov.raio);
    const angulo = Math.atan2(dy, dx);

    this.knob.setPosition(
      this.base.x + Math.cos(angulo) * distancia,
      this.base.y + Math.sin(angulo) * distancia
    );

    const ex = Phaser.Math.Clamp(dx / mov.raio, -1, 1);
    const ey = Phaser.Math.Clamp(dy / mov.raio, -1, 1);
    const forca = Math.hypot(ex, ey);

    if (forca < ZONA_MORTA) {
      this.zerarMovimento();
      return;
    }

    this.input.toque.eixoX = ex;
    this.input.toque.eixoY = ey;
    // Sem botao de correr, empurrar o analogico ate o fim faz ela correr.
    if (!this.layout.correr) this.input.toque.correndo = forca > 0.82;
  }

  // --------------------------------------------------------------- direcional

  /** Cruz de quatro botoes. Dois apertados ao mesmo tempo dao a diagonal. */
  criarDirecional() {
    const mov = this.layout.movimento;
    this.direcoes = { cima: false, baixo: false, esquerda: false, direita: false };

    const lista = [
      { nome: 'cima',     dx: 0,  dy: -1, rotulo: '▲' },
      { nome: 'baixo',    dx: 0,  dy: 1,  rotulo: '▼' },
      { nome: 'esquerda', dx: -1, dy: 0,  rotulo: '◀' },
      { nome: 'direita',  dx: 1,  dy: 0,  rotulo: '▶' },
    ];

    for (const direcao of lista) {
      const x = mov.x + direcao.dx * mov.afastamento;
      const y = mov.y + direcao.dy * mov.afastamento;

      const { circulo, rotulo } = this.desenharBotao(x, y, mov.botao, direcao.rotulo, 0.7);

      const marcar = (valor) => {
        this.direcoes[direcao.nome] = valor;
        this.realcar(circulo, rotulo, valor);
        this.aplicarDirecional();
      };

      circulo
        .setInteractive(
          new Phaser.Geom.Circle(mov.botao, mov.botao, mov.botao * 1.3),
          Phaser.Geom.Circle.Contains
        )
        .on('pointerdown', () => marcar(true))
        .on('pointerup', () => marcar(false))
        .on('pointerout', () => marcar(false));
    }
  }

  aplicarDirecional() {
    const d = this.direcoes;
    this.input.toque.eixoX = (d.direita ? 1 : 0) - (d.esquerda ? 1 : 0);
    this.input.toque.eixoY = (d.baixo ? 1 : 0) - (d.cima ? 1 : 0);
    // Na cruz nao existe "empurrar ate o fim": correr so com o botao.
  }

  // -------------------------------------------------------------------- seguir

  /**
   * Segue o dedo: encoste em qualquer lugar e a Alice caminha para la.
   * Sem widget fixo — so um alvo discreto onde o dedo esta. E o modo mais
   * confortavel para explorar, e o que menos cobre a tela.
   */
  criarSeguir() {
    const cena = this.cena;

    this.marcaAlvo = cena.add
      .circle(0, 0, 14 * this.layout.escala, CORES.osso, this.layout.opacidade * 1.6)
      .setScrollFactor(0)
      .setDepth(1098)
      .setVisible(false);
    this.marcaAlvo.setStrokeStyle(2, CORES.osso, this.layout.opacidadeBorda);
    this.container.add(this.marcaAlvo);
    prenderNaCamera(this.marcaAlvo);

    // Aqui a tela inteira responde — menos onde estao os botoes, que ficam
    // por cima e captam o toque antes.
    const area = this.criarAreaDeMovimento(true);
    this.ponteiro = null;
    this.destino = null;

    area.on('pointerdown', (ponteiro) => {
      this.ponteiro = ponteiro.id;
      this.destino = { x: ponteiro.x, y: ponteiro.y };
      this.marcaAlvo.setPosition(ponteiro.x, ponteiro.y).setVisible(true);
    });

    this.aoMover = (ponteiro) => {
      if (this.ponteiro !== ponteiro.id) return;
      this.destino = { x: ponteiro.x, y: ponteiro.y };
      this.marcaAlvo.setPosition(ponteiro.x, ponteiro.y);
    };

    this.aoSoltar = (ponteiro) => {
      if (this.ponteiro !== ponteiro.id) return;
      this.ponteiro = null;
      this.destino = null;
      this.marcaAlvo.setVisible(false);
      this.zerarMovimento();
    };

    cena.input.on('pointermove', this.aoMover);
    cena.input.on('pointerup', this.aoSoltar);
    cena.input.on('pointerupoutside', this.aoSoltar);

    // A direcao muda a cada quadro, porque a Alice se move em direcao ao dedo.
    this.aoAtualizar = () => this.atualizarSeguir();
    cena.events.on('update', this.aoAtualizar);
  }

  atualizarSeguir() {
    if (!this.destino || !this.alvo) return;

    const origem = this.alvo();
    const dx = this.destino.x - origem.x;
    const dy = this.destino.y - origem.y;
    const distancia = Math.hypot(dx, dy);

    if (distancia < DISTANCIA_MINIMA) {
      this.zerarMovimento();
      return;
    }

    this.input.toque.eixoX = dx / distancia;
    this.input.toque.eixoY = dy / distancia;
    if (!this.layout.correr) {
      this.input.toque.correndo = distancia > DISTANCIA_PARA_CORRER;
    }
  }

  zerarMovimento() {
    this.input.toque.eixoX = 0;
    this.input.toque.eixoY = 0;
    if (!this.layout.correr) this.input.toque.correndo = false;
  }

  // ------------------------------------------------------------------- botoes

  /** Desenha o circulo e o rotulo de um botao, sem ligar comportamento. */
  desenharBotao(x, y, raio, texto, proporcaoFonte = 0.85) {
    const circulo = this.cena.add.circle(x, y, raio, CORES.osso, this.layout.opacidade);
    circulo.setStrokeStyle(2, CORES.osso, this.layout.opacidadeBorda);

    const rotulo = this.cena.add
      .text(x, y, texto, {
        fontFamily: FONTE,
        fontSize: Math.round(raio * proporcaoFonte) + 'px',
        color: HEX.osso,
      })
      .setOrigin(0.5)
      .setAlpha(this.layout.opacidadeRotulo);

    this.container.add([circulo, rotulo]);
    prenderNaCamera(circulo, rotulo);
    return { circulo, rotulo };
  }

  realcar(circulo, rotulo, aceso) {
    circulo.setFillStyle(CORES.osso, aceso ? this.layout.opacidade * 2.6 : this.layout.opacidade);
    rotulo.setAlpha(aceso ? 1 : this.layout.opacidadeRotulo);
  }

  criarBotao(config, acao) {
    const { circulo, rotulo } = this.desenharBotao(config.x, config.y, config.raio, config.rotulo);

    const soltar = () => {
      this.realcar(circulo, rotulo, false);
      if (acao === 'pulo') this.input.toque.puloSegurado = false;
    };

    circulo
      .setInteractive(
        new Phaser.Geom.Circle(config.raio, config.raio, config.raio * 1.25),
        Phaser.Geom.Circle.Contains
      )
      .on('pointerdown', () => {
        this.input.toque[acao] = true;
        // Segurar o botao de pulo conta como "segurado": e o que permite o
        // pulo de altura variavel tambem no celular.
        if (acao === 'pulo') this.input.toque.puloSegurado = true;
        this.realcar(circulo, rotulo, true);
      })
      .on('pointerup', soltar)
      .on('pointerout', soltar);
  }

  /**
   * Botao de correr: alterna, nao segura. Segurar dois botoes e andar ao mesmo
   * tempo e demais para um polegar so — e na perseguicao da Fase 2 nao pode
   * escapar.
   */
  criarBotaoCorrer(config) {
    const { circulo, rotulo } = this.desenharBotao(config.x, config.y, config.raio, config.rotulo);
    let ligado = false;

    circulo
      .setInteractive(
        new Phaser.Geom.Circle(config.raio, config.raio, config.raio * 1.3),
        Phaser.Geom.Circle.Contains
      )
      .on('pointerdown', () => {
        ligado = !ligado;
        this.input.toque.correndo = ligado;
        this.realcar(circulo, rotulo, ligado);
      });
  }

  // --------------------------------------------------------------- visibilidade

  esconder() {
    if (!this.ativo) return;
    this.container.setVisible(false);
    this.areaMovimento?.disableInteractive();
    this.zerarMovimento();
  }

  mostrar() {
    if (!this.ativo) return;
    this.container.setVisible(true);
    this.areaMovimento?.setInteractive();
  }

  destroy() {
    if (!this.ativo) return;
    this.cena.events.off('dialogo:abriu', this.esconder, this);
    this.cena.events.off('dialogo:fechou', this.mostrar, this);
    if (this.aoAtualizar) this.cena.events.off('update', this.aoAtualizar);
    if (this.aoMover) this.cena.input.off('pointermove', this.aoMover);
    if (this.aoSoltar) {
      this.cena.input.off('pointerup', this.aoSoltar);
      this.cena.input.off('pointerupoutside', this.aoSoltar);
    }
    this.container.destroy();
    this.areaMovimento?.destroy();
  }
}
