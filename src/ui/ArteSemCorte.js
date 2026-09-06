/**
 * Uma arte de tela cheia que NUNCA e cortada e NUNCA deixa tarja preta.
 *
 * O problema: uma imagem tem uma proporcao; a tela tem outra, e ela muda —
 * celular deitado, notebook, monitor largo. So existem duas saidas honestas:
 *
 *   - COBRIR a tela e cortar o que sobra;
 *   - CABER inteira e sobrar borda.
 *
 * Nas capas do jogo nenhuma das duas serve: cortar come o titulo e a moldura
 * desenhada, e tarja preta estraga a tela de abertura de um jogo bonito.
 *
 * A saida e uma terceira: a arte entra INTEIRA, e o que sobrar de tela e
 * preenchido esticando a propria beirada da imagem. Como a beirada das capas e
 * escuro quase liso, a esticada nao tem o que deformar — nao existe desenho ali
 * para distorcer — e a emenda desaparece. O jogador ve uma arte que vai de
 * ponta a ponta, sem perder um pixel do que foi desenhado.
 */

import { recortarTextura } from '../core/texturas.js';
import { escalaParaCaber } from '../core/tela.js';

/** Espessura da fatia de beirada usada para esticar, em pixels da arte. */
const BEIRA = 8;

export class ArteSemCorte {
  /**
   * @param {Phaser.Scene} cena
   * @param {string} chave        textura ja carregada
   * @param {{profundidade?:number}} opcoes
   */
  constructor(cena, chave, opcoes = {}) {
    this.cena = cena;
    this.chave = chave;

    const fonte = cena.textures.get(chave).getSourceImage();
    const L = fonte.width;
    const A = fonte.height;

    const prefixo = chave + '/beira';
    recortarTextura(cena, chave, prefixo + 'Esq',  { x: 0,         y: 0,         largura: BEIRA, altura: A });
    recortarTextura(cena, chave, prefixo + 'Dir',  { x: L - BEIRA, y: 0,         largura: BEIRA, altura: A });
    recortarTextura(cena, chave, prefixo + 'Topo', { x: 0,         y: 0,         largura: L,     altura: BEIRA });
    recortarTextura(cena, chave, prefixo + 'Base', { x: 0,         y: A - BEIRA, largura: L,     altura: BEIRA });

    // As beiradas entram ANTES da arte, para a arte sempre ficar por cima da
    // emenda, e nao o contrario.
    this.beiras = {
      esq:  cena.add.image(0, 0, prefixo + 'Esq').setOrigin(1, 0.5),
      dir:  cena.add.image(0, 0, prefixo + 'Dir').setOrigin(0, 0.5),
      topo: cena.add.image(0, 0, prefixo + 'Topo').setOrigin(0.5, 1),
      base: cena.add.image(0, 0, prefixo + 'Base').setOrigin(0.5, 0),
    };

    this.imagem = cena.add.image(0, 0, chave);

    if (opcoes.profundidade !== undefined) {
      for (const parte of this.partes) parte.setDepth(opcoes.profundidade);
    }
  }

  /** Todas as pecas, para animar opacidade de uma vez. */
  get partes() {
    return [...Object.values(this.beiras), this.imagem];
  }

  /** A cor do canto da arte — serve de fundo de camera, por seguranca. */
  corDaBorda() {
    const cor = this.cena.textures.getPixel(6, 6, this.chave);
    if (!cor) return 0x000000;
    return (cor.red << 16) | (cor.green << 8) | cor.blue;
  }

  /**
   * Encaixa na tela atual. Chamar de novo quando a tela mudar de tamanho.
   * @param {{largura:number, altura:number, meioX:number, meioY:number}} tela
   */
  encaixar(tela) {
    const { largura, altura, meioX, meioY } = tela;

    const escala = escalaParaCaber(this.imagem, largura, altura);
    const larguraArte = this.imagem.width * escala;
    const alturaArte = this.imagem.height * escala;

    this.imagem.setPosition(meioX, meioY).setScale(escala);

    // +2 px de folga: sem isso, arredondamento deixa um fio de fundo aparecendo.
    const sobraX = Math.max(0, (largura - larguraArte) / 2) + 2;
    const sobraY = Math.max(0, (altura - alturaArte) / 2) + 2;

    this.beiras.esq
      .setPosition(meioX - larguraArte / 2 + 1, meioY)
      .setDisplaySize(sobraX, alturaArte);
    this.beiras.dir
      .setPosition(meioX + larguraArte / 2 - 1, meioY)
      .setDisplaySize(sobraX, alturaArte);
    this.beiras.topo
      .setPosition(meioX, meioY - alturaArte / 2 + 1)
      .setDisplaySize(largura, sobraY);
    this.beiras.base
      .setPosition(meioX, meioY + alturaArte / 2 - 1)
      .setDisplaySize(largura, sobraY);
  }
}
