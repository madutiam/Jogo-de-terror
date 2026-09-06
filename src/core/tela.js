/**
 * Tamanho real da tela, em tempo de execucao.
 *
 * O jogo e DESENHADO numa base de 960x640, mas nao e mostrado sempre nessa
 * proporcao. No modo EXPAND o Phaser estica o eixo que sobra ate preencher a
 * janela — celular deitado em 19,5:9, notebook em 16:10, monitor em 21:9. Nada
 * de barra preta, nada de corte.
 *
 * Em troca, nenhuma tela pode assumir 960x640. Quem posiciona alguma coisa
 * pergunta o tamanho aqui, e se reposiciona quando ele muda.
 */

import { GAME } from './constants.js';

/** Tamanho atual da area de jogo, em pixels do jogo. */
export function dimensoes(cena) {
  return {
    largura: cena.scale.width || GAME.WIDTH,
    altura: cena.scale.height || GAME.HEIGHT,
    meioX: (cena.scale.width || GAME.WIDTH) / 2,
    meioY: (cena.scale.height || GAME.HEIGHT) / 2,
  };
}

/**
 * Chama `callback` toda vez que a tela mudar de tamanho, e desliga sozinho
 * quando a cena termina.
 */
export function aoRedimensionar(cena, callback) {
  const aviso = () => callback(dimensoes(cena));
  cena.scale.on('resize', aviso);
  cena.events.once('shutdown', () => cena.scale.off('resize', aviso));
  cena.events.once('destroy', () => cena.scale.off('resize', aviso));
}

/**
 * Para telas de interface, cujo layout inteiro depende do tamanho: em vez de
 * reposicionar item por item, remonta a cena. Um giro de celular acontece uma
 * vez; remontar e mais simples e nunca deixa nada fora do lugar.
 *
 * Ignora variacoes minusculas (barra de endereco do navegador aparecendo e
 * sumindo), que senao remontariam a cena o tempo todo.
 */
export function remontarNoResize(cena, tolerancia = 24) {
  const inicial = dimensoes(cena);

  aoRedimensionar(cena, (agora) => {
    const mudou =
      Math.abs(agora.largura - inicial.largura) > tolerancia ||
      Math.abs(agora.altura - inicial.altura) > tolerancia;

    if (mudou && cena.scene.isActive()) cena.scene.restart();
  });
}

/**
 * Escala para a imagem COBRIR a area toda, sem sobrar borda.
 * Corta um pouco das extremidades — nas artes de capa isso cai na moldura
 * decorativa, que aguenta perder alguns por cento.
 */
export function escalaParaCobrir(imagem, largura, altura) {
  return Math.max(largura / imagem.width, altura / imagem.height);
}

/** Escala para a imagem CABER inteira, sem cortar nada. */
export function escalaParaCaber(imagem, largura, altura) {
  return Math.min(largura / imagem.width, altura / imagem.height);
}
