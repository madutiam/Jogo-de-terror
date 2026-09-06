# PLANTA DA FASE 1 — áreas conectadas

Baseada no roteiro, seções 6 a 11. Todas as oito áreas que o §6 pede estão aqui.

Regra que manda em tudo: **enigma abre desafio físico.** Nunca há uma seta.
O jogador descobre um número, o número abre um mecanismo, o mecanismo derruba
uma escada, e só então o pulo existe. Sem a descoberta, o caminho não está lá.

---

## O caminho inteiro, do início à porta

| # | onde | o que acontece | o que abre o próximo passo |
|---|---|---|---|
| 1 | **Sala principal** | Alice acorda. Xícara quebrada, cadeira virada, espelho rachado, e o relógio de parede parado em **03:17** | o número. É a única coisa que ela leva daqui |
| 2 | **Corredor** | corre para o oeste. No meio dele há uma **fresta baixa** na parede, entulhada | ela vê a fresta e não cabe. Fica a pergunta, não a resposta |
| 3 | **Despensa** | prateleiras altas. Empilhando caixotes ela alcança os **biscoitos: SHRINK e GROW** | o tamanho vira ferramenta |
| 4 | **Corredor** (volta) | come o SHRINK e atravessa a fresta | — |
| 5 | **Sala lateral** | **é a sala principal espelhada.** Mesma mobília, mesmas rachaduras — e o relógio de parede marcando **03:18**. Um minuto adiante. Aqui o tempo andou | a diferença entre as duas salas é o enigma |
| 6 | **Sala lateral** | pequena, ela entra num nicho na parede e chega ao **mecanismo de relógio**. Acerta os ponteiros em **03:17** | o mecanismo derruba a **escada quebrada** na sala principal |
| 7 | **Sala principal** (volta) | a escada está lá. Pequena ela não alcança os degraus — precisa comer o **GROW** | o tamanho de novo, agora ao contrário |
| 8 | **Sótão** | a progressão de parkour: vigas, tábua solta, um buraco no assoalho | ao fim dela, **o relógio de bolso do Coelho** |
| 9 | **Sótão** | pega o relógio. Som de item · pausa · **tic-tac** · reação da Alice. **Checkpoint aqui** (§10) | o tic-tac |
| 10 | **Sala principal** (volta) | a porta de pedra cede | **HIGHSFIELD 02** → Fase 2 |

As oito áreas do §6, conferidas: sala principal · corredor · área dos biscoitos ·
sala lateral · área superior · região inicialmente inacessível (sótão e sala
lateral) · área do relógio · porta de saída.

---

## O que eu preciso que você desenhe

### Formato — vale para os três cenários

Igual ao `cenario 1.png`, para tudo encaixar sem reescalar:

- **altura: 640 px**
- **linha do chão em y = 470** — é onde a parede do fundo encontra o piso
- de y=470 a y=640: um pedaço de chão em perspectiva, como no cenário 1
- fundo **transparente** acima da parede, se sobrar
- a largura muda em cada um (abaixo)

O resto do chão o jogo estende sozinho, como já faz na sala principal.

### Paleta — medida do seu próprio desenho

| | |
|---|---|
| parede | `#1f2c3b` |
| chão | `#202e3c` |
| rejunte | o mesmo do cenário 1 |

---

## 1 · CORREDOR

**1280 × 640**

Estreito e comprido. Teto mais baixo que o da sala principal — a sensação é de
aperto depois de um cômodo grande. Papel de parede descascando, uma moldura
vazia caída no chão, marcas na parede de móveis que já não estão ali.

**No meio da parede do fundo:** uma **fresta baixa**, entulhada de tijolo
quebrado, com uns 130 px de largura e 110 px de altura. Escura por dentro. Tem
que dar para ver que é passagem e ficar óbvio que uma pessoa do tamanho normal
não passa.

Nas duas pontas, vãos de porta abertos: um para a sala principal (leste), outro
para a despensa (oeste).

## 2 · DESPENSA

**960 × 640**

O cômodo dos biscoitos. Prateleiras de madeira subindo pela parede, potes de
vidro, sacos rasgados, farinha derramada no chão.

**Detalhe que é enigma, não decoração:** numa prateleira há **3 potes**; noutra,
mais alta, **17 potes**. Ninguém vai apontar isso. Quem reparar, guarda o
número; quem não reparar, encontra ele de novo no relógio de parede.

**Na prateleira mais alta**, fora de alcance, ficam os biscoitos. A prateleira
tem que estar visivelmente alta demais para um pulo só.

## 3 · SÓTÃO

**1600 × 640**

Teto em duas águas, vigas aparentes, um respiradouro no fundo deixando entrar um
fio de luz cinzenta — é a única coisa que diz ao jogador que ele está no alto.
Assoalho de tábuas, algumas soltas. Poeira. Móveis cobertos com lençol.

**Um buraco no assoalho**, com uns 260 px, mostrando o vão escuro embaixo.

No fim do sótão, num canto, é onde o **relógio de bolso** espera.

---

## 4 · A SALA LATERAL — não precisa desenhar

Ela é a **sala principal espelhada**. Mesma mobília, mesmas rachaduras, invertida.
O jogo faz isso sozinho, e o relógio de parede eu repinto para 03:18 — já
reconstruo o mostrador em 03:17 hoje.

É de propósito: o §8 pede *"diferenças entre salas"*, e uma sala que é a sua
igual com uma coisa fora do lugar assusta mais do que uma sala nova.

---

## Peças de parkour

PNGs separados, **fundo transparente** (ou rosa-choque `#FF00FF`, que é mais
fácil de recortar sem erro). Cada uma no seu arquivo.

### Travam a fase — sem elas não há progressão

| peça | tamanho | onde | para quê |
|---|---|---|---|
| **Caixote de madeira** | 110 × 96 | despensa | empilhar e subir. O topo tem que ser plano |
| **Prateleira de parede** | 320 × 40 | despensa | onde os biscoitos ficam. Precisa de suporte visível embaixo |
| **Escada quebrada** | 120 × 380 | sala principal | encostada na parede, **com degraus faltando** — é o que impede a Alice pequena de subir |
| **Viga do sótão** | 420 × 46 | sótão | atravessar por cima do buraco |
| **Tábua solta** | 240 × 32 | sótão | ponte estreita, mais fina que a viga |
| **Mecanismo de relógio** | 240 × 240 | sala lateral | um mostrador embutido num nicho, **sem os ponteiros** |
| **Ponteiro do mecanismo** | 2 peças: 90 × 12 e 60 × 12 | sala lateral | soltos, para eu poder girar. Um grande e um pequeno |

### Melhoram muito, mas não travam

| peça | tamanho | onde |
|---|---|---|
| **Saco de farinha caído** | 130 × 70 | despensa — degrau macio no meio da pilha |
| **Caixa empilhada alta** | 140 × 150 | sótão |
| **Alçapão** | 220 × 90, fechado e aberto | teto da sala principal |
| **Móvel coberto com lençol** | 200 × 160 | sótão |

---

## O que eu faço sem você

- a sala lateral (espelhamento) e o relógio dela em 03:18
- recortar os biscoitos SHRINK e GROW da sua imagem `biscoitos.png`
- a mecânica de tamanho: estados, colisão da Alice pequena, passagens baixas
- a lógica do mecanismo e o que ele destrava
- as luzes, sombras e a continuidade entre os cômodos, como já ficou na sala principal
- a HIGHSFIELD 02

## O que ainda vou te pedir depois

As três poses de cabeça do Coelho (já está no `BRIEFING-COELHO.md`), e as
animações que faltam da Alice — correr de costas, pular de costas, pegar item de
costas — que estão no `ASSETS-FALTANDO.md`.
