# Monta uma folha de prova com os quadros ja recortados, para conferir a olho.
#
#   powershell -File tools/folha-de-prova.ps1 -Pasta assets/characters/coelho -Saida prova.png
#
# O fundo e magenta de proposito: qualquer sobra do fundo preto original vira
# uma mancha escura obvia, e qualquer borda comida pelo recorte aparece como
# magenta vazando por dentro do desenho. Em fundo escuro os dois erros passam
# despercebidos.

param(
  [Parameter(Mandatory = $true)][string]$Pasta,
  [Parameter(Mandatory = $true)][string]$Saida,
  [int]$PorLinha = 6,
  [int]$Zoom = 1
)

Add-Type -AssemblyName System.Drawing

$arquivos = Get-ChildItem $Pasta -Filter *.png | Sort-Object Name
if ($arquivos.Count -eq 0) { Write-Host "nenhum PNG em $Pasta"; return }

$primeira = [System.Drawing.Bitmap]::FromFile($arquivos[0].FullName)
$qw = $primeira.Width * $Zoom
$qh = $primeira.Height * $Zoom
$primeira.Dispose()

$margem = 8
$alturaRotulo = 16
$colunas = [Math]::Min($PorLinha, $arquivos.Count)
$linhas = [Math]::Ceiling($arquivos.Count / $colunas)
$larguraTotal = $colunas * ($qw + $margem) + $margem
$alturaTotal = $linhas * ($qh + $margem + $alturaRotulo) + $margem

$folha = New-Object System.Drawing.Bitmap $larguraTotal, $alturaTotal
$g = [System.Drawing.Graphics]::FromImage($folha)
$g.Clear([System.Drawing.Color]::FromArgb(255, 255, 0, 255))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$fonte = New-Object System.Drawing.Font "Consolas", 9
$tinta = [System.Drawing.Brushes]::Black

# Linha guia no pe de cada celula: se os pes nao estiverem todos nela, o
# alinhamento vertical saiu errado e a Alice vai flutuar ao trocar de quadro.
$guia = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(150, 0, 200, 255)), 1

$i = 0
foreach ($a in $arquivos) {
  $col = $i % $colunas
  $lin = [Math]::Floor($i / $colunas)
  $x = $margem + $col * ($qw + $margem)
  $y = $margem + $lin * ($qh + $margem + $alturaRotulo)

  $b = [System.Drawing.Bitmap]::FromFile($a.FullName)
  $dest = New-Object System.Drawing.Rectangle $x, $y, $qw, $qh
  $g.DrawImage($b, $dest)
  $b.Dispose()

  $g.DrawLine($guia, $x, ($y + $qh - 1), ($x + $qw), ($y + $qh - 1))
  $g.DrawLine($guia, ($x + [int]($qw / 2)), $y, ($x + [int]($qw / 2)), ($y + $qh))
  $g.DrawString($a.BaseName, $fonte, $tinta, $x, ($y + $qh + 1))
  $i++
}

$g.Dispose()
$folha.Save($Saida, [System.Drawing.Imaging.ImageFormat]::Png)
$folha.Dispose()
Write-Host ("folha de prova: {0}  ({1} quadros, {2}x{3} cada)" -f $Saida, $arquivos.Count, $qw, $qh)
