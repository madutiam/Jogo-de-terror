/**
 * A PLANTA DA FASE 1, PARA O MAPA
 *
 * O mapa nao e um desenho: e esta tabela, acesa comodo a comodo conforme ela
 * entra. Quem nunca pisou na sala lateral nao ve que ela existe — e nem que ha
 * uma passagem saindo do corredor para baixo.
 *
 * As posicoes sao de GRADE, nao de pixel. Elas nao precisam bater com o mapa de
 * verdade (o corredor tem 1345 e a despensa 914, e no mapa os dois ocupam uma
 * casa cada): o que importa e a topologia — quem liga em quem, e de que lado.
 * Uma planta em escala seria menos legivel e nao diria nada a mais.
 *
 * `col` cresce para o LESTE e `lin` para o SUL, na mesma leitura do jogo: a
 * despensa fica a oeste de tudo, o sotao por cima do quarto.
 */
export const MAPA_FASE1 = {
  despensa: { nome: 'a despensa', col: 0, lin: 1 },
  corredor: { nome: 'o corredor', col: 1, lin: 1 },
  quarto:   { nome: 'o quarto',   col: 2, lin: 1 },
  lateral:  { nome: 'a sala lateral', col: 1, lin: 2 },
  sotao:    { nome: 'o sótão',    col: 2, lin: 0 },
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
