# Assets que faltam — ALICE TERROR

Lista viva. Revisada em **07/09/2026**, depois da entrega dos movimentos da
Alice Demon, da captura, das folhas da HIGHSFIELD 01 e do relógio limpo.

Regra do projeto: quando falta uma pose, o jogo **não inventa**. Usa o frame
existente mais próximo, sem deformar nada, e registra o pedido. Para ver o que
faltou numa sessão de teste, no console do navegador:

```
aliceAssetsFaltando()
```

**🔴 trava uma fase · 🟠 trava uma cinemática · 🟡 melhora muito**

---

## ⚠️ Duas Alices diferentes no projeto

Os três desenhos antigos (`alice.png`, `direita.png`, `esquerda.png`) e o Atlas
novo **não são o mesmo desenho**:

| | antiga | Atlas novo |
|---|---|---|
| laço preto na cabeça | não tem | tem |
| boca | batom vermelho | boca pequena |
| pernas / pés | perna nua + bota | meia branca + sapatilha |
| cabelo | liso, repartido | ondulado, com volume |

A Alice **de costas** já foi desenhada no traço novo (tem o laço). Ou seja: no
jogo de hoje ela troca de desenho quando vira. **O Atlas novo passa a ser a
Alice oficial** e os três desenhos antigos saem de cena — eles ficam guardados,
nada é apagado.

---

## O que ainda falta

### Alice — vista lateral (Fases 1 e 2)

> **Entregues desde então:** correndo de perfil (6 por lado), andando de frente,
> levando dano de perfil, ofegante, e o conjunto inteiro da Alice pequena. As
> linhas abaixo que pediam essas poses saíram da lista.

| Prio | Animação | Por que precisa | Frames |
|---|---|---|---|
| 🟡 | **CORRENDO de frente** (vindo para a câmera) | Hoje cai no ciclo de andar de frente, mais rápido | 4–6 |

### Alice — vista de costas (ela se afasta da câmera)

Já existem: parada, caminhada, corrida, pulo e pegar item de costas. Falta só o
conjunto da **pequena de costas** — hoje ela cai no ciclo de costas do tamanho
normal, encolhido.

---

## FASE 2 — o que ainda não existe em lugar nenhum

| Prio | O quê | Por quê |
|---|---|---|
| 🔴 | **A porta de saída da floresta** (§20) | Hoje só há a porta de pedra da casa, que é da Fase 1. A chave da fase precisa abrir alguma coisa |
| 🟠 | **Os quadros da HIGHSFIELD 03** (§17) | O espelho. Só se ela quiser desenhada em quadros compostos, como a HS02 e a captura — dá para montar com o que existe |

**Já entregue e só esperando recorte:** a folha
`Objetos relógio de bolso, espelho avulso, pedaço de roupa, rastros, comida
podre.png`, na pasta mãe. Tem o espelho (inteiro, moldura e vidro em camada
separada), o pedaço de roupa com a marca de espada, e as quatro comidas podres.
Nada disso precisa ser pedido de novo — precisa ser fatiado.

### Coelho

Existe 1 pose de frente com o relógio. O Coelho morto está pronto.

| Prio | Pose | Onde |
|---|---|---|
| 🟠 | Cabeça virada para o relógio | HIGHSFIELD 01, 3–6 s |
| 🟠 | Cabeça virada para a Alice | HIGHSFIELD 01, 3–6 s e 14–17 s |
| 🟠 | Reação de estranhamento | quando o relógio para |

### Chapeleiro · Soldado de cartas · Gato Cheshire

1 pose parada cada um. Só melhora se ganharem 2–3 quadros de respiração; nenhum
deles trava nada.

---

## ✅ Entregue e completo

- **Alice lateral** — parada, andando (11/lado), pulando (5/lado), caindo (6/lado),
  pegando item (6/lado)
- **Alice de costas** — parada + 4 de caminhada
- **Alice pequena (~50%)** — parada, andando, pulando, caindo, pegando item
- **Transição encolher** — 8 quadros
- **Alice top-down** — parada, andando, correndo, levando dano, nas 4 direções
- **Alice Demon** — idle, andar (8), correr (7), atacar (6), levar dano (3),
  morrer (4), virar 360° (11). *A HIGHSFIELD 03 inteira está coberta:
  o quadro 5 de ATTACK é a mão atravessando o espelho.*
- **Peças de xadrez** — 6 peças limpas + 6 sombrias/danificadas
- **Objetos** — relógio de bolso, espelho (moldura e vidro em camadas separadas),
  pedaço de roupa com a marca de espada, rastros, comida podre
- **Biscoitos** — SHRINK e GROW (texto em inglês, proposital)
- **Cenários** — os 3
- **Áudio** — os 30 sons da especificação. Nada falta.

---

## Leitura do tamanho (confirmada pela própria folha)

A folha diz **GRANDE (100%)** e **PEQUENA (~50%)**. São **dois** estados, não
três: a Alice normal é a "grande". O biscoito **SHRINK** leva para 50%, o
**GROW** traz de volta para 100%. Nada fica maior que o normal.

---

Os ponteiros do relógio de parede **não** são necessários: o jogo reconstrói o
mostrador com os pixels do próprio desenho e marca 03:17.
Ver `src/objects/RelogioDeParede.js`.
