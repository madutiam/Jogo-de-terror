/**
 * HIGHSFIELD 01 — O RELOGIO
 *
 * A cena de abertura, antes da Fase 1. Vinte segundos.
 *
 * Objetivo do roteiro (secao 32): mostrar Alice e o Coelho ANTES do
 * desaparecimento, e estabelecer o relogio como o elemento que importa.
 *
 * O intervalo de cada passo esta escrito no codigo com o mesmo numero do
 * roteiro, para dar para conferir cena e texto lado a lado.
 *
 * A CENA VEM DESENHADA COM OS DOIS JUNTOS
 *
 * Antes eram dois sprites soltos, cada um virado para a camera, parados lado a
 * lado por vinte segundos enquanto a camera dava um zoom que ninguem percebia.
 * Eles nao se olhavam, e nao havia nada no enquadramento dizendo que estavam no
 * mesmo comodo: liam como dois recortes colados no fundo.
 *
 * Agora os quadros trazem os DOIS — o Coelho enorme e parado, a Alice pequena
 * reagindo a ele. A relacao entre os dois ja vem resolvida no desenho, que e
 * onde ela deve ser resolvida.
 *
 * O EIXO DO COELHO
 *
 * Ele e o unico ponto fixo da cena: nos quadros pareados esta sempre no mesmo
 * lugar, e os quadros so dele foram escalados para o mesmo tamanho. Os dois
 * sprites sao assentados no MESMO ponto do palco, entao trocar de um para o
 * outro nao mexe nele — o que muda e so quem mais esta no quadro. E isso que
 * deixa a camera fechar nele sem corte visivel.
 *
 * O que a cena NAO faz, de proposito:
 *   - nao usa a floresta destruida (o roteiro proibe);
 *   - nao inventa pose nenhuma;
 *   - nao toca musica. O relogio domina o som, como pede a secao 34.
 */

import { SCENES } from '../core/constants.js';
import { dimensoes } from '../core/tela.js';
import { CORES } from '../ui/theme.js';
import { AudioManager } from '../core/AudioManager.js';
import { SaveManager } from '../core/SaveManager.js';
import { Cinematica } from '../core/Cinematica.js';

/** Altura do Coelho dentro de cada folha, em pixel. Ver o commit do fatiamento. */
const COELHO_NO_PAR = 269;
const COELHO_SOZINHO = 320;

/** Onde fica o eixo do Coelho dentro do quadro pareado, em fracao da tela dele. */
const EIXO_NO_PAR = { x: 205 / 273, y: 1 - 3 / 279 };

export class Highsfield01Scene extends Phaser.Scene {
  constructor() {
    super(SCENES.HIGHSFIELD01);
  }

  create() {
    this.tela = dimensoes(this);
    this.cameras.main.setBackgroundColor(CORES.preto);
    this.cameras.main.fadeIn(2200, 0, 0, 0);

    this.montarCena();

    // O silencio primeiro. O tic-tac entra depois, e e ele que manda.
    AudioManager.pararMusica(0);
    AudioManager.tocarAmbiente('ambiente.silencio', 2000);

    this.montarLinhaDoTempo();
  }

  // ------------------------------------------------------------------- cena

  montarCena() {
    const { largura, altura, meioX, meioY } = this.tela;

    this.palco = this.add.container(meioX, meioY);

    // O VAZIO ATRAS DO CENARIO
    //
    // O desenho do quarto cobre a tela em repouso, mas a camera desta cena
    // ANDA: quando ela aproxima e desloca para o Coelho, a beirada do desenho
    // entra no quadro e aparece um corte reto entre o comodo e o preto. Este
    // retangulo mora atras de tudo, dentro do palco, e e grande o bastante para
    // nenhum enquadramento alcancar o fim dele. Na cor mais escura da parede, e
    // nao preto puro: assim a transicao nao tem linha.
    this.vazio = this.add.rectangle(0, 0, 4200, 3000, 0x0c1016).setOrigin(0.5);

    const fundo = this.add.image(0, 0, 'fase1-quarto').setOrigin(0.5);
    const escala = Math.max(largura / fundo.width, altura / fundo.height);
    fundo.setScale(escala);

    // Onde as duas figuras pisam, medido no desenho de 960x640.
    const chao = (480 - 320) * escala;
    const naArte = (x) => (x - 480) * escala;
    this.chao = chao;

    // O TAMANHO DO COELHO
    //
    // 210 px na arte do quarto: pouco mais da metade do pe-direito, que e o que
    // faz ele encher o comodo sem bater no teto. Todo o resto sai daqui — a
    // Alice vem junto no desenho, na proporcao em que ela foi desenhada.
    const alvo = 210 * escala;
    this.alturaDoCoelho = alvo;
    this.eixoX = naArte(560);

    this.par = this.add
      .image(this.eixoX, chao, 'hs01/encontro-0')
      .setOrigin(EIXO_NO_PAR.x, EIXO_NO_PAR.y)
      .setScale(alvo / COELHO_NO_PAR);

    this.coelhoSo = this.add
      .image(this.eixoX, chao, 'coelho/ergue-0')
      .setOrigin(0.5, 1)
      .setScale(alvo / COELHO_SOZINHO)
      .setVisible(false);

    // A SOMBRA DE CONTATO
    //
    // Sem ela os dois ficam pousados no chao como adesivo. Nao e sombra
    // projetada — e o escurecimento embaixo deles, que e o que o olho usa para
    // decidir que uma coisa esta APOIADA, e nao flutuando.
    this.sombra = this.add
      .ellipse(this.eixoX - alvo * 0.18, chao + 2, alvo * 1.45, alvo * 0.15, 0x000000, 0.34);

    this.palco.add([this.vazio, fundo, this.sombra, this.par, this.coelhoSo]);

    this.montarPenumbra();

    // O close do relogio entra depois, por cima, com um veu entre ele e a cena.
    // Sem o veu o close vira adesivo colado no quarto: tudo continua igualmente
    // nitido e o olho nao sabe onde pousar. Com ele o comodo RECUA, e a Alice
    // fica "parcialmente ao fundo" — a palavra do §32 para 9-12 s.
    this.veu = this.add
      .rectangle(meioX, meioY, largura * 2, altura * 2, 0x000000, 1)
      .setAlpha(0)
      .setDepth(450);

    // O relogio INTEIRO, e nao o quebrado: esta cena se passa antes de tudo.
    this.close = this.add
      .image(meioX, meioY, 'relogio-bolso-limpo')
      .setAlpha(0)
      .setDepth(500);
    this.close.setScale(Math.min(1, (altura * 0.72) / this.close.height));
  }

  montarPenumbra() {
    const chave = 'h01/penumbra';
    const lado = 1024;

    if (!this.textures.exists(chave)) {
      const textura = this.textures.createCanvas(chave, lado, lado);
      const ctx = textura.getContext();
      const meio = lado / 2;
      const g = ctx.createRadialGradient(meio, meio, meio * 0.18, meio, meio, meio * 0.52);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.62)');
      g.addColorStop(1, 'rgba(0,0,0,0.93)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, lado, lado);
      textura.refresh();
    }

    this.penumbra = this.add
      .image(this.tela.meioX, this.tela.meioY, chave)
      .setDepth(400);
    this.penumbra.setDisplaySize(this.tela.largura * 2.1, this.tela.altura * 2.4);
  }

  // ------------------------------------------------------------------ planos

  /** Aproxima o palco de um ponto, como uma camera que anda para a frente. */
  aproximar(alvoX, alvoY, escala, ms) {
    this.tweens.add({
      targets: this.palco,
      scaleX: escala, scaleY: escala,
      x: this.tela.meioX - alvoX * escala,
      y: this.tela.meioY - alvoY * escala,
      duration: ms,
      ease: 'Sine.easeInOut',
    });
  }

  /** Prefixo e total de quadros de cada conjunto. */
  conjunto(qual, linha) {
    return qual === 'par'
      ? { alvo: this.par, outro: this.coelhoSo, chave: 'hs01/' + linha + '-', total: 6 }
      : { alvo: this.coelhoSo, outro: this.par, chave: 'coelho/' + linha + '-', total: 5 };
  }

  /**
   * Roda uma fileira de quadros, uma vez so, e segura o ultimo.
   *
   * `qual` diz de qual sprite: 'par' quando os dois estao no quadro, 'coelho'
   * quando so ele esta. Trocar de um para o outro nao mexe nele — os dois estao
   * assentados no mesmo eixo e no mesmo tamanho.
   */
  rodar(qual, linha, ms) {
    const c = this.conjunto(qual, linha);
    c.outro.setVisible(false);
    c.alvo.setVisible(true).setTexture(c.chave + '0');

    this.animacao?.remove();
    let i = 0;
    this.animacao = this.time.addEvent({
      delay: ms,
      repeat: c.total - 2,
      callback: () => { i += 1; c.alvo.setTexture(c.chave + i); },
    });
  }

  /** Um quadro parado de uma fileira, sem animar. */
  pousar(qual, linha, i) {
    const c = this.conjunto(qual, linha);
    this.animacao?.remove();
    c.outro.setVisible(false);
    c.alvo.setVisible(true).setTexture(c.chave + i);
  }

  // ------------------------------------------------------------- linha do tempo

  montarLinhaDoTempo() {
    const c = new Cinematica(this);
    const h = this.alturaDoCoelho;

    // 0-3 s — o comodo, e os dois nele. Ele com o relogio; ela olhando.
    this.pousar('par', 'encontro', 0);
    this.aproximar(0, 0, 1.06, 3000);

    // 3-6 s — a camera FECHA nele e ele ergue o relogio. Aqui a Alice sai do
    // quadro, e por isso o sprite pode trocar para o dele sozinho sem que nada
    // se mexa: os dois estao no mesmo eixo e no mesmo tamanho.
    c.em(3000, () => {
      this.aproximar(this.eixoX, this.chao - h * 0.55, 1.9, 2200);
      this.rodar('coelho', 'ergue', 420);
    });

    // 6-9 s — comeca o TIC TAC, e ele vira para ela.
    c.em(6000, () => {
      AudioManager.pararAmbiente(600);
      AudioManager.tocarAmbiente('ambiente.tictac', 900);
      this.rodar('coelho', 'vira', 380);
    });

    // 9-12 s — close no relogio. Os ponteiros ainda funcionam.
    c.em(9000, () => {
      this.tweens.add({ targets: this.close, alpha: 1, duration: 900 });
      // O veu entra JUNTO com o relogio, na mesma duracao: o comodo apaga na
      // mesma velocidade em que o objeto aparece.
      this.tweens.add({ targets: this.veu, alpha: 0.62, duration: 900 });
    });

    // 12-14 s — TIC. Silencio. O TAC nao acontece.
    c.em(12000, () => {
      AudioManager.pararAmbiente(120);
      AudioManager.tocarClac();
    });

    // 14-17 s — a camera ABRE e a Alice esta assustada. O plano volta a ser dos
    // dois, e agora ela reage — o que a cena antiga nunca chegou a mostrar.
    c.em(14000, () => {
      this.tweens.add({ targets: this.close, alpha: 0, duration: 700 });
      this.tweens.add({ targets: this.veu, alpha: 0, duration: 700 });
      this.aproximar(this.eixoX * 0.5, this.chao - h * 0.42, 1.34, 2200);
      this.rodar('par', 'assustada', 380);
    });

    // 17-19 s — um ultimo TIC, e ela recua. Nao e panico: e a sensacao de que
    // alguma coisa esta errada.
    c.em(17000, () => {
      AudioManager.tocarClac();
      this.rodar('par', 'recuando', 360);
    });

    // 19-20 s — corte para preto. O tic-tac continua um instante e some.
    c.em(19000, () => this.cameras.main.fadeOut(1200, 0, 0, 0));

    c.aoFim(20200, () => {
      this.animacao?.remove();
      AudioManager.silenciar({ fadeMs: 900 });
      SaveManager.registrarItem('viu-highsfield-01');
      this.scene.start(SCENES.PHASE1);
    });

    c.iniciar();
  }
}
