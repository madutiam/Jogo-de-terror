/**
 * Entrada unificada: teclado e toque chegam aqui e saem iguais.
 * As cenas nunca leem tecla direto — elas perguntam para este objeto.
 *
 * Regra 54: durante cinematica o controle e desligado. Quem desliga e
 * `bloquear()`, e o eixo passa a ser sempre 0 (a Alice para, nao continua andando).
 */

export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.bloqueado = false;

    /** Estado escrito pelos botoes de toque. */
    this.toque = {
      eixoX: 0,
      eixoY: 0,
      correndo: false,
      pulo: false,          // apertada, consumida uma vez
      puloSegurado: false,  // botao continua pressionado
      interagir: false,
      tamanho: false,
    };

    const teclado = scene.input.keyboard;

    this.teclas = teclado.addKeys({
      esquerda: Phaser.Input.Keyboard.KeyCodes.A,
      direita: Phaser.Input.Keyboard.KeyCodes.D,
      fundo: Phaser.Input.Keyboard.KeyCodes.W,
      frente: Phaser.Input.Keyboard.KeyCodes.S,
      setaEsquerda: Phaser.Input.Keyboard.KeyCodes.LEFT,
      setaDireita: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      setaCima: Phaser.Input.Keyboard.KeyCodes.UP,
      setaBaixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
      pulo: Phaser.Input.Keyboard.KeyCodes.SPACE,
      interagir: Phaser.Input.Keyboard.KeyCodes.E,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      correr: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      tamanho: Phaser.Input.Keyboard.KeyCodes.Q,
      pausa: Phaser.Input.Keyboard.KeyCodes.ESC,
    });

    // O navegador rola a pagina com espaco e setas; aqui nao.
    teclado.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    ]);
  }

  bloquear() {
    this.bloqueado = true;
    this.toque.eixoX = 0;
    this.toque.eixoY = 0;
    this.toque.pulo = false;
    this.toque.puloSegurado = false;
    this.toque.interagir = false;
    this.toque.tamanho = false;
  }

  liberar() {
    this.bloqueado = false;
  }

  /**
   * -1 esquerda, 0 parada, 1 direita.
   * Regra 52: o valor daqui manda tanto no movimento quanto no sprite,
   * entao nunca da para andar para um lado olhando para o outro.
   */
  get eixoX() {
    if (this.bloqueado) return 0;

    const t = this.teclas;
    let eixo = 0;
    if (t.esquerda.isDown || t.setaEsquerda.isDown) eixo -= 1;
    if (t.direita.isDown || t.setaDireita.isDown) eixo += 1;

    if (eixo === 0 && this.toque.eixoX !== 0) {
      eixo = Math.sign(this.toque.eixoX);
    }

    return eixo;
  }

  /**
   * Eixo da profundidade: -1 vai para o fundo da cena (se afasta da camera),
   * +1 vem para a frente.
   */
  get eixoY() {
    if (this.bloqueado) return 0;

    const t = this.teclas;
    let eixo = 0;
    if (t.fundo.isDown || t.setaCima.isDown) eixo -= 1;
    if (t.frente.isDown || t.setaBaixo.isDown) eixo += 1;

    if (eixo === 0 && this.toque.eixoY !== 0) {
      eixo = Math.sign(this.toque.eixoY);
    }

    return eixo;
  }

  get noTeclado() {
    const t = this.teclas;
    return t.esquerda.isDown || t.direita.isDown || t.fundo.isDown || t.frente.isDown ||
           t.setaEsquerda.isDown || t.setaDireita.isDown ||
           t.setaCima.isDown || t.setaBaixo.isDown;
  }

  /** Intensidade do analogico (0..1). No teclado e sempre 1. */
  get intensidade() {
    if (this.bloqueado) return 0;
    if (this.noTeclado) return 1;

    return Phaser.Math.Clamp(
      Math.hypot(this.toque.eixoX, this.toque.eixoY), 0, 1
    );
  }

  get correndo() {
    if (this.bloqueado) return false;
    return this.teclas.correr.isDown || this.toque.correndo;
  }

  /**
   * O pulo e so o espaco (e o botao na tela). W e a seta para cima agora
   * servem para andar para o fundo da cena, entao nao podem pular junto.
   */
  get pulandoSegurado() {
    if (this.bloqueado) return false;
    return this.teclas.pulo.isDown || this.toque.puloSegurado;
  }

  /** True uma unica vez por apertada. */
  consumirPulo() {
    if (this.bloqueado) return false;

    const teclado = Phaser.Input.Keyboard.JustDown(this.teclas.pulo);

    if (this.toque.pulo) {
      this.toque.pulo = false;
      return true;
    }

    return teclado;
  }

  /** True uma unica vez por apertada. Funciona tambem com o controle bloqueado
   *  (o dialogo precisa avancar durante a cinematica). */
  consumirInteragir({ mesmoBloqueado = false } = {}) {
    if (this.bloqueado && !mesmoBloqueado) return false;

    const t = this.teclas;
    const teclado = Phaser.Input.Keyboard.JustDown(t.interagir) ||
                    Phaser.Input.Keyboard.JustDown(t.enter);

    if (this.toque.interagir) {
      this.toque.interagir = false;
      return true;
    }

    return teclado;
  }

  /**
   * True uma unica vez por apertada: a Alice come um biscoito e troca de
   * tamanho. So funciona depois que ela pega os dois vidros na despensa.
   */
  consumirTamanho() {
    if (this.bloqueado) return false;

    if (this.toque.tamanho) {
      this.toque.tamanho = false;
      return true;
    }
    return Phaser.Input.Keyboard.JustDown(this.teclas.tamanho);
  }

  consumirPausa() {
    return Phaser.Input.Keyboard.JustDown(this.teclas.pausa);
  }
}
