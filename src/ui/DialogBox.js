/**
 * Caixa de dialogo / pista.
 *
 * Texto entra letra por letra, com o ritmo lento que o terror pede. Enquanto
 * ela esta aberta o controle da Alice fica desligado (regra 54). O jogador
 * avanca com a tecla de interacao, com Enter, ou tocando na tela.
 *
 * Nao serve para dizer "va para a direita": serve para a Alice reagir ao que
 * ela acabou de ver. Quem escreve o conteudo e a cena.
 */

import { CORES, ESTILO, HEX, FONTE, comSombra } from './theme.js';
import { dimensoes } from '../core/tela.js';

const MARGEM = 40;
const ALTURA = 148;
const VELOCIDADE_PADRAO = 26; // letras por segundo

export class DialogBox {
  /** @param {Phaser.Scene} cena */
  constructor(cena) {
    this.cena = cena;
    this.aberta = false;
    this.fila = [];
    this.aoFechar = null;

    // A caixa acompanha a largura real da tela. Num celular deitado ela fica
    // larga; num monitor 21:9 ela para de crescer, senao a linha ficaria
    // comprida demais para ler.
    const tela = dimensoes(cena);
    const largura = Math.min(tela.largura - MARGEM * 2, 1100);
    const x = (tela.largura - largura) / 2;
    const y = tela.altura - ALTURA - 28;

    this.container = cena.add
      .container(x, y)
      .setScrollFactor(0)
      .setDepth(1200)
      .setVisible(false)
      .setAlpha(0);

    // Painel: quase preto, borda fina, sem brilho.
    this.painel = cena.add.graphics();
    this.painel.fillStyle(CORES.fundoTexto, 0.93);
    this.painel.fillRect(0, 0, largura, ALTURA);
    this.painel.lineStyle(1, CORES.borda, 1);
    this.painel.strokeRect(0.5, 0.5, largura - 1, ALTURA - 1);
    this.container.add(this.painel);

    // Filete claro no topo, so para separar do cenario.
    const filete = cena.add.graphics();
    filete.fillStyle(CORES.ossoApagado, 0.25);
    filete.fillRect(0, 0, largura, 1);
    this.container.add(filete);

    this.rotulo = cena.add
      .text(24, 16, '', { fontFamily: FONTE, fontSize: '15px', color: HEX.dourado })
      .setAlpha(0.75);
    this.container.add(this.rotulo);

    this.texto = cena.add.text(24, 40, '', {
      ...comSombra(ESTILO.dialogo),
      wordWrap: { width: largura - 48 },
    });
    this.container.add(this.texto);

    this.seta = cena.add
      .text(largura - 30, ALTURA - 34, '▾', {
        fontFamily: FONTE,
        fontSize: '20px',
        color: HEX.ossoApagado,
      })
      .setVisible(false);
    this.container.add(this.seta);

    this.piscarSeta = cena.tweens.add({
      targets: this.seta,
      alpha: 0.15,
      duration: 620,
      yoyo: true,
      repeat: -1,
      paused: true,
    });

    // Tocar em qualquer lugar da tela tambem avanca.
    this.aoTocar = () => { if (this.aberta) this.avancar(); };
    cena.input.on('pointerdown', this.aoTocar);

    this.cronometro = null;
    this.linhaCompleta = false;
  }

  /**
   * @param {string|string[]} linhas
   * @param {{rotulo?: string, velocidade?: number, aoFechar?: Function}} opcoes
   */
  mostrar(linhas, opcoes = {}) {
    this.fila = Array.isArray(linhas) ? [...linhas] : [linhas];
    this.aoFechar = opcoes.aoFechar || null;
    this.velocidade = opcoes.velocidade || VELOCIDADE_PADRAO;
    this.rotulo.setText(opcoes.rotulo || '');

    this.aberta = true;
    this.container.setVisible(true);
    this.cena.tweens.add({ targets: this.container, alpha: 1, duration: 220 });

    this.cena.events.emit('dialogo:abriu');
    this.proximaLinha();
  }

  proximaLinha() {
    const linha = this.fila.shift();

    if (linha === undefined) {
      this.fechar();
      return;
    }

    this.linhaAtual = linha;
    this.texto.setText('');
    this.seta.setVisible(false);
    this.piscarSeta.pause();
    this.seta.setAlpha(1);
    this.linhaCompleta = false;

    let indice = 0;
    this.cronometro?.remove();
    this.cronometro = this.cena.time.addEvent({
      delay: 1000 / this.velocidade,
      loop: true,
      callback: () => {
        indice += 1;
        this.texto.setText(linha.slice(0, indice));
        if (indice >= linha.length) this.completarLinha();
      },
    });
  }

  completarLinha() {
    this.cronometro?.remove();
    this.cronometro = null;
    this.linhaCompleta = true;
    this.seta.setVisible(true);
    this.piscarSeta.resume();
  }

  /** Primeiro clique completa a linha; o segundo passa para a proxima. */
  avancar() {
    if (!this.aberta) return;

    // Primeiro toque: mostra a linha inteira de uma vez.
    if (!this.linhaCompleta) {
      this.cronometro?.remove();
      this.cronometro = null;
      this.texto.setText(this.linhaAtual || this.texto.text);
      this.completarLinha();
      return;
    }

    this.proximaLinha();
  }

  fechar() {
    if (!this.aberta) return;

    this.aberta = false;
    this.cronometro?.remove();
    this.cronometro = null;
    this.piscarSeta.pause();

    this.cena.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.container.setVisible(false);
        this.cena.events.emit('dialogo:fechou');
        const callback = this.aoFechar;
        this.aoFechar = null;
        callback?.();
      },
    });
  }

  destroy() {
    this.cena.input.off('pointerdown', this.aoTocar);
    this.cronometro?.remove();
    this.piscarSeta.remove();
    this.container.destroy();
  }
}
