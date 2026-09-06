/**
 * Configuracoes (regra 40): so o necessario.
 *
 * Coluna da esquerda: som e tela.
 * Coluna da direita: os controles de toque do celular — tamanho, tipo, lado,
 * botao de correr e opacidade. Do lado deles fica uma previa: a tela em
 * miniatura, mostrando onde cada botao vai cair. E o jeito de decidir sem
 * precisar entrar na fase para ver.
 *
 * Nada aqui assume 960x640: as colunas sao fracoes da largura real.
 */

import { SCENES } from '../core/constants.js';
import { dimensoes, remontarNoResize } from '../core/tela.js';
import { CORES, HEX, FONTE, ESTILO, comSombra } from '../ui/theme.js';
import { SaveManager } from '../core/SaveManager.js';
import { AudioManager } from '../core/AudioManager.js';
import {
  calcularLayout, TAMANHOS, TIPOS, LADOS, OPACIDADES, CORRER,
} from '../ui/layoutControles.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super(SCENES.SETTINGS);
  }

  create() {
    this.tela = dimensoes(this);
    this.cameras.main.setBackgroundColor(CORES.fundo);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // As duas colunas sao fracoes da largura: numa tela larga elas se afastam,
    // numa estreita se aproximam, e nada nunca sai da tela.
    this.colunaEsq = this.tela.largura * 0.26;
    this.colunaDir = this.tela.largura * 0.72;
    this.larguraColuna = Math.min(400, this.tela.largura * 0.42);
    /** Onde as opcoes comecam dentro da coluna, medido a partir da borda dela. */
    this.colunaDoRotulo = 122;

    this.add
      .text(this.tela.meioX, 44, 'CONFIGURAÇÕES', {
        fontFamily: FONTE, fontSize: '22px', color: HEX.dourado,
      })
      .setOrigin(0.5)
      .setAlpha(0.75);

    const config = SaveManager.getConfig();

    this.montarColunaSom(config);
    this.montarColunaControles(config);
    this.montarPrevia();

    const voltar = this.add
      .text(this.tela.meioX, this.tela.altura - 30, 'VOLTAR', comSombra(ESTILO.menu))
      .setOrigin(0.5)
      .setColor(HEX.ossoApagado)
      .setFontSize(21)
      .setInteractive({ useHandCursor: true });

    voltar.on('pointerover', () => voltar.setColor(HEX.dourado));
    voltar.on('pointerout', () => voltar.setColor(HEX.ossoApagado));
    voltar.on('pointerdown', () => this.voltar());

    this.input.keyboard.on('keydown-ESC', () => this.voltar());

    remontarNoResize(this);
  }

  // ------------------------------------------------------------------ som

  montarColunaSom(config) {
    const x = this.colunaEsq;
    this.tituloColuna(x, 92, 'SOM');

    this.criarBarra(x, 152, 'Volume geral', 'volumeGeral', config.volumeGeral);
    this.criarBarra(x, 220, 'Música', 'volumeMusica', config.volumeMusica);
    this.criarBarra(x, 288, 'Efeitos', 'volumeEfeitos', config.volumeEfeitos);

    this.criarTelaCheia(x, 372);
  }

  tituloColuna(x, y, texto) {
    this.add
      .text(x, y, texto, { fontFamily: FONTE, fontSize: '15px', color: HEX.dourado })
      .setOrigin(0.5)
      .setAlpha(0.6);

    const meia = this.larguraColuna / 2;
    const linha = this.add.graphics();
    linha.fillStyle(CORES.ossoMorto, 0.7);
    linha.fillRect(x - meia, y + 16, this.larguraColuna, 1);
  }

  /** Barra arrastavel. Retorna sempre um valor de 0 a 1. */
  criarBarra(x, y, rotulo, chave, valorInicial) {
    const comprimento = this.larguraColuna - 40;
    const esquerda = x - comprimento / 2;

    this.add
      .text(esquerda, y - 24, rotulo, {
        fontFamily: FONTE, fontSize: '17px', color: HEX.ossoApagado,
      })
      .setOrigin(0, 0.5);

    const numero = this.add
      .text(esquerda + comprimento, y - 24, '', {
        fontFamily: FONTE, fontSize: '15px', color: HEX.ossoApagado,
      })
      .setOrigin(1, 0.5)
      .setAlpha(0.7);

    const trilho = this.add.graphics();
    trilho.fillStyle(CORES.ossoMorto, 0.8);
    trilho.fillRect(esquerda, y - 1, comprimento, 2);

    const preenchido = this.add.graphics();
    const punho = this.add.circle(esquerda, y, 8, CORES.osso, 0.85);

    const desenhar = (valor) => {
      preenchido.clear();
      preenchido.fillStyle(CORES.osso, 0.6);
      preenchido.fillRect(esquerda, y - 1, comprimento * valor, 2);
      punho.setPosition(esquerda + comprimento * valor, y);
      numero.setText(Math.round(valor * 100) + '%');
    };

    desenhar(valorInicial);

    const area = this.add
      .rectangle(x, y, comprimento + 40, 40, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    const aplicar = (ponteiro) => {
      const valor = Phaser.Math.Clamp((ponteiro.x - esquerda) / comprimento, 0, 1);
      desenhar(valor);
      SaveManager.setConfig({ [chave]: valor });
      AudioManager.aplicarVolumes();
    };

    area.on('pointerdown', (ponteiro) => { this.arrastando = chave; aplicar(ponteiro); });
    this.input.on('pointermove', (ponteiro) => {
      if (this.arrastando === chave && ponteiro.isDown) aplicar(ponteiro);
    });
    this.input.on('pointerup', () => { this.arrastando = null; });
  }

  criarTelaCheia(x, y) {
    const texto = this.add
      .text(x, y, '', { fontFamily: FONTE, fontSize: '18px', color: HEX.ossoApagado })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const atualizar = () => {
      texto.setText(this.scale.isFullscreen ? 'Tela cheia: ligada' : 'Tela cheia: desligada');
    };

    atualizar();

    texto.on('pointerover', () => texto.setColor(HEX.dourado));
    texto.on('pointerout', () => texto.setColor(HEX.ossoApagado));
    texto.on('pointerdown', () => {
      if (this.scale.isFullscreen) this.scale.stopFullscreen();
      else this.scale.startFullscreen();
      this.time.delayedCall(120, atualizar);
    });

    this.add
      .text(x, y + 26, 'F11 também funciona no computador.', {
        fontFamily: FONTE, fontSize: '13px', color: HEX.ossoMorto,
      })
      .setOrigin(0.5);
  }

  // ----------------------------------------------------------- controles

  montarColunaControles(config) {
    const x = this.colunaDir;
    this.tituloColuna(x, 92, 'CONTROLES NO CELULAR');

    let y = 142;
    const passo = 47;

    this.criarEscolha(x, y, 'Tamanho', 'tamanhoControles', TAMANHOS); y += passo;
    this.criarEscolha(x, y, 'Tipo', 'tipoControle', TIPOS); y += passo;
    this.criarEscolha(x, y, 'Lado', 'ladoControles', LADOS); y += passo;
    this.criarEscolha(x, y, 'Correr', 'botaoCorrer', CORRER); y += passo;
    this.criarEscolha(x, y, 'Opacidade', 'opacidadeControles', OPACIDADES);

    this.previaCaixa = {
      x: x - this.larguraColuna / 2,
      y: y + 42,
      largura: this.larguraColuna,
      altura: this.larguraColuna * 0.6,
    };
  }

  /**
   * Rotulo a esquerda e as opcoes numa coluna fixa a direita dele.
   *
   * As opcoes comecam todas no MESMO x, alinhadas a esquerda. Encostar cada
   * linha na borda direita deixava o inicio de cada uma num lugar diferente —
   * e a coluna inteira ficava torta.
   */
  criarEscolha(x, y, rotulo, chave, opcoes) {
    const meia = this.larguraColuna / 2;
    const inicioDasOpcoes = x - meia + this.colunaDoRotulo;

    this.add
      .text(x - meia, y, rotulo, {
        fontFamily: FONTE, fontSize: '16px', color: HEX.ossoApagado,
      })
      .setOrigin(0, 0.5);

    const itens = opcoes.map((opcao) =>
      this.add
        .text(0, y, opcao.nome, { fontFamily: FONTE, fontSize: '16px', color: HEX.ossoMorto })
        .setOrigin(0, 0.5)
    );

    // Da esquerda para a direita, com o mesmo respiro entre elas.
    let cursor = inicioDasOpcoes;
    for (const item of itens) {
      item.setX(Math.round(cursor));
      cursor += item.width + 18;
    }

    const marcar = () => {
      const atual = SaveManager.getConfig()[chave];
      itens.forEach((item, i) => {
        const escolhido = opcoes[i].id === atual;
        item.setColor(escolhido ? HEX.osso : HEX.ossoMorto);
        item.setAlpha(escolhido ? 1 : 0.7);
      });
    };

    itens.forEach((item, i) => {
      item.setInteractive(
        new Phaser.Geom.Rectangle(-9, -14, item.width + 18, item.height + 28),
        Phaser.Geom.Rectangle.Contains
      );
      item.input.cursor = 'pointer';

      // Dourado sob o cursor, como no menu. A escolhida continua em osso
      // claro, para dar sempre para saber qual valor esta valendo.
      item.on('pointerover', () => item.setColor(HEX.dourado).setAlpha(1));
      item.on('pointerout', marcar);
      item.on('pointerdown', () => {
        SaveManager.setConfig({ [chave]: opcoes[i].id });
        AudioManager.tocar('efeito.item');
        marcar();
        this.montarPrevia();
      });
    });

    marcar();
  }

  // --------------------------------------------------------------- previa

  /** A tela em miniatura, com os controles onde eles realmente vao cair. */
  montarPrevia() {
    this.previa?.destroy();
    this.previa = this.add.container(0, 0);

    const caixa = this.previaCaixa;
    const layout = calcularLayout(SaveManager.getConfig(), this.tela);
    const fator = caixa.largura / this.tela.largura;
    const alturaCaixa = this.tela.altura * fator;

    const moldura = this.add.graphics();
    moldura.fillStyle(CORES.preto, 0.55);
    moldura.fillRect(caixa.x, caixa.y, caixa.largura, alturaCaixa);
    moldura.lineStyle(1, CORES.borda, 1);
    moldura.strokeRect(caixa.x + 0.5, caixa.y + 0.5, caixa.largura - 1, alturaCaixa - 1);
    this.previa.add(moldura);

    const paraPrevia = (ponto) => ({
      x: caixa.x + ponto.x * fator,
      y: caixa.y + ponto.y * fator,
    });

    const circulo = (ponto, raio, preenchimento) => {
      const p = paraPrevia(ponto);
      const c = this.add.circle(p.x, p.y, Math.max(2, raio * fator), CORES.osso, preenchimento);
      c.setStrokeStyle(1, CORES.osso, 0.5);
      this.previa.add(c);
    };

    // Onde a Alice fica, so para dar referencia de escala.
    const alice = paraPrevia({ x: this.tela.meioX, y: this.tela.altura * 0.55 });
    this.previa.add(
      this.add
        .text(alice.x, alice.y, '♠', { fontFamily: FONTE, fontSize: '12px', color: HEX.dourado })
        .setOrigin(0.5)
        .setAlpha(0.5)
    );

    if (layout.tipo === 'direcional') {
      const mov = layout.movimento;
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        circulo(
          { x: mov.x + dx * mov.afastamento, y: mov.y + dy * mov.afastamento },
          mov.botao, 0.16
        );
      }
    } else if (layout.tipo === 'seguir') {
      // Sem widget: o dedo e o controle. Mostra so a marca do alvo.
      const marca = paraPrevia({ x: this.tela.largura * 0.34, y: this.tela.altura * 0.42 });
      const alvo = this.add.circle(marca.x, marca.y, 5, CORES.osso, 0.2);
      alvo.setStrokeStyle(1, CORES.osso, 0.6);
      this.previa.add(alvo);
    } else {
      circulo(layout.movimento, layout.movimento.raio, 0.08);
      circulo(layout.movimento, layout.movimento.knob, 0.22);
    }

    circulo(layout.pulo, layout.pulo.raio, 0.16);
    circulo(layout.acao, layout.acao.raio, 0.16);
    if (layout.correr) circulo(layout.correr, layout.correr.raio, 0.16);

    this.previa.add(
      this.add
        .text(
          caixa.x + caixa.largura / 2,
          caixa.y + alturaCaixa + 12,
          'prévia — vale quando você entrar na fase',
          { fontFamily: FONTE, fontSize: '12px', color: HEX.ossoMorto }
        )
        .setOrigin(0.5)
    );
  }

  voltar() {
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(SCENES.MENU));
  }
}
