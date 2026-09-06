PROMPT MESTRE — PROJETO ALICE TERROR
Você é responsável por desenvolver e organizar o projeto de um jogo de terror em pixel art chamado ALICE TERROR.
O jogo deve ser tratado como um projeto sério de horror, com atmosfera pesada, investigação, tensão, exploração, puzzles e narrativa.
Não transforme o jogo em algo infantil, fofo, exageradamente cartunesco ou genérico.
O objetivo não é fazer um jogo enorme.
O objetivo é fazer um jogo pequeno, mas extremamente bem pensado, polido e memorável.
O jogo terá EXATAMENTE 3 FASES JOGÁVEIS.
Não criar uma quarta fase jogável.
Uma possível continuação pode ser apenas sugerida no pós-créditos, de maneira ambígua.
1. DIRETÓRIO OBRIGATÓRIO DO PROJETO
Todo o projeto deve existir EXCLUSIVAMENTE dentro desta pasta:
`C:\Users\Bedetti\Documents\ms pickles\Alice terror`
Essa é a raiz oficial do projeto.
Não criar arquivos do projeto em:

* Desktop
* Downloads
* Documentos fora dessa pasta
* outra pasta chamada Alice Terror
* diretórios temporários
* outra localização qualquer

Todos os arquivos necessários para o jogo devem permanecer dentro dessa raiz.
Antes de alterar qualquer coisa:

1. Inspecione a pasta.
2. Identifique a estrutura existente.
3. Identifique todas as imagens.
4. Identifique todos os sprites.
5. Identifique animações.
6. Identifique cenários.
7. Identifique sons.
8. Identifique arquivos de código.
9. Identifique arquivos duplicados.
10. Identifique possíveis arquivos que não devem ser sobrescritos.

NÃO MODIFIQUE NADA IMEDIATAMENTE.
Primeiro faça uma análise do conteúdo existente e apresente:

* estrutura encontrada;
* assets encontrados;
* personagens encontrados;
* cenários encontrados;
* sons encontrados;
* arquivos de código encontrados;
* o que já está pronto;
* o que está incompleto;
* o que está faltando;
* possíveis problemas técnicos.

Somente depois dessa análise deverá começar a implementação.
2. REGRA ABSOLUTA SOBRE OS ASSETS
Os assets visuais fornecidos pela desenvolvedora devem ser considerados os assets oficiais do jogo.
Entre eles existem:

* Alice Macabra;
* Alice Demon;
* Mad Hatter Sinistro;
* soldado de cartas;
* Coelho;
* Coelho caído/morto;
* quarto abandonado;
* floresta devastada e ensanguentada;
* cenário do chá/café;
* tabuleiro de xadrez destruído;
* porta antiga em parede de pedra;
* chave enferrujada manchada de sangue;
* outros elementos de cenário.

Os personagens devem manter sua identidade visual original.
Não:

* redesenhar os personagens;
* trocar roupa;
* mudar cabelo;
* mudar rosto;
* alterar cores;
* transformar em 3D;
* criar uma versão realista;
* substituir por outro personagem;
* criar um personagem genérico parecido;
* deformar o sprite;
* reduzir a qualidade desnecessariamente;
* alterar a identidade do pixel art.

Pode adaptar o cenário, quando necessário.
Por exemplo:

* ampliar horizontalmente;
* estender o fundo;
* adicionar escuridão;
* adicionar sombras;
* adicionar elementos ambientais;
* aumentar a área explorável;
* criar continuidade visual;
* tornar o ambiente mais assustador.

Mas preserve a identidade visual original do cenário.
3. REGRA FUNDAMENTAL — NÃO INVENTAR ASSETS DE PERSONAGEM
Se uma cena exigir uma pose ou animação que não existe nos assets fornecidos:
NÃO INVENTE.
Não desenhe automaticamente uma nova Alice.
Não gere uma Alice diferente.
Não use outro personagem como substituto.
Não faça uma animação falsa que altere a identidade do personagem.
Nesse caso:

1. identifique qual asset está faltando;
2. explique qual pose/animação é necessária;
3. solicite o asset correspondente à desenvolvedora;
4. continue o desenvolvimento somente utilizando aquilo que realmente existe.

Essa regra é especialmente importante para:

* Alice;
* Alice Demon;
* Coelho;
* Mad Hatter;
* personagens das cartas.

4. CONCEITO DO JOGO
O jogador controla Alice.
O Coelho desapareceu.
Alice começa procurando respostas.
Ao longo da jornada, ela encontra:

* relógio;
* rastros;
* roupas;
* marcas;
* objetos;
* símbolos;
* sangue;
* pistas;
* ambientes alterados;
* acontecimentos sobrenaturais.

As pistas não devem simplesmente dizer ao jogador:
"Vá para a direita."
ou:
"Agora faça isso."
O jogador deve interpretar o ambiente.
A experiência principal deve seguir:
explorar → observar → suspeitar → descobrir → interpretar → decidir → superar → encontrar uma nova pista → aumentar a tensão → descobrir mais da história.
O jogador deve sentir que está montando um quebra-cabeça.
5. ESTRUTURA GERAL
O jogo possui:
FASE 1
Quarto / sala dos biscoitos.
Foco:
exploração + puzzles + parkour + estranheza
FASE 2
Floresta devastada / local do chá.
Foco:
investigação + exploração + sobrevivência + perseguição
FASE 3
Tabuleiro de xadrez.
Foco:
puzzle + observação + timing + revelação
Cada fase deve durar mais de 10 minutos na primeira jogada.
Idealmente:

* Fase 1: 10–15 minutos;
* Fase 2: 15–20 minutos;
* Fase 3: 15–20 minutos.

Não aumentar a duração com:

* caminhada vazia;
* corredores enormes;
* diálogos desnecessários;
* repetição artificial.

A duração deve vir de gameplay real.
6. FASE 1 — O QUARTO DOS BISCOITOS
Alice começa em um ambiente frio e aparentemente abandonado.
O local não deve parecer uma simples fase de plataforma.
Deve parecer um lugar onde alguma coisa aconteceu.
A sensação é:
frio → silêncio → estranheza → curiosidade → medo.
Existe uma sala principal.
O mapa deve possuir diferentes áreas conectadas.
Exemplo de estrutura:

* sala principal;
* corredor;
* área dos biscoitos;
* sala lateral;
* área superior;
* região inacessível inicialmente;
* área onde está o relógio;
* porta de saída.

Essa estrutura é uma referência de design e pode ser adaptada conforme os assets existentes.
Entrada da fase
Ao iniciar:
Alice aparece no cenário.
Uma caixa de diálogo apresenta o objetivo inicial.
O Coelho foi levado.
Alice precisa encontrar pistas.
O texto deve ser curto o suficiente para não interromper excessivamente a experiência.
Depois que a caixa desaparece:
o controle passa para o jogador.
7. MECÂNICA DOS BISCOITOS
Os biscoitos não devem existir apenas como decoração.
Eles devem fazer parte da lógica da fase.
Alice pode alterar seu tamanho através deles.
O tamanho deve possuir função de gameplay.
Por exemplo:

* passar por espaços pequenos;
* alcançar determinadas plataformas;
* acessar áreas;
* ativar mecanismos;
* atravessar determinadas partes do cenário;
* descobrir caminhos que não seriam possíveis em outro tamanho.

O jogador deve precisar observar o ambiente para perceber onde cada tamanho pode ser utilizado.
Não mostrar tudo explicitamente.
8. PUZZLES DA FASE 1
Adicionar puzzles baseados em:

* relógios;
* horários;
* símbolos;
* marcas no ambiente;
* objetos deslocados;
* elementos repetidos;
* diferenças entre salas;
* pistas escondidas.

As pistas podem formar uma relação entre diferentes áreas.
Exemplo:
um símbolo encontrado na sala principal pode aparecer novamente em uma área aparentemente sem relação.
O jogador deve perceber a conexão.
Não colocar setas indicando o caminho.
Não colocar:
"VÁ PARA A SALA X."
A informação deve estar no ambiente.
9. PARKOUR DA FASE 1
O parkour existe, mas não deve ser a fase inteira.
Ele deve fazer parte da investigação.
O jogador eventualmente percebe que precisa alcançar uma área elevada/inacessível.
Para chegar até ela, precisa utilizar:

* plataformas;
* tamanho correto de Alice;
* timing;
* saltos;
* observação.

No final dessa progressão está o relógio quebrado do Coelho.
Ao pegá-lo:

* som de item sendo coletado;
* pequena pausa;
* tic-tac;
* reação de Alice;
* novo evento narrativo.

A obtenção do relógio deve parecer importante.
10. CHECKPOINT DA FASE 1
Não criar checkpoint simplesmente porque uma parte ficou difícil.
O checkpoint deve representar uma conquista real.
Exemplo:
Alice resolveu determinado conjunto de pistas e alcançou o relógio.
A partir desse momento, o progresso fica salvo.
Se morrer depois:
não obrigar o jogador a repetir toda a investigação anterior.
11. FINAL DA FASE 1
Alice possui o relógio quebrado.
O tic-tac começa.
A porta que antes estava inacessível agora pode ser aberta.
Isso leva à Fase 2.
A transição deve ser cinematográfica.
Usar:

* silêncio;
* tic-tac;
* porta;
* mudança de ambiente;
* vento/galhos;
* atmosfera da floresta.

12. FASE 2 — FLORESTA / CHÁ
A segunda fase acontece em uma floresta devastada.
É o lugar onde acontecia o chá/café de Alice.
Agora está destruído.
Há:

* objetos quebrados;
* louças;
* mesas;
* elementos do chá;
* vegetação;
* sangue;
* rastros;
* galhos;
* sinais de violência.

Não transformar tudo em gore gratuito.
O horror deve vir principalmente da sensação de que algo terrível aconteceu ali.
13. ENTRADA DA FASE 2
Alice atravessa a porta.
O cenário muda completamente.
O jogador percebe imediatamente que deixou o quarto para trás.
A floresta deve parecer maior e mais aberta.
Existe um novo objetivo.
Alice precisa seguir os rastros deixados pelo Coelho.
Uma caixa de diálogo apresenta a pista.
Ela deve indicar algo semelhante a:
siga o sangue e os pelos deixados pelo Coelho.
Mas sem transformar a experiência em GPS.
14. INVESTIGAÇÃO DA FLORESTA
A floresta deve exigir exploração.
O jogador encontra:

* sangue;
* pelos;
* objetos;
* marcas;
* partes de roupas;
* elementos deslocados;
* pistas ambientais.

Alguns rastros podem terminar.
Outros podem levar a locais aparentemente errados.
Algumas pistas devem exigir interpretação.
Exemplo de pista:
"Ele deixou a mesa antes que o chá esfriasse."
O jogador deve pensar:
O que aconteceu na mesa?
Onde alguém poderia ter ido?
Qual elemento do cenário confirma isso?
15. COMIDA PODRE
Existem alimentos estragados espalhados pelo cenário.
Alguns causam dano quando Alice entra em contato.
Eles são obstáculos permanentes.
Mas não tornar absolutamente todos os elementos perigosos.
O jogador deve observar.
Isso cria tensão sem virar tentativa e erro irritante.
16. ROUPA DO COELHO
Em determinado momento Alice encontra um pedaço da roupa do Coelho.
Esse é um evento importante.
Ao encontrar a roupa:

* som de descoberta;
* pausa;
* reação de Alice;
* nova pista;
* alteração no ambiente.

O fragmento pode possuir uma marca ou símbolo.
Essa marca deve se relacionar com algo encontrado anteriormente.
Assim o jogador percebe que as pistas das fases estão conectadas.
17. O ESPELHO
Depois da descoberta da roupa, um espelho aparece no mapa.
Ele deve parecer deslocado.
Não deve simplesmente parecer um objeto normal.
O jogador pode perceber que existe algo errado nele.
Ao se aproximar:
inicia a cinematics HIGHSFIELD 03.
18. ALICE DEMON
A Alice Demon deve utilizar exatamente o asset oficial fornecido.
Não criar uma nova versão.
Não alterar identidade.
Não trocar roupa.
Não modificar cabelo.
Não criar uma versão 3D.
Não transformar em outro monstro.
A diferença deve vir principalmente de:

* movimento;
* expressão;
* timing;
* som;
* comportamento;
* câmera.

A Alice Demon deve ser ameaçadora.
Seus movimentos devem ser diferentes dos movimentos normais da Alice.
Ela não deve parecer uma simples skin.
19. PERSEGUIÇÃO
Depois da aparição da Demon:
o controle retorna ao jogador.
A mensagem:
CORRA.
pode aparecer rapidamente.
A Demon começa a perseguir Alice.
A perseguição não deve ser apenas velocidade máxima.
A distância entre as duas deve variar.
A Demon pode:

* desaparecer brevemente;
* reaparecer;
* surgir mais próxima;
* diminuir a distância;
* ficar fora da tela;
* ser percebida pelos sons.

Não exagerar no desaparecimento.
A ameaça precisa continuar compreensível.
20. CHAVE DA FASE 2
Durante a perseguição aparece a chave necessária para sair.
Alice precisa:

1. localizar a chave;
2. pegá-la;
3. sobreviver;
4. encontrar a porta;
5. abrir a porta.

A chave deve ser um objetivo real durante a perseguição.
21. CHECKPOINT DA FASE 2
O checkpoint principal deve ocorrer depois que Alice conclui a investigação necessária e passa pelo evento do espelho.
Não colocar checkpoint simplesmente antes da perseguição.
A ideia é:
descoberta → evento sobrenatural → progresso salvo → perseguição.
22. FASE 3 — TABULEIRO DE XADREZ
A terceira fase acontece em um enorme tabuleiro de xadrez destruído.
Essa é a última fase jogável.
Não criar uma quarta fase.
O ambiente deve ser estranho e ameaçador.
As peças de xadrez estão em movimento constante.
O jogador precisa atravessar o tabuleiro e encontrar as pistas.
23. MOVIMENTAÇÃO DAS PEÇAS
As peças devem possuir padrões reconhecíveis.
Podem utilizar, de maneira temática, movimentos inspirados em:

* torre;
* bispo;
* cavalo;
* rainha;
* rei.

A intenção não é transformar o jogo em uma partida tradicional de xadrez.
É criar um puzzle de observação e timing.
O jogador deve observar:
como as peças se movimentam → onde existem brechas → quando atravessar.
24. PISTAS NO XADREZ
As pistas importantes estão espalhadas pelo tabuleiro.
Alice precisa encontrar todas.
Algumas podem estar:

* atrás de peças;
* em áreas perigosas;
* em caminhos temporariamente bloqueados;
* em locais que exigem timing;
* associadas a símbolos anteriores.

As pistas das três fases devem poder formar uma compreensão maior da história.
O jogador que prestou atenção terá uma experiência melhor no final.
25. FINAL DA FASE 3
Quando todas as pistas forem encontradas:
as peças começam a parar.
Uma por uma.
Silêncio.
Uma peça se move.
CLAC.
Outra.
CLAC.
Outra.
As peças começam a formar uma letra/palavra.
O jogador percebe que a movimentação estava formando uma mensagem.
Alice observa.
A expressão dela muda de:
confusão → compreensão → medo.
Então ocorre a revelação final.
26. MORTE DO COELHO
Depois da formação da mensagem:
deve existir uma caixa de diálogo final contendo uma descrição detalhada do assassinato do Coelho.
Essa revelação deve utilizar as pistas coletadas durante as três fases.
Não transformar isso simplesmente em:
"O Coelho morreu."
O jogador deve entender:

* o que aconteceu;
* onde aconteceu;
* como aconteceu;
* quais pistas levavam até aquilo;
* qual foi o papel de Alice;
* qual foi o papel da entidade/ameaça;
* por que os acontecimentos das fases estavam conectados.

A revelação deve ser perturbadora.
Não precisa depender de gore explícito.
O horror pode estar na compreensão.
27. MOVIMENTAÇÃO DA ALICE
A movimentação precisa ser natural.
Estados principais:
`IDLE`
`WALK`
`RUN`
`JUMP`
`FALL`
`LAND`
`DAMAGE`
`BREATHLESS`
Regras:

* não deslizar;
* não flutuar;
* não atravessar o chão;
* não deixar os pés desconectados;
* braços e pernas devem acompanhar o movimento;
* cabeça e torso devem acompanhar a direção;
* cabelo deve acompanhar o movimento quando possível;
* não exagerar nas animações.

28. DIREÇÃO
Movimentação:
direita = aumentar X
esquerda = diminuir X
Não utilizar rotação física do sprite para representar direção.
Não virar Alice de cabeça para baixo.
Não inverter verticalmente.
Não utilizar flip incorreto.
Se existirem sprites direcionais diferentes:
usar os sprites corretos.
Se não existirem:
não inventar novos sprites.
29. MOVIMENTAÇÃO EM CINEMATICS
Durante cinematics, Alice deve:

* andar naturalmente;
* parar naturalmente;
* olhar para objetos;
* virar a cabeça;
* movimentar o corpo antes de mudar completamente de direção;
* reagir aos acontecimentos;
* demonstrar medo através de postura;
* respirar;
* recuar quando necessário.

Não fazer:

* movimentos robóticos;
* teletransporte;
* mudanças instantâneas;
* animações exageradas;
* cabeça girando de maneira impossível;
* braços desconectados;
* pernas atravessando o corpo.

30. MOVIMENTAÇÃO DO COELHO
O Coelho também deve parecer vivo e natural nas cinematics.
Movimentos:

* olhar;
* virar a cabeça;
* observar o relógio;
* observar Alice;
* reagir;
* respirar;
* movimentar o corpo de forma coerente.

Se o asset disponível não possuir determinada animação:
não inventar.
Solicitar asset.
31. MOVIMENTAÇÃO DA ALICE DEMON
A Demon deve possuir linguagem corporal própria.
Ela deve parecer:

* errada;
* antinatural;
* ameaçadora;
* controlada.

Evitar movimentos exageradamente rápidos o tempo inteiro.
O medo funciona melhor quando ela fica parada por alguns segundos.
Movimentos possíveis:

* cabeça inclinando lentamente;
* olhar fixo;
* sorriso surgindo lentamente;
* aproximação controlada;
* movimentos bruscos apenas quando necessário.

32. HIGHSFIELD — CINEMATICS
Existem EXATAMENTE 5 HIGHSFIELD.
Não criar outros sem autorização.
As cinematics devem parecer parte do mesmo universo visual.
Não utilizar personagens genéricos.
Não transformar os personagens em personagens realistas diferentes.
Preservar a identidade dos assets.
HIGHSFIELD 01 — O RELÓGIO
Duração aproximada:
20 segundos.
Objetivo:
mostrar Alice e o Coelho antes do desaparecimento e estabelecer o relógio como elemento importante.
Cenário
Utilizar um ambiente coerente com o universo de Alice.
Não usar a floresta destruída nesta cena.
O local deve parecer habitado, porém estranho.
Iluminação baixa.
Sombras profundas.
Uma mesa.
Uma cadeira.
O relógio.
Alice e o Coelho.
0–3 segundos
A câmera mostra lentamente o ambiente.
Alice está próxima do Coelho.
Os dois estão relativamente tranquilos.
Nenhum movimento exagerado.
3–6 segundos
O Coelho olha para o relógio.
Depois olha para Alice.
Alice percebe o movimento e olha para ele.
O Coelho volta a olhar para o relógio.
6–9 segundos
Começa o som:
TIC
TAC
A câmera começa a aproximar lentamente do relógio.
Não utilizar música alta.
Deixar o relógio dominar o som.
9–12 segundos
Close no relógio.
Os ponteiros continuam funcionando.
TIC
TAC
Alice aparece parcialmente ao fundo.
Ela observa o objeto.
12–14 segundos
O relógio faz:
TIC.
Silêncio.
O próximo:
TAC
não acontece.
O relógio parou.
14–17 segundos
O Coelho percebe.
Olha para o relógio.
Depois olha para Alice.
Alice olha para o Coelho.
A expressão dos dois muda.
Não é pânico.
É a sensação de que alguma coisa está errada.
17–19 segundos
Um último:
TIC.
O ponteiro se movimenta brevemente.
Silêncio.
Alice permanece imóvel.
19–20 segundos
Corte para preto.
O som do tic-tac continua por um instante.
Depois desaparece.
Entrar na Fase 1.
HIGHSFIELD 02 — A PORTA
Duração aproximada:
20 segundos.
Objetivo:
conectar a Fase 1 com a Fase 2.
Alice acabou de obter o relógio quebrado.
0–3 segundos
Alice está diante da porta que anteriormente estava bloqueada.
Ela segura/possui o relógio.
Olha para ele.
3–6 segundos
O relógio começa a fazer:
TIC
TAC
Mesmo estando quebrado.
Alice levanta ligeiramente o olhar.
Ela percebe que o som está vindo do objeto.
6–9 segundos
A câmera aproxima do relógio.
TIC
TAC
O som começa a ficar mais presente.
Alice olha para a porta.
9–12 segundos
A porta começa a abrir lentamente.
Som:
porta antiga abrindo.
Atrás dela inicialmente existe apenas escuridão.
12–15 segundos
A abertura revela a floresta.
O ambiente é frio.
Galhos.
Escuridão.
Um pouco de luz distante.
Alice não entra imediatamente.
Ela olha para o relógio.
Depois para a porta.
15–18 segundos
Alice dá alguns passos em direção à porta.
Para por um instante.
Respira.
Então atravessa.
A câmera acompanha Alice por trás.
18–20 segundos
Ao atravessar a porta:
corte/transição para a floresta da Fase 2.
Entram:

* galhos;
* vento/ambiente;
* passos de Alice na floresta.

O controle volta para o jogador.
HIGHSFIELD 03 — O ESPELHO
Duração aproximada:
20 segundos.
Objetivo:
apresentar Alice Demon.
0–3 segundos
Alice caminha lentamente em direção ao espelho.
Ela está desconfiada.
A câmera acompanha lateralmente ou por trás.
3–5 segundos
Alice para.
Olha para o espelho.
A reflexão parece normal.
5–7 segundos
Alice faz um pequeno movimento.
A reflexão acompanha exatamente.
Ela movimenta a cabeça.
A reflexão acompanha.
Tudo parece normal.
7–9 segundos
Alice muda novamente a posição.
Desta vez:
a reflexão demora.
A diferença é pequena.
Quase imperceptível.
9–11 segundos
Alice percebe.
Ela dá um passo para trás.
A reflexão permanece onde estava.
Silêncio.
11–13 segundos
Dentro do espelho surge a Alice Demon.
Ela simplesmente está parada.
O olhar está diretamente em Alice.
Alice fica imóvel.
13–15 segundos
A Demon inclina lentamente a cabeça.
Sem tirar os olhos de Alice.
Um sorriso começa a aparecer.
15–17 segundos
A Demon se aproxima do interior do espelho.
Ela coloca a mão contra a superfície.
Som:
espelho rangendo.
17–19 segundos
A Demon atravessa o espelho.
Primeiro a mão.
Depois o braço.
Depois o corpo.
Não fazer teletransporte.
19–20 segundos
A Demon está fora do espelho.
Alice recua.
A Demon dá um passo.
Corte para gameplay.
Controle retorna imediatamente.
Começa a perseguição.
HIGHSFIELD 04 — A REVELAÇÃO
Duração aproximada:
20 segundos.
Objetivo:
encerrar a história principal.
0–4 segundos
Alice está no centro do tabuleiro.
Todas as pistas foram coletadas.
As peças ainda estão se movimentando.
Então começam a parar.
Uma por uma.
4–10 segundos
Silêncio.
Uma peça se move.
CLAC.
Outra.
CLAC.
Outra.
As peças começam a formar uma letra/mensagem.
A câmera acompanha a formação.
10–13 segundos
Alice observa.
Sua expressão muda.
Ela começa a compreender.
13–16 segundos
A câmera aproxima de Alice.
Ela olha para as peças.
Depois para uma das pistas que carregou.
A conexão fica clara.
16–18 segundos
O ambiente escurece.
O som do relógio volta.
TIC.
TAC.
18–20 segundos
Corte para preto.
Então aparece a caixa de diálogo final.
Essa caixa deve conter a descrição detalhada do assassinato do Coelho.
A descrição deve ser construída com base nas pistas coletadas.
Depois:
silêncio.
Fim da história principal.
HIGHSFIELD 05 — PÓS-CRÉDITOS
Duração:
10–15 segundos.
Esta cena NÃO é uma quarta fase.
É apenas um stinger pós-créditos.
0–4 segundos
Tela preta.
Silêncio.
Então:
TIC
TAC
4–7 segundos
Surge parcialmente o relógio.
Ambiente escuro.
Não revelar completamente onde ele está.
7–10 segundos
O relógio se movimenta.
Um som de respiração pode ser ouvido.
Não mostrar claramente quem está respirando.
10–13 segundos
Uma pequena silhueta ou movimento aparece no fundo.
Não confirmar imediatamente quem é.
13–15 segundos
Silêncio.
Último:
TIC.
Corte para preto.
Fim.
A intenção é deixar uma dúvida:
o Coelho realmente morreu?
Não confirmar.
Não criar uma quarta fase.
33. ÁUDIO
Já existem assets de áudio disponíveis.
NÃO pesquisar novamente sons que já existem.
Os assets disponíveis incluem:

1. trailer sound
2. whispers
3. homepage music
4. tense music
5. door creak
6. wooden floor
7. effect sounds
8. tic-tac
9. door opening
10. item pickup
11. item drop
12. fall in forest
13. running
14. apparition
15. scream
16. chess sounds
17. tense silence
18. mirror creaking
19. clothing sound
20. branches
21. rabbit dying sound
22. Alice wooden footsteps
23. Alice forest footsteps
24. Alice chess footsteps
25. jump
26. landing
27. damage
28. fall
29. Alice breathing
30. Alice breathless breathing

Utilizar esses assets antes de procurar/criar qualquer outro.
34. FILOSOFIA DE ÁUDIO
Não deixar música tocando o tempo inteiro.
Utilizar:
som → silêncio → som → música → silêncio.
O silêncio é uma ferramenta de terror.
Fase 1
Priorizar:

* passos;
* madeira;
* portas;
* ambiente;
* tic-tac;
* pequenos efeitos.

Quando Alice estiver próxima do relógio:
reduzir música.
Dar prioridade ao tic-tac.
Fase 2
Utilizar:

* floresta;
* galhos;
* passos;
* respiração;
* efeitos de descoberta.

No espelho:

* silêncio;
* espelho rangendo;
* aparição;
* sussurro;
* grito, se necessário.

Durante perseguição:

* corrida;
* respiração ofegante;
* música tensa;
* presença da Demon.

Fase 3
Priorizar:

* passos no xadrez;
* sons das peças;
* silêncio;
* CLAC das peças;
* sons associados às pistas.

Na formação da mensagem:
usar os sons das peças com bastante espaço entre eles.
Não transformar em música constante.
35. HUD
O HUD deve utilizar símbolos de cartas.
Não utilizar corações.
Vida:
♠ ♠ ♠
Alice começa com três vidas.
Ao receber dano:
uma espada desaparece.
Exemplo:
`♠ ♠ ♠`
↓
`♠ ♠`
↓
`♠`
↓
morte/checkpoint.
O HUD deve ser discreto.
Não utilizar cores infantis.
36. CONTROLES DESKTOP
Os controles devem ser simples.
Movimentação:

* A / seta esquerda;
* D / seta direita;
* espaço para pular;
* tecla de interação quando necessário.

Evitar quantidade excessiva de teclas.
37. CONTROLES MOBILE
O jogo precisa funcionar em celular.
Criar:
joystick virtual no lado esquerdo.
Botões de ação no lado direito.
Os botões precisam ter:

* tamanho adequado;
* espaçamento;
* boa resposta ao toque;
* não cobrir elementos importantes;
* não ficar pequenos demais.

A interface precisa continuar limpa.
38. RESPONSIVIDADE
O jogo deve funcionar em:

* desktop;
* notebook;
* celular.

Adaptar:

* resolução;
* escala;
* HUD;
* controles;
* caixas de diálogo;
* tamanho dos elementos.

Não deixar texto ilegível no celular.
39. MENU PRINCIPAL
Criar um menu simples e sombrio.
Opções:
JOGAR
HISTÓRIA
TUTORIAL
CONFIGURAÇÕES
CRÉDITOS
Os créditos devem ser discretos.
40. CONFIGURAÇÕES
Não criar um menu enorme.
Apenas opções simples, como:

* volume;
* efeitos;
* música;
* tela.

41. HISTÓRIA DO MENU
A opção HISTÓRIA deve apresentar uma introdução narrativa.
Não revelar toda a história.
Pode utilizar este texto como base:
Dizem que toda história começa quando alguém abre uma porta.
A de Alice começou quando ela percebeu que o relógio do Coelho havia parado.
Não havia vento naquela tarde.
Ainda assim, as cortinas se moviam.
O relógio estava sobre a mesa, aberto ao meio, com os ponteiros presos em um horário que Alice não reconhecia.
03:17.
Ela esperou pelo tic-tac seguinte.
Ele não veio.
— Coelho?
Nenhuma resposta.
Alice caminhou pela sala.
Havia uma xícara quebrada no chão.
Uma cadeira caída.
Marcas que ela não lembrava de ter deixado.
E então percebeu uma coisa.
O Coelho havia levado seu relógio para todos os lugares.
Todos.
Menos aquele.
Alice pegou o objeto.
Estava frio.
Frio demais.
Por um instante, teve a impressão de ouvir alguma coisa atrás dela.
Uma respiração.
Virou-se.
Nada.
Apenas o corredor escuro.
Ela voltou a olhar para o relógio.
O ponteiro dos segundos havia se movido.
03:18.
Alice deixou o relógio cair.
Foi então que ouviu.
Um sussurro vindo de algum lugar dentro da casa.
Uma voz baixa.
Quase infantil.
Quase familiar.
"Não procure por ele."
Alice ficou imóvel.
O silêncio voltou.
Mas alguma coisa havia mudado.
Ela sabia disso.
O Coelho não havia simplesmente desaparecido.
Alguém — ou alguma coisa — havia levado ele.
E, se quisesse encontrá-lo, teria que seguir aquilo que ele deixou para trás.
O relógio.
Os rastros.
As roupas.
As marcas.
As pistas.
E talvez, no fim do caminho, descobriria a verdade.
Mesmo que desejasse nunca tê-la encontrado.
Porque naquele lugar havia uma regra que Alice ainda não conhecia:
algumas coisas não querem ser encontradas.
E algumas histórias...
não terminam quando alguém morre.
42. TUTORIAL
O tutorial deve ensinar apenas o necessário.
Ensinar:

* andar;
* pular;
* interagir;
* coletar itens;
* entender dano;
* utilizar a mecânica de tamanho.

Não entregar soluções dos puzzles.
Não explicar a história.
Não apontar todas as pistas.
O jogador deve aprender a observar.
43. PRINCÍPIO DE DESIGN DE PUZZLES
Nunca utilizar exclusivamente:
"vá para X."
Preferir:
pista → interpretação → descoberta.
O jogador deve pensar.
As pistas podem ser:

* visuais;
* sonoras;
* ambientais;
* objetos;
* símbolos;
* horários;
* posições;
* padrões.

Algumas pistas podem parecer irrelevantes inicialmente e fazer sentido posteriormente.
44. HORROR
O jogo deve evitar depender somente de jumpscare.
Utilizar:

* silêncio;
* expectativa;
* sons distantes;
* coisas que se movem quando não deveriam;
* ambientes vazios;
* mudanças sutis;
* objetos fora do lugar;
* perseguição;
* sensação de estar sendo observado;
* revelação narrativa.

Jumpscares podem existir, mas devem ser usados com moderação.
45. PRINCÍPIO DE CÂMERA
Durante gameplay:
a câmera deve acompanhar Alice de maneira confortável.
Durante cinematics:
a câmera pode:

* aproximar;
* afastar;
* fazer pan;
* acompanhar personagem;
* mostrar objetos;
* esconder informações;
* revelar lentamente.

Não utilizar movimentos de câmera excessivamente rápidos.
O terror precisa de tempo.
46. O QUE O JOGADOR DEVE SENTIR
Fase 1
"Tem alguma coisa errada aqui."
Fase 2
"Alguém esteve aqui."
Fase 2 — Demon
"Ela está vindo."
Fase 3
"Essas pistas estavam contando alguma coisa."
Final
"Eu entendi o que aconteceu."
E então:
"Espera... então o que aconteceu com o Coelho?"
47. REGRA DE QUALIDADE
Prioridade:
qualidade > quantidade.
É melhor ter:
3 puzzles muito bons
do que
10 puzzles genéricos.
É melhor ter:
1 perseguição muito bem construída
do que
5 perseguições repetitivas.
É melhor ter:
um cenário pequeno e detalhado
do que
um mapa enorme vazio.
48. REGRA CONTRA CONTEÚDO DESNECESSÁRIO
Não adicionar:

* quarta fase;
* personagens não solicitados;
* sistemas complexos sem necessidade;
* lojas;
* inventário gigante;
* árvore de habilidades;
* moedas;
* RPG;
* armas;
* diálogos excessivos;
* missões secundárias aleatórias.

O projeto precisa continuar focado.
49. ESTRUTURA SUGERIDA DE PASTAS
Dentro de:
`C:\Users\Bedetti\Documents\ms pickles\Alice terror`
organizar de maneira clara.
Por exemplo:
`assets/`
`assets/characters/`
`assets/scenarios/`
`assets/audio/`
`assets/ui/`
`animations/`
`phases/`
`cinematics/`
`scripts/`
`docs/`
`build/`
A estrutura pode ser adaptada ao funcionamento real do projeto.
Não mover arquivos importantes sem verificar dependências.
Não apagar arquivos sem autorização.
50. REGRA PARA CÓDIGO
O código deve ser:

* organizado;
* legível;
* modular;
* comentado quando necessário;
* fácil de corrigir;
* sem duplicação desnecessária.

Antes de criar uma nova função:
verifique se já existe uma função que faça a mesma coisa.
Antes de criar um novo asset:
verifique se já existe.
Antes de criar um novo sistema:
verifique se ele é realmente necessário.
51. REGRA PARA BUGS
Quando encontrar um bug:

1. identificar a causa;
2. explicar o problema;
3. corrigir a causa;
4. testar o comportamento;
5. verificar se a correção não quebrou outra parte.

Não fazer alterações aleatórias apenas para "tentar resolver".
52. REGRA ESPECIAL PARA MOVIMENTO
Se Alice clicar para esquerda:
Alice deve realmente andar para esquerda.
Se clicar para direita:
Alice deve realmente andar para direita.
Nunca permitir:

* Alice virar de cabeça para baixo;
* Alice andar para um lado e olhar para outro;
* sprite virar verticalmente;
* animação invertida;
* personagem deslizar;
* direção visual contradizer movimento.

53. REGRA ESPECIAL PARA CINEMATICS
Cada cinematics deve respeitar:

* posição;
* direção;
* escala;
* proporção;
* identidade visual;
* continuidade.

Não fazer personagens aparecerem magicamente em posições diferentes.
Se Alice estiver à esquerda:
a cena seguinte precisa respeitar isso, salvo quando a câmera mostrar explicitamente a mudança.
54. REGRA DE CONTROLE DO JOGADOR
Durante cinematics:
controle do jogador desativado.
Durante gameplay:
controle ativo.
Nunca permitir que o jogador mova Alice durante uma sequência que deveria ser automática.
Ao final:
restaurar controle exatamente no momento planejado.
Na HIGHSFIELD 03:
o controle retorna imediatamente depois que a Demon atravessa o espelho.
Na HIGHSFIELD 04:
não restaurar controle depois da revelação final.
55. REGRA DE SOM
Todo evento importante deve possuir feedback sonoro apropriado quando existir asset disponível.
Exemplos:
item coletado → item pickup
porta → door opening
dano → damage
pulo → jump
queda → fall
passos → footsteps
corrida → running
espelho → mirror creaking
aparição → apparition
xadrez → chess sounds
relógio → tic-tac
Não adicionar sons aleatórios apenas para preencher silêncio.
56. ANTES DE IMPLEMENTAR
Depois de analisar o diretório:
apresente um relatório.
O relatório deve responder:
Assets encontrados
Quais personagens existem?
Quais animações existem?
Quais cenários existem?
Quais sons existem?
Assets faltantes
Existe alguma animação essencial que não está disponível?
Código
O que já existe?
O que pode ser reaproveitado?
Estrutura
Como o projeto está organizado?
Problemas
Existem bugs?
Existem assets duplicados?
Existem arquivos fora do lugar?
Plano
Qual será a ordem de implementação?
57. ORDEM DE IMPLEMENTAÇÃO
Não tente construir tudo de uma vez.
Priorizar:

1. estrutura do projeto;
2. movimentação da Alice;
3. câmera;
4. colisões;
5. controles desktop;
6. controles mobile;
7. HUD;
8. Fase 1;
9. puzzles da Fase 1;
10. HIGHSFIELD 01;
11. HIGHSFIELD 02;
12. Fase 2;
13. HIGHSFIELD 03;
14. perseguição;
15. Fase 3;
16. HIGHSFIELD 04;
17. menu;
18. história;
19. tutorial;
20. HIGHSFIELD 05;
21. áudio;
22. testes;
23. correções;
24. polimento.

Essa ordem pode ser ajustada caso a estrutura real do projeto exija outra abordagem.
58. TESTES OBRIGATÓRIOS
Testar:

* movimento para esquerda;
* movimento para direita;
* pulo;
* queda;
* colisão;
* dano;
* morte;
* checkpoint;
* coleta de itens;
* mudança de tamanho;
* portas;
* transições;
* cinematics;
* áudio;
* perseguição;
* peças de xadrez;
* final;
* mobile;
* desktop.

Verificar especificamente se:
nenhum personagem fica de cabeça para baixo.
nenhum sprite é substituído por um personagem inventado.
nenhuma fase adicional é criada.
nenhum arquivo é criado fora da pasta oficial.
59. REGRA FINAL — NÃO INVENTAR
Se alguma coisa não estiver especificada:
não assumir automaticamente que deve ser adicionada.
Primeiro avaliar se é necessária.
Se envolver:

* personagem;
* sprite;
* animação;
* história;
* fase;
* mecânica importante;

e não houver informação suficiente:
parar e perguntar.
Não preencher lacunas importantes inventando conteúdo.
60. OBJETIVO FINAL
O resultado deve ser um jogo de horror em pixel art com:

* exatamente 3 fases;
* narrativa conectada;
* investigação;
* puzzles;
* parkour;
* exploração;
* perseguição;
* suspense;
* atmosfera;
* cinematics;
* áudio bem utilizado;
* controles desktop;
* controles mobile;
* checkpoints;
* dificuldade justa;
* identidade visual consistente;
* personagens preservados;
* assets originais respeitados.

A experiência deve fazer o jogador pensar:
"Eu preciso descobrir o que aconteceu."
E, no final:
"Agora eu entendi."
Mas também:
"Tem alguma coisa que ainda não está certa."
INSTRUÇÃO FINAL PARA VOCÊ, CLAUDE
NÃO COMECE ALTERANDO O PROJETO.
Primeiro acesse:
`C:\Users\Bedetti\Documents\ms pickles\Alice terror`
Faça uma análise completa do conteúdo.
Liste:

* estrutura;
* arquivos;
* personagens;
* animações;
* cenários;
* sons;
* código;
* assets faltantes;
* problemas encontrados.

Depois apresente um diagnóstico claro.
Só após essa análise e aprovação da desenvolvedora comece a modificar o projeto.
Não apague assets originais.
Não substitua personagens.
Não invente animações quando um asset estiver faltando.
Não crie quarta fase.
Não crie conteúdo aleatório.
Não espalhe arquivos para fora da pasta oficial.
O projeto deve ser construído com calma, priorizando qualidade, coerência, atmosfera e jogabilidade.
ALICE TERROR NÃO PRECISA SER GRANDE. PRECISA SER BEM FEITO.

IMPORTANTE — PROJETO PESSOAL

O Alice Terror é um projeto pessoal e deve permanecer totalmente separado dos projetos, contas e configurações da Solid.

Não utilizar conta, usuário, credenciais, GitHub, repositórios ou configurações da Solid/Leo neste projeto.

O único repositório autorizado para o Alice Terror é:
https://github.com/madutiam/Jogo-de-terror

Não alterar configurações globais do Git ou credenciais da máquina. Se alguma alteração desse tipo for necessária, parar e me avisar antes.

voce consegue fazer?