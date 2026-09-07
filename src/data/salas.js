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

/**
 * O TAMANHO UTIL DE CADA PECA
 *
 * As pecas foram gravadas numa tela comum, com folga transparente em volta.
 * `displayHeight` da imagem, portanto, NAO e a altura do desenho. Estes numeros
 * sao o desenho de verdade, medidos pixel a pixel — sem eles a peca aparece num
 * lugar e a colisao fica em outro.
 *
 * Um por variante, na ordem 0..3.
 */
export const MEDIDA_DA_PECA = {
  caixote:          [[320, 252], [394, 252], [422, 266], [422, 252]],
  escada:           [[218, 614], [342, 556], [364, 550], [340, 564]],
  mecanismo:        [[414, 590], [414, 592], [414, 588], [414, 586]],
  'ponteiro-curto': [[120, 254], [186, 204], [236, 146], [254, 128]],
  'ponteiro-longo': [[116, 346], [264, 296], [330, 208], [484, 118]],
  prateleira:       [[482, 136], [474, 148], [476, 142], [484, 148]],
  tabua:            [[452, 148], [448, 166], [448, 188], [452, 148]],
  viga:             [[444, 140], [444, 146], [440, 174], [436, 166]],
};

export const SALAS = {
  corredor: {
    imagem: 'sala-corredor',
    linhaDoChao: 620,
    terreno: 'madeira',
    nome: 'corredor',

    /**
     * Corredor comprido e estreito, e a unica sala que tem PORTAS nas duas
     * pontas. O silencio vem mais baixo que no quarto para abrir espaco ao
     * rangido — que nunca toca perto: e sempre uma porta que ela ja passou, ou
     * uma que ainda nao abriu. O som faz o jogador olhar para tras. Nao tem
     * nada la; e essa a graca.
     */
    ambiente: {
      clipe: 'ambiente.silencio', volume: 0.30,
      intermitente: { clipe: 'efeito.rangido', volume: 0.30, minMs: 12000, maxMs: 25000 },
    },

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
     * O rastro continua. Ele passa direto pela fresta e segue para o oeste,
     * na direcao da despensa — quem estava sendo arrastado nao entrou pelo
     * buraco.
     */
    rastros: [
      { chave: 'arrasto', x: 0.78, y: 700, escala: 0.95, alpha: 0.42, angulo: -5 },
      { chave: 'poca-media', x: 0.66, y: 664, escala: 0.7, alpha: 0.4 },
      {
        chave: 'tufo-pelo', x: 0.56, y: 716, escala: 0.9, alpha: 0.9,
        rotulo: 'um tufo de pelo', pista: 'tufo-de-pelo',
        texto: [
          'Pelo branco, preso numa lasca do rodape.',
          'Arrancado, nao caido.',
          'Era ele.',
        ],
      },
      { chave: 'arrasto', x: 0.44, y: 734, escala: 0.9, alpha: 0.3, angulo: -4, virar: true },
      { chave: 'pegada',  x: 0.34, y: 776, escala: 0.75, alpha: 0.26, angulo: -9 },
      { chave: 'arrasto', x: 0.22, y: 748, escala: 0.85, alpha: 0.18, angulo: -3 },
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

    /**
     * Comodo pequeno, fechado e cheio de coisa ate o teto. Som abafado e o que
     * o ouvido espera de uma despensa — e o contraste com o corredor, que ela
     * acabou de deixar, vende os dois de uma vez.
     */
    ambiente: { clipe: 'ambiente.silencio', volume: 0.22 },

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
     * O PARKOUR DA DESPENSA
     *
     * Os caixotes que ela ja desenhou no chao viram degrau de verdade. Subir
     * neles e a unica maneira de alcancar a prateleira dos biscoitos.
     *
     * As alturas foram escolhidas contra o pulo medido (128 px normal, 70 px
     * pequena):
     *   chao -> caixote baixo   96  ok de pulo normal, alto demais para a pequena
     *   baixo -> caixote alto  178  degrau de 82
     *   alto -> prateleira     210  degrau de 32
     */
    /**
     * O PARKOUR DA DESPENSA
     *
     * Os caixotes que ela desenhou no chao viram degrau de verdade. Subir neles
     * e a unica maneira de alcancar a prateleira dos biscoitos.
     *
     * `apoio` fica no chao e a altura sai do proprio desenho.
     * `saliencia` esta presa na parede, na altura dada.
     *
     * As alturas foram escolhidas contra o pulo MEDIDO — 128 px normal, 70 px
     * pequena — para a subida so existir no tamanho grande:
     *   chao      -> caixote 1   101   sobe de pulo normal; pequena nao alcanca
     *   caixote 1 -> caixote 2   207   degrau de 106
     *   caixote 2 -> prateleira  240   degrau de 33
     */
    plataformas: [
      { chave: 'caixote', variante: 0, x: 0.545, escala: 0.40, tipo: 'apoio' },
      { chave: 'caixote', variante: 2, x: 0.650, escala: 0.40, tipo: 'apoio',
        sobre: 101 },
      { chave: 'prateleira', variante: 1, x: 0.755, escala: 0.62,
        tipo: 'saliencia', topo: 240 },
    ],

    /**
     * Os dois vidros, na prateleira mais alta.
     *
     * Ela pega OS DOIS de uma vez. Nao e escolha de qual: os dois ficam com ela
     * e dali em diante a pergunta e ONDE usar cada tamanho — que e o que o
     * roteiro pede na secao 7. Pegar um so criaria beco sem saida: quem
     * encolhesse la em cima nao subiria de novo para pegar o outro.
     */
    biscoitos: { x: 0.755, altura: 280 },

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

    /**
     * A SALA QUE O SOM RESOLVE
     *
     * Ela tem um relogio de pendulo desenhado na parede, marcando 03:18 —
     * um minuto depois do relogio parado do quarto. O tic-tac baixinho nao e
     * enfeite: e a sala dizendo, pelo ouvido, exatamente o que o mostrador diz
     * pelo olho. Do outro lado da fresta o tempo andou.
     *
     * Bem baixo de proposito. Alto demais viraria aviso; assim e uma coisa que
     * o jogador nota sozinho, e a descoberta continua sendo dele.
     */
    ambiente: { clipe: 'ambiente.tictac', volume: 0.18 },

    luzes: [
      { x: 0.30, y: 0.04, raio: 380, forca: 0.34 },
      // A janela, ao fundo.
      { x: 0.44, y: 0.02, raio: 300, forca: 0.30 },
    ],

    /**
     * Nao ha porta nesta sala: ela so se entra pela fresta, e so se sai por
     * ela. Como a Alice chegou aqui pequena, sair e imediato — mas se ela
     * comeu o GROW la dentro, precisa encolher de novo. Beco sem saida nao
     * existe: os dois biscoitos andam com ela.
     */
    saidas: [],
    saidasPorPonto: [
      {
        x: 0.245, altura: 80, raio: 130, para: 'corredor', entrada: 'fresta',
        exigeTamanho: 'pequena',
        rotulo: 'a fresta',
        textoBloqueado: [
          'A fresta continua ali.',
          'Deste tamanho eu nao volto por ela.',
        ],
      },
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

    /**
     * O mecanismo. Acertar 03:17 nele derruba a escada no quarto principal.
     * O numero nao esta aqui: esta no relogio parado do quarto, nos tres potes
     * da despensa e no pendulo desta sala, que marca um minuto depois.
     */
    mecanismo: { x: 0.115, altura: 230, raio: 150, escala: 0.42 },
  },

  sotao: {
    imagem: 'sala-sotao',
    linhaDoChao: 640,
    terreno: 'madeira',
    nome: 'sotao',

    /**
     * O ponto mais alto da casa, com uma janela redonda. Estalos de galho
     * baixinhos passam por vento no telhado — e sussurro raro, tao espacado
     * que fica a duvida se veio de fora ou de dentro.
     *
     * O sussurro e EFEITO, nao ambiente: so toca uma camada de ambiente por
     * vez, e trocar o vento pelo sussurro perderia o vento.
     */
    ambiente: {
      clipe: 'ambiente.galhos', volume: 0.26,
      intermitente: { clipe: 'efeito.sussurro', volume: 0.22, minMs: 35000, maxMs: 75000 },
    },

    luzes: [
      // A luz da lua pela janela redonda: fria, e a unica que diz que ela
      // esta no alto da casa.
      { x: 0.50, y: 0.02, raio: 400, forca: 0.44 },
      { x: 0.83, y: 0.08, raio: 240, forca: 0.28 },
    ],

    saidas: [],
    saidasPorPonto: [
      {
        x: 0.115, altura: 200, raio: 140, para: 'quarto', entrada: 'escada',
        rotulo: 'a escada',
        texto: ['Melhor descer enquanto ainda da.'],
      },
    ],

    /**
     * O PARKOUR DO SOTAO — a progressao que termina no relogio (secao 9)
     *
     * Contra o pulo medido de 128 px, e sempre por cima do buraco:
     *   chao   -> caixote   106
     *   caixote-> viga      196   degrau de 90
     *   viga   -> tabua     262   degrau de 66
     * O relogio esta a 262: so alcanca quem chegou na tabua.
     *
     * A Alice PEQUENA (pulo 70) nao sobe nem no primeiro caixote. O sotao
     * inteiro e territorio do tamanho normal — e isso ja foi dito antes, na
     * escada de degraus faltando.
     */
    plataformas: [
      { chave: 'caixote', variante: 3, x: 0.300, escala: 0.42, tipo: 'apoio' },
      { chave: 'viga',    variante: 0, x: 0.470, escala: 0.60,
        tipo: 'saliencia', topo: 196 },
      { chave: 'tabua',   variante: 2, x: 0.660, escala: 0.52,
        tipo: 'saliencia', topo: 262 },
    ],

    /**
     * O buraco no assoalho, embaixo da viga. Cair custa uma espada — e a
     * unica coisa da Fase 1 que machuca.
     */
    buraco: { x: 0.470, largura: 300 },

    /** O relogio de bolso do Coelho, no fim da progressao (secao 9). */
    relogioDeBolso: { x: 0.700, altura: 262 },
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
  /** Fase 2: a porta com a caveira, encostada na arvore da ponta oeste. */
  porta:  { x: 0.10, y: 0.55 },
};
