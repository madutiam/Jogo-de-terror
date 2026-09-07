/**
 * FASE 1 — O QUARTO
 *
 * Sala grande, vista em perspectiva. A Alice anda livre pelo chao, para os
 * lados e para o fundo, e a camera acompanha nos dois eixos. Ela fica maior
 * quando vem para a frente e menor quando se afasta.
 *
 * A sala e montada a partir do desenho original (`cenario 1`), desmontado em
 * pecas e remontado maior — ver `QuartoExtendido`. A mobilia desenhada vira
 * obstaculo de verdade: a Alice contorna, e se pular alto o bastante sobe em
 * cima. E dai que vai sair o parkour.
 *
 * O que ainda NAO esta aqui, porque depende de arte que nao existe:
 *   - biscoitos e a mecanica de tamanho
 *   - o relogio de bolso do Coelho como item
 *   - a porta destrancada e a passagem para a Fase 2
 *   - a Alice de costas (hoje ela continua de frente ao andar para o fundo)
 */

import {
  SCENES, PROFUNDIDADE, ALICE_TAMANHO, profundidadeDeDesenho,
} from '../core/constants.js';
import { dimensoes } from '../core/tela.js';
import { GameplayScene } from './GameplayScene.js';
import { AudioManager } from '../core/AudioManager.js';
import { SaveManager } from '../core/SaveManager.js';
import { QuartoExtendido } from '../objects/QuartoExtendido.js';
import { RelogioDeParede } from '../objects/RelogioDeParede.js';
import { preencherBuracos } from '../core/texturas.js';
import { CORES, HEX, FONTE } from '../ui/theme.js';
import { relatorio } from '../core/MissingAssets.js';

/**
 * Uma mancha escura de bordas suaves, para sombra de contato.
 * Elipse desenhada com borda dura le como adesivo; com degrade le como sombra.
 */
function sombraSuave(cena) {
  const chave = 'sombra/suave';
  if (cena.textures.exists(chave)) return chave;

  const lado = 256;
  const textura = cena.textures.createCanvas(chave, lado, lado);
  const ctx = textura.getContext();
  const meio = lado / 2;
  const degrade = ctx.createRadialGradient(meio, meio, 0, meio, meio, meio);
  degrade.addColorStop(0.00, 'rgba(0,0,0,1)');
  degrade.addColorStop(0.45, 'rgba(0,0,0,0.72)');
  degrade.addColorStop(0.78, 'rgba(0,0,0,0.22)');
  degrade.addColorStop(1.00, 'rgba(0,0,0,0)');
  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, lado, lado);
  textura.refresh();
  return chave;
}

/**
 * O RASTRO NO CHAO DO QUARTO
 *
 * Onde a coisa aconteceu: perto da mesa e da cadeira virada. Dali sai uma marca
 * de arrasto que vai enfraquecendo para o OESTE, ate o vao que da no corredor.
 *
 * Isto e a direcao da fase. Nenhum texto manda ir para o oeste; quem seguir o
 * sangue sai pelo lado certo por conta propria. E o que a secao 8 pede: a
 * informacao esta no ambiente, e nao existe seta.
 *
 * A opacidade cai junto com a distancia — sangue arrastado vai acabando.
 */
const RASTROS_DO_QUARTO = [
  // O ponto onde comecou.
  { chave: 'poca-grande', x: 1120, y: 604, escala: 1.0, alpha: 0.95 },
  { chave: 'respingos',   x: 1218, y: 566, escala: 0.9, alpha: 0.8, angulo: 14 },
  { chave: 'respingos',   x: 1032, y: 646, escala: 0.7, alpha: 0.7, angulo: -22, virar: true },
  { chave: 'poca-media',  x: 1186, y: 662, escala: 0.8, alpha: 0.75 },

  // A marca de arrasto, indo embora.
  {
    chave: 'arrasto', x: 968, y: 650, escala: 1.0, alpha: 0.85, angulo: -7,
    rotulo: 'a marca no chao', pista: 'marca-de-arrasto',
    texto: [
      'Isto nao e pegada.',
      'Alguma coisa foi puxada por aqui, e nao se soltou no caminho.',
      'Vai para a porta dos fundos.',
    ],
  },
  { chave: 'arrasto', x: 806, y: 686, escala: 0.95, alpha: 0.66, angulo: -5, virar: true },
  { chave: 'pegada',  x: 726, y: 758, escala: 0.8,  alpha: 0.5,  angulo: -12 },
  { chave: 'arrasto', x: 632, y: 706, escala: 0.9,  alpha: 0.5,  angulo: -6 },
  { chave: 'pegada',  x: 540, y: 776, escala: 0.75, alpha: 0.38, angulo: -8, virar: true },
  { chave: 'arrasto', x: 448, y: 724, escala: 0.85, alpha: 0.36, angulo: -4, virar: true },
  { chave: 'arrasto', x: 276, y: 742, escala: 0.8,  alpha: 0.22, angulo: -3 },
];

const SALA = {
  largura: 2400,
  profundidade: PROFUNDIDADE.FRENTE,
  /**
   * A Alice nao passa desta linha para o fundo.
   * MEDIDO: com 496 ela parava ANTES de todos os moveis e nunca esbarrava em
   * nenhum. 478 poe os pes dela na mesma faixa das bases desenhadas.
   */
  limiteFundo: 478,
};

export class Phase1Scene extends GameplayScene {
  constructor() {
    super(SCENES.PHASE1, {
      terreno: 'madeira',
      largura: SALA.largura,
      profundidade: SALA.profundidade,
      limiteFundo: SALA.limiteFundo,
    });
    this.faseNumero = 1;
  }

  /** Recebe de onde ela veio, quando volta de outra sala. */
  init(dados) {
    // A cena volta a ser usada quando a Alice retorna de outra sala.
    this.trocandoDeSala = false;
    this.saindoDaFase = false;
    this.entrada = dados?.entrada || null;
    this.tamanhoDaAlice = dados?.tamanho || 'normal';
  }

  create() {
    this.tela = dimensoes(this);
    // Com o relogio no bolso, a porta de pedra cede (roteiro, secao 11).
    this.portaCedeu = SaveManager.temItem('relogio-de-bolso');
    // A porta so entra no mapa quando cede. Antes disso ela e parede.
    if (this.portaCedeu) SaveManager.registrarMarco('porta');
    this.cameras.main.setBackgroundColor(CORES.preto);

    // ---- sala ----
    this.quarto = new QuartoExtendido(this, SALA);

    // O relogio da parede passa a marcar 03:17, como na historia. Ele mora
    // dentro do trecho original, entao acompanha o deslocamento dele.
    this.relogio = new RelogioDeParede(this, {
      hora: 3,
      minuto: 17,
      deslocamentoX: this.quarto.centroX - 58,
      profundidade: -17.5,
    });

    this.montarPorta();

    // ---- jogabilidade ----
    const inicio = this.entrada === 'oeste'
      ? { x: 200, y: 700 }
      : { x: this.paraSala(430), y: 700 };
    this.montarJogabilidade(inicio);

    // Quem saiu pequena, volta pequena.
    this.alice.tamanho = ALICE_TAMANHO[this.tamanhoDaAlice] || ALICE_TAMANHO.normal;
    this.alice.aplicarPegada();

    this.montarObstaculos();
    this.montarObservacoes();
    this.montarEscadaDoSotao();
    this.montarRastros(RASTROS_DO_QUARTO);

    // ---- audio (regra 34: ambiente e passos, sem musica por cima) ----
    this.descobrirSala('quarto');

    AudioManager.pararMusica(400);
    AudioManager.tocarAmbiente('ambiente.silencio', 2600);

    // A ABERTURA E DA PARTIDA, NAO DO COMODO
    //
    // `abrir()` rodava em TODA entrada no quarto: voltando do corredor,
    // descendo do sotao, reiniciando a fase. Alem de repetir a fala, ela tirava
    // o controle por dois segundos a cada vez — o que numa fase que passa pelo
    // quarto quatro vezes vira pedagio.
    //
    // Duas condicoes, e as duas importam. `entrada` so vem preenchida quando a
    // Alice chega de OUTRA sala, entao ela sozinha ja barra o vaivem. E o item
    // no save garante o resto: reiniciar a fase para testar nao repete a fala,
    // mas RECOMECAR do menu apaga o progresso e a abertura volta a existir,
    // porque ai e uma partida nova de verdade.
    if (!this.entrada && !SaveManager.temItem('abertura-fase1')) {
      SaveManager.registrarItem('abertura-fase1');
      this.abrir();
    } else {
      this.voltarAoQuarto();
    }
  }

  /** Converte uma coordenada X do desenho original para a sala grande. */
  paraSala(xOriginal) {
    return this.quarto.paraSala(xOriginal);
  }

  // ------------------------------------------------------------------- cenario

  /**
   * A porta de pedra, no fim da parede. E a saida — hoje ainda trancada.
   *
   * Antes ela era so a imagem colada sobre a parede, e por isso parecia
   * adesivo: nao tinha sombra, nao encostava no chao e nao recebia luz
   * nenhuma. Agora vem com as tres coisas — o que faz um objeto pertencer a
   * um lugar nao e a arte dele, e o contato com o resto.
   */
  montarPorta() {
    // A arte da porta veio vazada: o removedor de fundo comeu a argamassa
    // entre os blocos de pedra junto com o fundo. Isto fecha so os buracos
    // cercados pelo desenho, com a cor escura da propria porta.
    preencherBuracos(this, 'porta', 'porta/recorte', {
      x: 28, y: 37, largura: 352, altura: 573,
    });

    this.portaX = SALA.largura - 300;
    const baseY = 492;

    // Sombra projetada no chao, para a frente: a porta deixa de flutuar.
    this.add
      .image(this.portaX, baseY - 4, sombraSuave(this))
      .setOrigin(0.5, 0.5)
      .setDisplaySize(250, 96)
      .setAlpha(0.62)
      .setDepth(-19);

    this.porta = this.add
      .image(this.portaX, baseY, 'porta/recorte')
      .setOrigin(0.5, 1)
      .setScale(0.46)
      .setDepth(-16.5);

    // Sombra de contato, curta e fechada, na linha em que ela toca o chao.
    this.add
      .image(this.portaX, baseY - 1, sombraSuave(this))
      .setOrigin(0.5, 0.5)
      .setDisplaySize(190, 34)
      .setAlpha(0.8)
      .setDepth(-16.4);

    // E um pouco de luz, para ela pertencer a iluminacao da sala em vez de
    // ficar mais clara ou mais escura que tudo em volta.
    this.quarto.adicionarLuz(this.portaX, baseY + 40, 360, 0.42);
  }

  // ---------------------------------------------------------------- obstaculos

  /**
   * A mobilia desenhada vira pegada no chao. A Alice contorna; pulando alto o
   * bastante, sobe em cima (e ai o `topo` vira o chao dela).
   */
  montarObstaculos() {
    // A mobilia desenhada vira obstaculo. A lista mora no QuartoExtendido,
    // porque o tutorial usa exatamente o mesmo quarto.
    this.quarto.montarMobilia(this);

    // A porta de pedra tambem ocupa chao.
    this.criarObstaculo({
      x: this.portaX,
      y: 492,
      largura: 150,
      profundidade: 26,
    });
  }

  // ---------------------------------------------------------------- observacoes

  /**
   * Pontos de observacao. Nenhum deles diz para onde ir (regra 43):
   * eles descrevem o que a Alice ve, e o jogador junta as pecas.
   */
  montarObservacoes() {
    this.criarInterativo({
      x: this.paraSala(433),
      y: 540,
      raio: 130,
      alturaMarca: 90,
      aoInteragir: () => {
        AudioManager.abafarMusica(0.2, 400);
        AudioManager.tocar('efeito.sussurro');
        this.dialogo.mostrar(
          [
            'Três e dezessete.',
            'O ponteiro não passa daí. Nem quando eu espero.',
            'O relógio dele também tinha parado nessa hora.',
          ],
          {
            rotulo: 'o relógio da parede',
            // Sem checkpoint aqui: olhar o relogio e uma descoberta, nao uma
            // conquista (regra 10). O primeiro checkpoint da fase vai ser a
            // coleta do relogio de bolso, quando o asset existir.
            aoFechar: () => {
              AudioManager.restaurarMusica(900);
              this.registrarPista('relogio-0317');
            },
          }
        );
      },
    });

    this.criarInterativo({
      x: this.paraSala(172),
      y: 520,
      raio: 100,
      alturaMarca: 30,
      aoInteragir: () => {
        this.dialogo.mostrar(
          [
            'A xícara está quebrada do lado de dentro.',
            'Alguém derrubou de cima. Não caiu sozinha.',
          ],
          { rotulo: 'xícara', aoFechar: () => this.registrarPista('xicara-quebrada') }
        );
      },
    });

    this.criarInterativo({
      x: this.paraSala(298),
      y: 512,
      raio: 100,
      alturaMarca: 70,
      aoInteragir: () => {
        this.dialogo.mostrar(
          [
            'A cadeira está virada para a porta.',
            'Ele não estava sentado. Estava se levantando.',
          ],
          { rotulo: 'cadeira', aoFechar: () => this.registrarPista('cadeira-virada') }
        );
      },
    });

    this.criarInterativo({
      x: this.paraSala(790),
      y: 520,
      raio: 110,
      alturaMarca: 100,
      aoInteragir: () => {
        AudioManager.tocar('efeito.espelho');
        this.dialogo.mostrar(
          [
            'O espelho está rachado no meio.',
            'A rachadura começa por dentro.',
          ],
          { rotulo: 'espelho', aoFechar: () => this.registrarPista('espelho-rachado') }
        );
      },
    });

    this.criarInterativo({
      x: this.portaX,
      y: 540,
      raio: 130,
      alturaMarca: 130,
      aoInteragir: () => {
        if (!this.portaCedeu) {
          AudioManager.tocar('efeito.rangido');
          this.dialogo.mostrar(
            ['Fria.', 'E do outro lado não vem som nenhum.'],
            { rotulo: 'a porta de pedra' }
          );
          return;
        }
        // Roteiro, secao 11: com o relogio na mao, a porta que estava
        // inacessivel cede.
        this.atravessarAPorta();
      },
    });
  }

  /**
   * O relogio de bolso NAO fica mais aqui.
   *
   * Ele estava em cima da comoda deste quarto porque, quando eu fechei a fase
   * pela primeira vez, o sotao nao existia. Existe agora — e o roteiro e claro
   * na secao 9: o relogio esta no FIM de uma progressao de parkour, nao no
   * primeiro movel do primeiro comodo. Ver SalaScene.montarRelogioDeBolso.
   *
   * O que sobrou aqui e a consequencia: com o relogio no bolso, a porta cede.
   */
  /**
   * A ESCADA QUEBRADA
   *
   * Ela nao existe ate o mecanismo da sala lateral ser resolvido. E o que o
   * roteiro pede: o enigma abre o desafio fisico. Antes disso o sotao nao e
   * inalcancavel — ele simplesmente nao esta la.
   *
   * Depois de cair, ainda ha um segundo portao: faltam degraus, e a Alice
   * PEQUENA nao alcanca os que sobraram. Para subir, ela precisa comer o GROW.
   */
  montarEscadaDoSotao() {
    if (!SaveManager.temItem('mecanismo')) return;

    // Longe da marca de arrasto (x 968): com os dois juntos, os raios de
    // interacao se cobriam e um escondia o outro.
    const x = 520;
    const chao = 560;

    this.escada = this.add
      .image(x, chao, 'peca/escada-1')
      .setOrigin(0.5, 1)
      .setScale(0.44)
      .setDepth(profundidadeDeDesenho(chao) - 0.3);

    this.criarInterativo({
      x,
      y: chao + 20,
      raio: 130,
      alturaMarca: 210,
      aoInteragir: () => {
        if (this.alice.tamanho.id === 'pequena') {
          this.dialogo.mostrar(
            [
              'Faltam degraus.',
              'Do jeito que eu estou, o primeiro ja fica longe demais.',
            ],
            { rotulo: 'Alice' }
          );
          return;
        }
        this.subirParaOSotao();
      },
    });
  }

  subirParaOSotao() {
    if (this.trocandoDeSala) return;
    this.trocandoDeSala = true;

    this.alice.pararPassos();
    AudioManager.tocar('efeito.rangido');
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.SALA, {
        sala: 'sotao', entrada: 'escada', tamanho: this.alice.tamanho.id,
      });
    });
  }

  /**
   * FIM DA FASE 1 (roteiro, secao 11)
   *
   * Este metodo foi apagado sem querer quando o relogio de bolso mudou de
   * lugar: eu recortei o trecho entre dois marcadores do arquivo e ele estava
   * no meio. Sem ele, apertar E na porta ja destrancada lancava uma excecao
   * dentro do update — e o jogo TRAVAVA na porta, sem mensagem nenhuma.
   *
   * Recuperado do historico, identico ao que era.
   */
  /**
   * FIM DA FASE 1 (roteiro, secao 11)
   *
   * A porta cede e a cena passa para a HIGHSFIELD 02, que e onde ela abre de
   * verdade e a floresta aparece. Aqui so o som, o escurecer e a passagem —
   * o cartao de fim mora la, junto com o resto da cinematica.
   */
  atravessarAPorta() {
    if (this.saindoDaFase) return;
    this.saindoDaFase = true;

    this.entrarEmCinematica();
    AudioManager.tocar('efeito.rangido');
    this.cameras.main.fadeOut(1200, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.HIGHSFIELD02);
    });
  }

  /** Guarda a pista e da o retorno de descoberta. */
  registrarPista(id, xCheckpoint, yCheckpoint) {
    const nova = SaveManager.registrarPista(id);
    if (!nova) return;

    AudioManager.tocar('efeito.item');

    const aviso = this.add
      .text(this.tela.largura / 2, 92, 'uma pista', {
        fontFamily: FONTE, fontSize: '17px', color: HEX.dourado,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1300)
      .setAlpha(0);

    this.tweens.add({
      targets: aviso,
      alpha: 0.9,
      duration: 400,
      yoyo: true,
      hold: 1100,
      onComplete: () => aviso.destroy(),
    });

    if (xCheckpoint !== undefined) {
      this.marcarCheckpoint(xCheckpoint, yCheckpoint, id);
    }

  }

  // ------------------------------------------------------------------- abertura

  /**
   * Voltar ao quarto vindo de outro comodo. So a luz acendendo: sem caixa,
   * sem cinematica, sem esperar. O controle nunca sai da mao do jogador.
   */
  voltarAoQuarto() {
    this.cameras.main.fadeIn(420, 0, 0, 0);
  }

  /**
   * Entrada da fase (regra 6): a Alice aparece, a caixa apresenta o objetivo,
   * o controle volta. Curto — a ideia e o jogador querer olhar em volta.
   */
  abrir() {
    this.entrarEmCinematica();
    this.cameras.main.fadeIn(1800, 0, 0, 0);

    this.time.delayedCall(2100, () => {
      this.dialogo.mostrar(
        [
          'O quarto está frio.',
          'Ele esteve aqui. Não faz muito tempo.',
          'Alguma coisa levou o Coelho — e deixou o rastro do que fez.',
        ],
        {
          rotulo: 'Alice',
          aoFechar: () => {
            this.sairDeCinematica();
            this.mostrarDica();
          },
        }
      );
    });
  }

  /** Dica de controle, discreta, some sozinha. Nao indica caminho. */
  mostrarDica() {
    const texto = this.toque?.ativo
      ? 'analógico para andar em qualquer direção · ⌃ pula · ◇ observa'
      : 'W A S D ou setas para andar · espaço para pular · E para observar';

    const dica = this.add
      .text(this.tela.largura / 2, this.tela.altura - 44, texto, {
        fontFamily: FONTE, fontSize: '15px', color: HEX.ossoApagado,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1300)
      .setAlpha(0);

    this.tweens.add({
      targets: dica,
      alpha: 0.75,
      duration: 700,
      yoyo: true,
      hold: 4600,
      onComplete: () => dica.destroy(),
    });

    // Deixa registrado no console o que faltou de arte nesta sessao.
    this.time.delayedCall(2000, () => relatorio());
  }

  // --------------------------------------------------------------------- update

  update(tempo, delta) {
    super.update(tempo, delta);
    if (this.pausado || this.saindoDaFase) return;

    // A escuridao anda junto: a sala grande so existe em volta dela.
    this.quarto.seguirComEscuridao(this.alice.x, this.alice.y);

    // A ponta oeste do quarto e um vao aberto: da no corredor.
    //
    // O LIMITE SAI DA FISICA, NAO DE UM NUMERO ESCRITO A MAO.
    //
    // Estava 150, e era inalcancavel: o mundo reserva MARGEM_LATERAL (130) na
    // borda e o corpo dela tem 58 de largura, entao o centro da Alice nunca
    // passa de 159 andando. Ela batia na parede invisivel e nada acontecia —
    // os outros quatro comodos da fase eram INACESSIVEIS pelo caminho normal.
    //
    // A mesma armadilha ja tinha sido paga uma vez na SalaScene (faixa de
    // porta a 70 px, atras do limite) e esta escrita no ESTADO-DO-PROJETO.
    // Escrever o numero na mao de novo era so esperar a vez. Agora ele nasce
    // do proprio limite do mundo mais meio corpo: se a margem ou a Alice
    // mudarem de tamanho, a faixa acompanha.
    const faixaDoVao =
      this.physics.world.bounds.x + this.alice.body.width / 2 + 24;

    if (this.alice.x <= faixaDoVao && !this.trocandoDeSala) {
      this.trocandoDeSala = true;
      this.alice.pararPassos();
      this.cameras.main.fadeOut(420, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.SALA, {
          sala: 'corredor', entrada: 'leste', tamanho: this.alice.tamanho.id,
        });
      });
    }
  }
}
