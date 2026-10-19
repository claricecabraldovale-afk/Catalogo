$src = "C:\Users\ACER\AppData\Local\Claude-3p\local-agent-mode-sessions\61f0ca50\00000000\213a9f1a\outputs"
$dst = "C:\Users\ACER\Documents\Projetos\CATPITSTOP"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Get-ChildItem -Path "$src\CATPITSTOP" -Recurse | ForEach-Object {
    $rel = $_.FullName.Substring($src.Length + 1)
    $target = Join-Path $dst $rel
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Force -Path $target | Out-Null
    } else {
        Copy-Item -Path $_.FullName -Destination $target -Force
    }
}
Write-Host "Copiado para: $dst"
Get-ChildItem -Path $dst -Recurse | Select-Object FullName, Length
