/**
 * O QUE A ALICE CARREGA, E O QUE ELA REPAROU
 *
 * Nao e inventario de RPG (regra 48: nada de sistema grande sem necessidade).
 * Sao duas listas curtas — o que esta com ela, e o que ela ja entendeu — para o
 * jogador poder reler as pistas sem ter que refazer o caminho.
 *
 * O texto e a leitura DELA, nao a explicacao do jogo: nenhuma linha aqui diz
 * para onde ir nem resolve enigma nenhum (regra 43). Reler "tres potes, e um
 * tres em cada" continua exigindo que alguem junte esse tres com os outros.
 *
 * O que NAO entra: os marcadores de progresso (`abertura-fase1`,
 * `viu-highsfield-01`, `mecanismo`). Eles vivem na mesma lista de itens do save,
 * mas nao sao coisas — sao lembretes que o jogo guarda para si.
 */

export const ITENS = {
  'biscoitos': {
    id: 'biscoitos',
    nome: 'Dois vidros de biscoito',
    texto: 'Um diz SHRINK, o outro GROW. Ela levou os dois — a pergunta nunca foi qual, e sim onde.',
  },
  'relogio-de-bolso': {
    id: 'relogio-de-bolso',
    nome: 'O relógio do Coelho',
    texto: 'O vidro está quebrado e os ponteiros pararam em três e dezessete. Mas está andando de novo.',
  },
};

export const PISTAS = {
  'xicara-quebrada': {
    id: 'xicara-quebrada',
    nome: 'A xícara quebrada',
    texto: 'Caiu de perto do chão: os cacos ficaram juntos, não espalhados.',
  },
  'cadeira-virada': {
    id: 'cadeira-virada',
    nome: 'A cadeira virada',
    texto: 'Tombada para trás, como quem se levanta depressa demais.',
  },
  'marca-de-arrasto': {
    id: 'marca-de-arrasto',
    nome: 'A marca de arrasto',
    texto: 'Vai enfraquecendo para o oeste. Alguma coisa foi levada por ali, e não andou sozinha.',
  },
  'tufo-de-pelo': {
    id: 'tufo-de-pelo',
    nome: 'Um tufo de pelo',
    texto: 'Pelo branco preso numa lasca do rodapé. Arrancado, não caído. Era ele.',
  },
  'potes-tres': {
    id: 'potes-tres',
    nome: 'Os três potes',
    texto: 'Três potes, e em cada um alguém escreveu um três. Como se contar uma vez não bastasse.',
  },
  'relogio-0317': {
    id: 'relogio-0317',
    nome: 'O relógio da parede',
    texto: 'Parou em três e dezessete.',
  },
  'relogio-0318': {
    id: 'relogio-0318',
    nome: 'O relógio de pêndulo',
    texto: 'Três e dezoito. O da sala tinha parado em dezessete — deste lado o tempo andou um minuto a mais.',
  },
  'espelho-rachado': {
    id: 'espelho-rachado',
    nome: 'O espelho rachado',
    texto: 'A rachadura começa por dentro.',
  },
};

/** Na ordem em que a fase as oferece, para a lista contar a historia na ordem. */
export const ORDEM_PISTAS = [
  'xicara-quebrada', 'cadeira-virada', 'marca-de-arrasto', 'relogio-0317',
  'espelho-rachado', 'tufo-de-pelo', 'potes-tres', 'relogio-0318',
];

export const ORDEM_ITENS = ['biscoitos', 'relogio-de-bolso'];
