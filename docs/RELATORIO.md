# RELATÓRIO — ALICE TERROR

Análise do diretório e do estado do projeto, na estrutura que a **seção 56** do
[ROTEIRO.md](ROTEIRO.md) pede.

Tudo aqui foi **medido**, não estimado: contagens de arquivo, hashes de
conteúdo, varredura do código, e testes com o jogo rodando no navegador.

Data: **06/09/2026**. Raiz: `C:\Users\Bedetti\Documents\ms pickles\Alice terror`

---

## 1. ASSETS ENCONTRADOS

**345 arquivos de mídia, 74,4 MB no total** — contando os originais na raiz e as
cópias de trabalho dentro do jogo.

### Quais personagens existem

| personagem | o que existe | está no jogo? |
|---|---|---|
| **Alice** | 163 quadros, normal e pequena, todos normalizados | **sim**, é a personagem jogável |
| **Alice Demon** | folha completa: idle, andar (8), correr (7), atacar (6), levar dano (3), morrer (4), virar 360° (11) | **não** — folha não recortada |
| **Coelho vivo** | 1 pose de corpo + 3 poses de cabeça + 9 closes de rosto | **sim**, na HIGHSFIELD 01 |
| **Coelho morto** | 1 desenho | não — é da Fase 2 |
| **Chapeleiro** | 2 desenhos (sinistro e fofo) | só na tela de HISTÓRIA |
| **Soldado de cartas** | 1 desenho | só na tela de HISTÓRIA |
| **Gato Cheshire** | 1 desenho + o sorriso em pixel art feito para o jogo | só na tela de HISTÓRIA |

### Quais animações existem

**Alice — 163 quadros**, fatiados de cinco folhas e todos trazidos para a mesma
altura (253 px em pé):

```
andando       perfil D 11 · perfil E 11 · de frente 6 · de costas 4
correndo      perfil D  6 · perfil E  6 · de costas 6
pulando       perfil D  5 · perfil E  5 · de costas 5 · de frente 6
caindo/tombo  perfil D  6 · perfil E  6
pegando item  perfil D  6 · perfil E  6 · de costas 4
parada        de frente 4 · de costas 1
levando dano  D 2 · E 2
ofegante      4
PEQUENA       parada 4 · andando 7 · pulando 6 · caindo 5 · pegando 5
transição     8 quadros de encolher
```

**Alice Demon — 39 quadros** na folha, ainda não recortados.

**Coelho — 12 quadros** recortados: as três poses de corpo (olhando o relógio,
olhando a Alice, estranhando) e três closes de rosto para cada uma.

### Quais cenários existem

| cenário | tamanho | linha do chão | no jogo |
|---|---|---|---|
| quarto (`cenario 1`) | 960 × 640 | 470 | **sim** — remontado em 2400 de largura |
| corredor vitoriano | 1774 × 887 | 620 | **sim** — 1345 no jogo |
| despensa | 1536 × 1024 | 790 | **sim** — 914 no jogo |
| sala lateral | 1536 × 1024 | 720 | **sim** — 1003 no jogo |
| sótão | 1774 × 887 | 640 | **sim** — 1303 no jogo |
| floresta devastada | — | — | só aparece pela porta, na HIGHSFIELD 02 |
| tabuleiro de xadrez | — | — | **não** |

Cada sala é escalada para a linha do chão dela cair no mesmo ponto do quarto
principal. É isso que faz a Alice ter o mesmo tamanho em todos os cômodos.

### Objetos

Relógio de bolso (caído e aberto em 03:17) · espelho em duas camadas (moldura e
vidro) · pedaço de roupa com a marca de espada · **6 rastros** (poça grande,
poça média, respingos, marca de arrasto, tufo de pelo, pegada) · comida podre ·
biscoitos SHRINK e GROW · porta de pedra · chave · **32 peças de parkour**
(caixote, escada, mecanismo, ponteiros, tábua, prateleira, viga — 4 variantes de
cada) · **12 peças de xadrez** (6 limpas, 6 sombrias) ainda não recortadas.

### Quais sons existem

**25 arquivos, 32 clipes catalogados.** Os 30 sons que a seção 33 lista estão
todos no acervo — `AUDIO_FALTANDO` está vazio.

Cada clipe tem corte medido, não estimado: os pontos foram levantados com
análise de envelope (RMS + detecção de transiente) sobre os arquivos, e depois
conferidos de ouvido. Trechos usam **marcador do Phaser**, e não `seek`, porque
marcador respeita o recorte ao repetir.

---

## 2. ASSETS FALTANTES

Lista viva em [ASSETS-FALTANDO.md](ASSETS-FALTANDO.md). Nenhum trava a Fase 1.

**Alice de costas:** correr, pular, pegar item.
**Alice pequena:** de costas, correndo, levando dano, ofegante.
**Alice parada de perfil** — hoje ela vira para a câmera ao parar, e o jogo
registra esse pedido em `MissingAssets`.

Nada foi inventado no lugar do que falta: onde não há pose, o jogo usa o quadro
existente mais próximo **sem deformar** e anota o pedido. Rodar
`aliceAssetsFaltando()` no console lista o que faltou numa sessão.

---

## 3. CÓDIGO

**36 arquivos, 9.140 linhas** em `src/`. Phaser 3.80 por CDN, módulos ES, sem
etapa de build.

```
src/core/      Alice, InputManager, AudioManager, SaveManager, Cinematica,
               MissingAssets, constants, tela, texturas
src/objects/   QuartoExtendido, SalaDesenhada, Iluminacao,
               RelogioDeParede, MecanismoDeRelogio
src/scenes/    Boot, Preload, Menu, Story, Tutorial, Settings, Credits,
               Phase1, Sala, Highsfield01, Highsfield02
src/ui/        Hud, DialogBox, TouchControls, ArteSemCorte, theme,
               layoutControles
src/data/      audio, story, salas
```

### O que dá para reaproveitar direto

- **`SalaDesenhada` + `salas.js`** — uma sala nova é uma entrada numa tabela:
  imagem, linha do chão, luzes, saídas, conteúdo. Nenhum código novo.
- **`Iluminacao`** — a escuridão e as luzes de qualquer cena, prontas.
- **`Cinematica`** — a linha do tempo por intervalo de segundos, no mesmo
  formato do roteiro. As HIGHSFIELD 03, 04 e 05 já têm onde nascer.
- **`fatiar-alice.ps1`** — fatia qualquer folha de sprite. Já foi usado na Alice,
  no Coelho, nos objetos, nos rastros e nas peças. Serve para a Alice Demon e
  para as peças de xadrez sem uma linha nova.
- **`GameplayScene`** — obstáculos, plataformas, perigos, pontos de interação,
  diálogo, dano, checkpoint, pausa, e a mecânica de tamanho.

---

## 4. ESTRUTURA

```
Alice terror/                    ← a raiz oficial
├── audios/                      25 áudios originais
├── *.png                        45 desenhos originais
└── Jogo-de-terror/              ← o repositório git
    ├── index.html
    ├── src/                     o código
    ├── assets/                  cópias de trabalho do jogo
    ├── tools/                   servidor local e as ferramentas de arte
    └── docs/                    roteiro, briefings, plantas, este relatório
```

**A arte original nunca é alterada.** O jogo trabalha sobre cópias em `assets/`,
e todo recorte acontece em memória, em tempo de execução ou pelas ferramentas —
nenhum arquivo de origem é sobrescrito.

---

## 5. PROBLEMAS ENCONTRADOS

### Bugs — todos corrigidos, todos com a causa identificada

| o que acontecia | a causa |
|---|---|
| tela preta ao CONTINUAR e em toda troca de sala | criei um getter `anims` na Alice; `anims` já é do Phaser, e o `destroy()` do Sprite estourava no shutdown |
| o jogo travava na porta | apaguei `atravessarAPorta` sem querer ao mover o relógio de bolso; a exceção derrubava o loop |
| menu e história mudos | o fade de áudio vivia num tween de cena, e a cena viva no momento era a Preload, morrendo |
| áudio duplicado na história | o desbloqueio que escrevi recomeçava a música sem parar a antiga |
| botões da pausa não respondiam | o painel estava preso à câmera, os textos dentro dele não |
| conserto no disco não chegava na tela | o navegador guarda módulos ES num mapa próprio; `no-store` não limpa |
| cenário parecia colagem | a penumbra era uma imagem de tamanho fixo: fora dela nada escurecia |
| mobília atravessável | os corpos ficavam atrás do limite onde a Alice pode andar |
| barra branca na porta | um Graphics usado como máscara continua se desenhando |

O detalhe de cada um está no histórico do git — cada commit explica a causa,
não só o que mudou.

### Assets duplicados

**49 conteúdos aparecem mais de uma vez.** A maioria é intencional: o original
mora na raiz e o jogo usa uma cópia renomeada em `assets/`. Isso é proposital —
os originais ficam intocados.

Duas duplicatas são de verdade, dentro do jogo:
- `galhos.ogg` e `passos-floresta.ogg` são o mesmo arquivo
- `xadrez.ogg` e `passos-xadrez.ogg` também

Foi você quem renomeou os originais para deixar claro que o mesmo som serve de
ambiente e de pisada. Copiei sob os dois nomes para o catálogo ficar legível.
São 51 KB — não vale mexer.

### Arquivos fora do lugar

Nenhum. Tudo está dentro da raiz oficial.

### Peso morto

**484 KB de Alice antiga** que ninguém carrega mais, substituída pelos 163
quadros novos:

```
assets/characters/alice-idle-frente.png
assets/characters/alice-anda-direita.png
assets/characters/alice-anda-esquerda.png
assets/characters/alice-costas-0..4.png
```

Mais `gato-sorriso-1x.png` (intermediário) e `olhos-gato.jpg` (referência).

**Não apaguei nada** — a regra é clara sobre isso. Ficam listados aqui para
você decidir.

---

## 6. PLANO — a ordem daqui

A seção 57 do roteiro define a ordem geral. Os itens 1 a 11 estão feitos. O que
falta, na ordem que faz sentido:

1. **Áudio por sala** — cada cômodo com o próprio ambiente. Hoje as cinco salas
   usam o mesmo silêncio tenso. É barato e muda muito.
2. **Testar morte e renascimento** — o buraco do sótão é o único perigo da fase,
   e o caminho de volta ao checkpoint nunca foi percorrido.
3. **Testar os controles de toque** — existem, mas não foram verificados depois
   das mudanças recentes.
4. **Recortar a Alice Demon** — 39 quadros, com a ferramenta que já existe.
5. **Fase 2** — floresta, investigação, a roupa do Coelho, o espelho.
6. **HIGHSFIELD 03** — o espelho e a aparição da Demon.
7. **A perseguição.**
8. **Recortar as peças de xadrez** e construir a Fase 3.
9. **HIGHSFIELD 04 e 05.**
10. **A revelação final** — o texto que junta as pistas das três fases.

### Duas decisões que são suas

**A arte original não está versionada.** Os 45 PNGs e os 25 áudios moram fora do
repositório. Se esta máquina morrer, some. Dá para mover para dentro do
repositório e ajustar as referências das ferramentas.

**A duração da Fase 1** está em 8–12 minutos numa primeira jogada; a seção 5
pede 10–15. O jeito de fechar essa conta **não** é alongar corredor — o roteiro
proíbe. É mais coisa para observar e mais uma volta de interpretação.
