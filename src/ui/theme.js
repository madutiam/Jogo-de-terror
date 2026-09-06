/**
 * Paleta e tipografia da interface.
 * Nada de cor infantil: osso, cinza, sangue seco e um dourado apagado.
 */

export const CORES = {
  fundo: 0x07080b,
  fundoTexto: 0x0b0d11,
  osso: 0xc9c2b4,
  ossoApagado: 0x7d786e,
  ossoMorto: 0x3a3831,
  sangue: 0x7a1f22,
  dourado: 0xb9a05f,
  borda: 0x2a2b30,
  preto: 0x000000,
};

export const HEX = {
  osso: '#c9c2b4',
  ossoApagado: '#7d786e',
  ossoMorto: '#3a3831',
  sangue: '#7a1f22',
  dourado: '#b9a05f',
  preto: '#000000',
};

export const FONTE = 'Georgia, "Times New Roman", Times, serif';

export const ESTILO = {
  titulo: {
    fontFamily: FONTE,
    fontSize: '64px',
    color: HEX.osso,
    letterSpacing: 12,
  },

  subtitulo: {
    fontFamily: FONTE,
    fontSize: '18px',
    color: HEX.ossoApagado,
  },

  menu: {
    fontFamily: FONTE,
    fontSize: '27px',
    color: HEX.ossoApagado,
  },

  menuAtivo: {
    fontFamily: FONTE,
    fontSize: '27px',
    color: HEX.osso,
  },

  dialogo: {
    fontFamily: FONTE,
    fontSize: '22px',
    color: HEX.osso,
    lineSpacing: 9,
    wordWrap: { width: 700 },
  },

  narrativa: {
    fontFamily: FONTE,
    fontSize: '20px',
    color: HEX.osso,
    lineSpacing: 12,
    wordWrap: { width: 740 },
  },

  dica: {
    fontFamily: FONTE,
    fontSize: '17px',
    color: HEX.ossoApagado,
  },

  hud: {
    fontFamily: FONTE,
    fontSize: '30px',
    color: HEX.osso,
  },
};

/**
 * Sombra escura atras do texto. Os cenarios sao muito escuros e cheios de
 * textura; sem isso o texto some no fundo.
 */
export function comSombra(estilo, forca = 3) {
  return {
    ...estilo,
    shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: forca, fill: true },
  };
}
