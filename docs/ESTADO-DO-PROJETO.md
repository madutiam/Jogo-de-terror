# ALICE TERROR — estado do projeto

Documento de passagem. Escrito em **06/09/2026**, para quem abrir uma conversa
nova sem nenhum contexto.

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

**Código:** 33 arquivos, 8.502 linhas, em `src/`.

**Cenas:** Boot · Preload · Menu · História · Tutorial · Configurações ·
Créditos · Phase1 (o quarto) · Sala (as outras quatro salas da Fase 1).

**Assets no jogo:**

| | |
|---|---|
| quadros da Alice | **163** (normal e pequena, todos normalizados) |
| peças de parkour | 32 (4 variantes de 8 peças) |
| rastros | 6 |
| Coelho | 12 (3 corpos + 9 rostos das expressões) |
| cenários | 7 |
| áudio | 25 arquivos, 32 clipes com cortes medidos |

---

## FASE 1 — o que está pronto, seção por seção

A resposta curta à pergunta *"você implementou tudo da Fase 1?"* é **não.**
O corpo da fase está de pé e fecha de ponta a ponta. O que falta é a moldura:
as duas cinemáticas.

| § | o que o roteiro pede | estado |
|---|---|---|
| 6 | áreas conectadas: sala principal, corredor, biscoitos, sala lateral, área superior, região inacessível, área do relógio, porta | **feito** — 5 salas |
| 6 | entrada da fase: Alice aparece, caixa curta, controle volta | **feito** |
| 7 | biscoitos com função de gameplay | **feito** — dois tamanhos, com portão real |
| 8 | puzzles de relógio/horário/símbolo, diferença entre salas | **parcial** — uma corrente (03:17) |
| 9 | parkour como parte da investigação, terminando no relógio | **feito** — duas progressões |
| 10 | checkpoint como conquista real | **feito** — nos biscoitos e no relógio |
| 11 | com o relógio, a porta cede e leva à Fase 2 | **parcial** — a porta cede; não há Fase 2 |
| — | HIGHSFIELD 01 (o relógio) | **não feito** |
| — | HIGHSFIELD 02 (a porta) | **não feito** |

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

---

## O que NÃO está implementado

### Cinemáticas — nenhuma das cinco
- **HIGHSFIELD 01** (o relógio) — os 12 quadros do Coelho já estão recortados em
  `assets/characters/coelho/` e `coelho-rosto/`, prontos para usar
- **HIGHSFIELD 02** (a porta) — hoje a porta mostra um cartão "FIM DA FASE 1" e
  volta ao menu
- **HIGHSFIELD 03, 04, 05** — dependem das Fases 2 e 3

### Fases 2 e 3 — não existem
Nada além dos cenários carregados e das peças de xadrez ainda não recortadas.

### Personagens fora do jogo
Alice Demon (a folha inteira de movimentos existe, 39 quadros, não recortada),
Chapeleiro, Soldado de cartas, Gato Cheshire.

### Outras faltas
- **O tutorial não ensina a mecânica de tamanho** (§42 pede) — ele foi escrito
  antes de ela existir
- **O símbolo da espada ♠** não liga as pistas entre si, como o §8 sugere
- **Cada sala usa o mesmo silêncio tenso** — não há ambiente próprio por cômodo
- **Morte e renascimento não foram testados.** O único perigo da fase é o buraco
  do sótão
- **Controles de toque não foram testados** depois das mudanças recentes
- **Duração:** provavelmente 8–12 minutos. O §5 pede 10–15

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

## Armadilhas técnicas já pagas

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
  normalizados. Remove fundo chapado por preenchimento a partir da borda (não
  come o que é escuro dentro do desenho), ancora pelo centro do vestido, alinha
  os pés na base. Configurações em `tools/config/*.json`.
- **`folha-de-prova.ps1`** — monta contato dos quadros sobre fundo magenta, para
  qualquer sobra de fundo ou borda comida saltar aos olhos.
- **`dev-server.js`** — servidor local, com o carimbo de importação descrito
  acima.

---

## Git

Repositório: `https://github.com/madutiam/Jogo-de-terror` — **privado**.

Identidade presa **localmente** a este repositório (nada global foi tocado):
`Maria Eduarda Bedetti <100002186+madutiam@users.noreply.github.com>`.

**10 commits locais ainda não enviados.** O push precisa que a conta ativa do
`gh` seja a `madutiam` (hoje é a `EduardaBedetti`), e isso é configuração da
máquina — pedir autorização antes.

A **arte original** (45 PNGs e os áudios, ~42 MB) mora na pasta de fora e
**não está versionada**. Decisão pendente: mover para dentro do repositório ou
deixar só na máquina.

---

## Onde está cada coisa da Fase 1

x medido com o jogo rodando.

**QUARTO** (2400 de largura, começa em x=1150)

| x | o quê |
|---|---|
| 70 | passagem trancada |
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

## Ordem sugerida daqui

1. **HIGHSFIELD 02** — a passagem pela porta. Fecha a Fase 1 de verdade, e os
   assets já existem
2. **HIGHSFIELD 01** — a abertura. Os 12 quadros do Coelho estão prontos
3. **Tutorial** — ensinar a mecânica de tamanho (§42)
4. **Ambiente por sala** — cada cômodo com o próprio som
5. **Fase 2** — floresta, Alice Demon, perseguição

Antes de qualquer uma: reler a seção correspondente do
[ROTEIRO.md](ROTEIRO.md). Ele é específico ao ponto de dizer o que acontece em
cada intervalo de segundos.
