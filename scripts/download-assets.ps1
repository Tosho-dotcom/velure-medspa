# Velure — download generated media into public/media
# Run from the project root (e.g. in the VS Code terminal):
#   powershell -ExecutionPolicy Bypass -File .\scripts\download-assets.ps1

$ErrorActionPreference = "Stop"
$base = "https://YOUR-MEDIA-CDN.example.com/YOUR_USER_PATH"
$dest = Join-Path (Get-Location) "public\media"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$assets = [ordered]@{
  "hero-desktop.mp4"                 = "hf_20261017_100750_ded186e9-0357-4a30-88d7-ceb56ccbcca9.mp4"
  "hero-mobile.mp4"                  = "hf_20261017_100800_72a2ba4e-db34-4221-b144-b635a2fb9670.mp4"
  "hero-desktop-poster.png"          = "hf_20261017_100557_946b4e9a-3aa5-436e-929b-83692bf9474c.png"
  "hero-mobile-poster.png"           = "hf_20261017_100721_a8b82c67-df7c-4819-b95e-e2d04ad2e5d2.png"
  "menu-reveal.png"                  = "hf_20261017_100556_0a899573-ee6f-4137-9e5f-e02393a1ffe1.png"
  "booking-reception.png"            = "hf_20261017_100557_ddea2121-49ad-4ee7-9d9c-dc223596e9c4.png"
  "treatment-01-facial.png"          = "hf_20261017_100556_de233d07-7544-4830-b3b6-8ace06be5304.png"
  "treatment-02-injectables.png"     = "hf_20261017_100555_c9d6c2f1-3842-431a-8f79-b2854f65d9df.png"
  "treatment-03-fillers.png"         = "hf_20261017_100628_2265a551-3ff5-4bed-a70e-92e6a4d840e9.png"
  "treatment-04-microneedling.png"   = "hf_20261017_100557_15e24d32-51e3-4ecf-b2ad-4030282fd3b6.png"
  "treatment-05-laser.png"           = "hf_20261017_100555_42c8c239-9728-4f3e-9a80-1d0e60faf63a.png"
  "treatment-06-body.png"            = "hf_20261017_100638_7c53961a-f9eb-4f27-8c04-44ce612d9a88.png"
}

foreach ($name in $assets.Keys) {
  $out = Join-Path $dest $name
  if (Test-Path $out) { Write-Host "skip  $name (already exists)"; continue }
  Write-Host "get   $name"
  Invoke-WebRequest -Uri "$base/$($assets[$name])" -OutFile $out -UseBasicParsing
}

Write-Host ""
Write-Host "Gotovo. Datoteke su u public\media:"
Get-ChildItem $dest | Select-Object Name, @{n="MB";e={[math]::Round($_.Length/1MB,2)}} | Format-Table -AutoSize

# Opcionalno (ako imas ffmpeg): kompresija videa na ~4-6 MB bez audio traga
#   ffmpeg -i public\media\hero-desktop.mp4 -an -vf scale=1920:-2 -c:v libx264 -crf 27 -preset slow -movflags +faststart public\media\hero-desktop.opt.mp4
#   ffmpeg -i public\media\hero-mobile.mp4  -an -vf scale=1080:-2 -c:v libx264 -crf 27 -preset slow -movflags +faststart public\media\hero-mobile.opt.mp4
# Poster u JPG (manji LCP):
#   ffmpeg -i public\media\hero-desktop-poster.png -q:v 3 public\media\hero-desktop-poster.jpg
