/**
 * HIGHSFIELD 02 — A PORTA
 *
 * Liga a Fase 1 a Fase 2. Vinte segundos. A Alice acaba de pegar o relogio
 * quebrado, e ele volta a andar.
 *
 * A CENA VEM DESENHADA, e nao montada aqui.
 *
 * Antes esta cena colava as pecas na mao — um pedaco do quarto de fundo, a
 * porta por cima, a Alice na frente, e a floresta aparecendo por um RETANGULO
 * aberto no meio da porta. O retangulo era o problema: um vao reto atras de um
 * arco curvo, com a beirada dura aparecendo. E o fundo era o desenho cru do
 * quarto esticado, que nao e a parede que a Fase 1 mostra.
 *
 * Agora sao dez quadros compostos por ela: arco, porta, Alice e o que esta
 * atras, ja resolvidos juntos em cada um. A cena aqui so troca quadro e cuida
 * do som. Nao ha nada para mascarar, e o que se ve e o desenho dela inteiro.
 *
 * A revelacao da floresta (§32, 12-15 s) e a troca do MESMO quadro entre as
 * duas versoes: primeiro com escuridao atras da porta, depois com a floresta.
 * Como a pose nao muda, o que o olho ve e o fundo mudando — que e exatamente o
 * que o roteiro descreve.
 *
 * A Fase 2 ainda nao existe. A cena vai ate a porta se fechar atras dela, e ai
 * mostra o cartao de fim. Quando a floresta existir, e so trocar o ultimo passo.
 */

import { SCENES } from '../core/constants.js';
import { dimensoes } from '../core/tela.js';
import { CORES, HEX, FONTE } from '../ui/theme.js';
import { AudioManager } from '../core/AudioManager.js';
import { SaveManager } from '../core/SaveManager.js';
import { Cinematica } from '../core/Cinematica.js';

export class Highsfield02Scene extends Phaser.Scene {
  constructor() {
    super(SCENES.HIGHSFIELD02);
  }

  create() {
    this.tela = dimensoes(this);
    this.cameras.main.setBackgroundColor(CORES.preto);
    this.cameras.main.fadeIn(1400, 0, 0, 0);

    this.montarCena();

    AudioManager.pararMusica(0);
    AudioManager.tocarAmbiente('ambiente.silencio', 1500);

    this.montarLinhaDoTempo();
  }

  // -------------------------------------------------------------------- cena

  montarCena() {
    const { meioX, meioY, altura } = this.tela;

    // O quadro e retrato (322x406) e a tela e paisagem: ele fica centrado, alto
    // quase toda a altura, com o escuro da sala em volta. Nao e tarja — e o
    // resto do quarto, que na Fase 1 tambem some no preto a essa distancia.
    this.escala = (altura * 0.94) / 406;

    // Dois quadros empilhados, para uma troca poder ser um DISSOLVER e nao um
    // corte: `atras` recebe o proximo, `frente` some por cima dele.
    this.atras = this.add
      .image(meioX, meioY, 'porta/escura-0')
      .setScale(this.escala)
      .setDepth(10);

    this.frente = this.add
      .image(meioX, meioY, 'porta/escura-0')
      .setScale(this.escala)
      .setDepth(11);

    // O close do relogio de bolso, que entra aos 6 s. E o mesmo desenho da
    // HIGHSFIELD 01.
    this.close = this.add
      .image(meioX, meioY, 'relogio-bolso-aberto')
      .setAlpha(0)
      .setDepth(500);
    this.close.setScale(Math.min(0.82, (altura * 0.58) / this.close.height));
  }

  /**
   * Troca o quadro visivel. Com `ms`, dissolve; sem, corta seco.
   *
   * Dissolver e o que faz a floresta APARECER atras da porta em vez de piscar.
   * Cortar seco e o certo quando a pose muda — dissolver um passo da outro
   * borra a Alice em duas posicoes ao mesmo tempo.
   */
  trocarQuadro(chave, ms = 0) {
    if (!ms) {
      this.frente.setTexture(chave);
      this.atras.setTexture(chave);
      this.frente.setAlpha(1);
      return;
    }

    this.atras.setTexture(chave);
    this.tweens.add({
      targets: this.frente,
      alpha: 0,
      duration: ms,
      onComplete: () => {
        this.frente.setTexture(chave);
        this.frente.setAlpha(1);
      },
    });
  }

  // ------------------------------------------------------------- linha do tempo

  montarLinhaDoTempo() {
    const c = new Cinematica(this);

    // 0-3 s — a Alice diante da porta que estava bloqueada. Quadro 1: ela so
    // esta ali, de costas, com o relogio.
    this.trocarQuadro('porta/escura-0');

    // 3-6 s — o relogio comeca a fazer tic-tac. Mesmo quebrado.
    c.em(3000, () => {
      AudioManager.pararAmbiente(400);
      AudioManager.tocarAmbiente('ambiente.tictac', 800);
    });

    // 6-9 s — a camera aproxima do relogio. Ela olha para a porta.
    c.em(6000, () => this.tweens.add({ targets: this.close, alpha: 1, duration: 1100 }));
    c.em(8200, () => this.tweens.add({ targets: this.close, alpha: 0, duration: 800 }));

    // 9-12 s — ela levanta a mao, pega a argola e puxa. A porta cede, e atras
    // dela so existe escuridao.
    c.em(9000, () => this.trocarQuadro('porta/escura-1'));
    c.em(9700, () => this.trocarQuadro('porta/escura-2'));
    c.em(10400, () => {
      this.trocarQuadro('porta/escura-3');
      AudioManager.tocar('efeito.porta');
    });
    c.em(11200, () => this.trocarQuadro('porta/escura-4'));

    // 12-15 s — a abertura revela a floresta. MESMO quadro, outra versao: a
    // pose nao muda, so o que esta atras da porta. Dissolvido, para o olho ler
    // como a escuridao virando mata.
    c.em(12200, () => {
      this.trocarQuadro('porta/floresta-4', 1700);
      AudioManager.tocarAmbiente('ambiente.galhos', 2200);
    });

    // 15-18 s — ela da alguns passos, para, respira, e atravessa.
    c.em(15200, () => {
      this.trocarQuadro('porta/floresta-5');
      AudioManager.iniciarLoop('passos.madeira');
    });
    c.em(16100, () => this.trocarQuadro('porta/floresta-6'));
    c.em(16900, () => {
      this.trocarQuadro('porta/floresta-7');
      AudioManager.pararLoop('passos.madeira');
      AudioManager.tocar('alice.respiracao');
    });
    c.em(17800, () => this.trocarQuadro('porta/floresta-8'));

    // 18-20 s — a porta se fecha atras dela, e corta.
    c.em(19000, () => {
      this.trocarQuadro('porta/floresta-9', 900);
      AudioManager.tocar('efeito.rangido');
    });
    c.em(20000, () => this.cameras.main.fadeOut(1200, 0, 0, 0));

    c.aoFim(21400, () => {
      SaveManager.salvarCheckpoint(1, 'fase1-concluida');
      SaveManager.registrarItem('viu-highsfield-02');
      this.mostrarFim();
    });

    c.iniciar();
  }

  /**
   * O cartao de fim. Fica aqui ate a Fase 2 existir — quando existir, este
   * metodo vira `this.scene.start(SCENES.PHASE2)` e nada mais muda.
   */
  mostrarFim() {
    const { meioX, meioY, largura, altura } = this.tela;

    this.add.rectangle(0, 0, largura * 2, altura * 2, CORES.preto)
      .setOrigin(0, 0).setDepth(2000);

    const fim = this.add
      .text(meioX, meioY - 12, 'FIM DA FASE 1', {
        fontFamily: FONTE, fontSize: '26px', color: HEX.osso,
      })
      .setOrigin(0.5).setDepth(2001).setAlpha(0);

    const nota = this.add
      .text(meioX, meioY + 26, 'a floresta ainda não existe', {
        fontFamily: FONTE, fontSize: '14px', color: HEX.ossoApagado,
      })
      .setOrigin(0.5).setDepth(2001).setAlpha(0);

    this.tweens.add({ targets: [fim, nota], alpha: 0.9, duration: 1600 });

    // O tic-tac continua sozinho no escuro por um instante.
    this.time.delayedCall(4200, () => {
      AudioManager.silenciar({ fadeMs: 900 });
      this.cameras.main.fadeOut(900, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete',
        () => this.scene.start(SCENES.MENU));
    });
  }
}
