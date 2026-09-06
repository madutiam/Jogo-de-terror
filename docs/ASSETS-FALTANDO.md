# Assets que faltam — ALICE TERROR

Lista viva. Revisada em 06/09/2026, depois da entrega do Atlas lateral, da folha
grande/pequena, do top-down com as peças de xadrez, dos movimentos da Alice
Demon, dos 5 objetos e dos biscoitos.

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

| Prio | Animação | Por que precisa | Frames |
|---|---|---|---|
| 🔴 | **CORRENDO** de perfil, D e E | A Fase 2 é uma perseguição. Existe só na folha top-down, num tamanho menor | 6 por lado |
| 🔴 | **ANDANDO DE FRENTE** (vindo para a câmera) | O jogo tem profundidade: ela anda para a frente o tempo todo. Hoje só existe a parada de frente | 4–6 |
| 🟡 | **LEVANDO DANO** de perfil | Existe só na top-down. Dá para segurar com o primeiro quadro de CAINDO | 2 por lado |
| 🟡 | **OFEGANTE** depois da perseguição | O áudio já existe (`alice.ofegante`), a pose não | 2–4 |

### Alice — vista de costas (ela se afasta da câmera)

Já existem: parada + ciclo de caminhada (5 quadros). Faltam:

| Prio | Animação | Frames |
|---|---|---|
| 🟡 | **PULANDO** de costas | 3–5 |
| 🟡 | **CORRENDO** de costas | 6 |
| 🟡 | **PEGANDO ITEM** de costas | 4 |

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
