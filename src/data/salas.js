/**
 * AS SALAS DA FASE 1
 *
 * Uma unica tabela descreve a fase inteira: que salas existem, por onde elas se
 * ligam, e o que cada uma tem dentro. A cena e a mesma para todas — ela le
 * daqui. Assim mudar o mapa e mudar dados, nao codigo.
 *
 * Coordenadas em FRACAO da largura da sala (0 = borda esquerda, 1 = direita).
 * Fracao e nao pixel porque cada desenho veio num tamanho diferente e foi
 * reescalado; fracao sobrevive a isso, pixel nao.
 *
 * `linhaDoChao` e o y, NA IMAGEM ORIGINAL, onde a parede encontra o piso. E o
 * unico numero medido a mao em cada arte, e o que alinha todas as salas na
 * mesma perspectiva.
 */

export const SALAS = {
  corredor: {
    imagem: 'sala-corredor',
    linhaDoChao: 620,
    terreno: 'madeira',
    nome: 'corredor',

    luzes: [
      // O lustre no meto do corredor.
      { x: 0.56, y: 0.05, raio: 420, forca: 0.42 },
      // A arandela da parede esquerda.
      { x: 0.17, y: 0.05, raio: 260, forca: 0.26 },
    ],

    saidas: [
      { lado: 'leste', para: 'quarto',   entrada: 'oeste' },
      { lado: 'oeste', para: 'despensa', entrada: 'leste' },
    ],

    /**
     * A fresta entulhada na parede do fundo. So a Alice PEQUENA entra.
     * Roteiro, secao 7: o tamanho abre caminho que nao existiria de outro jeito.
     */
    passagemBaixa: {
      x: 0.245, para: 'lateral', entrada: 'fresta',
      textoGrande: [
        'Tem um buraco na parede, atras do entulho.',
        'Do outro lado o ar e mais frio.',
        'Eu nao passo por aqui. Nao desse tamanho.',
      ],
      textoPequena: ['Agora cabe.'],
    },
  },

  despensa: {
    imagem: 'sala-despensa',
    linhaDoChao: 790,
    terreno: 'madeira',
    nome: 'despensa',

    luzes: [
      // A lampada pendurada, que e a unica coisa acesa aqui.
      { x: 0.28, y: 0.02, raio: 430, forca: 0.52 },
      // O lampiao fraco na prateleira da direita.
      { x: 0.79, y: 0.06, raio: 230, forca: 0.30 },
    ],

    saidas: [
      { lado: 'leste', para: 'corredor', entrada: 'oeste' },
    ],

    /**
     * Os biscoitos, nos vidros SHRINK e GROW da prateleira mais alta.
     * `altura` e a altura da prateleira em pixels de jogo: e o que decide se a
     * Alice alcanca pulando ou se precisa empilhar caixote antes.
     */
    biscoitos: [
      { id: 'shrink', x: 0.755, altura: 300, vira: 'pequena', rotulo: 'SHRINK' },
      { id: 'grow',   x: 0.815, altura: 300, vira: 'normal',  rotulo: 'GROW' },
    ],

    /** Os potes marcados. Ninguem aponta: quem reparar, guarda o numero. */
    observacoes: [
      {
        id: 'potes-tres', x: 0.185, altura: 150, raio: 130,
        rotulo: 'os potes',
        texto: [
          'Tres potes, e em cada um alguem escreveu um tres.',
          'Como se contar uma vez nao bastasse.',
        ],
      },
    ],
  },

  lateral: {
    imagem: 'sala-lateral',
    linhaDoChao: 720,
    terreno: 'madeira',
    nome: 'sala lateral',

    luzes: [
      { x: 0.30, y: 0.04, raio: 380, forca: 0.34 },
      // A janela, ao fundo.
      { x: 0.44, y: 0.02, raio: 300, forca: 0.30 },
    ],

    saidas: [
      { lado: 'fresta', para: 'corredor', entrada: 'fresta' },
    ],

    /**
     * O relogio de pendulo. Aqui ele marca 03:18 — um minuto DEPOIS do relogio
     * parado da sala principal. E a diferenca entre as duas salas, e e a
     * unica coisa que diz que o tempo andou deste lado.
     */
    relogioDePendulo: {
      x: 0.885, altura: 250, raio: 150, hora: 3, minuto: 18,
      texto: [
        'Tres e dezoito.',
        'O da sala tinha parado em dezessete.',
        'Este aqui andou. Um minuto a mais, e depois desistiu tambem.',
      ],
    },

    /** O mecanismo. Acertar 03:17 nele derruba a escada na sala principal. */
    mecanismo: { x: 0.12, altura: 210, raio: 150 },
  },

  sotao: {
    imagem: 'sala-sotao',
    linhaDoChao: 640,
    terreno: 'madeira',
    nome: 'sotao',

    luzes: [
      // A luz da lua pela janela redonda: fria, e a unica que diz que ela
      // esta no alto da casa.
      { x: 0.50, y: 0.02, raio: 400, forca: 0.44 },
      { x: 0.83, y: 0.08, raio: 240, forca: 0.28 },
    ],

    saidas: [
      { lado: 'escada', para: 'quarto', entrada: 'escada' },
    ],

    /** O buraco no assoalho. Cair nele custa uma espada. */
    buraco: { x: 0.47, largura: 0.14 },

    /** O relogio de bolso do Coelho, no fim da progressao (secao 9). */
    relogioDeBolso: { x: 0.845, altura: 190 },
  },
};

/**
 * Onde a Alice aparece ao entrar numa sala, por porta de entrada.
 *
 * Longe da borda de proposito: nascendo colada na faixa de saida, um passo na
 * direcao errada devolvia o jogador para a sala anterior na hora.
 */
export const ENTRADAS = {
  leste:  { x: 0.78, y: 0.42 },
  oeste:  { x: 0.22, y: 0.42 },
  fresta: { x: 0.245, y: 0.20 },
  escada: { x: 0.16, y: 0.40 },
};
