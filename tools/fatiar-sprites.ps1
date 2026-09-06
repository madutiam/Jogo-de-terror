# Fatia uma folha de sprites em quadros individuais.
#
# As folhas entregues vem com varios quadros lado a lado, separados por vazio.
# Este script acha os quadros olhando as COLUNAS totalmente transparentes e
# corta cada bloco de conteudo num PNG proprio.
#
#   powershell -File tools/fatiar-sprites.ps1 -Folha "caminho.png" -Saida "pasta" -Prefixo "alice-costas"
#
# Opcional:
#   -LinhaUnica     trata a folha como uma linha so (padrao)
#   -MinLargura N   ignora blocos menores que N pixels (tira ruido e rotulos)

param(
  [Parameter(Mandatory = $true)][string]$Folha,
  [Parameter(Mandatory = $true)][string]$Saida,
  [Parameter(Mandatory = $true)][string]$Prefixo,
  [int]$MinLargura = 24,
  [int]$AlphaMinimo = 12
)

Add-Type -AssemblyName System.Drawing

$bmp = [System.Drawing.Bitmap]::FromFile($Folha)
$w = $bmp.Width; $h = $bmp.Height
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$dados = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $dados.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($dados.Scan0, $bytes, 0, $bytes.Length)
$bmp.UnlockBits($dados)

# Quais colunas tem alguma coisa desenhada
$colunaCheia = New-Object bool[] $w
for ($x = 0; $x -lt $w; $x++) {
  for ($y = 0; $y -lt $h; $y++) {
    if ($bytes[$y * $stride + $x * 4 + 3] -ge $AlphaMinimo) { $colunaCheia[$x] = $true; break }
  }
}

# Blocos contiguos de colunas cheias = quadros
$blocos = New-Object 'System.Collections.ArrayList'
$dentro = $false; $ini = 0
for ($x = 0; $x -lt $w; $x++) {
  if ($colunaCheia[$x] -and -not $dentro) { $dentro = $true; $ini = $x }
  elseif (-not $colunaCheia[$x] -and $dentro) {
    $dentro = $false
    if (($x - $ini) -ge $MinLargura) { [void]$blocos.Add(@($ini, $x)) }
  }
}
if ($dentro -and (($w - $ini) -ge $MinLargura)) { [void]$blocos.Add(@($ini, $w)) }

if (-not (Test-Path $Saida)) { New-Item -ItemType Directory -Force -Path $Saida | Out-Null }

"folha: {0}x{1} — {2} quadro(s) encontrado(s)" -f $w, $h, $blocos.Count

$indice = 0
foreach ($b in $blocos) {
  $x1 = [int]$b[0]; $x2 = [int]$b[1]

  # altura util deste quadro
  $y1 = $h; $y2 = -1
  for ($y = 0; $y -lt $h; $y++) {
    for ($x = $x1; $x -lt $x2; $x++) {
      if ($bytes[$y * $stride + $x * 4 + 3] -ge $AlphaMinimo) {
        if ($y -lt $y1) { $y1 = $y }
        if ($y -gt $y2) { $y2 = $y }
        break
      }
    }
  }
  if ($y2 -lt 0) { continue }

  $lw = $x2 - $x1; $lh = $y2 - $y1 + 1
  $corte = New-Object System.Drawing.Rectangle $x1, $y1, $lw, $lh
  $quadro = $bmp.Clone($corte, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $caminho = Join-Path $Saida ("{0}-{1}.png" -f $Prefixo, $indice)
  $quadro.Save($caminho, [System.Drawing.Imaging.ImageFormat]::Png)
  "  {0}  x={1}..{2}  {3}x{4}" -f (Split-Path $caminho -Leaf), $x1, $x2, $lw, $lh
  $quadro.Dispose()
  $indice++
}

$bmp.Dispose()
