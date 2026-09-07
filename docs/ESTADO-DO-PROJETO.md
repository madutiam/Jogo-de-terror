# ALICE TERROR — estado do projeto

Documento de passagem. Escrito em **06/09/2026** e atualizado em
**07/09/2026**, para quem abrir uma conversa nova sem nenhum contexto.

O roteiro mestre completo — as 60 seções, as 5 HIGHSFIELD, as regras — está em
**[ROTEIRO.md](ROTEIRO.md)**. Ele manda em tudo. Este documento aqui só diz o
que já foi feito dele e o que não.

---

## Como rodar

```
cd "C:\Users\Bedetti\Documents\ms pickles\Alice terror\Jogo-de-terror"
node tools/dev-server.js
```

Abre em `http://localhost:5173`. Não tem etapa de build: é Phaser 3.80 por CDN,
módulos ES, arquivos servidos direto.

---

## As regras que não se negociam

Resumo do que mais custou até aqui. O texto completo está no ROTEIRO.

1. **A pasta é só uma:** `C:\Users\Bedetti\Documents\ms pickles\Alice terror`.
   Nada fora dela.
2. **Os desenhos dela são os oficiais.** Não redesenhar, não trocar roupa,
   cabelo, rosto ou cor, não deformar, não substituir por parecido.
   Cenário pode ser adaptado (estender, escurecer, aumentar a área); a
   identidade visual, não.
3. **Faltou uma pose? Não invente.** Identifique, explique qual é, peça para a
   desenvolvedora, e siga só com o que existe. Ver
   [ASSETS-FALTANDO.md](ASSETS-FALTANDO.md).
4. **Exatamente 3 fases jogáveis e 5 HIGHSFIELD.** Nunca uma quarta fase.
5. **HUD com espadas (♠ ♠ ♠), nunca corações.** Três vidas.
6. **Direita = X maior, esquerda = X menor.** Nada de girar sprite, inverter
   verticalmente ou deixar a direção visual contradizer o movimento.
7. **Puzzle nunca diz "vá para X".** Pista → interpretação → descoberta.
8. **Durante cinemática o controle sai do jogador**, e volta no momento exato.
9. **Analisar antes de mexer.** Diagnóstico primeiro, alteração depois.
10. **Projeto pessoal e isolado.** Nada da Solid, do Leo ou da Moss. O único
    repositório autorizado é `https://github.com/madutiam/Jogo-de-terror`.
    Não alterar configuração global de git nem credencial da máquina sem
    avisar antes.

---

## O que existe hoje

**Código:** 41 arquivos, 11.196 linhas, em `src/`.

**Cenas:** Boot · Preload · Menu · História · Tutorial · Configurações ·
Créditos · **Highsfield01** · Phase1 (o quarto) · Sala (as outras salas da casa
**e as três telas da floresta**) · **Highsfield02**.

**Assets no jogo:**

| | |
|---|---|
| quadros da Alice | **269** (normal e pequena, todos normalizados) |
| Alice Demon | **39** (parado 1, anda 8, corre 7, ataca 6, dano 3, morre 4, vira 10) |
| a captura (os dois juntos) | **18** |
| HIGHSFIELD 01 (os dois juntos) | **18** (encontro, assustada, recuando) |
| Coelho | **22** (3 poses antigas + ergue 5 + vira 5 + 9 rostos) |
| peças de parkour | 32 (4 variantes de 8 peças) |
| rastros | 6 |
| cenários | 10 |
| folhas do mapa | 7 (5 cômodos + o papel em branco + a escada) |
| áudio | 25 arquivos, 32 clipes com cortes medidos |

---

## FASE 1 — o que está pronto, seção por seção

A Fase 1 está **completa**, e desde 07/09 a HIGHSFIELD 02 entrega mesmo na
floresta. Tudo o que as seções 6 a 11 pedem está no jogo.

| § | o que o roteiro pede | estado |
|---|---|---|
| 6 | áreas conectadas: sala principal, corredor, biscoitos, sala lateral, área superior, região inacessível, área do relógio, porta | **feito** — 5 salas |
| 6 | entrada da fase: Alice aparece, caixa curta, controle volta | **feito** |
| 7 | biscoitos com função de gameplay | **feito** — dois tamanhos, com portão real |
| 8 | puzzles de relógio/horário/símbolo, diferença entre salas | **parcial** — uma corrente (03:17) |
| 9 | parkour como parte da investigação, terminando no relógio | **feito** — duas progressões |
| 10 | checkpoint como conquista real | **feito** — nos biscoitos e no relógio |
| 11 | com o relógio, a porta cede e leva à Fase 2 | **feito** — a cinemática entrega na chegada da floresta |
| — | HIGHSFIELD 01 (o relógio) | **feito** |
| — | HIGHSFIELD 02 (a porta) | **feito** |

### A corrente que funciona hoje

```
quarto      lê 03:17 no relógio de parede parado
corredor    vê a fresta entulhada e não cabe
despensa    sobe caixote → caixote → prateleira e pega OS DOIS vidros
corredor    encolhe (Q) e atravessa a fresta
lateral     o pêndulo marca 03:18 — um minuto depois; o mecanismo está vazio
lateral     acerta 03:17 no mecanismo → a escada cai no quarto
quarto      cresce, sobe a escada
sótão       caixote → viga → tábua, por cima do buraco
sótão       o relógio de bolso, e o tic-tac
quarto      a porta de pedra cede
```

Mapa com o x exato de cada coisa: ver o final deste documento.

### Decisões de design que valem saber

**Os biscoitos são um item só.** Pegar um vidro de cada vez criava beco sem
saída: quem encolhesse em cima da prateleira não subiria de novo para pegar o
outro. Ela leva os dois; a pergunta deixa de ser *qual* e passa a ser **onde** —
que é o que o §7 pede. `Q` come um biscoito, e o jogo diz essa tecla uma única
vez.

**As alturas são contra o pulo medido** — 128 px normal, 70 px pequena:

```
despensa   chão 0 → 101 → 207 → 240 (prateleira dos vidros)
sótão      chão 0 → 106 → 196 → 262 (tábua, onde está o relógio)
```

A Alice pequena não sobe no primeiro degrau de nenhuma das duas. O sótão inteiro
é território do tamanho normal.

**O mecanismo não entrega o número.** O mostrador está vazio; a hora vem de fora
— do relógio parado do quarto, dos três potes marcados da despensa, do pêndulo
que marca um minuto depois.

### O CADERNO — inventário, diário, mapa, comandos, configurações

Abre no **Y** (e num botão próprio no celular). Cinco abas, montadas por
`src/ui/PainelDeAbas.js`, com o conteúdo em `GameplayScene`:

- **INVENTÁRIO** e **DIÁRIO** — lista à esquerda, detalhe e ilustração à
  direita. Os textos estão em `src/data/inventario.js`, e são a leitura *dela*:
  nenhuma linha diz para onde ir nem resolve enigma (§43).
- **MAPA** — uma folha inteira por cômodo, e não uma planta única. Cada cômodo
  só existe nele depois de pisado; embaixo da folha fica escrito o que sai dali,
  e só aparece vizinho já pisado. Ver as CONVENÇÕES NOVAS, item 8, sobre as
  camadas que só surgem depois de descobertas.
- **COMANDOS** — as teclas, escritas. Não se adivinha nada.
- **CONFIGURAÇÕES** — volume (três barras), tela cheia, e os controles de
  celular (tamanho, tipo, lado, botão de correr, opacidade), que se refazem na
  hora ao mudar.

O fundo do painel é **opaco**: com 0,94 dava para ver a Alice atrás do texto.

---

## O que NÃO está implementado

### Cinemáticas — duas das cinco estão feitas
- **HIGHSFIELD 01** (o relógio) — **feita, e refeita em 07/09.** Abre o jogo
- **HIGHSFIELD 02** (a porta) — **feita.** Agora entrega a Alice na chegada da
  floresta, e não mais num cartão de fim
- **HIGHSFIELD 03** (o espelho, §17) — não existe. É o próximo gargalo da Fase 2
- **HIGHSFIELD 04, 05** — dependem da Fase 3

### Fase 3 — não existe
Só o cenário do tabuleiro carregado e as peças de xadrez não recortadas.

### Personagens fora do jogo
Chapeleiro, Soldado de cartas, Gato Cheshire. A Alice Demon **já está
recortada** (39 quadros) mas ainda não entra em cena: falta a perseguição.

### Outras faltas
- **O símbolo da espada ♠** não liga as pistas entre si, como o §8 sugere. Ele
  está no mostrador do relógio E no pedaço de roupa da Fase 2 — a ligação que o
  §16 pede já existe desenhada, falta o código notar
- **Controles de toque não foram testados** em aparelho de verdade
- **Duração da Fase 1:** provavelmente 8–12 minutos. O §5 pede 10–15

---

## Assets que ainda faltam

Lista viva em [ASSETS-FALTANDO.md](ASSETS-FALTANDO.md). Os que travam alguma
coisa:

- Alice **de costas**: correr, pular, pegar item
- Alice **pequena**: de costas, correndo, levando dano, ofegante
- Alice **parada de perfil** (hoje ela vira para a câmera ao parar)

Briefings prontos para pedir arte: [BRIEFING-COELHO.md](BRIEFING-COELHO.md),
[BRIEFING-OBJETOS.md](BRIEFING-OBJETOS.md), [PLANTA-FASE1.md](PLANTA-FASE1.md).

---

## A DICA MAIS IMPORTANTE — como testar sem se enganar

Foi aqui que se perdeu mais tempo, e não em escrever código. Leia antes de
concluir que alguma coisa "não funciona".

**O painel do navegador pausa o Phaser quando fica oculto.** O jogo para de
atualizar, mas o `game.loop.time` continua andando se você o empurrar à mão.
O sintoma é traiçoeiro: `scene.time.now` fica em **0**, o `update` da cena nunca
roda, e tudo parece quebrado quando na verdade está só congelado.

O que fazer:

1. **Tire um screenshot primeiro.** Isso acorda o painel. Só depois meça.
2. Se precisar de um relógio, use um leve —
   `setInterval(() => { t += 33.3; game.loop.step(t) }, 40)`. Passos grandes
   demais travam o desenho da página e o screenshot expira.
3. **`cena.update(t, dt)` chamado à mão NÃO move a física.** O corpo da Alice só
   anda no passo real do mundo Arcade. Se ela não sai do lugar num teste
   automatizado, é a bancada, não o jogo.
4. **Prefira medir estado a olhar a tela**: `alice.tamanho.id`, `alice.pisoAtual`,
   `alice.texturaAtual`, `obstaculos.getChildren()`, `sound.sounds`. É mais
   rápido e não mente.
5. Para conferir cor e brilho de verdade, leia o framebuffer com
   `gl.readPixels` — foi assim que se descobriu que o chão estava uma vez e
   meia mais claro que a parede, e que a música tocava em **volume zero**.

**E dois hábitos que evitaram estragos:**

**Nunca recorte arquivo por marcador de texto.** Foi assim que o
`atravessarAPorta` sumiu junto com um bloco vizinho, e o jogo passou a travar
na porta. Depois de qualquer cirurgia grande, rode a varredura de método
fantasma — ela pega isso em segundos:

```
node -e '…confere que todo this.x() tem um metodo x…'
```
(o comando completo está no histórico do commit "O jogo travava na porta")

**Não use heredoc do bash para escrever JavaScript.** Ele come as barras
invertidas e corrompe o arquivo em silêncio. O caminho confiável neste projeto:
escrever um script Python no scratchpad com a ferramenta Write, e rodá-lo.

---

## Armadilhas técnicas já pagas

### O volume só pega no quadro SEGUINTE ao `play()`

Esta é a mais cara de descobrir, porque nada avisa. Qualquer volume definido no
**mesmo quadro** do `play()` é descartado pelo Phaser. Medido no navegador,
quatro caminhos, todos terminando em ganho **1**:

| caminho | resultado |
|---|---|
| volume no `sound.add(chave, { volume })` | ganho 1 |
| volume no próprio `play({ volume })` | ganho 1 |
| volume no `config` do **marcador** | ganho 1 |
| `setVolume` na linha logo depois do `play()` | ganho 1 |
| **`setVolume` um quadro adiante** | **funciona** |

O estrago: a música do menu era criada em volume 0 para subir suave, o Phaser
devolvia 1, e o fade então **descia** de 1 até 0,308 — o que se ouvia era uma
pancada no começo em vez de uma entrada. E teria estragado o áudio por sala
inteiro: cada cômodo tem o peso dele, e todos sairiam no talo.

A solução no `AudioManager`: o volume desejado vive em `__volumeAtual`, e o som
entra numa fila (`pendentes`) aplicada no próximo passo do jogo. **Nada na
classe lê `som.volume`** — o Phaser mente nesse instante. Quem mexe em volume é
só `definirVolume()`.

Se um som novo sair alto demais, é aqui que se olha.


Cada uma custou tempo. Não repetir.

**`anims` é do Phaser.** Criei um getter com esse nome na Alice e o
`destroy()` do Sprite passou a chamar `.destroy()` num objeto de dados —
exceção no shutdown, cena velha não termina, tela preta em toda troca de cena.
O nosso getter chama-se `animacoes`.

**`erase` com objeto de configuração não apaga nada, e falha calada.** A forma
`rt.erase({key, x, y, scale, alpha})` é ignorada. Só `rt.erase(chave, x, y)`
funciona — por isso cada luz tem o próprio pincel, já assado no tamanho e na
força finais. Ver `src/objects/Iluminacao.js`.

**Fade de áudio não pode viver num tween de cena.** A música do menu é pedida no
`create()` do Menu, e nesse instante a cena viva ainda é a Preload, que está
morrendo: o tween morria com ela e a música tocava em volume ZERO para sempre.
Os fades agora andam no relógio do jogo (`AudioManager.esmaecer`).

**O navegador guarda módulos ES num mapa próprio.** `Cache-Control: no-store`
não limpa esse mapa. O servidor de desenvolvimento agora carimba cada
importação com a hora de modificação do arquivo (`?v=...`), então a URL muda
quando o arquivo muda. Sem isso, conserto no disco não chega na tela.

**Faixa de saída tem que ser maior que a margem lateral.** O mundo reserva
130 px nas bordas para a Alice nunca ficar cortada na tela. Faixa de porta a
70 px ficava atrás desse limite e nunca disparava.

**Recortar arquivo por marcadores de texto é perigoso.** Apaguei
`atravessarAPorta` sem querer ao mover o relógio de bolso — o método estava
entre os dois marcadores. O jogo travava na porta. Existe uma varredura para
isso: conferir que todo `this.x()` tem um método `x`.

**PowerShell:** a vírgula liga mais forte que o `+`, então `@(a + b, c + d)`
vira soma de array. E `return` desenrola coleções: use `return ,$lista`.

**O painel do navegador pausa o jogo quando está oculto.** Testes automatizados
precisam de um relógio sintético (`game.loop.step`) e, ainda assim, a física
só anda com o loop real.

---

## Ferramentas em `tools/`

- **`fatiar-alice.ps1`** — fatia folhas de sprite em quadros individuais
  normalizados. Remove fundo chapado por preenchimento a partir da borda, ancora
  pelo centro do vestido, alinha os pés na base. Configurações em
  `tools/config/*.json`. Opções que valem conhecer:

  | opção | para quê |
  |---|---|
  | `ancora` | `vestido` (azul), `vestido-escuro` (o verde-petróleo da Demon), `massa`, `caixa` |
  | `escala` | por LINHA, não por folha — dá para casar folhas de tamanhos diferentes |
  | `apagar` | retângulos ditos à mão, apagados da máscara (legendas, "!?") |
  | `limparAnotacoes` | só apaga componente **vermelho puro**; não pega vinho |
  | `quadrosDitos` | célula por quadro, com veto do vizinho — ver CONVENÇÕES, item 4 |
  | `recuperarContorno` | quando a linha do desenho tem a cor do fundo — item 3 |

  **A tela comum é calculada numa passada só, sobre todas as linhas do
  arquivo de configuração.** Refatiar só uma parte do conjunto DESALINHA o
  resto. Sempre rodar o config inteiro, e conferir no `git status` que só
  aparecem os arquivos que deviam mudar.
- **`folha-de-prova.ps1`** — monta contato dos quadros sobre fundo magenta, para
  qualquer sobra de fundo ou borda comida saltar aos olhos.
- **`dev-server.js`** — servidor local, com o carimbo de importação descrito
  acima.

---

## Git

Repositório: `https://github.com/madutiam/Jogo-de-terror` — **privado**.

Identidade presa **localmente** a este repositório (nada global foi tocado):
`Maria Eduarda Bedetti <100002186+madutiam@users.noreply.github.com>`.

**Tudo enviado.** `main` está sincronizada com `origin/main`.

**Como enviar de novo.** A conta ativa do `gh` na máquina é a `EduardaBedetti`,
mas este repositório é da `madutiam`. O caminho já testado, que não deixa
resíduo nenhum:

```
gh auth switch --user madutiam
git push
gh auth switch --user EduardaBedetti
```

Trocar a conta ativa é **configuração da máquina** — a regra 10 manda avisar
antes. Ela já autorizou este vaivém uma vez; peça de novo mesmo assim, e sempre
devolva a conta ao final. O `user.name`, o `user.email` e o credential helper
**globais** nunca foram tocados e não devem ser.

A **arte original** (45 PNGs e os áudios, ~42 MB) mora na pasta de fora e
**não está versionada**. Decisão pendente: mover para dentro do repositório ou
deixar só na máquina.

---

## Onde está cada coisa da Fase 1

x medido com o jogo rodando.

**QUARTO** (2400 de largura, começa em x=1150)

| x | o quê |
|---|---|
| 150 | vao aberto — leva ao corredor |
| 520 | escada → sótão (só depois do mecanismo) |
| 892 | xícara quebrada |
| 968 | marca de arrasto |
| 1018 | cadeira virada |
| 1120 | a poça de sangue (desenho) |
| 1153 | **relógio de parede = 03:17** |
| 1444 | baú, topo 52 |
| 1510 | espelho rachado |
| 2100 | **porta de pedra = fim da fase** |

**CORREDOR** (1345) — 330 fresta (só pequena) · 753 tufo de pelo

**DESPENSA** (914) — 169 potes 3 3 3 · 498 caixote 101 · 594 caixote 207 ·
690 prateleira 240 e **os biscoitos**

**SALA LATERAL** (1003) — 115 **mecanismo (03:17)** · 246 volta pela fresta ·
888 pêndulo 03:18

**SÓTÃO** (1303) — 150 escada para baixo · 391 caixote 106 · 612 **buraco
(dano)** e viga 196 · 860 tábua 262 · 912 **relógio de bolso**

---

## ÁUDIO POR SALA — feito

Cada cômodo tem o próprio ambiente. **Nenhum áudio novo foi preciso**: são os
quatro clipes que já existiam, em pesos diferentes.

| sala | o que toca | por quê |
|---|---|---|
| **quarto** | `silencio` | o cômodo frio do começo — a linha de base contra a qual todo o resto soa |
| **corredor** | `silencio` a 0,30 + `efeito.rangido` sorteado (12 a 25 s) | corredor comprido: o rangido faz olhar para trás, e não há nada lá |
| **despensa** | `silencio` a 0,22 | cômodo fechado e entulhado. Abafado é o que o ouvido espera |
| **sala lateral** | **`tictac` a 0,18** | ela tem um relógio de pêndulo marcando 03:18. O som confirma pelo ouvido o que o mostrador diz pelo olho |
| **sótão** | `galhos` a 0,26 + `efeito.sussurro` raríssimo (35 a 75 s) | ponto mais alto da casa, janela redonda: vento no telhado |

O da **sala lateral** é o que mais rende — o som entrega a pista sem uma
palavra, e a descoberta continua sendo do jogador.

**Quatro decisões que estão no código e valem saber:**

- **Intervalo sorteado, nunca fixo.** Ritmo previsível deixa de assustar na
  terceira vez. `Phaser.Math.Between(minMs, maxMs)` a cada disparo.
- **Sussurro é efeito, não ambiente.** Só toca uma camada de ambiente por vez;
  trocar o vento pelo sussurro perderia o vento.
- **Nada solto durante cinemática.** Um rangido sorteado no meio de uma fala
  atropelaria a cena (regra 8). O relógio segue correndo e tenta depois.
- **Depois do relógio de bolso, o sótão VIRA o tic-tac** (0,34). Subir de novo
  não devolve o vento: o que mudou ali foi a história, não a hora do dia. E a
  pausa de 1,9 s antes do tic-tac cancela o sussurro pendente — senão a pausa
  deixaria de ser pausa.

Onde está: `ambiente` em cada sala de `src/data/salas.js`, lido por
`SalaScene.iniciarAmbienteDaSala()`. Uma sala nova só precisa da entrada na
tabela. O `tocarAmbiente(id, fadeMs, { volume })` desliza o peso quando a sala
nova pede outro para o mesmo clipe — atravessar uma porta não corta o som.

---

## FASE 2 — a floresta (07/09/2026)

A fase **existe e se atravessa**. O que falta são os desafios do §14 ao §21.

### O que está de pé

- **Três telas**, com tabela própria em `src/data/fase2.js` (elas nasceram
  provisórias dentro de `salas.js`; saíram de lá). Ligadas nos dois sentidos:
  `chegada → corrida → espelho`. A direção da fase é o **leste**, e é o rastro
  de sangue que aponta — nenhum texto manda ir.
- **A `SalaScene` serve as duas fases.** `init` recebe `fase` e escolhe de qual
  tabela ler. As tabelas são separadas de propósito: `espelho` é uma pista da
  Fase 1 e uma tela inteira da Fase 2.
- **Colisão de verdade.** Cada tela diz o seu `limiteFundo` — na casa a parede
  do fundo é uma linha reta, na floresta é massa de tronco e raiz que desce até
  onde a arte quiser. Medido em cima do desenho: chegada 520, corrida 660,
  espelho 575. Onde a massa desce mais que o limite, vai `obstaculos`, dito em
  fração da largura e y do mundo.
- **A HIGHSFIELD 02 desemboca aqui**, na porta, no tamanho em que ela terminou
  a casa.
- **A morte por captura** roda inteira (18 quadros) — só falta quem a chame.
- **A Alice Demon** tem 39 quadros recortados, sete animações.
- **O som da fase inteira já existe:** `passos.floresta`, `queda-floresta`,
  `efeito.espelho` (espelho rangendo), `ambiente.galhos`, `ambiente.sussurros`,
  `efeito.sussurro`, `efeito.grito`, e uma faixa de perseguição.

### O que falta — código

| § | O desafio |
|---|---|
| 13 | O diálogo de entrada: "siga o sangue e os pelos" |
| 14 | O conteúdo da investigação: rastros que acabam, pistas que enganam |
| 15 | A comida podre como perigo — **algumas** machucam, outras não |
| 16 | O evento do pedaço de roupa: som, pausa, reação, o ambiente muda |
| 17 | O espelho aparecendo depois da roupa, e a **HIGHSFIELD 03** |
| 19 | A perseguição: a distância varia, ela some, reaparece, é ouvida antes de vista |
| 20 | A chave durante a corrida, e a porta de saída |
| 21 | O checkpoint depois do espelho, antes da corrida |

### O que falta — arte

A folha **"Objetos relógio de bolso, espelho avulso, pedaço de roupa, rastros,
comida podre.png"** (na pasta mãe) já tem quase tudo, e **não está recortada**:

- o espelho — inteiro, mais **moldura e vidro em camada separada**
- o pedaço de roupa, com a marca de espada, mais o detalhe da marca
- as quatro comidas podres: bolo mofado, sanduíche apodrecido, geleia
  estragada, restos de chá

Só duas coisas não existem em lugar nenhum:

1. **A porta de saída da floresta.** Hoje só há a porta de pedra da casa.
2. **Os quadros da HIGHSFIELD 03**, se ela for desenhada como a HS02 e a
   captura. Dá para montar com o que existe, se ela preferir.

### A PERGUNTA EM ABERTO — precisa da resposta dela

**Três telas não dão os 15–20 minutos que o §5 pede.** O §14 quer rastros que
acabam e caminhos que levam a lugares aparentemente errados; o §19 quer a Demon
sumindo e reaparecendo. As duas coisas precisam de espaço.

A pergunta feita a ela, ainda sem resposta:

> Mais telas de floresta (duas ou três, com bifurcação), ou a investigação
> acontece *dentro* dessas três, com mais coisa em cada uma?

A segunda opção não custa arte nenhuma, mas fica apertada. **Não começar a
investigação sem essa resposta** — ela decide o tamanho do mapa.

---

## CONVENÇÕES NOVAS — 07/09/2026

Coisas que custaram caro para descobrir e não são óbvias lendo o código.

### 1. Desenho com DOIS personagens não entra na folha de nenhum dos dois

A folha da Alice é de um personagem só: cada quadro é ancorado pelo centro do
vestido **dela** e alinhado pelos pés numa tela comum. Quando a arte traz os
dois juntos — eles se tocam, se sobrepõem e trocam de posição entre um quadro e
o outro — não há vestido único para ancorar, e separá-los exigiria redesenhar o
que a arte já resolveu junto.

Esses desenhos viram **cena**: pasta própria, tela comum própria, e alinhamento
pelo personagem que **fica parado**. Dois casos no jogo:

| pasta | o que é | alinhado por |
|---|---|---|
| `assets/characters/morte-demon/` | a Demon matando a Alice, 18 quadros | a Demon, encostada à **esquerda** |
| `assets/characters/hs01/` | o encontro com o Coelho, 3×6 quadros | o Coelho, no **eixo x=205** da tela |

Alinhar pelo centro de cada desenho faz os dois derivarem pela tela a cada
troca de quadro. Dá para conferir sobrepondo os quadros com alpha baixo: o
personagem parado tem que virar uma mancha só.

### 2. Folhas de tamanhos diferentes: normalizar pela MENOR

As três folhas da HS01 vieram com o Coelho a 338 px numa e 269 nas outras. Todas
foram para 269. **Reduzir preserva o traço melhor do que ampliar.** Mesma regra
entre as poses antigas do Coelho (320 px) e as folhas novas (630 e 610): as
novas desceram para 320.

Sem isso, cortar de uma fileira para a outra faz o personagem mudar de tamanho
no meio da cena.

### 3. `recuperarContorno` — quando a linha do desenho tem a cor do fundo

Na folha do Coelho, o fundo é `(3,3,3)` e o contorno dele usa `(3,3,2)`,
`(2,2,2)` e `(0,0,0)`. **Nenhuma tolerância separa as duas coisas.** O
preenchimento pela borda comia o contorno inteiro e vazava para as sombras
escuras do casaco: o recorte saía com buracos por dentro da roupa.

A cor não resolve, a **distância** resolve. Com `recuperarContorno: N` no
`fatiar-alice.ps1`, a máscara é refeita dentro da caixa: é desenho todo pixel a
N px de um pixel **colorido**.

Tentativa que NÃO funciona, para ninguém refazer: crescer a máscara do
preenchimento em vez de refazê-la. O crescimento fecha o vão estreito entre a
orelha e o braço, e o bolsão de fundo fica gravado como uma cunha preta.

E `limparAnotacoes` só apaga componente **vermelho puro** — o "!?" das folhas é
vinho `(75,20,20)` e nunca teve chance. Essas regiões vão em `apagar`, medidas
na folha.

### 4. `quadrosDitos` — quando os quadros se entrelaçam

A detecção por coluna vazia só separa quadro que não encosta no vizinho, e a
divisão em partes iguais só serve com passo constante. A folha da Alice Demon
não tem nem uma coisa nem outra: o passo varia, e no ataque a garra levantada de
um quadro passa por cima do corpo do outro.

Cada quadro pode trazer a sua célula e **vetar** o retângulo onde o vizinho
invade. Diferente de `apagar`, o veto vale só para o quadro que o declarou — o
mesmo pixel continua inteiro no quadro a que pertence. Os 13 vetos da Demon
saem de medida (a caixa exata dos pixels que, dentro daquela célula, pertencem a
outro componente ligado), não de chute.

### 5. `segurar: true` num gesto da Alice

Gesto que não se desfaz sozinho: o último quadro fica até alguém limpar
`alice.gesto` (o `colocarEm` do renascimento já faz isso). É o que a morte
precisa — sem ele, no frame em que o gesto acaba o `controlar` cai no ramo de
`!controlavel`, que repinta a Alice **em pé** em cima do próprio corpo caído.

E `desabar` pinta o primeiro quadro na hora, e não no próximo `controlar`:
`congelar()` acabou de trocar a textura para a parada de frente.

### 6. Obstáculo sem `alturaTopo` não é escalável — de propósito

`atualizarPiso` ignora obstáculo sem topo. Tronco caído no meio da floresta é
obstáculo, não plataforma. Subir nele foi exatamente o que apareceu errado.

### 7. A captura é um CORTE DE CÂMERA

O desenho tem uma direção só: a Demon vem pela esquerda. Quem for pego voltando
para o oeste veria a cena espelhada em relação ao que acabou de acontecer.
Espelhar não é opção neste jogo. A saída escolhida: a câmera solta a Alice, zera
a zona morta, **salta** para enquadrar a cena e fica parada.

Sem soltar o `startFollow` a cena entra de lado; sem o salto, o corte vira um
travelling.

### 8. Camada de mapa que só aparece depois de descoberta

`CAMADAS_FASE1` em `src/data/mapa.js`. A escada não existe no quarto até o
mecanismo ser resolvido — desenhá-la na folha não seria adiantar o enigma,
seria **mentir**, mostrando na planta uma coisa que não está na sala.

A fresta saiu dessa lista porque passou a vir desenhada dentro da folha do
corredor, e isso não custa a surpresa: o buraco entulhado já está à vista na
sala, e a folha do corredor só existe depois de ela ter estado lá.

---

## ARMADILHA DE TESTE — os tweens não andam com o relógio passo a passo

A técnica de bombear `game.loop.step()` à mão (descrita mais acima) faz o
relógio da cena andar, mas os **tweens não acompanham**: numa HIGHSFIELD, os
`aproximar` ficam em 10–20% de progresso enquanto o relógio já passou dos 50 s.

Então não dá para conferir *tempo* de movimento de câmera por esse caminho. O
que dá, e é o que foi feito na HS01: **aplicar o enquadramento direto**
(`palco.setScale` e `palco.setPosition` com a conta que o `aproximar` faria) e
conferir o quadro. Isso valida a composição de cada plano; o ritmo só se
confere jogando de verdade.

---

## O que foi feito em 07/09/2026

Os commits desta jornada, do mais novo para o mais antigo:

```
  551c6fe HIGHSFIELD 01 refeita
  936f209 HIGHSFIELD 01: a arte nova, fatiada
  f74518d HIGHSFIELD 01: o relogio do close deixa de ser o quebrado
  d0929e2 Coelho: o recorte estava comendo o desenho
  530200a A captura e um corte de camera
  b9f5fb4 A captura: os 18 quadros da Alice Demon matando a Alice
  07c9b95 A floresta deixa de ser chao vazio
  72fa00b A Alice desaba antes de a tela apagar
  1474435 A fase 2 existe: a floresta se atravessa
  ed76e93 Alice Demon fatiada: 39 quadros
  9a3ff5a Mapa: a escada, que so aparece depois do mecanismo
  db692c7 Mapa: as folhas novas, uma por comodo
  cfb5def Mapa: a fresta, que so aparece depois de ela passar
  b351fec Mapa: o sotao, e a espada que aparece no buraco
```

Em uma frase cada:

- **HIGHSFIELD 01 refeita** — era um quadro parado por 20 s com os dois virados
  para a câmera; agora tem planos, os dois no mesmo desenho, e sombra de contato
- **O relógio do close** deixou de ser o quebrado e cheio de sangue (que é o do
  FIM da fase 1) e passou a ser o inteiro
- **O recorte do Coelho** estava comendo o desenho por dentro; refeito
- **A captura** — os 18 quadros da Demon matando a Alice, como corte de câmera
- **A floresta ganhou colisão** — ela andava em cima de tronco e coluna
- **A morte** deixou de ser corte seco: a Alice desaba antes de a tela apagar
- **A fase 2 existe** e se atravessa
- **A Alice Demon** fatiada, 39 quadros
- **O mapa da fase 1 fechado** — cinco cômodos e a camada da escada

---

## Ordem sugerida daqui

1. **Perguntar a ela o tamanho do mapa da Fase 2** (a pergunta em aberto,
   acima). Nada da investigação deve começar antes dessa resposta
2. **Recortar a folha de objetos da Fase 2** — espelho, roupa, comida podre. A
   arte já está lá; é só passar a ferramenta
3. **A perseguição** (§19) — pôr a Demon na tela da corrida, fazer ela caçar, e
   chamar `morrerAgarrada` quando alcançar. É só código
4. **A HIGHSFIELD 03** (§17) — o espelho. É o gargalo narrativo da fase
5. **Testar os controles de toque** em aparelho de verdade — nunca foram

Antes de qualquer uma: reler a seção correspondente do
[ROTEIRO.md](ROTEIRO.md). Ele é específico ao ponto de dizer o que acontece em
cada intervalo de segundos.
