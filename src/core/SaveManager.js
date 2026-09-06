/**
 * Configuracoes e progresso, guardados no navegador.
 * Tudo aqui tolera localStorage bloqueado (aba anonima, iOS restrito):
 * se nao der para ler ou gravar, o jogo continua com os valores padrao.
 */

const CHAVE_CONFIG = 'alice-terror:config';
const CHAVE_PROGRESSO = 'alice-terror:progresso';

const CONFIG_PADRAO = {
  volumeGeral: 0.8,
  volumeMusica: 0.7,
  volumeEfeitos: 0.9,

  // ---- controles de toque (celular) ----
  /** Multiplica o tamanho dos botoes: 0.8 pequeno, 1 medio, 1.3 grande. */
  tamanhoControles: 1,
  /** 'analogico' (arrastar) ou 'direcional' (cruz de quatro botoes). */
  tipoControle: 'analogico',
  /** 'destro' = andar na esquerda; 'canhoto' = tudo espelhado. */
  ladoControles: 'destro',
  /** Botao dedicado de correr. Sem ele, correr e empurrar o analogico ate o fim
   *  — o que nao existe na cruz direcional. */
  botaoCorrer: false,
  /** Preenchimento dos botoes: 0.06 discreto, 0.12 medio, 0.24 visivel. */
  opacidadeControles: 0.12,
};

const PROGRESSO_PADRAO = {
  /** Ultima fase alcancada. */
  fase: 1,
  /** Id do checkpoint dentro da fase, ou null para o inicio. */
  checkpoint: null,
  /** Pistas ja encontradas, por id. As tres fases compartilham esta lista. */
  pistas: [],
  /** Itens no bolso da Alice (relogio, chave, pedaco de roupa...). */
  itens: [],
};

function ler(chave, padrao) {
  try {
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return { ...padrao };
    return { ...padrao, ...JSON.parse(bruto) };
  } catch (erro) {
    console.warn('[save] nao consegui ler "' + chave + '":', erro);
    return { ...padrao };
  }
}

function gravar(chave, valor) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    console.warn('[save] nao consegui gravar "' + chave + '":', erro);
    return false;
  }
}

let config = ler(CHAVE_CONFIG, CONFIG_PADRAO);
let progresso = ler(CHAVE_PROGRESSO, PROGRESSO_PADRAO);

export const SaveManager = {
  // ---- configuracoes ----

  getConfig() {
    return { ...config };
  },

  setConfig(parcial) {
    config = { ...config, ...parcial };
    gravar(CHAVE_CONFIG, config);
    return { ...config };
  },

  // ---- progresso ----

  getProgresso() {
    return { ...progresso, pistas: [...progresso.pistas], itens: [...progresso.itens] };
  },

  /** Salva o ponto atual. So deve ser chamado depois de uma conquista real. */
  salvarCheckpoint(fase, checkpoint) {
    progresso = { ...progresso, fase, checkpoint };
    gravar(CHAVE_PROGRESSO, progresso);
  },

  registrarPista(id) {
    if (progresso.pistas.includes(id)) return false;
    progresso = { ...progresso, pistas: [...progresso.pistas, id] };
    gravar(CHAVE_PROGRESSO, progresso);
    return true;
  },

  temPista(id) {
    return progresso.pistas.includes(id);
  },

  registrarItem(id) {
    if (progresso.itens.includes(id)) return false;
    progresso = { ...progresso, itens: [...progresso.itens, id] };
    gravar(CHAVE_PROGRESSO, progresso);
    return true;
  },

  temItem(id) {
    return progresso.itens.includes(id);
  },

  /** Existe jogo comecado? Usado pelo menu para decidir entre JOGAR e CONTINUAR. */
  temProgresso() {
    return progresso.fase > 1 || progresso.checkpoint !== null || progresso.itens.length > 0;
  },

  apagarProgresso() {
    progresso = { ...PROGRESSO_PADRAO, pistas: [], itens: [] };
    gravar(CHAVE_PROGRESSO, progresso);
  },
};
