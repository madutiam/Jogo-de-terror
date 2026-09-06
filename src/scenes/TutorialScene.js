/**
 * TUTORIAL (regra 42): ensina o minimo e sai da frente.
 *
 * A sala e um corredor de 3400px que o jogador atravessa uma vez. Cada trecho
 * dela ensina uma coisa, na ordem em que ela precisa ser aprendida:
 *
 *   1  andar para os lados        — o corpo responde
 *   2  andar para o FUNDO         — existe um segundo eixo, e ele nao e o pulo
 *   3  pular                      — pulo e altura, serve para subir em algo
 *   4  observar                   — a marca dourada acende sozinha; olhe
 *   5  coletar                    — mesmo botao, consequencia diferente
 *   6  dano                       — o HUD so acende quando passa a significar algo
 *   7  tamanho (biscoitos)        — encolher e passar por baixo da viga
 *   8  a viga                     — a prova de que entendeu
 *   9  silencio                   — o aviso acabou
 *
 * Correr nao e passo: e uma reacao. Quem correr sem ser mandado recebe uma
 * frase e mais nada; quem nunca correr nunca ouve falar disso.
 *
 * Regra 42 continua valendo: nao explica a historia, nao aponta pista, nao
 * entrega puzzle. Nenhum objeto da Fase 1 e usado aqui como ponto de
 * observacao — usar um deles ja seria adiantar a investigacao.
 */

import {
  SCENES, PROFUNDIDADE, ALICE_STATE, VIDAS_INICIAIS, profundidadeDeDesenho,
} from '../core/constants.js';
import { dimensoes } from '../core/tela.js';
import { GameplayScene } from './GameplayScene.js';
import { AudioManager } from '../core/AudioManager.js';
import { QuartoExtendido } from '../objects/QuartoExtendido.js';
import { CORES, HEX, FONTE } from '../ui/theme.js';
import { relatorio } from '../core/MissingAssets.js';

const SALA = {
  // O trecho final, de 2800 em diante, e o do tamanho: os vidros, a viga
  // baixa, e a saida depois dela.
  largura: 3400,
  profundidade: PROFUNDIDADE.FRENTE,
  limiteFundo: 496,
};

const INICIO = { x: 260, y: 1000 };

/** Onde o jogador para de ser avisado. */
const SILENCIO_FINAL = 4000;

export class TutorialScene extends GameplayScene {
  constructor() {
    super(SCENES.TUTORIAL, {
      terreno: 'madeira',
      largura: SALA.largura,
      profundidade: SALA.profundidade,
      limiteFundo: SALA.limiteFundo,
    });
  }

  create() {
    this.tela = dimensoes(this);
    this.cameras.main.setBackgroundColor(CORES.preto);
    this.cameras.main.fadeIn(900, 0, 0, 0);

    this.quarto = new QuartoExtendido(this, SALA);

    this.montarJogabilidade({ x: INICIO.x, y: INICIO.y });
    this.hud.esconder();

    // A mobilia desenhada vira obstaculo de verdade. Sem isso a Alice
    // atravessa a mesa, e um cenario atravessavel ensina que o cenario mente.
    this.quarto.montarMobilia(this);

    this.montarTexto();
    this.montarPassos();
    this.montarPerigo();
    this.montarSaida();

    AudioManager.pararMusica(400);
    AudioManager.tocarAmbiente('ambiente.silencio', 2200);

    // A cena abre no escuro e em silencio. Nada aparece ate ela se mexer.
    this.acordou = false;
    this.abertoEm = this.time.now;
    this.passo = 0;
    this.correu = false;
    this.tempoCorrendo = 0;

    this.events.once('shutdown', () => relatorio());
  }

  // --------------------------------------------------------------------- texto

  /**
   * Duas linhas: o sussurro da Alice e, abaixo, a tecla.
   * Separadas porque um passo pode omitir a tecla (o de coletar diz so "o
   * mesmo botao") sem ficar mudo, e porque a linha da tecla muda com o tipo de
   * controle sem tocar no sussurro.
   *
   * No alto da tela: no rodape colidiria com o analogico no celular.
   */
  montarTexto() {
    const meio = this.tela.largura / 2;

    this.sussurro = this.add
      .text(meio, 96, '', { fontFamily: FONTE, fontSize: '20px', color: HEX.osso })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1300)
      .setAlpha(0);

    this.linhaDaTecla = this.add
      .text(meio, 124, '', { fontFamily: FONTE, fontSize: '15px', color: HEX.ossoApagado })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1300)
      .setAlpha(0);
  }

  dizer(sussurro, tecla = '') {
    const trocar = (alvo, texto, alphaFinal) => {
      this.tweens.add({
        targets: alvo,
        alpha: 0,
        duration: 240,
        onComplete: () => {
          alvo.setText(texto);
          if (texto) this.tweens.add({ targets: alvo, alpha: alphaFinal, duration: 600 });
        },
      });
    };

    trocar(this.sussurro, sussurro, 0.62);
    trocar(this.linhaDaTecla, tecla, 0.4);
  }

  calar() {
    this.tweens.add({ targets: [this.sussurro, this.linhaDaTecla], alpha: 0, duration: 400 });
  }

  // -------------------------------------------------------------------- passos

  get ehToque() {
    return this.toque?.ativo === true;
  }

  montarPassos() {
    const bau = this.quarto.movel('bau');

    this.marcos = [
      // 1) andar para os lados — qualquer lado conta
      {
        verificar: () => Math.abs(this.alice.x - INICIO.x) > 200,
        entrar: () => this.dizer(
          'Meus pés ainda obedecem.',
          this.ehToque ? 'arraste para o lado' : 'A   D   ·   setas'
        ),
      },

      // 2) andar para o fundo — o eixo que ninguem espera
      {
        verificar: () => this.alice.y < INICIO.y - 260,
        entrar: () => this.dizer(
          'A parede está mais longe do que parecia.',
          this.ehToque ? 'arraste para cima — não é o pulo' : 'W  ·  ↑  — não é o pulo'
        ),
      },

      // 3) pular e ficar EM CIMA do bau
      {
        verificar: () => this.alice.pisoAtual > 40,
        entrar: () => this.dizer(
          'Isso aguenta o meu peso.',
          this.ehToque ? '⌃ — segure para subir mais' : 'espaço — segure para subir mais'
        ),
      },

      // 4) observar
      {
        verificar: () => this.observou === true,
        entrar: () => this.dizer(
          'Vale olhar mais de perto.',
          this.ehToque ? '◇' : 'E  ·  Enter'
        ),
      },

      // 5) coletar — mesmo botao, outra consequencia
      {
        verificar: () => this.pegou === true,
        entrar: () => this.dizer('Isso vem comigo.', 'o mesmo botão'),
      },

      // 6) dano — o HUD acende aqui, quando passa a significar alguma coisa
      {
        verificar: () => this.alice.x > 2540,
        entrar: () => {
          this.hud.mostrar();
          this.marcarCheckpoint(2280, 880);
          this.dizer('Olhe o chão antes de pisar.');
        },
        concluir: () => {
          if (this.hud.vidas < VIDAS_INICIAIS) this.dizer('Elas não voltam sozinhas.');
        },
      },

      // 7) tamanho — os vidros, e uma viga baixa demais para passar inteira.
      // O tutorial ensina a TECLA e a consequencia. Nao ensina onde usar: isso
      // e da fase, e a regra 42 manda nao adiantar puzzle.
      {
        verificar: () => this.podeTrocarTamanho === true,
        entrar: () => this.dizer(
          'Dois vidros. Um encolhe, o outro devolve.',
          this.ehToque ? '◈' : 'Q'
        ),
      },

      // 8) atravessar a viga, ja pequena — a prova de que entendeu
      {
        verificar: () => this.alice.x > 3120,
        entrar: () => this.dizer('Do outro lado o teto é mais baixo.'),
        concluir: () => this.dizer('Nem toda porta é do tamanho de quem passa.'),
      },
    ];

    // ---- passo 4: um ponto do assoalho, sem objeto desenhado ----
    // De proposito: assim ele aprende que qualquer lugar pode valer um olhar,
    // e nao que "aperta E em movel".
    this.criarInterativo({
      x: 1880, y: 620, raio: 150, raioAviso: 300, alturaMarca: 40,
      aoInteragir: () => {
        this.observou = true;
        this.dialogo.mostrar(
          [
            'Poeira parada. Ninguém passou por aqui.',
            'Mas o rodapé está riscado.',
          ],
          { rotulo: 'observar' }
        );
      },
    });

    // ---- passo 5: a chave, que ja existe como asset ----
    this.chaveNoChao = this.porNoChao(this.add.image(0, 0, 'chave'), 2200, 680, 0.12);

    this.criarInterativo({
      x: 2200, y: 680, raio: 150, raioAviso: 300, umaVez: true, alturaMarca: 90,
      aoInteragir: () => {
        this.pegou = true;
        AudioManager.tocar('efeito.item');
        this.tweens.add({
          targets: this.chaveNoChao,
          alpha: 0,
          y: this.chaveNoChao.y - 20,
          duration: 420,
          onComplete: () => this.chaveNoChao.destroy(),
        });
      },
    });

    this.montarPassoDoTamanho();

    // Guarda a posicao do bau so para conferencia — o obstaculo dele ja veio
    // de montarMobilia().
    this.bau = bau;
  }

  /**
   * PASSO 7 — O TAMANHO
   *
   * Os dois vidros num caixote, ao alcance da mao: aqui nao ha puzzle, so a
   * lição. Depois deles, uma viga atravessada baixa demais — ela ocupa a
   * profundidade inteira da sala, entao nao ha como contornar. So passa quem
   * encolher.
   *
   * O que a Alice ganha aqui NAO entra no save: senao a despensa da Fase 1,
   * que e onde os biscoitos sao conquistados de verdade, ficaria sem sentido
   * para quem fez o tutorial antes.
   */
  montarPassoDoTamanho() {
    const chao = 700;

    // Os vidros, num caixote. Ao alcance: o tutorial nao pede parkour aqui.
    this.caixoteDosVidros = this.add
      .image(2860, chao, 'peca/caixote-1')
      .setOrigin(0.5, 1)
      .setScale(0.34)
      .setDepth(profundidadeDeDesenho(chao) - 0.2);

    this.criarObstaculo({
      x: 2860, y: chao, largura: 120, profundidade: 46, alturaTopo: 86,
    });

    this.pontoDosVidros = this.criarInterativo({
      x: 2860, y: chao + 20, raio: 150, raioAviso: 320, umaVez: true,
      alturaMarca: 120,
      aoInteragir: () => {
        AudioManager.tocar('efeito.item');
        this.podeTrocarTamanho = true;
        this.tweens.add({
          targets: this.caixoteDosVidros, alpha: 0.55, duration: 400,
        });
      },
    });

    // A viga: baixa, atravessada, e ocupando a sala toda em profundidade.
    // Nao da para dar a volta — e essa e a questao.
    const vigaX = 3060;
    this.viga = this.add
      .image(vigaX, chao - 96, 'peca/viga-2')
      .setOrigin(0.5, 0.5)
      .setScale(0.72)
      .setDepth(profundidadeDeDesenho(chao) + 0.4);

    this.criarObstaculo({
      x: vigaX,
      y: (SALA.limiteFundo + SALA.profundidade) / 2,
      largura: 70,
      profundidade: SALA.profundidade - SALA.limiteFundo,
      soPequena: true,
    });
  }

  /**
   * Assoalho podre. Nao e obstaculo: da para atravessar, so custa.
   * Ocupa o fundo inteiro em y e deixa 350px limpos na frente — quem olhar o
   * chao desce e passa limpo, quem andar reto apanha. Os dois concluem o passo.
   */
  montarPerigo() {
    const area = { x1: 2340, x2: 2500, y1: 496, y2: 820 };

    const g = this.add.graphics().setDepth(-13);
    for (let y = area.y1; y < area.y2; y += 2) {
      const t = (y - area.y1) / (area.y2 - area.y1);
      // Mais escuro no fundo, esmaecendo para a frente: le como podridao
      // avancando pela parede, nao como uma faixa pintada.
      g.fillStyle(CORES.preto, 0.55 * (1 - t) ** 0.7);
      g.fillRect(area.x1, y, area.x2 - area.x1, 2);
    }
    // Manchas irregulares na borda, para a faixa nao ter cara de retangulo.
    g.fillStyle(CORES.preto, 0.3);
    for (let i = 0; i < 14; i++) {
      const x = area.x1 - 14 + (i * 13) % (area.x2 - area.x1 + 28);
      const y = area.y1 + ((i * 61) % (area.y2 - area.y1));
      g.fillEllipse(x, y, 30 + (i % 4) * 12, 14 + (i % 3) * 6);
    }

    this.criarPerigo({
      x: (area.x1 + area.x2) / 2,
      y: (area.y1 + area.y2) / 2,
      largura: area.x2 - area.x1,
      profundidade: area.y2 - area.y1,
    });
  }

  montarSaida() {
    // Alvo grande e afastado da borda: no celular o canto superior direito e
    // onde o sistema captura o gesto de voltar.
    const sair = this.add
      .text(this.tela.largura - 40, 34, 'sair do tutorial', {
        fontFamily: FONTE, fontSize: '15px', color: HEX.ossoApagado,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(1300)
      .setAlpha(0.7);

    sair.setInteractive(
      new Phaser.Geom.Rectangle(-14, -22, sair.width + 28, 44),
      Phaser.Geom.Rectangle.Contains
    );
    sair.input.cursor = 'pointer';

    sair.on('pointerover', () => sair.setColor(HEX.dourado));
    sair.on('pointerout', () => sair.setColor(HEX.ossoApagado));
    sair.on('pointerdown', () => this.voltar());

    this.input.keyboard.on('keydown-ESC', () => this.voltar());
  }

  // -------------------------------------------------------------------- update

  update(tempo, delta) {
    super.update(tempo, delta);
    if (this.pausado || !this.marcos) return;

    this.quarto.seguirComEscuridao(this.alice.x, this.alice.y);

    if (!this.acordou) {
      this.talvezAcordar(tempo);
      return;
    }

    this.reagirACorrida(delta);
    this.avancarPasso();
  }

  /**
   * Um tutorial que fala antes de o jogador respirar vira manual.
   * O primeiro aviso so aparece quando ela se mexe — ou depois de 4 segundos,
   * para quem congelou nao ficar preso.
   */
  talvezAcordar(tempo) {
    const mexeu = this.alice.body.velocity.length() > 10;
    if (!mexeu && tempo - this.abertoEm < SILENCIO_FINAL) return;

    this.acordou = true;
    this.marcos[0].entrar?.();
  }

  /**
   * Correr nao e passo: e reacao. Quem correr por instinto ouve uma frase;
   * quem nunca correr nunca fica sabendo que da.
   */
  reagirACorrida(delta) {
    if (this.correu) return;
    if (this.alice.estado !== ALICE_STATE.RUN) return;

    this.tempoCorrendo += delta;
    if (this.tempoCorrendo < 500) return;

    this.correu = true;
    const guardado = { sussurro: this.sussurro.text, tecla: this.linhaDaTecla.text };
    this.dizer('Isso faz barulho.');
    this.time.delayedCall(2200, () => {
      if (this.acordou && this.passo < this.marcos.length) {
        this.dizer(guardado.sussurro, guardado.tecla);
      }
    });
  }

  avancarPasso() {
    const marco = this.marcos[this.passo];
    if (!marco || marco.concluido) return;
    if (!marco.verificar()) return;

    marco.concluido = true;
    marco.concluir?.();
    this.passo += 1;

    const proximo = this.marcos[this.passo];
    if (proximo) {
      proximo.entrar?.();
      return;
    }

    this.encerrar();
  }

  /**
   * O fim nao e uma frase: sao quatro segundos de silencio COM o controle na
   * mao. E o unico jeito de o jogador sentir a diferenca entre ser guiado e
   * ser largado.
   */
  encerrar() {
    this.calar();

    this.time.delayedCall(SILENCIO_FINAL, () => {
      this.dizer('Daqui em diante ninguém avisa.');
      this.time.delayedCall(2400, () => this.voltar());
    });
  }

  /** ESC dentro do tutorial volta ao menu em vez de abrir a pausa. */
  alternarPausa() {
    this.voltar();
  }

  voltar() {
    if (this.saindo) return;
    this.saindo = true;
    AudioManager.silenciar({ fadeMs: 300 });
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(SCENES.MENU));
  }
}
