# Briefing dos objetos — ALICE TERROR

Contexto para escrever os prompts dos cinco objetos que faltam.
As cores foram amostradas dos seus próprios desenhos, então o que nascer daqui
já entra na paleta do jogo.

---

## Regras que valem para os cinco

**Fundo transparente de verdade.** PNG RGBA, alpha 0 no fundo. Não é fundo
preto nem fundo branco — é vazio. (A `chave 1.png` está certa: 10,9% de pixels
opacos, cantos transparentes. A porta com recorte estragado é o contra-exemplo.)

**Ângulo: visto de cima, em três quartos.** O jogo não é de lado. A câmera olha
o chão em perspectiva e a Alice anda por ele para os lados **e para o fundo**.
Um objeto largado no chão precisa ser desenhado como quem olha de cima e de
frente ao mesmo tempo — como a xícara quebrada do `cenario 1`, não como um
ícone de perfil.

**Não desenhe sombra no objeto.** O jogo desenha a sombra dele no chão,
proporcional à profundidade. Sombra desenhada junto fica dobrada.

**Não escureça o objeto.** As cores abaixo são as que aparecem *em cena*, já com
o escurecimento do jogo por cima. Desenhe mais claro que elas — o motor escurece
depois, e um objeto que já nasce escuro some por completo.

**Sem cenário junto.** Nada de chão, moldura, vinheta ou fundo decorativo. Só o
objeto recortado.

**Escala de referência:** a Alice tem 253 px de altura no arquivo dela e aparece
com 182 a 253 px em cena, dependendo da profundidade. Um objeto de mão fica bem
com 60 a 90 px.

### Paleta amostrada dos seus desenhos

| Onde | Cor em cena |
|---|---|
| Quarto — parede | `#1f2c3b` |
| Quarto — chão | `#202e3c` |
| Quarto — móveis | `#1d2937` |
| Quarto — sombra profunda | `#161f2c` |
| Floresta — chão | `#1e120f` |
| Floresta — troncos | `#11191a` |
| Floresta — névoa ao fundo | `#1e2b2f` |
| Coelho — casaco | `#602325` |
| Coelho — pelo | `#817471` |
| Coelho — latão do relógio | `#8f7a67` |
| Coelho — gravata | `#212937` |
| Interface — osso | `#c9c2b4` |
| Interface — sangue seco | `#7a1f22` |
| Interface — dourado | `#b9a05f` |

---

## 1. Relógio de bolso 🔴

**É o item mais importante do jogo.** Fecha a Fase 1, abre a porta para a Fase 2,
aparece na HIGHSFIELD 01, na 02 e no pós-créditos.

**Ele já existe desenhado.** Está na mão do Coelho em `coelho.png` — latão
`#8f7a67`, corrente, mostrador claro. **O avulso precisa ser o mesmo relógio**,
não um parecido.

**O que ele precisa contar:** que está morto. A história diz que ele está
*"aberto ao meio, com os ponteiros presos"* em **03:17**, e que estava
*"frio demais"*. Vidro rachado, corrente arrebentada, latão manchado.

**Precisam ser duas imagens:**
- **caído no chão** — visto de cima, fechado ou semiaberto, ~70 px de largura.
  É assim que a Alice acha.
- **aberto, de frente** — o mostrador legível, ponteiros em 03:17, ~200 px.
  É para o close da cinemática.

**Armadilha:** ele volta a fazer tic-tac mesmo quebrado. O desenho não pode
parecer funcionando — o susto é ele soar sem ter como.

---

## 2. Espelho avulso 🟠

**Onde:** Fase 2, floresta. Aparece depois da descoberta da roupa. É por ele que
a Alice Demon atravessa, na HIGHSFIELD 03.

**O que ele precisa contar:** que está no lugar errado. Um espelho de quarto,
com moldura, largado no meio de uma floresta devastada. O deslocamento é o
ponto — se parecer que pertence ali, perdeu.

**Referência sua:** o espelho encostado na parede do `cenario 1` — moldura
escura, vidro com rachadura em X.

**Formato:** em pé, apoiado num tronco, inclinado. Mais alto que a Alice —
uns 300 px. Moldura antiga, ornamentada, escurecida.

**O ponto mais importante, e é técnico:**
> **Deixe o vidro escuro e liso, sem reflexo desenhado.**

O jogo precisa desenhar o reflexo por cima: primeiro a Alice normal, depois o
reflexo **atrasando** um instante, e só então a Demon aparecendo lá dentro. Se
o vidro vier com reflexo pintado, nada disso é possível — e o atraso do reflexo
é a cena inteira.

Se puder, mande **duas camadas**: a moldura com o vidro vazio (transparente no
meio) e, separado, uma textura de vidro sujo para eu sobrepor.

---

## 3. Pedaço de roupa 🟠

**Onde:** Fase 2. É um momento marcado na especificação (§16): som de
descoberta, pausa, a Alice reage, o ambiente muda.

**O que é:** um pedaço do casaco vermelho do Coelho (`#602325`), rasgado e com
sangue. Não é um pano genérico — é reconhecível como *daquele* casaco.

**O detalhe obrigatório:** ele precisa ter uma **marca ou símbolo** que o
jogador já tenha visto em outro lugar. É isso que faz as pistas das três fases
se ligarem.

Duas sugestões que já existem no jogo:
- a **espada ♠**, que está no cabo da chave e é o símbolo das vidas no HUD;
- o horário **03:17**, bordado ou marcado.

**Formato:** caído no chão, amassado, visto de cima. ~80 px.

---

## 4. Rastros 🟠

**Onde:** Fase 2. É a trilha que a Alice segue — sangue e pelos deixados pelo
Coelho.

**Precisam ser vários sprites pequenos e SEPARADOS**, não uma trilha pronta.
Assim eu espalho pelo mapa, giro e vario o tamanho, e a trilha pode terminar,
desviar ou enganar — que é o que a especificação pede (§14).

**Lista:**

| Sprite | Tamanho | Observação |
|---|---|---|
| Poça de sangue grande | ~120 px | |
| Poça média | ~70 px | |
| Respingo / gotas | ~40 px | 2 ou 3 variações |
| Marca de arrasto | ~140 px | alongada, direcional |
| Tufo de pelo branco | ~35 px | cor `#817471` |
| Pegada de pata | ~30 px | |

**Todos vistos de cima** — é chão.

**Atenção ao sangue:** o sangue que está pintado no `cenario 2` aparece em cena
como `#171817` — praticamente preto, porque o cenário é escuríssimo. Se você
desenhar os rastros nesse tom, eles somem. **Desenhe mais vivo** (perto do
`#7a1f22`), que o jogo escurece depois.

---

## 5. Comida podre 🟡

**Onde:** Fase 2. É obstáculo: encostar tira vida (§15).

**O que é:** os restos do chá que aconteceu ali. Bolo mofado, sanduíche
apodrecido, geleia derramada e escorrida, chá coalhado numa xícara tombada.

**O que precisa contar:** perigo — mas **sem usar vermelho vivo**, que é a cor
do sangue e ia confundir as duas leituras. Mofo verde-acinzentado, superfície
molhada e brilhante, contornos moles.

**Precisam ser 3 ou 4 variações**, para eu espalhar sem repetir a mesma mancha.

**Tamanho:** 60 a 140 px, no chão, vistos de cima.

**A armadilha, e é a mais importante:**
> A especificação diz que **nem tudo no chão pode ser perigoso** — o jogador
> precisa observar para distinguir.

O `cenario 2` já tem louça quebrada e uma xícara tombada que são **inofensivas**.
A comida podre precisa ser visualmente distinta delas à primeira vista, senão o
jogo vira tentativa e erro. O mofo é o que separa as duas coisas: se tem mofo,
machuca.

---

## Modelo de prompt

Para reaproveitar, trocando só o miolo:

```
Pixel art de [OBJETO], estilo pixel art detalhado e sombrio, jogo de terror.
Visto de cima em três quartos, como um objeto largado no chão.
Fundo totalmente transparente, sem sombra, sem cenário, sem moldura.
Paleta escura e dessaturada: [CORES DA TABELA].
Iluminação fraca e lateral. Aspecto sujo, antigo, abandonado.
Sem texto, sem contorno branco, sem brilho neon.
```
