/**
 * Onde ficam os controles de toque, a partir das preferencias do jogador.
 *
 * Este calculo mora aqui, sozinho, porque duas telas precisam dele: os
 * controles de verdade (`TouchControls`) e a previa da tela de configuracoes.
 * Se o layout mudasse em dois lugares, um dia eles iam divergir.
 */

import { GAME } from '../core/constants.js';

const MARGEM = 26;

const BASE = {
  movimento: { raio: 68, knob: 32, botaoDirecional: 30, afastamento: 54 },
  pulo: { raio: 46, rotulo: '⌃' },
  acao: { raio: 38, rotulo: '◇' },
  correr: { raio: 34, rotulo: '»' },
  /** Inventario. Vive num CANTO, longe do polegar que joga: abrir a lista
   *  por engano no meio de um pulo seria pior que nao ter botao. */
  inventario: { raio: 26, rotulo: '☰' },
};

/**
 * Onde os botoes de acao ficam em volta do botao de pulo.
 * Direcao (x, y) em coordenadas de tela — y negativo e para cima.
 */
const ORBITA = {
  acao: { x: -0.970, y: -0.243 },
  correr: { x: -0.410, y: -0.912 },
};

export const TAMANHOS = [
  { id: 0.8, nome: 'pequeno' },
  { id: 1.0, nome: 'médio' },
  { id: 1.3, nome: 'grande' },
];

export const TIPOS = [
  { id: 'analogico', nome: 'analógico' },
  { id: 'direcional', nome: 'direcional' },
  { id: 'seguir', nome: 'seguir' },
];

export const LADOS = [
  { id: 'destro', nome: 'destro' },
  { id: 'canhoto', nome: 'canhoto' },
];

export const OPACIDADES = [
  { id: 0.06, nome: 'discreto' },
  { id: 0.12, nome: 'médio' },
  { id: 0.24, nome: 'visível' },
];

export const CORRER = [
  { id: false, nome: 'sem botão' },
  { id: true, nome: 'com botão' },
];

/**
 * @param {{tamanhoControles:number, tipoControle:string, ladoControles:string,
 *          opacidadeControles:number, botaoCorrer:boolean}} config
 * @param {{largura:number, altura:number}} [tela] tamanho real da tela; sem
 *   ele usa a base de projeto. Os botoes ficam ancorados nos CANTOS, entao
 *   numa tela mais larga eles acompanham a borda em vez de ficarem no meio.
 * @returns layout em coordenadas do jogo
 */
export function calcularLayout(config, tela) {
  const LARGURA = tela?.largura ?? GAME.WIDTH;
  const ALTURA = tela?.altura ?? GAME.HEIGHT;

  const escala = config.tamanhoControles ?? 1;
  const canhoto = config.ladoControles === 'canhoto';
  const tipo = config.tipoControle ?? 'analogico';
  const espelhar = (x) => (canhoto ? LARGURA - x : x);

  const raioMov = BASE.movimento.raio * escala;
  const raioPulo = BASE.pulo.raio * escala;

  const movimento = {
    x: espelhar(MARGEM + raioMov),
    y: ALTURA - MARGEM - raioMov,
    raio: raioMov,
    knob: BASE.movimento.knob * escala,
    botao: BASE.movimento.botaoDirecional * escala,
    afastamento: BASE.movimento.afastamento * escala,
  };

  const pulo = {
    x: espelhar(LARGURA - MARGEM - raioPulo),
    y: ALTURA - MARGEM - raioPulo,
    raio: raioPulo,
    rotulo: BASE.pulo.rotulo,
  };

  /** Coloca um botao em orbita ao redor do pulo, sem encostar nele. */
  const emOrbita = (nome) => {
    const raio = BASE[nome].raio * escala;
    const distancia = raioPulo + raio + 18 * escala;
    const direcao = ORBITA[nome];
    // O x da orbita tambem espelha, mas o pulo ja veio espelhado: por isso o
    // deslocamento e calculado antes e refletido junto.
    const dx = direcao.x * distancia * (canhoto ? -1 : 1);
    return {
      x: pulo.x + dx,
      y: pulo.y + direcao.y * distancia,
      raio,
      rotulo: BASE[nome].rotulo,
    };
  };

  const acao = emOrbita('acao');
  const correr = config.botaoCorrer ? emOrbita('correr') : null;

  // O botao de inventario nao entra na orbita do pulo: fica no canto de CIMA,
  // do lado oposto ao HUD de espadas, onde o polegar nao passa jogando.
  // NAO espelha com o canhoto: o HUD de espadas mora no canto superior
  // ESQUERDO, e espelhando o botao caia em cima dele. Este e o unico controle
  // que fica no mesmo lugar para os dois — e tudo bem, porque nao e um controle
  // de jogar: e para ler, com o jogo parado.
  const raioInv = BASE.inventario.raio * escala;
  const inventario = {
    x: LARGURA - MARGEM - raioInv,
    y: MARGEM + raioInv,
    raio: raioInv,
    rotulo: BASE.inventario.rotulo,
  };

  const opacidade = config.opacidadeControles ?? 0.12;

  return {
    escala,
    canhoto,
    tipo,
    inventario,
    /** Opacidade do preenchimento; borda e rotulo saem daqui. */
    opacidade,
    opacidadeBorda: Math.min(1, opacidade * 2.4),
    opacidadeRotulo: Math.min(1, 0.35 + opacidade * 2),
    /** Metade da tela em que o polegar de andar trabalha. */
    areaMovimento: {
      x: canhoto ? LARGURA * 0.5 : 0,
      y: ALTURA * 0.32,
      largura: LARGURA * 0.5,
      altura: ALTURA * 0.68,
    },
    movimento,
    pulo,
    acao,
    correr,
  };
}
