/**
 * O relogio de parede do quarto (cenario 1).
 *
 * O desenho original marca ~1h20, mas a historia diz 03:17. Em vez de mexer no
 * arquivo da desenvolvedora, o miolo do mostrador e reconstruido com os pixels
 * do PROPRIO desenho: os dois ponteiros originais estao na metade direita do
 * mostrador, entao espelhamos a metade esquerda (que esta limpa) sobre a
 * direita. O resultado mantem a textura, a sujeira e a luz do desenho — nada e
 * pintado do nada. Depois desenhamos os ponteiros novos em cima.
 *
 * Isso e adaptacao de cenario, permitida pela regra 2. A moldura, os algarismos
 * e o vidro continuam intactos: a reconstrucao cobre so o disco interno.
 */

/** Medido no proprio PNG do cenario 1 varrendo o mostrador claro. */
const RELOGIO = {
  x: 433,
  y: 213,
  raioMiolo: 40,   // o anel dos algarismos comeca em r=43; ficamos dentro dele
  raioHora: 24,
  raioMinuto: 38,
  raioEixo: 4,
};

/**
 * Fatia do mostrador que precisa ser reconstruida.
 * No desenho original o ponteiro das horas aponta para o 1 e o dos minutos
 * para perto do 4 — os dois ficam na metade direita. Angulos em radianos,
 * medidos como no canvas (0 = 3 horas, cresce no sentido horario).
 */
const SETOR = {
  inicio: Phaser.Math.DegToRad(-78),  // um pouco acima do 1
  fim: Phaser.Math.DegToRad(48),      // um pouco abaixo do 4
};

const CHAVE_TEXTURA = 'relogio-miolo';

export class RelogioDeParede {
  /**
   * @param {Phaser.Scene} cena
   * @param {{hora?: number, minuto?: number, parado?: boolean, profundidade?: number}} opcoes
   */
  constructor(cena, opcoes = {}) {
    this.cena = cena;
    this.hora = opcoes.hora ?? 3;
    this.minuto = opcoes.minuto ?? 17;
    this.parado = opcoes.parado ?? true;

    /**
     * A leitura dos pixels usa sempre as coordenadas do PNG original.
     * O DESENHO, porem, vai para onde o trecho original foi parar dentro da
     * sala grande — por isso o deslocamento.
     */
    this.dx = opcoes.deslocamentoX ?? 0;

    const profundidade = opcoes.profundidade ?? 0.5;

    this.criarMiolo();

    this.miolo = cena.add
      .image(RELOGIO.x + this.dx, RELOGIO.y, CHAVE_TEXTURA)
      .setDepth(profundidade);

    this.corPonteiro = this.lerCorDoPonteiro();

    this.g = cena.add.graphics().setDepth(profundidade + 0.05);
    this.desenharPonteiros();
  }

  /**
   * Monta o disco limpo espelhando a metade esquerda do mostrador.
   * Nada de cor inventada: sao os pixels do desenho original.
   */
  criarMiolo() {
    const cena = this.cena;
    if (cena.textures.exists(CHAVE_TEXTURA)) return;

    const R = RELOGIO.raioMiolo;
    const lado = R * 2;

    const origem = cena.textures.get('fase1-quarto').getSourceImage();
    const textura = cena.textures.createCanvas(CHAVE_TEXTURA, lado, lado);
    const ctx = textura.getContext();

    ctx.clearRect(0, 0, lado, lado);
    ctx.save();

    // Recorta so a FATIA onde estavam os ponteiros antigos (de pouco depois do
    // 12 ate pouco depois do 4). Fora dela o mostrador original continua
    // aparecendo intacto — quanto menos a gente cobre, melhor.
    ctx.beginPath();
    ctx.moveTo(R, R);
    ctx.arc(R, R, R, SETOR.inicio, SETOR.fim);
    ctx.closePath();
    ctx.clip();

    // Dentro da fatia, usa a metade esquerda do mostrador espelhada:
    // mesma textura, mesma sujeira, mesma luz — e sem ponteiro.
    ctx.translate(lado, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      origem,
      RELOGIO.x - R, RELOGIO.y - R, R, lado,
      0, 0, R, lado
    );

    ctx.restore();
    textura.refresh();
  }

  /** Cor dos ponteiros: a mais escura do mostrador original. */
  lerCorDoPonteiro() {
    const textura = this.cena.textures;
    let escuro = { r: 255, g: 255, b: 255 };
    let menorLuz = 1e9;

    for (let angulo = 0; angulo < 360; angulo += 7) {
      const rad = Phaser.Math.DegToRad(angulo);
      const x = Math.round(RELOGIO.x + Math.cos(rad) * 30);
      const y = Math.round(RELOGIO.y + Math.sin(rad) * 30);
      const cor = textura.getPixel(x, y, 'fase1-quarto');
      if (!cor) continue;

      const luz = cor.red + cor.green + cor.blue;
      if (luz < menorLuz) {
        menorLuz = luz;
        escuro = { r: cor.red, g: cor.green, b: cor.blue };
      }
    }

    return (escuro.r << 16) | (escuro.g << 8) | escuro.b;
  }

  // ---------------------------------------------------------------- ponteiros

  desenharPonteiros() {
    const g = this.g;
    g.clear();

    const anguloMinuto = Phaser.Math.DegToRad(this.minuto * 6 - 90);
    const anguloHora = Phaser.Math.DegToRad(((this.hora % 12) + this.minuto / 60) * 30 - 90);

    // As 03:17 os dois ponteiros quase se sobrepoem (98,5 contra 102 graus).
    // E o horario certo — o das horas fica mais curto e mais grosso para que
    // ainda de para ler os dois.
    g.lineStyle(5, 0x000000, 0.35);
    this.linha(anguloHora, RELOGIO.raioHora, 2);
    g.lineStyle(3, 0x000000, 0.35);
    this.linha(anguloMinuto, RELOGIO.raioMinuto, 2);

    g.lineStyle(5, this.corPonteiro, 1);
    this.linha(anguloHora, RELOGIO.raioHora, 0);

    g.lineStyle(2.5, this.corPonteiro, 1);
    this.linha(anguloMinuto, RELOGIO.raioMinuto, 0);

    g.fillStyle(this.corPonteiro, 1);
    g.fillCircle(RELOGIO.x + this.dx, RELOGIO.y, RELOGIO.raioEixo);
  }

  linha(angulo, comprimento, deslocamento) {
    const cx = RELOGIO.x + this.dx;
    this.g.beginPath();
    this.g.moveTo(cx, RELOGIO.y + deslocamento);
    this.g.lineTo(
      cx + Math.cos(angulo) * comprimento,
      RELOGIO.y + Math.sin(angulo) * comprimento + deslocamento
    );
    this.g.strokePath();
  }

  /** Muda a hora mostrada — os puzzles de horario vao usar isto. */
  definirHora(hora, minuto) {
    this.hora = hora;
    this.minuto = minuto;
    this.desenharPonteiros();
  }

  get posicao() {
    return { x: RELOGIO.x + this.dx, y: RELOGIO.y };
  }

  destroy() {
    this.g.destroy();
    this.miolo.destroy();
  }
}
