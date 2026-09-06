/**
 * A escuridao e a luz de uma sala.
 *
 * Nasceu dentro do QuartoExtendido e saiu de la porque toda sala da Fase 1
 * precisa exatamente disto — e duas copias viravam duas coisas diferentes um
 * dia.
 *
 * COMO FUNCIONA, e por que nao e uma imagem em cima da Alice:
 *
 * A primeira versao era um PNG de degrade radial posicionado nela. Quando ela
 * chegava perto de uma parede, parte da TELA ficava fora dessa imagem — e o que
 * fica fora nao escurece. Aparecia um retangulo claro de borda reta, que era o
 * defeito mais visivel do jogo.
 *
 * Agora e o contrario: uma RenderTexture do tamanho da TELA, presa a camera,
 * repintada de preto a cada quadro. A luz e feita APAGANDO circulos suaves
 * dela. Cobre tudo por definicao, nunca sobra canto, e o recorte nunca e reto.
 *
 * Detalhe que custou caro descobrir: a forma de `erase` que aceita escala e
 * opacidade num objeto de configuracao NAO APAGA NADA, e falha calada. So a
 * forma simples, `erase(chave, x, y)`, funciona. Por isso cada luz ganha o
 * proprio pincel, ja assado no tamanho e na forca finais.
 */

import { CORES } from '../ui/theme.js';

/** Quao escuro fica o que nenhuma luz alcanca. */
export const ESCURIDAO = 0.82;

/** Um circulo de luz suave, para ser APAGADO da escuridao. */
function pincelDeLuz(cena, chave, raio, forca) {
  if (cena.textures.exists(chave)) return chave;

  const lado = raio * 2;
  const textura = cena.textures.createCanvas(chave, lado, lado);
  const ctx = textura.getContext();

  const degrade = ctx.createRadialGradient(raio, raio, 0, raio, raio, raio);
  degrade.addColorStop(0.00, 'rgba(255,255,255,' + forca + ')');
  degrade.addColorStop(0.30, 'rgba(255,255,255,' + forca * 0.92 + ')');
  degrade.addColorStop(0.58, 'rgba(255,255,255,' + forca * 0.55 + ')');
  degrade.addColorStop(0.80, 'rgba(255,255,255,' + forca * 0.20 + ')');
  degrade.addColorStop(1.00, 'rgba(255,255,255,0)');

  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, lado, lado);
  textura.refresh();
  return chave;
}

export class Iluminacao {
  /**
   * @param {Phaser.Scene} cena
   * @param {{raioDaAlice?: number, escuridao?: number}} opcoes
   */
  constructor(cena, opcoes = {}) {
    this.cena = cena;
    this.escuridao = opcoes.escuridao ?? ESCURIDAO;
    this.raioAlice = opcoes.raioDaAlice ?? 380;
    this.pincelAlice = pincelDeLuz(cena, 'luz/alice' + this.raioAlice, this.raioAlice, 0.93);

    /** Luzes que ficam paradas na sala. A da Alice e tratada a parte. */
    this.luzes = [];

    this.montarTela();

    // A tela muda de tamanho quando a janela muda. A escuridao tem que
    // acompanhar, senao volta a sobrar borda — que era exatamente o defeito.
    const aviso = () => this.montarTela();
    cena.scale.on('resize', aviso);
    cena.events.once('shutdown', () => cena.scale.off('resize', aviso));
    cena.events.once('destroy', () => cena.scale.off('resize', aviso));
  }

  montarTela() {
    const largura = this.cena.scale.width;
    const altura = this.cena.scale.height;

    this.escuro?.destroy();
    this.escuro = this.cena.add
      .renderTexture(0, 0, largura, altura)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(800);

    this.montarVinheta(largura, altura);
  }

  /**
   * Vinheta: escurece as quinas da tela. Radial, nao retangular — quina de
   * tela escura le como lente; quatro barras pretas leem como erro.
   */
  montarVinheta(largura, altura) {
    const chave = 'luz/vinheta';
    if (!this.cena.textures.exists(chave)) {
      const lado = 512;
      const textura = this.cena.textures.createCanvas(chave, lado, lado);
      const ctx = textura.getContext();
      const meio = lado / 2;
      const degrade = ctx.createRadialGradient(
        meio, meio, meio * 0.54, meio, meio, meio * 0.80
      );
      degrade.addColorStop(0, 'rgba(0,0,0,0)');
      degrade.addColorStop(1, 'rgba(0,0,0,0.52)');
      ctx.fillStyle = degrade;
      ctx.fillRect(0, 0, lado, lado);
      textura.refresh();
    }

    this.vinheta?.destroy();
    this.vinheta = this.cena.add
      .image(0, 0, chave)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(802);
    this.vinheta.setDisplaySize(largura, altura);
  }

  /**
   * Luzes fixas da sala. Elas nao existem para clarear: existem para o jogador
   * ter em que se apoiar no escuro. Sem nenhum ponto de referencia, uma sala
   * grande e escura vira um corredor sem fim.
   *
   * @param {number} x      posicao no mundo
   * @param {number} y      posicao no mundo
   * @param {number} raio   alcance da luz, em pixels
   * @param {number} forca  0..1, quanto ela come da escuridao no centro
   */
  adicionar(x, y, raio = 300, forca = 0.5) {
    const chave = 'luz/' + Math.round(raio) + '_' + Math.round(forca * 100);
    pincelDeLuz(this.cena, chave, Math.round(raio), forca);
    const luz = { x, y, raio: Math.round(raio), chave };
    this.luzes.push(luz);
    return luz;
  }

  /** Chamar a cada quadro com a posicao da Alice. */
  seguir(x, y) {
    if (!this.escuro) return;
    const camera = this.cena.cameras.main;

    this.escuro.clear();
    this.escuro.fill(CORES.preto, this.escuridao);

    for (const luz of this.luzes) {
      this.apagar(luz.chave, luz.raio, luz.x, luz.y, camera);
    }

    // A da Alice por ultimo, para ser sempre a mais forte.
    this.apagar(this.pincelAlice, this.raioAlice, x, y - 40, camera);
  }

  apagar(pincel, raio, x, y, camera) {
    const ex = x - camera.scrollX - raio;
    const ey = y - camera.scrollY - raio;

    // Fora da tela nao adianta apagar.
    if (ex > this.escuro.width || ey > this.escuro.height ||
        ex + raio * 2 < 0 || ey + raio * 2 < 0) return;

    this.escuro.erase(pincel, ex, ey);
  }

  destroy() {
    this.escuro?.destroy();
    this.vinheta?.destroy();
  }
}
