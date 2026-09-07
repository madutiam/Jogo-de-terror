/**
 * A CAPTURA — QUANDO A ALICE DEMON ALCANCA A ALICE
 *
 * Dezoito quadros: a ultima passada da perseguicao, a garra, o agarrao, a luta,
 * e o corpo no chao. E o unico desenho do jogo com as DUAS na mesma imagem.
 *
 * Por isso ele nao entra na folha da Alice. Aquela folha e de um personagem so:
 * cada quadro e ancorado pelo centro do vestido DELA e alinhado pelos pes numa
 * tela comum. Aqui as duas se tocam, se sobrepoem e trocam de posicao entre um
 * quadro e o outro — nao ha vestido unico para ancorar, e separa-las exigiria
 * redesenhar o que ela ja resolveu junto. Entao a captura e tratada como o que
 * e: uma cena, desenhada como cena e tocada como cena.
 *
 * O ALINHAMENTO. Os dezoito quadros foram assentados pela BASE (o chao) e pela
 * ESQUERDA, e nao pelo centro de cada desenho. Encostando a esquerda, a Alice
 * Demon fica plantada e a Alice e que se aproxima dela — que e o que a sequencia
 * conta. Centralizando cada quadro no proprio desenho, as duas derivavam pela
 * tela a cada troca de quadro.
 */
export const MORTE_DEMON = {
  /** Quantos quadros a cena tem. */
  quadros: 18,

  /** Tamanho da tela comum dos quadros, em pixel. */
  tela: { W: 503, H: 250 },

  /**
   * Onde a Alice esta no PRIMEIRO quadro, em fracao da tela.
   *
   * E a origem do sprite: assentando a cena neste ponto, a Alice do desenho
   * cai exatamente em cima de onde a Alice do jogo estava, e a Demon aparece
   * atras dela, a esquerda. Sem isto a cena nasceria deslocada do lugar onde a
   * perseguicao terminou.
   */
  ancora: { x: 0.5239, y: 1 },

  /**
   * Altura da Alice EM PE dentro do desenho, em pixel.
   *
   * Serve para casar o tamanho: a Alice do jogo mede ALICE_ALTURA (253) na
   * tela dela, entao a cena e escalada por 253/173 antes da perspectiva. Sem
   * isso a cena entraria menor que a Alice que ela substitui.
   */
  alturaDaAlice: 173,

  /** Quanto dura cada quadro. 18 x 110 = 1,98 s de cena. */
  msPorQuadro: 110,

  /** O ultimo quadro — o corpo no chao — fica parado antes de a tela apagar. */
  msSegurando: 420,
};
