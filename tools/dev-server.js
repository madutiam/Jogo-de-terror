/**
 * Servidor estatico minimo para rodar o Alice Terror localmente.
 *
 *   node tools/dev-server.js
 *
 * Sem dependencias: usa so o que vem no Node.
 * O jogo usa modulos ES, entao precisa ser servido por HTTP (abrir o
 * index.html direto pelo file:// nao funciona).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const RAIZ = path.resolve(__dirname, '..');
const PORTA = Number(process.env.PORT) || 5173;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
};

/** Resolve a URL para um caminho dentro da raiz, barrando saida da pasta. */
function resolverCaminho(url) {
  const semQuery = decodeURIComponent(url.split('?')[0]);
  const relativo = semQuery === '/' ? 'index.html' : semQuery.replace(/^\/+/, '');
  const destino = path.resolve(RAIZ, relativo);
  if (destino !== RAIZ && !destino.startsWith(RAIZ + path.sep)) return null;
  return destino;
}

/**
 * CARIMBA A HORA DE MODIFICACAO EM CADA IMPORTACAO
 *
 * O navegador guarda modulos ES num mapa proprio, por URL. `Cache-Control:
 * no-store` NAO limpa esse mapa: recarregar a pagina pode continuar entregando
 * o modulo antigo, e o jogo roda com codigo de meia hora atras. Foi assim que
 * um conserto ja aplicado no disco continuou "sem efeito" na tela.
 *
 * Aqui cada `from './x.js'` sai como `from './x.js?v=<hora do arquivo>'`. A URL
 * muda quando o arquivo muda, entao o mapa do navegador e obrigado a buscar de
 * novo — e so quando precisa.
 *
 * Isto vale so para o servidor de desenvolvimento. O arquivo em disco nao e
 * tocado.
 */
function carimbarImportacoes(codigo, arquivoAtual) {
  const pasta = path.dirname(arquivoAtual);

  return codigo.replace(
    /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.[^'"]+?)\2/g,
    (inteiro, antes, aspa, alvo) => {
      if (alvo.includes('?')) return inteiro;
      try {
        const destino = path.resolve(pasta, alvo);
        const marca = fs.statSync(destino).mtimeMs.toString(36);
        return antes + aspa + alvo + '?v=' + marca + aspa;
      } catch {
        return inteiro;   // importacao que nao e arquivo local: deixa como esta
      }
    }
  );
}

const servidor = http.createServer((req, res) => {
  const destino = resolverCaminho(req.url);

  if (!destino) {
    res.writeHead(403).end('403 - fora da pasta do projeto');
    return;
  }

  fs.stat(destino, (erro, info) => {
    if (erro || !info.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - nao encontrado: ' + req.url);
      return;
    }

    const tipo = TIPOS[path.extname(destino).toLowerCase()] || 'application/octet-stream';

    // Os arquivos de codigo passam por uma reescrita antes de sair; o resto vai
    // direto, em fluxo, sem carregar na memoria.
    if (path.extname(destino).toLowerCase() === '.js') {
      const codigo = carimbarImportacoes(fs.readFileSync(destino, 'utf8'), destino);
      res.writeHead(200, {
        'Content-Type': tipo,
        'Content-Length': Buffer.byteLength(codigo),
        'Cache-Control': 'no-store',
      });
      res.end(codigo);
      return;
    }

    res.writeHead(200, {
      'Content-Type': tipo,
      'Content-Length': info.size,
      // Durante o desenvolvimento nao queremos cache nenhum.
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(destino).pipe(res);
  });
});

servidor.listen(PORTA, () => {
  const enderecos = ['http://localhost:' + PORTA];
  for (const listaNic of Object.values(os.networkInterfaces())) {
    for (const nic of listaNic || []) {
      if (nic.family === 'IPv4' && !nic.internal) {
        enderecos.push('http://' + nic.address + ':' + PORTA);
      }
    }
  }

  console.log('');
  console.log('  ALICE TERROR — servidor local');
  console.log('  ' + '-'.repeat(38));
  for (const endereco of enderecos) console.log('  ' + endereco);
  console.log('');
  console.log('  O endereco com o IP da rede abre no celular,');
  console.log('  desde que ele esteja no mesmo Wi-Fi.');
  console.log('  Ctrl+C para parar.');
  console.log('');
});
