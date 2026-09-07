/**
 * A PLANTA DA FASE 1, PARA O MAPA
 *
 * O mapa nao e um desenho: e esta tabela, acesa comodo a comodo conforme ela
 * entra. Quem nunca pisou na sala lateral nao ve que ela existe — e nem que ha
 * uma passagem saindo do corredor para baixo.
 *
 * As posicoes sao FRACAO da base do mapa (`mapa-base.png`), e nao pixel: o
 * papel dela e escalado para caber na aba, e uma coordenada em pixel sairia do
 * lugar em toda tela de tamanho diferente.
 *
 * Elas tambem fogem dos CANTOS: o papel tem rosas, o relogio, a chave e as
 * cartas no alto e no rodape a esquerda, e um comodo caindo ali sumiria dentro
 * do ornamento. O oeste continua a esquerda, como a rosa dos ventos dela ensina,
 * e o sotao continua por cima do quarto.
 */
export const MAPA_FASE1 = {
  despensa: { nome: 'a despensa',     fx: 0.28, fy: 0.50 },
  corredor: { nome: 'o corredor',     fx: 0.48, fy: 0.50 },
  quarto:   { nome: 'o quarto',       fx: 0.70, fy: 0.50 },
  sotao:    { nome: 'o sótão',        fx: 0.70, fy: 0.25 },
  lateral:  { nome: 'a sala lateral', fx: 0.48, fy: 0.75 },
};

/**
 * As passagens. Uma linha so aparece quando os DOIS comodos ja foram pisados —
 * senao o mapa entregaria que existe algo do outro lado da fresta, que e
 * exatamente a descoberta que o §7 guarda.
 */
export const LIGACOES_FASE1 = [
  { de: 'despensa', para: 'corredor' },
  { de: 'corredor', para: 'quarto' },
  { de: 'corredor', para: 'lateral', nota: 'só a Alice pequena' },
  { de: 'quarto',   para: 'sotao',   nota: 'a escada' },
];

/**
 * AS CAMADAS DE PASSAGEM
 *
 * Uma planta e o comodo como ele e; estas sao as descobertas que se somam a
 * ele. A fresta so aparece na planta do corredor depois que a Alice PASSOU por
 * ela — enquanto ela nao coube, do outro lado nao existe nada, e um buraco
 * desenhado ali entregaria de graca o que a secao 7 guarda.
 *
 * Cada camada e um PNG do tamanho da folha, com o desenho ja no lugar certo:
 * assim o encaixe e uma sobreposicao, sem uma tabela de coordenadas para
 * manter sincronizada com a arte.
 */
export const CAMADAS_FASE1 = [
  { marco: 'fresta', sala: 'corredor', chave: 'mapa/fresta' },
];
