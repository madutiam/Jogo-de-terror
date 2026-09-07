# Fatia as folhas de sprite da Alice em quadros individuais, normalizados.
#
#   powershell -ExecutionPolicy Bypass -File tools/fatiar-alice.ps1 `
#       -Config tools/alice-folhas.json -Saida assets/characters/alice
#
# O que este script resolve, e que um recorte ingenuo nao resolve:
#
# 1. FUNDO. Duas folhas vieram com fundo preto opaco, e a Alice tem laco e
#    sapatos azul-marinho quase pretos. Separar por cor comeria a borda deles.
#    Entao o fundo e removido por PREENCHIMENTO A PARTIR DAS BORDAS: so vira
#    transparente o preto que esta ligado a moldura da imagem. O laco dela esta
#    cercado de cabelo claro, nunca e alcancado.
#
# 2. ALINHAMENTO. Se cada quadro for recortado no seu proprio contorno, a Alice
#    treme ao trocar de quadro, porque o cabelo balanca e muda a largura. Aqui
#    cada quadro e ancorado pelo CENTRO DO VESTIDO (o azul), que e a parte mais
#    estavel do desenho. Cabelo, sapato e avental nao entram na conta.
#
# 3. LINHA DE CHAO. Todos os quadros saem com os pes na mesma altura, na base da
#    tela do sprite, para a origem poder ser (0.5, 1) no jogo.
#
# Nada e escrito por cima dos originais. As folhas so sao lidas.

param(
  [Parameter(Mandatory = $true)][string]$Config,
  [Parameter(Mandatory = $true)][string]$Saida,
  [switch]$SemGravar
)

Add-Type -AssemblyName System.Drawing

# ---------------------------------------------------------------- leitura

function Carregar($caminho) {
  $bmp = [System.Drawing.Bitmap]::FromFile($caminho)
  $ret = New-Object System.Drawing.Rectangle 0, 0, $bmp.Width, $bmp.Height
  $trava = $bmp.LockBits($ret, [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
                         [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $passo = $trava.Stride
  $dados = New-Object byte[] ($passo * $bmp.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($trava.Scan0, $dados, 0, $dados.Length)
  $bmp.UnlockBits($trava)
  $w = $bmp.Width; $h = $bmp.Height
  $bmp.Dispose()
  return [pscustomobject]@{ dados = $dados; passo = $passo; largura = $w; altura = $h }
}

# ------------------------------------------------------- mascara de conteudo

# Devolve um byte[] do tamanho da imagem: 1 = desenho, 0 = fundo.
#
# Para folha transparente basta o alpha. Para folha de fundo chapado, o fundo e
# descoberto por preenchimento a partir das quatro bordas: so e fundo o pixel
# parecido com a cor de fundo E ligado a borda.
function MascaraDeConteudo($img, $modoFundo, $corFundo, $tolerancia) {
  $w = $img.largura; $h = $img.altura; $passo = $img.passo; $d = $img.dados
  $mascara = New-Object byte[] ($w * $h)

  if ($modoFundo -eq 'transparente') {
    # Algumas folhas tem uma lavagem de cor por cima do fundo, com alpha baixo.
    # Um limiar mais alto separa o desenho dessa lavagem.
    $limiar = if ($tolerancia -gt 0) { $tolerancia } else { 40 }
    for ($y = 0; $y -lt $h; $y++) {
      $linha = $y * $passo; $baseM = $y * $w
      for ($x = 0; $x -lt $w; $x++) {
        if ($d[$linha + $x * 4 + 3] -ge $limiar) { $mascara[$baseM + $x] = 1 }
      }
    }
    return [pscustomobject]@{ mascara = $mascara; pareceFundo = (New-Object byte[] ($w * $h)) }
  }

  # fundo chapado: tudo e conteudo ate o preenchimento provar o contrario
  for ($i = 0; $i -lt $mascara.Length; $i++) { $mascara[$i] = 1 }

  $fr = [int]$corFundo[0]; $fg = [int]$corFundo[1]; $fb = [int]$corFundo[2]
  $tol2 = $tolerancia * $tolerancia * 3

  # "Parece fundo?" resolvido de uma vez para a imagem inteira. Fica barato
  # depois, e deixa explicito o unico numero que importa aqui: a tolerancia.
  # Ela precisa ser MENOR que a distancia entre o fundo e a parte mais escura
  # do desenho — no Coelho, o fundo e #030303 e a bota e #24222D.
  $pareceFundo = New-Object byte[] ($w * $h)
  for ($y = 0; $y -lt $h; $y++) {
    $linha = $y * $passo; $baseM = $y * $w
    for ($x = 0; $x -lt $w; $x++) {
      $i = $linha + $x * 4
      if ($d[$i + 3] -lt 40) { $pareceFundo[$baseM + $x] = 1; continue }
      $dr = [int]$d[$i + 2] - $fr; $dg = [int]$d[$i + 1] - $fg; $db = [int]$d[$i] - $fb
      if ((($dr * $dr) + ($dg * $dg) + ($db * $db)) -le $tol2) { $pareceFundo[$baseM + $x] = 1 }
    }
  }

  # Preenchimento a partir das bordas: so vira transparente o que parece fundo
  # E esta ligado a moldura da imagem. O que estiver cercado pelo desenho fica.
  $pilha = New-Object 'System.Collections.Generic.Stack[int]'
  for ($x = 0; $x -lt $w; $x++) {
    if ($pareceFundo[$x])                    { [void]$pilha.Push($x) }
    $b = ($h - 1) * $w + $x
    if ($pareceFundo[$b])                    { [void]$pilha.Push($b) }
  }
  for ($y = 0; $y -lt $h; $y++) {
    $e = $y * $w
    if ($pareceFundo[$e])                    { [void]$pilha.Push($e) }
    $dd = $e + $w - 1
    if ($pareceFundo[$dd])                   { [void]$pilha.Push($dd) }
  }

  Escoar $mascara $pareceFundo $w $h $pilha
  return [pscustomobject]@{ mascara = $mascara; pareceFundo = $pareceFundo }
}

# Esvazia a pilha de sementes, apagando da mascara tudo que parece fundo e esta
# ligado a alguma delas.
function Escoar($mascara, $pareceFundo, $w, $h, $pilha) {
  while ($pilha.Count -gt 0) {
    $p = $pilha.Pop()
    if (-not $mascara[$p]) { continue }   # ja marcado como fundo, nao repete
    $mascara[$p] = 0
    $y = [int]($p / $w); $x = $p - $y * $w
    if ($x -gt 0        -and $pareceFundo[$p - 1]  -and $mascara[$p - 1])  { [void]$pilha.Push($p - 1) }
    if ($x -lt ($w - 1) -and $pareceFundo[$p + 1]  -and $mascara[$p + 1])  { [void]$pilha.Push($p + 1) }
    if ($y -gt 0        -and $pareceFundo[$p - $w] -and $mascara[$p - $w]) { [void]$pilha.Push($p - $w) }
    if ($y -lt ($h - 1) -and $pareceFundo[$p + $w] -and $mascara[$p + $w]) { [void]$pilha.Push($p + $w) }
  }
}

# As folhas costumam ter reguas e molduras decorativas que FECHAM cada coluna
# numa caixa. O preenchimento que vem da borda da imagem nao entra nessas
# caixas, e sobra um bloco de fundo dentro do recorte. Semear tambem pelo
# perimetro do proprio recorte resolve: como a caixa foi escolhida com folga
# em volta do desenho, a borda dela e fundo.
function PreencherPelaCaixa($mascara, $pareceFundo, $w, $h, $x1, $y1, $x2, $y2) {
  $pilha = New-Object 'System.Collections.Generic.Stack[int]'
  for ($x = $x1; $x -lt $x2; $x++) {
    $a = $y1 * $w + $x;         if ($pareceFundo[$a]) { [void]$pilha.Push($a) }
    $b = ($y2 - 1) * $w + $x;   if ($pareceFundo[$b]) { [void]$pilha.Push($b) }
  }
  for ($y = $y1; $y -lt $y2; $y++) {
    $e = $y * $w + $x1;         if ($pareceFundo[$e]) { [void]$pilha.Push($e) }
    $d = $y * $w + ($x2 - 1);   if ($pareceFundo[$d]) { [void]$pilha.Push($d) }
  }
  Escoar $mascara $pareceFundo $w $h $pilha
}

# --------------------------------------------------------- achar os quadros

# Blocos de colunas com conteudo dentro da caixa. Se sair mais bloco que o
# esperado, junta os vizinhos mais proximos ate bater — e o caso do braco
# esticado que se separa do corpo por uma coluna vazia.
function BlocosDeColuna($mascara, $w, $x1, $y1, $x2, $y2, $esperado) {
  $cheia = New-Object bool[] ($x2 - $x1)
  for ($x = $x1; $x -lt $x2; $x++) {
    for ($y = $y1; $y -lt $y2; $y++) {
      if ($mascara[$y * $w + $x]) { $cheia[$x - $x1] = $true; break }
    }
  }
  $blocos = New-Object 'System.Collections.ArrayList'
  $dentro = $false; $ini = 0
  for ($k = 0; $k -lt $cheia.Length; $k++) {
    if ($cheia[$k] -and -not $dentro) { $dentro = $true; $ini = $k }
    elseif (-not $cheia[$k] -and $dentro) {
      $dentro = $false
      [void]$blocos.Add(@(($ini + $x1), ($k + $x1)))
    }
  }
  if ($dentro) { [void]$blocos.Add(@(($ini + $x1), ($cheia.Length + $x1))) }

  while ($esperado -gt 0 -and $blocos.Count -gt $esperado) {
    $menor = [int]::MaxValue; $onde = -1
    for ($k = 0; $k -lt ($blocos.Count - 1); $k++) {
      $vao = [int]$blocos[$k + 1][0] - [int]$blocos[$k][1]
      if ($vao -lt $menor) { $menor = $vao; $onde = $k }
    }
    if ($onde -lt 0) { break }
    $novo = @([int]$blocos[$onde][0], [int]$blocos[$onde + 1][1])
    $blocos.RemoveAt($onde + 1); $blocos[$onde] = $novo
  }
  # A virgula impede o PowerShell de desenrolar a lista em itens soltos.
  return ,$blocos
}

# ------------------------------------------------------ anotacoes soltas

# Algumas folhas trazem marcas de anotacao que NAO fazem parte do desenho —
# o "!?" vermelho da pose de estranhamento do Coelho, por exemplo. Elas estao
# soltas no fundo, longe do corpo, e sao de vermelho puro.
#
# Aqui os pedacos ligados sao separados dentro do bloco. O maior e o
# personagem. Qualquer outro que seja quase todo de vermelho puro e apagado.
# Respingo de sangue nao corre risco: o sangue do desenho e vinho escuro
# (R por volta de 127), nao passa no teste de vermelho puro.
function LimparAnotacoes($img, $mascara, $x1, $y1, $x2, $y2) {
  $w = $img.largura; $passo = $img.passo; $d = $img.dados
  $rotulo = @{}
  $componentes = New-Object 'System.Collections.ArrayList'
  $fila = New-Object 'System.Collections.Generic.Queue[int]'

  for ($y = $y1; $y -lt $y2; $y++) {
    for ($x = $x1; $x -lt $x2; $x++) {
      $p = $y * $w + $x
      if (-not $mascara[$p] -or $rotulo.ContainsKey($p)) { continue }
      $membros = New-Object 'System.Collections.Generic.List[int]'
      $vermelhos = 0
      $rotulo[$p] = $componentes.Count
      $fila.Enqueue($p)
      while ($fila.Count -gt 0) {
        $q = $fila.Dequeue()
        [void]$membros.Add($q)
        $qy = [int]($q / $w); $qx = $q - $qy * $w
        $i = $qy * $passo + $qx * 4
        if ([int]$d[$i + 2] -ge 150 -and [int]$d[$i + 1] -le 70 -and [int]$d[$i] -le 70) { $vermelhos++ }
        foreach ($v in @(($q - 1), ($q + 1), ($q - $w), ($q + $w))) {
          $vy = [int]($v / $w); $vx = $v - $vy * $w
          if ($vx -lt $x1 -or $vx -ge $x2 -or $vy -lt $y1 -or $vy -ge $y2) { continue }
          if (-not $mascara[$v] -or $rotulo.ContainsKey($v)) { continue }
          $rotulo[$v] = $componentes.Count
          $fila.Enqueue($v)
        }
      }
      [void]$componentes.Add([pscustomobject]@{ membros = $membros; vermelhos = $vermelhos })
    }
  }

  if ($componentes.Count -le 1) { return 0 }
  $maior = 0
  for ($k = 1; $k -lt $componentes.Count; $k++) {
    if ($componentes[$k].membros.Count -gt $componentes[$maior].membros.Count) { $maior = $k }
  }
  $apagados = 0
  for ($k = 0; $k -lt $componentes.Count; $k++) {
    if ($k -eq $maior) { continue }
    $c = $componentes[$k]
    if (($c.vermelhos / $c.membros.Count) -ge 0.6) {
      foreach ($p in $c.membros) { $mascara[$p] = 0 }
      $apagados += $c.membros.Count
    }
  }
  return $apagados
}

# ------------------------------------------------------------- ancoragem

# Centro horizontal do VESTIDO. O azul do vestido e a parte que menos muda de
# quadro para quadro — o cabelo voa, a saia gira, mas o tronco fica no lugar.
# Se nao houver azul suficiente (quadro deitado, por exemplo), cai para o
# centro de massa do desenho inteiro.
# VETO: pedaco do vizinho que caiu dentro desta celula.
#
# Um recorte retangular nao separa quadros que se entrelacam. No ultimo ataque
# da Alice Demon a garra levantada de um passa por cima do corpo do outro — mas
# em ALTURA diferente, entao dizer o retangulo do invasor resolve, sem nenhuma
# heuristica adivinhando de quem e cada pixel. Diferente de `apagar`, que muda a
# mascara da folha inteira, este veto vale so para o quadro que o declarou: o
# mesmo pixel continua inteiro no quadro a que pertence.
function DentroDeAlgum($rects, $x, $y) {
  if (-not $rects) { return $false }
  foreach ($r in $rects) {
    if ($x -ge [int]$r[0] -and $y -ge [int]$r[1] -and $x -lt [int]$r[2] -and $y -lt [int]$r[3]) {
      return $true
    }
  }
  return $false
}

function AncoraX($img, $mascara, $x1, $y1, $x2, $y2, $modo, $vetar) {
  $w = $img.largura; $passo = $img.passo; $d = $img.dados
  if ($modo -eq 'caixa') { return [pscustomobject]@{ x = (($x1 + $x2) / 2); origem = 'caixa'; pixels = 0 } }
  $somaAzul = 0.0; $nAzul = 0
  $somaTudo = 0.0; $nTudo = 0
  for ($y = $y1; $y -lt $y2; $y++) {
    $linha = $y * $passo; $baseM = $y * $w
    for ($x = $x1; $x -lt $x2; $x++) {
      if (-not $mascara[$baseM + $x]) { continue }
      if (DentroDeAlgum $vetar $x $y) { continue }
      $nTudo++; $somaTudo += $x
      $i = $linha + $x * 4
      $r = [int]$d[$i + 2]; $g = [int]$d[$i + 1]; $b = [int]$d[$i]
      if ($modo -eq 'vestido-escuro') {
        # O vestido da Alice Demon e verde-petroleo, nao azul: no teste acima
        # ela nao tem um pixel sequer de vestido, e a ancora caia no centro de
        # massa, que balanca junto com o cabelo. O que separa o tecido dela da
        # pele e do cabelo e o azul estar ACIMA do vermelho, e nao abaixo do
        # verde.
        if ($b -gt 40 -and $b -gt ($r + 15) -and ($b + 5) -ge $g) { $nAzul++; $somaAzul += $x }
      }
      elseif ($b -gt 90 -and $b -gt ($r + 40) -and $b -gt ($g + 15)) { $nAzul++; $somaAzul += $x }
    }
  }
  if ($modo -ne 'massa' -and $nAzul -ge 120) { return [pscustomobject]@{ x = ($somaAzul / $nAzul); origem = 'vestido'; pixels = $nAzul } }
  if ($nTudo -gt 0)   { return [pscustomobject]@{ x = ($somaTudo / $nTudo); origem = 'massa';    pixels = $nTudo } }
  return [pscustomobject]@{ x = (($x1 + $x2) / 2); origem = 'caixa'; pixels = 0 }
}

# Caixa util do desenho dentro do bloco.
function CaixaUtil($mascara, $w, $x1, $y1, $x2, $y2, $vetar) {
  $minx = [int]::MaxValue; $maxx = -1; $miny = [int]::MaxValue; $maxy = -1
  for ($y = $y1; $y -lt $y2; $y++) {
    $baseM = $y * $w
    for ($x = $x1; $x -lt $x2; $x++) {
      if ($mascara[$baseM + $x] -and -not (DentroDeAlgum $vetar $x $y)) {
        if ($x -lt $minx) { $minx = $x }
        if ($x -gt $maxx) { $maxx = $x }
        if ($y -lt $miny) { $miny = $y }
        if ($y -gt $maxy) { $maxy = $y }
      }
    }
  }
  if ($maxx -lt 0) { return $null }
  return [pscustomobject]@{ x1 = $minx; y1 = $miny; x2 = ($maxx + 1); y2 = ($maxy + 1) }
}

# ------------------------------------------------------------------ passo 1
# Levanta a medida de todos os quadros, sem gravar nada ainda. Precisamos das
# medidas de todos antes de decidir o tamanho da tela comum.

$cfg = Get-Content -Raw -Encoding UTF8 $Config | ConvertFrom-Json
$quadros = New-Object 'System.Collections.ArrayList'
$cacheImg = @{}
$cacheMascara = @{}

foreach ($folha in $cfg.folhas) {
  $caminho = $folha.arquivo
  if (-not (Test-Path $caminho)) { Write-Host ("FALTA a folha: " + $caminho); continue }
  Write-Host ("lendo " + (Split-Path $caminho -Leaf))
  $img = Carregar $caminho
  $cor = if ($folha.corDeFundo) { $folha.corDeFundo } else { @(0, 0, 0) }
  $tol = if ($folha.tolerancia) { [int]$folha.tolerancia } else { 46 }
  $mapa = MascaraDeConteudo $img $folha.fundo $cor $tol
  $mascara = $mapa.mascara
  $pareceFundo = $mapa.pareceFundo
  $cacheImg[$caminho] = $img
  $cacheMascara[$caminho] = $mascara

  foreach ($linha in $folha.linhas) {
    if ($folha.fundo -ne 'transparente') {
      PreencherPelaCaixa $mascara $pareceFundo $img.largura $img.altura `
        ([int]$linha.x1) ([int]$linha.y1) ([int]$linha.x2) ([int]$linha.y2)
    }
    # REGIOES DE LEGENDA, APAGADAS NA MAO
    #
    # `LimparAnotacoes` so remove componente que seja >=60% VERMELHO. Nas folhas
    # de personagem isso basta: os rotulos dela sao vermelhos. Na folha de
    # OBJETOS os subtitulos sao CLAROS -- "ABERTO (CLOSE)", "(~200px)", "03:17"
    # -- entao passavam pelo filtro e vinham gravados dentro do sprite. O
    # relogio de bolso aberto chegou no jogo com o texto da folha em cima dele,
    # e a HIGHSFIELD 02 mostrava isso em tela cheia.
    #
    # Aqui a regiao e DITA, nao adivinhada: nenhuma heuristica nova, nenhum
    # risco de comer parte do desenho.
    if ($linha.apagar) {
      $fora = 0
      foreach ($r in $linha.apagar) {
        $ax1 = [int]$r[0]; $ay1 = [int]$r[1]; $ax2 = [int]$r[2]; $ay2 = [int]$r[3]
        for ($y = $ay1; $y -lt $ay2; $y++) {
          for ($x = $ax1; $x -lt $ax2; $x++) {
            $p = $y * $img.largura + $x
            if ($mascara[$p]) { $mascara[$p] = 0; $fora++ }
          }
        }
      }
      Write-Host ("   {0}: {1} px de legenda apagados" -f $linha.chave, $fora)
    }
    if ($linha.limparAnotacoes) {
      $apagados = LimparAnotacoes $img $mascara ([int]$linha.x1) ([int]$linha.y1) ([int]$linha.x2) ([int]$linha.y2)
      if ($apagados -gt 0) { Write-Host ("   {0}: {1} px de anotacao solta apagados" -f $linha.chave, $apagados) }
    }
    # QUADROS DITOS, UM A UM
    #
    # A coluna vazia so separa quadro que nao encosta no vizinho, e a divisao em
    # partes iguais so serve quando o passo e constante. Na folha da Alice Demon
    # nao vale nem uma coisa nem outra: o passo varia de fileira para fileira, e
    # no ataque a garra levantada de um quadro passa por cima do corpo do outro.
    # Quando `quadrosDitos` existe, cada quadro traz a sua celula e, se precisar,
    # os retangulos do vizinho que ele deve ignorar.
    $celulas = New-Object 'System.Collections.ArrayList'
    $aviso = ''
    if ($linha.quadrosDitos) {
      foreach ($c in $linha.quadrosDitos) {
        [void]$celulas.Add([pscustomobject]@{ x1 = [int]$c.x1; x2 = [int]$c.x2; vetar = $c.apagar })
      }
    }
    else {
      $blocos = BlocosDeColuna $mascara $img.largura ([int]$linha.x1) ([int]$linha.y1) ([int]$linha.x2) ([int]$linha.y2) ([int]$linha.quadros)
      if ($blocos.Count -ne [int]$linha.quadros) {
        $aviso = ("esperava {0} quadros, achou {1}" -f $linha.quadros, $blocos.Count)
        Write-Host ("   AVISO  " + $linha.chave + ": " + $aviso)
      }
      foreach ($b in $blocos) {
        [void]$celulas.Add([pscustomobject]@{ x1 = [int]$b[0]; x2 = [int]$b[1]; vetar = $null })
      }
    }

    $n = 0
    foreach ($c in $celulas) {
      $bx1 = $c.x1; $bx2 = $c.x2
      $caixa = CaixaUtil $mascara $img.largura $bx1 ([int]$linha.y1) $bx2 ([int]$linha.y2) $c.vetar
      if ($null -eq $caixa) { continue }
      $anc = AncoraX $img $mascara $bx1 ([int]$linha.y1) $bx2 ([int]$linha.y2) $linha.ancora $c.vetar
      [void]$quadros.Add([pscustomobject]@{
        folha = $caminho; chave = $linha.chave; indice = $n
        caixa = $caixa; ancora = $anc.x; ancoraOrigem = $anc.origem
        largura = ($caixa.x2 - $caixa.x1); altura = ($caixa.y2 - $caixa.y1)
        escala = $(if ($linha.escala) { [double]$linha.escala } else { 1.0 })
        vetar = $c.vetar; aviso = $aviso
      })
      $n++
    }
    Write-Host ("   {0,-16} {1} quadro(s)" -f $linha.chave, $n)
  }
}

# ------------------------------------------------------------------ passo 2
# Tela comum. Largura: a maior distancia da ancora ate cada borda, dos dois
# lados, com folga. Altura: o quadro mais alto. Assim nenhum desenho e cortado
# e todos compartilham o mesmo referencial.

$folga = 2
$esqMax = 0.0; $dirMax = 0.0; $altMax = 0.0
foreach ($q in $quadros) {
  $e = ($q.ancora - $q.caixa.x1) * $q.escala
  $d = ($q.caixa.x2 - $q.ancora) * $q.escala
  $a = $q.altura * $q.escala
  if ($e -gt $esqMax) { $esqMax = $e }
  if ($d -gt $dirMax) { $dirMax = $d }
  if ($a -gt $altMax) { $altMax = $a }
}
$meia = [int][Math]::Ceiling([Math]::Max($esqMax, $dirMax)) + $folga
$telaW = $meia * 2
$telaH = [int][Math]::Ceiling($altMax) + $folga

Write-Host ""
Write-Host ("{0} quadros no total" -f $quadros.Count)
Write-Host ("tela comum: {0}x{1}   (ancora no meio, pes na base)" -f $telaW, $telaH)

if ($SemGravar) {
  $quadros | Select-Object chave, indice, largura, altura, ancoraOrigem, aviso |
    Format-Table -AutoSize | Out-String -Width 200 | Write-Host
  return
}

# ------------------------------------------------------------------ passo 3
# Grava cada quadro na tela comum: ancora no centro, pes na base.

if (-not (Test-Path $Saida)) { New-Item -ItemType Directory -Force -Path $Saida | Out-Null }

$relatorio = New-Object 'System.Collections.ArrayList'
$origens = @{}
foreach ($caminho in $cacheImg.Keys) { $origens[$caminho] = [System.Drawing.Bitmap]::FromFile($caminho) }

foreach ($q in $quadros) {
  $destino = New-Object System.Drawing.Bitmap $telaW, $telaH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($destino)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $g.CompositingMode   = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy

  $lw = [int][Math]::Round($q.largura * $q.escala)
  $lh = [int][Math]::Round($q.altura * $q.escala)
  $desX = $meia - [int][Math]::Round(($q.ancora - $q.caixa.x1) * $q.escala)
  $desY = $telaH - $lh

  $orig = New-Object System.Drawing.Rectangle $q.caixa.x1, $q.caixa.y1, $q.largura, $q.altura
  $dest = New-Object System.Drawing.Rectangle $desX, $desY, $lw, $lh
  $g.DrawImage($origens[$q.folha], $dest, $orig, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()

  # Apaga o que a mascara disse que e fundo, para o preto chapado nao vir junto.
  $mascara = $cacheMascara[$q.folha]
  $lw0 = $cacheImg[$q.folha].largura
  $ret = New-Object System.Drawing.Rectangle 0, 0, $telaW, $telaH
  $trava = $destino.LockBits($ret, [System.Drawing.Imaging.ImageLockMode]::ReadWrite,
                             [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $passoD = $trava.Stride
  $bytes = New-Object byte[] ($passoD * $telaH)
  [System.Runtime.InteropServices.Marshal]::Copy($trava.Scan0, $bytes, 0, $bytes.Length)
  for ($y = 0; $y -lt $telaH; $y++) {
    for ($x = 0; $x -lt $telaW; $x++) {
      $i = $y * $passoD + $x * 4
      $sx = [int][Math]::Floor(($x - $desX) / $q.escala) + $q.caixa.x1
      $sy = [int][Math]::Floor(($y - $desY) / $q.escala) + $q.caixa.y1
      $dentro = ($x -ge $desX -and $x -lt ($desX + $lw) -and $y -ge $desY -and $y -lt ($desY + $lh))
      if (-not $dentro -or -not $mascara[$sy * $lw0 + $sx] -or (DentroDeAlgum $q.vetar $sx $sy)) {
        $bytes[$i] = 0; $bytes[$i + 1] = 0; $bytes[$i + 2] = 0; $bytes[$i + 3] = 0
      }
    }
  }
  [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $trava.Scan0, $bytes.Length)
  $destino.UnlockBits($trava)

  $nome = "{0}-{1}.png" -f $q.chave, $q.indice
  $destino.Save((Join-Path $Saida $nome), [System.Drawing.Imaging.ImageFormat]::Png)
  $destino.Dispose()
  [void]$relatorio.Add([pscustomobject]@{
    arquivo = $nome; chave = $q.chave; indice = $q.indice
    larguraUtil = $lw; alturaUtil = $lh; ancoraOrigem = $q.ancoraOrigem; aviso = $q.aviso
  })
}

foreach ($b in $origens.Values) { $b.Dispose() }

$relatorio | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $Saida "_quadros.json")
Write-Host ""
Write-Host ("gravados {0} PNGs em {1}" -f $relatorio.Count, $Saida)
Write-Host ("tela {0}x{1} — origem do sprite no jogo: (0.5, 1)" -f $telaW, $telaH)
