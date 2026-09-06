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
 * Onde o relogio de bolso do Coelho espera.
 *
 * Roteiro, secao 9: "No final dessa progressao esta o relogio quebrado do
 * Coelho." Ele fica EM CIMA da comoda — a Alice precisa subir para alcancar.
 * Nao existe texto mandando pular: quem tentar pegar do chao ouve que esta
 * alto demais, e isso basta.
 */
const RELOGIO = { movel: 'comoda', escala: 0.30 };

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
    this.montarRelogioDeBolso();

    // ---- audio (regra 34: ambiente e passos, sem musica por cima) ----
    AudioManager.pararMusica(400);
    AudioManager.tocarAmbiente('ambiente.silencio', 2600);

    this.abrir();
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
      x: 70,
      y: 540,
      raio: 120,
      alturaMarca: 110,
      aoInteragir: () => {
        AudioManager.tocar('efeito.rangido');
        this.dialogo.mostrar(
          ['A passagem está trancada.', 'Não tem fechadura deste lado.'],
          { rotulo: 'passagem' }
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
   * O relogio de bolso do Coelho, em cima da comoda.
   *
   * O jogador ve a marca dourada de longe e, ao chegar, descobre que ela esta
   * acima da cabeca dele. A conclusao — preciso subir — e dele. O roteiro pede
   * exatamente isso na secao 9: o parkour faz parte da investigacao.
   */
  montarRelogioDeBolso() {
    if (SaveManager.temItem('relogio-de-bolso')) {
      this.temORelogio = true;
      this.portaCedeu = true;
      return;
    }

    const movel = this.quarto.movel(RELOGIO.movel);
    const emCima = movel.y - movel.topo;

    this.relogioDeBolso = this.add
      .image(movel.x, emCima + 4, 'relogio-bolso')
      .setOrigin(0.5, 1)
      .setScale(RELOGIO.escala)
      .setDepth(profundidadeDeDesenho(movel.y) + 0.5);

    // Um brilho fraco: no escuro, latao velho ainda pega luz.
    this.tweens.add({
      targets: this.relogioDeBolso,
      alpha: { from: 0.72, to: 1 },
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.pontoDoRelogio = this.criarInterativo({
      x: movel.x,
      y: movel.y + 26,
      raio: 120,
      alturaMarca: movel.topo + 34,
      aoInteragir: () => this.tentarPegarORelogio(movel),
    });
  }

  /** So alcanca quem estiver em cima do movel. */
  tentarPegarORelogio(movel) {
    if (this.alice.altura < movel.topo - 18) {
      this.dialogo.mostrar(
        ['Tem alguma coisa ali em cima.', 'Daqui eu não alcanço.'],
        { rotulo: 'Alice' }
      );
      return;
    }
    this.pegarORelogio();
  }

  /**
   * Roteiro, secao 9, na ordem exata: som de item, pequena pausa, tic-tac,
   * reacao da Alice, novo evento narrativo. E secao 10: e AQUI que o progresso
   * fica salvo, porque foi uma conquista de verdade.
   */
  pegarORelogio() {
    if (this.temORelogio) return;
    this.temORelogio = true;

    this.entrarEmCinematica();
    this.pontoDoRelogio.usado = true;
    this.pontoDoRelogio.umaVez = true;
    this.pontoDoRelogio.marca.destroy();

    AudioManager.tocar('efeito.item');
    this.tweens.add({
      targets: this.relogioDeBolso,
      alpha: 0, y: this.relogioDeBolso.y - 26,
      duration: 700,
      onComplete: () => this.relogioDeBolso.destroy(),
    });

    SaveManager.registrarItem('relogio-de-bolso');
    this.marcarCheckpoint(this.alice.x, this.alice.y, 'relogio-de-bolso');

    // A pausa. O silencio da fase inteira para antes de o tic-tac comecar.
    AudioManager.pararAmbiente(500);

    this.time.delayedCall(1900, () => {
      AudioManager.tocarAmbiente('ambiente.tictac', 1500);

      this.time.delayedCall(1300, () => {
        this.dialogo.mostrar(
          [
            'É o relógio dele.',
            'O vidro está quebrado e os ponteiros pararam em três e dezessete.',
            'Mas está andando. Está andando de novo.',
          ],
          {
            rotulo: 'Alice',
            aoFechar: () => {
              this.portaCedeu = true;
              this.sairDeCinematica();
            },
          }
        );
      });
    });
  }

  /** Fim da Fase 1. */
  atravessarAPorta() {
    if (this.saindoDaFase) return;
    this.saindoDaFase = true;

    this.entrarEmCinematica();
    AudioManager.tocar('efeito.porta');
    SaveManager.salvarCheckpoint(1, 'fase1-concluida');

    this.time.delayedCall(1400, () => {
      this.cameras.main.fadeOut(1600, 0, 0, 0);
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      const tela = dimensoes(this);

      // A tela preta e desenhada PELO JOGO, e nao pelo efeito de fade da
      // camera. Se o fade continuasse ligado, ele ficaria por cima de tudo que
      // fosse criado agora — foi o que aconteceu: o cartao existia, mas
      // invisivel atras do preto da camera, e a fase parecia voltar direto
      // para o menu sem dizer nada.
      this.add
        .rectangle(0, 0, tela.largura * 2, tela.altura * 2, CORES.preto)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(2000);
      this.cameras.main.resetFX();

      const fim = this.add
        .text(tela.meioX, tela.meioY - 12, 'FIM DA FASE 1', {
          fontFamily: FONTE, fontSize: '26px', color: HEX.osso,
        })
        .setOrigin(0.5).setScrollFactor(0).setDepth(2001).setAlpha(0);

      const nota = this.add
        .text(tela.meioX, tela.meioY + 26, 'a floresta ainda nao existe', {
          fontFamily: FONTE, fontSize: '14px', color: HEX.ossoApagado,
        })
        .setOrigin(0.5).setScrollFactor(0).setDepth(2001).setAlpha(0);

      this.tweens.add({ targets: [fim, nota], alpha: 0.9, duration: 1600 });

      // O tic-tac continua sozinho no escuro por um instante, e so entao a
      // tela devolve para o menu.
      this.time.delayedCall(4200, () => {
        AudioManager.pararAmbiente(900);
        this.cameras.main.fadeOut(900, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete',
          () => this.scene.start(SCENES.MENU));
      });
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
    if (this.alice.x <= 150 && !this.trocandoDeSala) {
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
