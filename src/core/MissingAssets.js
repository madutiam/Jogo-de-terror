/**
 * Registro de assets que faltam.
 *
 * Regra do projeto: quando uma cena precisa de uma pose ou animacao que nao
 * existe nos arquivos da desenvolvedora, o jogo NAO inventa um substituto.
 * Ele usa o frame existente mais proximo, sem deformar nada, e anota o pedido
 * aqui. No fim, `relatorio()` imprime a lista para levar para a producao de arte.
 */

const pedidos = new Map();

/**
 * Anota que uma pose/animacao foi pedida e nao existe.
 *
 * @param {string} personagem  Ex.: 'Alice', 'Alice Demon', 'Coelho'
 * @param {string} animacao    Ex.: 'JUMP', 'RUN'
 * @param {string} descricao   O que a arte precisa mostrar
 * @param {string} [usandoNoLugar] Frame existente usado provisoriamente
 */
export function pedirAsset(personagem, animacao, descricao, usandoNoLugar = '') {
  const chave = personagem + '::' + animacao;
  const existente = pedidos.get(chave);

  if (existente) {
    existente.vezes += 1;
    return;
  }

  pedidos.set(chave, {
    personagem,
    animacao,
    descricao,
    usandoNoLugar,
    vezes: 1,
  });
}

/** Lista crua, para telas de debug ou para gerar documentacao. */
export function listar() {
  return [...pedidos.values()].sort((a, b) =>
    a.personagem.localeCompare(b.personagem) || a.animacao.localeCompare(b.animacao)
  );
}

/** Imprime no console do navegador tudo que faltou durante a sessao. */
export function relatorio() {
  const itens = listar();

  if (itens.length === 0) {
    console.info('[assets] Nenhuma pose faltando foi pedida nesta sessao.');
    return itens;
  }

  console.groupCollapsed(
    '%c[assets] ' + itens.length + ' pose(s)/animacao(oes) faltando',
    'color:#c9b16a'
  );
  for (const item of itens) {
    console.info(
      item.personagem + ' — ' + item.animacao + ': ' + item.descricao +
      (item.usandoNoLugar ? '  (usando no lugar: ' + item.usandoNoLugar + ')' : '')
    );
  }
  console.groupEnd();

  return itens;
}

/** Usado pelos testes; nao chamar durante o jogo. */
export function limpar() {
  pedidos.clear();
}

// Deixa acessivel pelo console do navegador: alice.assetsFaltando()
if (typeof window !== 'undefined') {
  window.aliceAssetsFaltando = relatorio;
}
