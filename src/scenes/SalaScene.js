/**
 * UMA CENA PARA TODAS AS SALAS DA FASE 1
 *
 * Corredor, despensa, sala lateral e sotao usam esta mesma cena. O que muda
 * entre elas esta em `src/data/salas.js` — imagem, luzes, saidas, som, o que
 * tem dentro. Trocar de sala e reiniciar esta cena com outro nome; os assets ja
 * estao carregados, entao a troca e imediata.
 *
 * O quarto principal continua na Phase1Scene, porque ele e montado de um jeito
 * diferente: veio como uma tela de 960x640 e precisa ser remontado maior. As
 * salas novas vieram inteiras.
 */

import {
  SCENES, PROFUNDIDADE, ALICE_TAMANHO, profundidadeDeDesenho,
} from '../core/constants.js';
import { dimensoes } from '../core/tela.js';
import { GameplayScene } from './GameplayScene.js';
import { SalaDesenhada } from '../objects/SalaDesenhada.js';
import { SALAS, ENTRADAS, MEDIDA_DA_PECA } from '../data/salas.js';
import { AudioManager } from '../core/AudioManager.js';
import { SaveManager } from '../core/SaveManager.js';
import { HEX, FONTE } from '../ui/theme.js';
import { MecanismoDeRelogio } from '../objects/MecanismoDeRelogio.js';

/**
 * Onde acaba a sala e comeca a proxima.
 *
 * Tem que ser MAIOR que a margem lateral do mundo (130 px), senao a faixa fica
 * atras do limite onde a Alice pode andar e a porta nunca dispara — o jogador
 * encosta na parede invisivel e nada acontece.
 */
const FAIXA_DE_SAIDA = 165;

export class SalaScene extends GameplayScene {
  constructor() {
    super(SCENES.SALA, {});
  }

  /** @param {{sala: string, entrada: string, tamanho?: string}} dados */
  init(dados) {
    // A cena e reaproveitada a cada troca de sala: sem zerar isto, a segunda
    // porta nunca abriria.
    this.trocandoDeSala = false;
    this.nomeDaSala = dados?.sala || 'corredor';
    this.entrada = dados?.entrada || 'leste';
    this.tamanhoDaAlice = dados?.tamanho || 'normal';
    this.dados = SALAS[this.nomeDaSala];

    this.terreno = this.dados.terreno || 'madeira';
    this.faseNumero = 1;
  }

  create() {
    this.tela = dimensoes(this);
    this.cameras.main.setBackgroundColor(0x000000);

    this.sala = new SalaDesenhada(this, {
      chave: this.dados.imagem,
      linhaDoChao: this.dados.linhaDoChao,
      luzes: this.dados.luzes,
    });

    // A sala manda no tamanho do mundo.
    this.larguraMundo = this.sala.largura;
    this.profundidadeMundo = this.sala.profundidade;
    this.limiteFundo = PROFUNDIDADE.FUNDO + 34;

    const ponto = this.pontoDeEntrada();
    this.montarJogabilidade({ x: ponto.x, y: ponto.y });

    // Ela atravessa portas sem voltar ao tamanho normal: quem entrou pequena
    // continua pequena. Troca direta, sem a animacao de encolher — a mudanca
    // aconteceu na sala anterior, nao agora.
    this.alice.tamanho = ALICE_TAMANHO[this.tamanhoDaAlice] || ALICE_TAMANHO.normal;
    this.alice.aplicarPegada();

    this.montarConteudo();
    this.montarSaidas();

    AudioManager.pararMusica(400);
    this.iniciarAmbienteDaSala();

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.mostrarNome();
  }

  // ------------------------------------------------------------------ ambiente

  /**
   * O SOM DE CADA COMODO
   *
   * As cinco salas chamavam `ambiente.silencio` e mais nada, entao todas
   * soavam iguais — e uma casa em que todo comodo soa igual e uma casa que o
   * ouvido para de escutar. Agora cada sala traz o proprio ambiente em
   * `salas.js`, do mesmo jeito que ja traz luzes e saidas.
   *
   * Nenhum audio novo foi preciso: sao os quatro clipes de ambiente que ja
   * existiam, em pesos diferentes.
   */
  iniciarAmbienteDaSala() {
    const a = this.ambienteDaSala();
    AudioManager.tocarAmbiente(a.clipe, a.fade ?? 2200, { volume: a.volume });
    if (a.intermitente) this.agendarIntermitente(a.intermitente);
  }

  ambienteDaSala() {
    // O relogio de bolso volta a andar no instante em que ela o pega, e dali em
    // diante o sotao E o tic-tac. Subir de novo depois disso nao pode devolver
    // o vento: o que mudou na sala foi a historia, nao a hora do dia.
    if (this.nomeDaSala === 'sotao' && SaveManager.temItem('relogio-de-bolso')) {
      return { clipe: 'ambiente.tictac', volume: 0.34 };
    }
    return this.dados.ambiente || { clipe: 'ambiente.silencio' };
  }

  /**
   * Um som solto, em intervalo SORTEADO a cada disparo.
   *
   * Intervalo fixo vira metronomo: na terceira vez o jogador ja sabe a hora e
   * o susto acaba antes de acontecer. Sorteado, o corredor nunca fica
   * confortavel — e nao ha nada para achar, o que e justamente o ponto.
   *
   * O relogio da cena morre com a cena, entao trocar de sala cancela isto
   * sozinho.
   */
  agendarIntermitente(i) {
    const proximo = () => {
      this.intermitente = this.time.delayedCall(
        Phaser.Math.Between(i.minMs, i.maxMs),
        () => {
          // Durante cinematica o controle sai do jogador (regra 8) e a cena
          // manda no som. Um rangido sorteado no meio de uma fala atropelaria
          // a cena — o relogio segue correndo e ele tenta de novo depois.
          if (!this.emCinematica) AudioManager.tocar(i.clipe, { volume: i.volume });
          proximo();
        }
      );
    };
    proximo();
  }

  pontoDeEntrada() {
    const e = ENTRADAS[this.entrada] || ENTRADAS.leste;
    return {
      x: e.x * this.sala.largura,
      y: PROFUNDIDADE.FUNDO + 40 +
         e.y * (PROFUNDIDADE.FRENTE - PROFUNDIDADE.FUNDO - 80),
    };
  }

  // ------------------------------------------------------------------ conteudo

  montarConteudo() {
    const d = this.dados;
    if (d.rastros) this.montarRastros(d.rastros.map((r) => ({
      ...r, x: r.x * this.sala.largura,
    })));
    if (d.plataformas) for (const p of d.plataformas) this.montarPlataforma(p);
    if (d.observacoes) for (const o of d.observacoes) this.montarObservacao(o);
    if (d.biscoitos) this.montarBiscoitos(d.biscoitos);
    if (d.passagemBaixa) this.montarPassagemBaixa(d.passagemBaixa);
    if (d.relogioDePendulo) this.montarRelogioDePendulo(d.relogioDePendulo);
    if (d.mecanismo) this.montarMecanismo(d.mecanismo);
    if (d.buraco) this.montarBuraco(d.buraco);
    if (d.relogioDeBolso) this.montarRelogioDeBolso(d.relogioDeBolso);
    if (d.saidasPorPonto) for (const p of d.saidasPorPonto) this.montarSaidaPorPonto(p);
  }

  /**
   * Uma peca que da para subir.
   *
   * O desenho e a colisao saem do MESMO numero: a altura util da peca, medida
   * no PNG. Se cada um usasse a sua conta, a Alice pisaria no ar ou afundaria
   * na madeira.
   */
  montarPlataforma(p) {
    const medida = MEDIDA_DA_PECA[p.chave][p.variante];
    const larguraArte = medida[0] * p.escala;
    const alturaArte = medida[1] * p.escala;

    const x = p.x * this.sala.largura;
    const chaoDaPeca = PROFUNDIDADE.FUNDO + 92;   // um pouco a frente da parede
    const base = p.sobre ?? 0;

    // `apoio` fica no chao (ou em cima de outra peca) e a altura vem do desenho.
    // `saliencia` esta presa na parede, com o topo na altura pedida.
    const topo = p.tipo === 'saliencia' ? p.topo : base + alturaArte;
    const yDoDesenho = p.tipo === 'saliencia'
      ? chaoDaPeca - p.topo + alturaArte
      : chaoDaPeca - base;

    this.add
      .image(x, yDoDesenho, 'peca/' + p.chave + '-' + p.variante)
      .setOrigin(0.5, 1)
      .setScale(p.escala)
      .setDepth(profundidadeDeDesenho(chaoDaPeca) - 0.2);

    this.criarObstaculo({
      x,
      y: chaoDaPeca,
      largura: larguraArte * 0.82,
      profundidade: 52,
      alturaTopo: Math.round(topo),
    });
  }

  montarObservacao(o) {
    this.criarInterativo({
      x: o.x * this.sala.largura,
      y: PROFUNDIDADE.FUNDO + 60,
      raio: o.raio ?? 130,
      alturaMarca: o.altura ?? 120,
      aoInteragir: () => {
        this.dialogo.mostrar(o.texto, {
          rotulo: o.rotulo,
          aoFechar: () => SaveManager.registrarPista(o.id),
        });
      },
    });
  }

  /**
   * Os dois vidros. Ela precisa estar EM CIMA da prateleira para alcancar —
   * do chao a resposta e que nao da, e o jogador tira dai a propria conclusao.
   */
  montarBiscoitos(b) {
    if (SaveManager.temItem('biscoitos')) return;
    const x = b.x * this.sala.largura;

    this.pontoDosBiscoitos = this.criarInterativo({
      x,
      y: PROFUNDIDADE.FUNDO + 92,
      raio: 130,
      alturaMarca: b.altura + 30,
      aoInteragir: () => {
        if (this.alice.altura < b.altura - 40) {
          this.dialogo.mostrar(
            ['Os vidros estao la em cima.', 'Daqui eu nao alcanco.'],
            { rotulo: 'Alice' }
          );
          return;
        }
        this.pegarOsBiscoitos();
      },
    });
  }

  pegarOsBiscoitos() {
    if (SaveManager.temItem('biscoitos')) return;

    this.entrarEmCinematica();
    this.pontoDosBiscoitos.usado = true;
    this.pontoDosBiscoitos.umaVez = true;
    this.pontoDosBiscoitos.marca.destroy();

    this.alice.pegarItem().then(() => {
      SaveManager.registrarItem('biscoitos');
      AudioManager.tocar('efeito.descoberta');
      this.marcarCheckpoint(this.alice.x, this.alice.y, 'biscoitos');

      this.dialogo.mostrar(
        [
          'Dois vidros. SHRINK num, GROW no outro.',
          'Alguem deixou os dois aqui em cima, longe de quem nao devesse subir.',
          'Cabem no bolso.',
        ],
        { rotulo: 'Alice', aoFechar: () => { this.sairDeCinematica(); this.ensinarTamanho(); } }
      );
    });
  }

  /** A unica vez em que o jogo diz uma tecla. Depois disso, nunca mais. */
  ensinarTamanho() {
    const dica = this.add
      .text(this.tela.largura / 2, this.tela.altura - 52,
        this.toque?.ativo ? 'toque no vidro para comer um biscoito' : 'Q come um biscoito', {
          fontFamily: FONTE, fontSize: '15px', color: HEX.dourado,
        })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1300)
      .setAlpha(0);

    this.tweens.add({
      targets: dica, alpha: 0.85, duration: 700, yoyo: true, hold: 4200,
      onComplete: () => dica.destroy(),
    });
  }

  /**
   * A fresta baixa. So passa quem estiver pequena — e e a Alice quem descobre
   * isso, tentando. Nada aponta o caminho (regra 43).
   */
  montarPassagemBaixa(p) {
    this.criarInterativo({
      x: p.x * this.sala.largura,
      y: PROFUNDIDADE.FUNDO + 46,
      raio: 120,
      alturaMarca: 70,
      aoInteragir: () => {
        if (this.alice.tamanho.id !== 'pequena') {
          this.dialogo.mostrar(p.textoGrande, { rotulo: 'Alice' });
          return;
        }
        this.dialogo.mostrar(p.textoPequena, {
          rotulo: 'Alice',
          aoFechar: () => this.irPara(p.para, p.entrada),
        });
      },
    });
  }

  /**
   * O mecanismo na parede. Fica visivel de longe — nao e escondido, e dificil:
   * o jogador ve o mostrador vazio e nao sabe que hora por nele.
   */
  montarMecanismo(m) {
    const x = m.x * this.sala.largura;
    const chao = PROFUNDIDADE.FUNDO + 92;
    const medida = MEDIDA_DA_PECA.mecanismo[0];
    const jaResolvido = SaveManager.temItem('mecanismo');

    this.desenhoDoMecanismo = this.add
      .image(x, chao - m.altura + medida[1] * m.escala, 'peca/mecanismo-' + (jaResolvido ? 3 : 0))
      .setOrigin(0.5, 1)
      .setScale(m.escala)
      .setDepth(profundidadeDeDesenho(chao) - 0.3);

    if (jaResolvido) {
      this.iluminacaoDoMecanismo();
      return;
    }

    this.puzzle = new MecanismoDeRelogio(this, () => {
      SaveManager.registrarItem('mecanismo');
      this.desenhoDoMecanismo.setTexture('peca/mecanismo-3');
      this.iluminacaoDoMecanismo();
      this.marcarCheckpoint(this.alice.x, this.alice.y, 'mecanismo');

      this.dialogo.mostrar(
        [
          'Alguma coisa cedeu, longe daqui.',
          'Madeira batendo no chao. Do lado do quarto.',
        ],
        { rotulo: 'Alice' }
      );
    });

    this.criarInterativo({
      x,
      y: chao,
      raio: m.raio ?? 150,
      alturaMarca: m.altura + 20,
      aoInteragir: () => {
        if (SaveManager.temItem('mecanismo')) {
          this.dialogo.mostrar(
            ['Ja parou de girar.'],
            { rotulo: 'Alice' }
          );
          return;
        }
        this.entrarEmCinematica();
        this.puzzle.abrir();
        // O controle so volta quando o painel fecha.
        const vigia = this.time.addEvent({
          delay: 120, loop: true,
          callback: () => {
            if (this.puzzle.aberto) return;
            vigia.remove();
            this.sairDeCinematica();
          },
        });
      },
    });
  }

  /** Depois de resolvido ele fica aceso: e o unico ponto de luz da sala. */
  iluminacaoDoMecanismo() {
    const x = this.dados.mecanismo.x * this.sala.largura;
    this.sala.iluminacao.adicionar(x, PROFUNDIDADE.FUNDO + 40, 260, 0.45);
  }

  montarRelogioDePendulo(r) {
    this.criarInterativo({
      x: r.x * this.sala.largura,
      y: PROFUNDIDADE.FUNDO + 60,
      raio: r.raio ?? 150,
      alturaMarca: r.altura ?? 250,
      aoInteragir: () => {
        AudioManager.tocar('efeito.sussurro');
        this.dialogo.mostrar(r.texto, {
          rotulo: 'o relogio de pendulo',
          aoFechar: () => SaveManager.registrarPista('relogio-0318'),
        });
      },
    });
  }

  /**
   * Uma saida que nao e uma borda: uma fresta, uma escada, um alcapao.
   *
   * Existe porque nem toda sala se liga pelas laterais. A sala lateral so tem a
   * fresta; o sotao so tem a escada. Sem isto, entrar nelas era entrar e ficar.
   */
  montarSaidaPorPonto(p) {
    this.criarInterativo({
      x: p.x * this.sala.largura,
      y: PROFUNDIDADE.FUNDO + 70,
      raio: p.raio ?? 130,
      alturaMarca: p.altura ?? 90,
      aoInteragir: () => {
        if (p.exigeTamanho && this.alice.tamanho.id !== p.exigeTamanho) {
          this.dialogo.mostrar(p.textoBloqueado, { rotulo: 'Alice' });
          return;
        }
        if (p.texto) {
          this.dialogo.mostrar(p.texto, {
            rotulo: 'Alice',
            aoFechar: () => this.irPara(p.para, p.entrada),
          });
          return;
        }
        this.irPara(p.para, p.entrada);
      },
    });
  }

  /**
   * O buraco no assoalho. So machuca quem estiver no chao — passar por cima
   * pela viga e seguro, e e essa a graca.
   */
  montarBuraco(b) {
    this.criarPerigo({
      x: b.x * this.sala.largura,
      y: PROFUNDIDADE.FUNDO + 150,
      largura: b.largura,
      profundidade: 190,
    });
  }

  /**
   * O RELOGIO DE BOLSO DO COELHO
   *
   * Roteiro, secao 9, na ordem exata: som de item, pequena pausa, tic-tac,
   * reacao da Alice, novo evento narrativo. E secao 10: e AQUI que o progresso
   * fica salvo, porque foi conquista de verdade — ela atravessou tres salas,
   * resolveu o mecanismo e subiu ate o fim do sotao.
   */
  montarRelogioDeBolso(r) {
    if (SaveManager.temItem('relogio-de-bolso')) return;

    const x = r.x * this.sala.largura;
    const chao = PROFUNDIDADE.FUNDO + 92;

    this.relogio = this.add
      .image(x, chao - r.altura, 'relogio-bolso')
      .setOrigin(0.5, 1)
      .setScale(0.26)
      .setDepth(profundidadeDeDesenho(chao) + 0.5);

    // Latao velho ainda pega luz no escuro.
    this.tweens.add({
      targets: this.relogio, alpha: { from: 0.72, to: 1 },
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.pontoDoRelogio = this.criarInterativo({
      x,
      y: chao,
      raio: 120,
      alturaMarca: r.altura + 34,
      aoInteragir: () => {
        if (this.alice.altura < r.altura - 40) {
          this.dialogo.mostrar(
            ['Tem alguma coisa la em cima.', 'Daqui eu nao alcanco.'],
            { rotulo: 'Alice' }
          );
          return;
        }
        this.pegarORelogio();
      },
    });
  }

  pegarORelogio() {
    if (this.temORelogio) return;
    this.temORelogio = true;

    this.entrarEmCinematica();
    this.pontoDoRelogio.usado = true;
    this.pontoDoRelogio.umaVez = true;
    this.pontoDoRelogio.marca.destroy();

    AudioManager.tocar('efeito.item');
    this.tweens.add({
      targets: this.relogio, alpha: 0, y: this.relogio.y - 26, duration: 700,
      onComplete: () => this.relogio.destroy(),
    });

    SaveManager.registrarItem('relogio-de-bolso');
    this.marcarCheckpoint(this.alice.x, this.alice.y, 'relogio-de-bolso');

    // A pausa. O silencio da fase inteira para antes de o tic-tac comecar.
    // O vento do sotao tambem sai, e o sussurro sorteado junto: se ele caisse
    // dentro destes 1,9 s de nada, a pausa deixaria de ser pausa.
    AudioManager.pararAmbiente(500);
    this.intermitente?.remove();

    this.time.delayedCall(1900, () => {
      AudioManager.tocarAmbiente('ambiente.tictac', 1500);
      this.time.delayedCall(1300, () => {
        this.dialogo.mostrar(
          [
            'E o relogio dele.',
            'O vidro esta quebrado e os ponteiros pararam em tres e dezessete.',
            'Mas esta andando. Esta andando de novo.',
          ],
          { rotulo: 'Alice', aoFechar: () => this.sairDeCinematica() }
        );
      });
    });
  }

  // -------------------------------------------------------------------- saidas

  /**
   * As saidas sao faixas nas bordas da sala. Chegar na borda leva para a sala
   * vizinha — sem apertar nada, sem texto explicando. Porta e para atravessar.
   */
  montarSaidas() {
    this.saidas = [];
    for (const s of this.dados.saidas || []) {
      if (s.lado !== 'leste' && s.lado !== 'oeste') continue;
      this.saidas.push({
        ...s,
        x1: s.lado === 'oeste' ? 0 : this.sala.largura - FAIXA_DE_SAIDA,
        x2: s.lado === 'oeste' ? FAIXA_DE_SAIDA : this.sala.largura,
      });
    }
  }

  irPara(sala, entrada) {
    if (this.trocandoDeSala) return;
    this.trocandoDeSala = true;

    this.alice.pararPassos();
    AudioManager.tocar('efeito.rangido');
    this.cameras.main.fadeOut(420, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const carga = { sala, entrada, tamanho: this.alice.tamanho.id };
      if (sala === 'quarto') this.scene.start(SCENES.PHASE1, carga);
      else this.scene.start(SCENES.SALA, carga);
    });
  }

  /** O nome da sala, discreto, so por um instante. */
  mostrarNome() {
    const t = this.add
      .text(this.tela.largura / 2, 64, this.dados.nome, {
        fontFamily: FONTE, fontSize: '15px', color: HEX.ossoApagado,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1300)
      .setAlpha(0);

    this.tweens.add({
      targets: t, alpha: 0.7, duration: 700, yoyo: true, hold: 1500,
      onComplete: () => t.destroy(),
    });
  }

  // --------------------------------------------------------------------- update

  update(tempo, delta) {
    super.update(tempo, delta);
    if (this.pausado || this.trocandoDeSala) return;

    this.sala.seguirComEscuridao(this.alice.x, this.alice.y);

    for (const s of this.saidas) {
      if (this.alice.x >= s.x1 && this.alice.x <= s.x2) {
        this.irPara(s.para, s.entrada);
        return;
      }
    }
  }
}
