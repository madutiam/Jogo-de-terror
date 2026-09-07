/**
 * A FLORESTA — AS TELAS DA FASE 2
 *
 * Mesma ideia da tabela da fase 1: a cena e uma so, o que muda entre as telas
 * esta aqui. Estas tres nasceram provisorias dentro de `salas.js`, so para
 * poderem ser desenhadas e medidas; agora que a fase existe, elas moram no
 * proprio lugar.
 *
 * A DIRECAO DA FASE E O LESTE. Ela sai pela porta na ponta oeste da chegada e o
 * rastro de sangue aponta para dentro da floresta — quem seguir o sangue anda
 * na direcao certa sem que nenhum texto mande. E a mesma regra da fase 1, onde
 * a marca de arrasto puxava para o oeste.
 *
 * `linhaDoChao` e o y, NA ARTE ORIGINAL, onde o chao encontra o fundo. As tres
 * artes tem alturas diferentes (887, 724, 887) e o que as casa e a posicao
 * RELATIVA dessa linha — 48% da altura em todas —, nunca o numero absoluto.
 * Copiar o 430 da chegada para a corrida encolhia a tela e deixava um terco da
 * profundidade em chao pintado pelo motor.
 */
export const SALAS_FASE2 = {
  /**
   * ONDE ELA SAI DA CASA
   *
   * A porta com a caveira fica na ponta oeste, encostada na arvore. Dali para
   * o leste corre o rastro de sangue, e no chao ha xicaras quebradas e um
   * bule — a mesa do cha, muito depois da festa.
   */
  chegada: {
    imagem: 'fase2-chegada',
    linhaDoChao: 430,
    terreno: 'folhas',
    nome: 'a floresta',

    /** Galhos estalando. Sem intermitente: o silencio daqui e a chegada. */
    ambiente: { clipe: 'ambiente.galhos', volume: 0.34 },

    luzes: [],
    saidas: [
      { lado: 'leste', para: 'corrida', entrada: 'oeste' },
    ],
  },

  /**
   * A CORRIDA
   *
   * A tela mais larga do jogo (2172 contra os 1774 das outras), e e larga de
   * proposito: e nela que a Alice Demon aparece. Troncos caidos e um tronco oco
   * dao onde se esconder e onde tropecar.
   */
  corrida: {
    imagem: 'fase2-corrida',
    linhaDoChao: 350,
    terreno: 'folhas',
    nome: 'a floresta',

    /** Mais alto que na chegada: aqui o mato mexe porque alguma coisa mexe. */
    ambiente: {
      clipe: 'ambiente.galhos', volume: 0.40,
      intermitente: { clipe: 'efeito.sussurro', volume: 0.24, minMs: 14000, maxMs: 30000 },
    },

    luzes: [],
    saidas: [
      { lado: 'oeste', para: 'chegada', entrada: 'leste' },
      { lado: 'leste', para: 'espelho', entrada: 'oeste' },
    ],
  },

  /**
   * A CLAREIRA DO ESPELHO
   *
   * A unica tela da floresta com LUZ propria: uma claridade cai no meio do
   * chao e nao vem de lugar nenhum — nao ha lua nesta arte, nem fogo. E o
   * unico lugar da fase onde da para ver o proprio pe.
   */
  espelho: {
    imagem: 'fase2-espelho',
    linhaDoChao: 429,
    terreno: 'folhas',
    nome: 'a clareira',

    ambiente: { clipe: 'ambiente.sussurros', volume: 0.26 },

    luzes: [{ x: 0.52, y: 0.30, raio: 300, forca: 0.30 }],
    saidas: [
      { lado: 'oeste', para: 'corrida', entrada: 'leste' },
    ],
  },
};

/** Por onde a fase comeca: a porta da casa, na ponta oeste da chegada. */
export const PRIMEIRA_SALA_FASE2 = { sala: 'chegada', entrada: 'porta' };
