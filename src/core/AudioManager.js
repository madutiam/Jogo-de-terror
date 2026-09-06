/**
 * Camada unica de audio do jogo.
 *
 * Filosofia (regra 34): som -> silencio -> som. Musica nao fica tocando o tempo
 * todo. Por isso existem tres camadas separadas e independentes:
 *
 *   musica    — uma por vez, com fade
 *   ambiente  — uma por vez, baixa, continua
 *   efeito    — pontuais e loops curtos (passos)
 *
 * Nenhum som e inventado: se o clipe nao existir no catalogo, o pedido e
 * registrado e nada toca (melhor silencio do que som errado).
 */

import { CLIPES, CLACS, AUDIO_FALTANDO } from '../data/audio.js';
import { SaveManager } from './SaveManager.js';

class Audio {
  constructor() {
    /** @type {Phaser.Game|null} */
    this.game = null;
    this.musicaAtual = null;
    this.ambienteAtual = null;
    /** loops de efeito ativos, por id de clipe */
    this.loops = new Map();
    /** atenuacao temporaria da musica (0..1), usada quando o tic-tac tem prioridade */
    this.duckMusica = 1;
    this.pedidosFaltando = new Set();
  }

  registrar(game) {
    this.game = game;

    // Util para inspecionar pelo console, como `window.aliceTerror`. Sem isto
    // nao ha como conferir volume real por sala sem alterar codigo de jogo.
    if (typeof window !== 'undefined') window.aliceAudio = this;

    this.aplicarVolumes();
    this.ligarDesbloqueio();

    /** Fades em andamento. Ver `esmaecer`. */
    this.fades = [];
    /** Sons que acabaram de tocar e ainda esperam o volume. Ver `aplicarPendentes`. */
    this.pendentes = [];

    game.events.on('step', () => {
      this.aplicarPendentes();
      this.avancarFades();
    });
  }

  /**
   * Leva o volume de um som ate um alvo, ao longo de `ms`.
   *
   * Isto era feito com um tween de CENA — e essa era a origem de "o jogo esta
   * mudo". A musica do menu e pedida no create() do Menu, e nesse instante a
   * cena que o gerenciador encontrava viva ainda era a Preload, que estava
   * sendo encerrada. O tween nascia na cena moribunda, morria com ela, e a
   * musica ficava tocando em volume ZERO para sempre.
   *
   * A musica atravessa cenas; o fade dela nao pode pertencer a nenhuma. Aqui
   * ele anda no relogio do jogo, que so acaba quando o jogo acaba.
   */
  esmaecer(som, alvo, ms, aoTerminar) {
    this.fades = this.fades.filter((f) => f.som !== som);

    if (!som || ms <= 0) {
      if (som) this.definirVolume(som, alvo);
      aoTerminar?.();
      return;
    }
    // `de` sai de `__volumeAtual`, nunca de `som.volume`: no quadro do play o
    // Phaser ainda responde 1, e o fade desceria DE 1 em vez de subir do zero.
    this.fades.push({
      som, de: som.__volumeAtual ?? som.volume, para: alvo, ms, passou: 0, aoTerminar,
    });
  }

  /**
   * O VOLUME SO PEGA NO QUADRO SEGUINTE AO `play()`
   *
   * MEDIDO no navegador, quatro caminhos, todos terminando em ganho 1:
   * volume no `sound.add`, volume no proprio `play`, volume no config do
   * MARCADOR, e `setVolume` na linha logo depois do play. O mesmo `setVolume`
   * um quadro adiante pega e vale 0,33 certinho.
   *
   * Isso explicava a musica do menu comecando com uma pancada: ela era criada
   * em volume 0 para subir suave, o Phaser devolvia 1, e o fade entao DESCIA de
   * 1 ate 0,308. E teria estragado o ambiente por sala inteiro — cada comodo
   * tem o peso dele, e todos sairiam no talo.
   *
   * Entao o volume desejado vive em `__volumeAtual`, e o som entra numa fila
   * aplicada no proximo passo do jogo. Nada mais na classe le `som.volume`.
   */
  aplicarPendentes() {
    if (!this.pendentes.length) return;
    for (const som of this.pendentes) {
      if (som && !som.pendingRemove && som.__volumeAtual !== undefined) {
        som.setVolume(som.__volumeAtual);
      }
    }
    this.pendentes.length = 0;
  }

  /** Unico lugar que mexe em volume de som. Mantem `__volumeAtual` de pe. */
  definirVolume(som, v) {
    som.__volumeAtual = v;
    som.setVolume(v);
  }

  avancarFades() {
    if (!this.fades.length) return;
    const dt = this.game.loop.delta;

    this.fades = this.fades.filter((f) => {
      f.passou += dt;
      const t = Math.min(1, f.passou / f.ms);
      if (f.som.setVolume) this.definirVolume(f.som, f.de + (f.para - f.de) * t);
      if (t < 1) return true;
      f.aoTerminar?.();
      return false;
    });
  }

  /**
   * Navegador nenhum deixa um site tocar som antes de a pessoa encostar nele.
   * Ate o primeiro clique, o contexto de audio fica SUSPENSO — a musica e
   * criada, o jogo acha que esta tocando, e nao sai som nenhum.
   *
   * O jogo tinha um desbloqueio, mas ele morava numa cena (a Boot) que e
   * encerrada logo depois. Quando a pessoa finalmente clicava, no menu, nao
   * havia mais ninguem escutando — e o jogo ficava mudo a partida inteira.
   *
   * Aqui o ouvinte fica no documento, vive enquanto a pagina viver, e depois de
   * destravar ele RECOMECA a musica e o ambiente que estavam no ar. Sem isso,
   * o que comecou travado nunca vira som.
   */
  ligarDesbloqueio() {
    if (this.desbloqueioLigado) return;
    this.desbloqueioLigado = true;

    const destravar = () => {
      const contexto = this.game?.sound?.context;
      if (contexto?.state === 'suspended') contexto.resume();
      this.game?.sound?.unlock?.();

      // Recomeca APENAS o que ficou mudo por causa da trava.
      //
      // A primeira versao disto zerava a referencia e chamava de novo — e
      // assim a antiga continuava tocando por baixo da nova. Duas musicas ao
      // mesmo tempo na tela de historia. Agora a antiga e parada de verdade
      // antes, e o que ja estiver soando fica como esta.
      this.recomecarSeMudo(
        this.musicaAtual,
        (id) => { this.pararMusica(0); this.tocarMusica(id, 600); }
      );
      this.recomecarSeMudo(
        this.ambienteAtual,
        // O volume vai junto: sem ele, o ambiente que estava abafado por ser
        // de uma sala fechada voltaria no peso cheio do catalogo.
        (id, volume) => { this.pararAmbiente(0); this.tocarAmbiente(id, 900, { volume }); }
      );

      for (const evento of ['pointerdown', 'keydown', 'touchstart'])
        window.removeEventListener(evento, destravar, true);
    };

    for (const evento of ['pointerdown', 'keydown', 'touchstart'])
      window.addEventListener(evento, destravar, true);
  }

  /** Se o som existe mas nao esta soando, refaz. Se ja esta soando, nao mexe. */
  recomecarSeMudo(som, refazer) {
    if (!som || som.isPlaying) return;
    const id = som.__id;
    if (id) refazer(id, som.__volumeBase);
  }

  // ------------------------------------------------------------------ volumes

  get config() {
    return SaveManager.getConfig();
  }

  volumeDe(categoria, volumeClipe = 1) {
    const c = this.config;
    const base = categoria === 'musica' ? c.volumeMusica : c.volumeEfeitos;
    const duck = categoria === 'musica' ? this.duckMusica : 1;
    return c.volumeGeral * base * volumeClipe * duck;
  }

  /**
   * Um fade em curso manda no volume daquele som ate terminar. Mexer no slider
   * no meio dele nao adiantava: `aplicarVolumes` ajustava, e no quadro seguinte
   * o fade puxava de volta para o alvo ANTIGO. Quem abre as configuracoes
   * enquanto a musica do menu ainda esta entrando via o controle nao pegar.
   *
   * Em vez de brigar com o fade, reaponta ele: a transicao continua suave e
   * termina no volume novo.
   */
  reapontarFade(som, alvo) {
    const f = this.fades?.find((x) => x.som === som);
    if (!f) return false;
    f.para = alvo;
    return true;
  }

  /** Aplica o volume respeitando um fade em curso. */
  ajustarVolume(som, alvo) {
    if (!this.reapontarFade(som, alvo)) this.definirVolume(som, alvo);
  }

  /** Reaplica volumes em tudo que ja esta tocando (chamado pelas configuracoes). */
  aplicarVolumes() {
    if (!this.game) return;

    if (this.musicaAtual && this.musicaAtual.isPlaying) {
      this.ajustarVolume(
        this.musicaAtual, this.volumeDe('musica', this.musicaAtual.__volumeBase)
      );
    }
    if (this.ambienteAtual && this.ambienteAtual.isPlaying) {
      this.ajustarVolume(
        this.ambienteAtual, this.volumeDe('ambiente', this.ambienteAtual.__volumeBase)
      );
    }
    for (const som of this.loops.values()) {
      if (som.isPlaying) {
        this.ajustarVolume(som, this.volumeDe('efeito', som.__volumeBase));
      }
    }
  }

  /**
   * Abaixa a musica temporariamente para outro som dominar
   * (regra 34: perto do relogio, o tic-tac manda).
   */
  abafarMusica(fator = 0.25, ms = 600) {
    this.duckMusica = fator;
    if (this.musicaAtual && this.musicaAtual.isPlaying && this.game) {
      this.game.scene.getScenes(true)[0]?.tweens.add({
        targets: this.musicaAtual,
        volume: this.volumeDe('musica', this.musicaAtual.__volumeBase),
        duration: ms,
      });
    }
  }

  restaurarMusica(ms = 900) {
    this.abafarMusica(1, ms);
  }

  // ------------------------------------------------------------------- helpers

  clipe(id) {
    const clipe = CLIPES[id];
    if (clipe) return clipe;

    if (!this.pedidosFaltando.has(id)) {
      this.pedidosFaltando.add(id);
      const descricao = AUDIO_FALTANDO[id];
      console.info(
        '[audio] clipe ausente "' + id + '"' +
        (descricao ? ' — som que falta: ' + descricao : '') +
        '. Nada foi tocado.'
      );
    }
    return null;
  }

  /** Cena viva qualquer, so para ter acesso a tweens/timers. */
  get cena() {
    return this.game ? this.game.scene.getScenes(true)[0] : null;
  }

  /**
   * Cria o som de um clipe respeitando `inicio` e `duracao`.
   *
   * Quando o clipe e um TRECHO do arquivo, usamos um MARCADOR do Phaser em vez
   * de `seek` — porque marcador tambem respeita o recorte ao repetir. Com
   * `seek` o loop voltaria para o comeco do arquivo, e um passo que comeca em
   * 2,2 s voltaria a tocar o ambiente que existe antes disso.
   */
  criarSom(clipe, { loop = false, volume = 1 } = {}) {
    const som = this.game.sound.add(clipe.arquivo);
    som.__volumeBase = volume;

    // O volume que ESTE som deve ter agora. Ver `definirVolume`.
    som.__volumeAtual = volume;

    const ehTrecho = clipe.inicio !== undefined || clipe.duracao !== undefined;

    if (ehTrecho) {
      som.addMarker({
        name: 'clipe',
        start: clipe.inicio ?? 0,
        duration: clipe.duracao,
        config: { loop, volume },
      });
      som.__marcador = 'clipe';
    } else {
      som.__marcador = null;
      som.setLoop(loop);
      som.setVolume(volume);
    }

    return som;
  }

  /**
   * Toca o som respeitando o marcador, se houver — e agenda o volume.
   *
   * O agendamento nao e frescura. Ver `aplicarPendentes`.
   */
  iniciar(som) {
    if (som.__marcador) som.play(som.__marcador);
    else som.play();

    this.pendentes.push(som);
    return som;
  }

  // -------------------------------------------------------------------- musica

  tocarMusica(id, fadeMs = 900) {
    const clipe = this.clipe(id);
    if (!clipe || !this.game) return null;

    if (this.musicaAtual && this.musicaAtual.__id === id && this.musicaAtual.isPlaying) {
      return this.musicaAtual;
    }

    this.pararMusica(fadeMs);

    const som = this.criarSom(clipe, { loop: clipe.loop ?? true, volume: 0 });
    som.__id = id;
    som.__volumeBase = clipe.volume ?? 1;
    this.iniciar(som);

    const alvo = this.volumeDe('musica', som.__volumeBase);
    this.esmaecer(som, alvo, fadeMs);

    this.musicaAtual = som;
    return som;
  }

  pararMusica(fadeMs = 700) {
    const som = this.musicaAtual;
    if (!som) return;
    this.musicaAtual = null;

    this.esmaecer(som, 0, fadeMs, () => { som.stop(); som.destroy(); });
  }

  // ------------------------------------------------------------------ ambiente

  /**
   * `volume` sobrescreve o volume do catalogo.
   *
   * Existe porque o mesmo clipe serve a comodos diferentes com pesos
   * diferentes: o silencio tenso e a linha de base no quarto, mas na despensa
   * — comodo fechado e entulhado — ele precisa vir abafado. Um clipe, varias
   * salas, sem duplicar entrada no catalogo.
   */
  tocarAmbiente(id, fadeMs = 1200, { volume } = {}) {
    const clipe = this.clipe(id);
    if (!clipe || !this.game) return null;

    const volumeBase = volume ?? clipe.volume ?? 1;

    if (this.ambienteAtual && this.ambienteAtual.__id === id && this.ambienteAtual.isPlaying) {
      // Mesmo clipe, ja soando: nao recomeca do zero. Mas se a sala nova pediu
      // outro peso, ele desliza ate la — atravessar uma porta nao pode cortar
      // o som no meio.
      if (this.ambienteAtual.__volumeBase !== volumeBase) {
        this.ambienteAtual.__volumeBase = volumeBase;
        this.esmaecer(this.ambienteAtual, this.volumeDe('ambiente', volumeBase), fadeMs);
      }
      return this.ambienteAtual;
    }

    this.pararAmbiente(fadeMs);

    const som = this.criarSom(clipe, { loop: true, volume: 0 });
    som.__id = id;
    som.__volumeBase = volumeBase;
    this.iniciar(som);

    this.esmaecer(som, this.volumeDe('ambiente', som.__volumeBase), fadeMs);

    this.ambienteAtual = som;
    return som;
  }

  pararAmbiente(fadeMs = 900) {
    const som = this.ambienteAtual;
    if (!som) return;
    this.ambienteAtual = null;

    this.esmaecer(som, 0, fadeMs, () => { som.stop(); som.destroy(); });
  }

  // ------------------------------------------------------------------- efeitos

  /** Efeito pontual. Respeita `inicio`/`duracao` do catalogo. */
  tocar(id, opcoes = {}) {
    const clipe = this.clipe(id);
    if (!clipe || !this.game) return null;

    const volumeBase = opcoes.volume ?? clipe.volume ?? 1;
    const som = this.criarSom(clipe, {
      loop: false,
      volume: this.volumeDe(clipe.categoria || 'efeito', volumeBase),
    });

    som.__volumeBase = volumeBase;

    // Um efeito pontual se desfaz quando acaba. `stop()` tambem emite
    // 'complete', entao o guarda evita destruir duas vezes se alguem parar o
    // som na mao antes do fim.
    som.once('complete', () => {
      if (!som.pendingRemove) som.destroy();
    });

    this.iniciar(som);

    return som;
  }

  /**
   * Um CLAC de xadrez, alternando entre as variantes.
   * Repetir sempre a mesma batida transformaria a formacao da mensagem na
   * Fase 3 num metronomo — e o que precisa soar ali e uma peca de cada vez.
   */
  tocarClac() {
    this.proximoClac = ((this.proximoClac ?? -1) + 1) % CLACS.length;
    return this.tocar(CLACS[this.proximoClac]);
  }

  /** Loop de efeito (passos, corrida). Chamar de novo com o mesmo id nao reinicia. */
  iniciarLoop(id) {
    const clipe = this.clipe(id);
    if (!clipe || !this.game) return null;

    const existente = this.loops.get(id);
    if (existente && existente.isPlaying) return existente;

    const som = this.criarSom(clipe, {
      loop: true,
      volume: this.volumeDe('efeito', clipe.volume ?? 1),
    });
    som.__volumeBase = clipe.volume ?? 1;
    this.iniciar(som);

    this.loops.set(id, som);
    return som;
  }

  pararLoop(id) {
    const som = this.loops.get(id);
    if (!som) return;
    this.loops.delete(id);
    som.stop();
    som.destroy();
  }

  pararTodosOsLoops() {
    for (const id of [...this.loops.keys()]) this.pararLoop(id);
  }

  /** Corta tudo de uma vez — util em transicao de cena e no silencio dramatico. */
  silenciar({ musica = true, ambiente = true, loops = true, fadeMs = 400 } = {}) {
    if (musica) this.pararMusica(fadeMs);
    if (ambiente) this.pararAmbiente(fadeMs);
    if (loops) this.pararTodosOsLoops();
  }
}

export const AudioManager = new Audio();
