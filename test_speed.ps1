$t1 = Get-Date
$r = Invoke-WebRequest -Uri 'http://127.0.0.1:5000/product-search' -Method Post -ContentType 'application/json' -Body '{"query":"Nike shoes"}' -TimeoutSec 30
$t2 = Get-Date
$elapsed = ($t2 - $t1).TotalSeconds
Write-Host "Search took $elapsed seconds"

$data = $r.Content | ConvertFrom-Json
Write-Host "Status: $($data.status)"
Write-Host "Canonical products: $($data.canonical_products.Count)"

foreach ($p in $data.canonical_products) {
    $title = if ($p.title.Length -gt 50) { $p.title.Substring(0, 50) } else { $p.title }
    $img = if ($p.image -and $p.image.Length -gt 0) { "YES" } else { "EMPTY" }
    Write-Host "  [$img] $title"
}
