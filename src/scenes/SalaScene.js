/**
 * UMA CENA PARA TODAS AS SALAS DA FASE 1
 *
 * Corredor, despensa, sala lateral e sotao usam esta mesma cena. O que muda
 * entre elas esta em `src/data/salas.js` — imagem, luzes, saidas, o que tem
 * dentro. Trocar de sala e reiniciar esta cena com outro nome; os assets ja
 * estao carregados, entao a troca e imediata.
 *
 * O quarto principal continua na Phase1Scene, porque ele e montado de um jeito
 * diferente: veio como uma tela de 960x640 e precisa ser remontado maior. As
 * salas novas vieram inteiras.
 */

import { SCENES, PROFUNDIDADE, ALICE_TAMANHO } from '../core/constants.js';
import { dimensoes } from '../core/tela.js';
import { GameplayScene } from './GameplayScene.js';
import { SalaDesenhada } from '../objects/SalaDesenhada.js';
import { SALAS, ENTRADAS } from '../data/salas.js';
import { AudioManager } from '../core/AudioManager.js';
import { SaveManager } from '../core/SaveManager.js';
import { HEX, FONTE } from '../ui/theme.js';

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
    AudioManager.tocarAmbiente('ambiente.silencio', 2200);

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.mostrarNome();
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
    if (d.observacoes) for (const o of d.observacoes) this.montarObservacao(o);
    if (d.biscoitos) for (const b of d.biscoitos) this.montarBiscoito(b);
    if (d.passagemBaixa) this.montarPassagemBaixa(d.passagemBaixa);
    if (d.relogioDePendulo) this.montarRelogioDePendulo(d.relogioDePendulo);
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
   * Um biscoito, no vidro dele. Comer troca o tamanho da Alice.
   * A prateleira e alta de proposito: sozinha ela nao alcanca, e essa e a
   * primeira vez que o jogo pede parkour.
   */
  montarBiscoito(b) {
    const x = b.x * this.sala.largura;

    const ponto = this.criarInterativo({
      x,
      y: PROFUNDIDADE.FUNDO + 70,
      raio: 120,
      alturaMarca: b.altura + 40,
      aoInteragir: () => {
        if (this.alice.altura < b.altura - 40) {
          this.dialogo.mostrar(
            ['O vidro esta la em cima.', 'Daqui eu nao alcanco.'],
            { rotulo: 'Alice' }
          );
          return;
        }
        this.comerBiscoito(b, ponto);
      },
    });
  }

  comerBiscoito(b, ponto) {
    if (this.alice.tamanho.id === b.vira) {
      this.dialogo.mostrar(
        ['Ja estou assim.'],
        { rotulo: 'Alice' }
      );
      return;
    }

    this.entrarEmCinematica();
    SaveManager.registrarItem('biscoito-' + b.id);

    this.alice.pegarItem().then(() => this.alice.mudarTamanho(b.vira)).then(() => {
      this.sairDeCinematica();
      this.dialogo.mostrar(
        b.vira === 'pequena'
          ? ['O chao ficou longe.', 'E o resto do mundo, enorme.']
          : ['Voltei.', 'Ou o mundo voltou. Nao da para saber daqui.'],
        { rotulo: 'Alice' }
      );
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
