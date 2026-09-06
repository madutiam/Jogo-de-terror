/**
 * Carrega tudo e prepara as texturas derivadas.
 * Barra de progresso discreta: um filete claro sobre fundo preto.
 */

import { SCENES } from '../core/constants.js';
import { dimensoes, escalaParaCaber } from '../core/tela.js';
import { CORES, HEX, FONTE } from '../ui/theme.js';
import { AUDIO_ARQUIVOS } from '../data/audio.js';
import { carregarQuadrosDaAlice } from '../core/Alice.js';
import { recortarTextura } from '../core/texturas.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload() {
    this.desenharBarra();

    // ---- personagens ----
    // Os 163 quadros da Alice, ja fatiados e normalizados: parada, andar,
    // correr, pular, cair, pegar item, levar dano, ofegante — de perfil, de
    // frente e de costas — mais o conjunto INTEIRO da Alice pequena e os 8
    // quadros de encolher.
    carregarQuadrosDaAlice(this);
    this.load.image('alice-demon', 'assets/characters/alice-demon.png');
    this.load.image('coelho', 'assets/characters/coelho.png');
    this.load.image('coelho-morto', 'assets/characters/coelho-morto.png');

    // As tres poses do Coelho para a HIGHSFIELD 01, e os nove closes de rosto.
    for (const pose of ['relogio', 'alice', 'estranha']) {
      this.load.image('coelho/' + pose, 'assets/characters/coelho/coelho-' + pose + '-0.png');
      for (let i = 0; i < 3; i++) {
        this.load.image('coelho/' + pose + '-rosto-' + i,
          'assets/characters/coelho-rosto/coelho-' + pose + '-rosto-' + i + '.png');
      }
    }
    this.load.image('chapeleiro', 'assets/characters/chapeleiro.png');
    this.load.image('chapeleiro-fofo', 'assets/characters/chapeleiro-fofo.png');
    this.load.image('soldado-cartas', 'assets/characters/soldado-cartas.png');
    this.load.image('gato-cheshire', 'assets/characters/gato-cheshire.png');
    // Pixel art original do sorriso do Gato, feita para o jogo.
    this.load.image('gato-sorriso', 'assets/characters/gato-sorriso.png');

    // ---- cenarios ----
    this.load.image('fase1-quarto', 'assets/scenarios/fase1-quarto.png');
    this.load.image('fase2-floresta', 'assets/scenarios/fase2-floresta.png');
    this.load.image('fase2-chegada', 'assets/scenarios/fase2-chegada.png');
    this.load.image('fase2-corrida', 'assets/scenarios/fase2-corrida.png');
    this.load.image('fase2-espelho', 'assets/scenarios/fase2-espelho.png');
    this.load.image('fase3-tabuleiro', 'assets/scenarios/fase3-tabuleiro.png');

    // As salas da Fase 1, cada uma numa imagem inteira.
    this.load.image('sala-corredor', 'assets/scenarios/sala-corredor.png');
    this.load.image('sala-despensa', 'assets/scenarios/sala-despensa.png');
    this.load.image('sala-lateral',  'assets/scenarios/sala-lateral.png');
    this.load.image('sala-sotao',    'assets/scenarios/sala-sotao.png');

    // ---- objetos ----
    this.load.image('porta', 'assets/objects/porta.png');
    this.load.image('chave', 'assets/objects/chave.png');
    // O relogio de bolso do Coelho: o item que fecha a Fase 1 (roteiro, 9 e 11).
    this.load.image('relogio-bolso', 'assets/objects/relogio/relogio-bolso-0.png');
    this.load.image('relogio-bolso-aberto', 'assets/objects/relogio/relogio-bolso-aberto-0.png');

    // A HIGHSFIELD 02 vem DESENHADA, quadro a quadro: arco, porta, Alice e o
    // que esta atras, tudo junto em cada um. Duas versoes do mesmo movimento —
    // com escuridao atras da porta, e com a floresta — para a revelacao ser uma
    // troca de quadro e nao um recorte.
    for (let i = 0; i < 10; i++) {
      for (const versao of ['escura', 'floresta']) {
        this.load.image(
          'porta/' + versao + '-' + i,
          'assets/scenarios/porta-hs02/porta-' + versao + '-' + i + '.png'
        );
      }
    }

    // Rastros: o que sobrou de quem foi levado.
    for (const r of ['poca-grande', 'poca-media', 'respingos',
                     'arrasto', 'tufo-pelo', 'pegada']) {
      this.load.image('rastro/' + r, 'assets/objects/rastros/' + r + '-0.png');
    }

    // Pecas de parkour: 4 variantes de cada, para a fase nao ficar repetida.
    for (const peca of ['caixote', 'escada', 'mecanismo', 'tabua', 'prateleira',
                        'viga', 'ponteiro-longo', 'ponteiro-curto']) {
      for (let i = 0; i < 4; i++) {
        this.load.image('peca/' + peca + '-' + i,
          'assets/objects/pecas/' + peca + '-' + i + '.png');
      }
    }

    // ---- interface ----
    this.load.image('capa', 'assets/ui/capa.png');
    // A capa larga vem sem o texto do menu: as opcoes de verdade sao
    // desenhadas pelo jogo, na mesma faixa da moldura.
    this.load.image('capa-larga', 'assets/ui/capa-larga-limpa.png');
    this.load.image('pos-creditos', 'assets/ui/tela-final.png');

    // ---- audio ----
    for (const [chave, caminho] of Object.entries(AUDIO_ARQUIVOS)) {
      this.load.audio(chave, [caminho]);
    }
  }

  create() {
    this.scene.start(SCENES.MENU);
  }

  // ---------------------------------------------------------------------- ui

  desenharBarra() {
    const tela = dimensoes(this);
    const largura = Math.min(320, tela.largura * 0.4);
    const baseY = tela.altura - Math.round(tela.altura * 0.12);

    this.cameras.main.setBackgroundColor(CORES.fundo);

    // A arte do Coelho ocupa a tela de espera. Ela ja veio no Boot, entao
    // aparece de imediato, antes do carregamento pesado comecar.
    if (this.textures.exists('capa-coelho')) {
      const arte = this.add
        .image(tela.meioX, tela.meioY - tela.altura * 0.05, 'capa-coelho')
        .setAlpha(0);
      arte.setScale(escalaParaCaber(arte, tela.largura * 0.9, tela.altura * 0.86));
      this.tweens.add({ targets: arte, alpha: 1, duration: 1200 });
    }

    // Escurecimento no rodape, onde fica a barra.
    const faixa = Math.round(tela.altura * 0.22);
    const escuro = this.add.graphics();
    for (let i = 0; i < faixa; i++) {
      escuro.fillStyle(CORES.preto, (i / faixa) * 0.9);
      escuro.fillRect(0, tela.altura - faixa + i, tela.largura, 1);
    }

    const trilho = this.add.graphics();
    trilho.fillStyle(CORES.ossoMorto, 0.5);
    trilho.fillRect(tela.meioX - largura / 2, baseY, largura, 2);

    const barra = this.add.graphics();

    this.load.on('progress', (valor) => {
      barra.clear();
      barra.fillStyle(CORES.osso, 0.75);
      barra.fillRect(tela.meioX - largura / 2, baseY, largura * valor, 2);
    });

    this.load.on('fileprogress', (arquivo) => {
      // Nada na tela: silencio tambem no carregamento.
      if (arquivo?.key) this.ultimoArquivo = arquivo.key;
    });

    this.load.on('loaderror', (arquivo) => {
      console.error('[preload] falhou: ' + arquivo.key + ' (' + arquivo.url + ')');
    });
  }
}
