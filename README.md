# ALICE TERROR

Jogo de terror em pixel art. Três fases. Roda no navegador, no computador e no
celular, sem instalar nada.

---

## Como rodar

```bash
node tools/dev-server.js
```

Abre em `http://localhost:5173`. O terminal também mostra um endereço com o IP
da máquina — esse abre no celular, desde que ele esteja no mesmo Wi-Fi.

> O jogo usa módulos ES. Abrir o `index.html` direto (`file://`) não funciona;
> precisa passar por um servidor. Por isso o script acima existe — ele não tem
> nenhuma dependência, é só Node puro.

---

## O que já funciona

- Movimentação da Alice com os sprites originais (esquerda / direita / parada),
  sem espelhamento e sem deformação
- Pulo com altura variável, *coyote time* e memória de pulo
- Colisão real com o chão e com a mobília do quarto (a mobília é plataforma de
  mão única: a Alice passa na frente, mas sobe em cima)
- Câmera com deadzone
- HUD de vida em espadas ♠ ♠ ♠
- Caixa de diálogo com texto máquina de escrever
- Pontos de observação (as pistas da Fase 1)
- Controles de teclado **e** analógico virtual + botões no celular
- Menu, HISTÓRIA, TUTORIAL, CONFIGURAÇÕES, CRÉDITOS
- Sistema de áudio em camadas (música / ambiente / efeito), com silêncio como
  ferramenta e não como ausência
- Salvamento de configurações, pistas e checkpoint no navegador
- O relógio do quarto marcando **03:17**, como na história

## O que ainda não está aqui

Está tudo em [docs/ASSETS-FALTANDO.md](docs/ASSETS-FALTANDO.md), e o estado
completo em [docs/ESTADO-DO-PROJETO.md](docs/ESTADO-DO-PROJETO.md).

Resumo em 07/09/2026: a **Fase 1 está inteira** (cinco salas, os biscoitos, o
parkour, o mecanismo, o caderno com mapa) e a **Fase 2 se atravessa** — as três
telas da floresta, com colisão. Faltam os desafios dela (§14 a §21), a
HIGHSFIELD 03, e a Fase 3.

A regra do projeto continua: **pedir o asset, nunca inventar**.

---

## Estrutura

```
assets/          cópias organizadas dos arquivos originais
  characters/    Alice, Alice Demon, Coelho, Chapeleiro, Soldado, Cheshire
  scenarios/     quarto, floresta, tabuleiro
  objects/       porta, chave
  audio/         os 20 sons, com nomes limpos

src/
  main.js        configuração do Phaser e lista de cenas
  core/
    constants.js  TODO número que aparece em mais de um lugar mora aqui
    Alice.js      personagem: estados, física, passos, dano
    InputManager  teclado e toque chegam aqui e saem iguais
    AudioManager  três camadas de som, com fade e silêncio
    SaveManager   configurações e progresso (localStorage, tolerante a falha)
    MissingAssets registro do que faltou de arte
  objects/
    RelogioDeParede.js
  scenes/
    GameplayScene.js  base comum das fases (Alice, HUD, diálogo, dano, pausa)
    Phase1Scene.js    o quarto
    TutorialScene.js  andar, pular, observar
    Menu / Story / Settings / Credits / Boot / Preload
  ui/
    theme.js  paleta e tipografia
    Hud / DialogBox / TouchControls
  data/
    story.js  o texto da HISTÓRIA, escrito pela desenvolvedora
    audio.js  catálogo de clipes, com os cortes a ajustar

tools/dev-server.js   servidor local sem dependências
docs/                 documentação de produção
```

---

## Decisões que valem registrar

**Por que Phaser 3 e não Unity/Godot.** O jogo precisa rodar em celular e
computador. No navegador isso sai de graça: um link e pronto, sem instalar,
sem loja, sem build por plataforma. E dá para testar cada mudança em segundos.

**Por que os sprites da Alice são recortados no preload.** Os PNGs originais
têm 500×500 com o desenho ocupando só 152×253 no meio. Em vez de lidar com
esse vazio em cada cálculo de colisão, o jogo recorta a janela útil e já grava
na escala final, uma vez, na memória. **Nenhum arquivo em disco é alterado.**

**Por que a mobília é plataforma de mão única.** Em cena lateral a Alice
caminha na frente dos móveis. Se a colisão fosse total, ela bateria na lateral
da cadeira e não passaria. Colidindo só por cima, ela anda livre e ainda pode
subir na mesa.

**Por que o relógio é redesenhado.** O desenho original marca ~1h20 e a
história diz 03:17. O jogo cobre só a fatia do mostrador onde estavam os
ponteiros antigos, usando os **pixels do próprio desenho** (espelhados da
metade limpa), e desenha os ponteiros novos por cima. A moldura, os algarismos
e a textura continuam intactos — e os ponteiros agora podem se mover, o que os
puzzles de horário vão precisar.

**Por que a Alice vira para a câmera quando para.** O único desenho de "parada"
que existe é de frente. Em vez de inventar um idle de perfil, ela mantém o
último frame de perfil por meio segundo e então se vira. Funciona, e não
descaracteriza o personagem.

**Sem tint no dano.** Piscar mudando a cor alteraria as cores da Alice. O dano
pisca mexendo só na opacidade.

---

## Regras do projeto

1. Os assets da desenvolvedora são os oficiais. Não redesenhar, não trocar
   roupa, cabelo, rosto ou cor, não deformar, não substituir.
2. Cenário pode ser adaptado (estender, escurecer, sombrear) preservando a
   identidade visual.
3. Faltou uma pose? Pedir o asset. Nunca inventar.
4. Exatamente **3 fases jogáveis** e **5 HIGHSFIELD**. Nada além disso.
5. Nada de arquivo do projeto fora desta pasta.

---

## Repositório

Único repositório autorizado: `madutiam/Jogo-de-terror`.

> Atenção antes do primeiro push: o `gh` desta máquina tem duas contas logadas
> e a **ativa é `EduardaBedetti`**, mas o repositório é da **`madutiam`**. Isso
> precisa ser resolvido no nível deste repositório (por exemplo, colocando o
> usuário na URL do remote), **sem** trocar a conta ativa nem mexer no git
> global da máquina.
