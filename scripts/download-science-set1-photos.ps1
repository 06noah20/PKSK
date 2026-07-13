$ErrorActionPreference = "Continue"

$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) "assets\science-set1-realistic"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$items = @(
  @{ name="cat.jpg"; q="domestic cat full body" },
  @{ name="turtle.jpg"; q="turtle shell animal" },
  @{ name="parent-animal.jpg"; q="mother cat with kittens" },
  @{ name="lung-animal.jpg"; q="dog mammal breathing" },
  @{ name="insect.jpg"; q="grasshopper insect six legs" },
  @{ name="lungs.jpg"; q="human lungs anatomy model" },
  @{ name="kidney.jpg"; q="human kidney anatomy model" },
  @{ name="hot-cup-hand.jpg"; q="hand touching hot cup" },
  @{ name="healthy-food.jpg"; q="healthy balanced meal vegetables" },
  @{ name="rice-plant.jpg"; q="rice plant paddy field" },
  @{ name="frog.jpg"; q="frog close up" },
  @{ name="decomposer.jpg"; q="mushroom decomposer forest floor" },
  @{ name="photosynthesis.jpg"; q="green leaves sunlight" },
  @{ name="root.jpg"; q="plant roots soil" },
  @{ name="seedling.jpg"; q="seedling germination soil" },
  @{ name="food-web.jpg"; q="rice field ecosystem grasshopper frog snake" },
  @{ name="shadow.jpg"; q="shadow experiment lamp screen object" },
  @{ name="circuit.jpg"; q="simple electric circuit battery bulb switch" },
  @{ name="lunar-eclipse.jpg"; q="earth moon sun lunar eclipse diagram" },
  @{ name="plant-light.jpg"; q="plant growing toward light" },
  @{ name="friction-car.jpg"; q="toy car different surfaces experiment" },
  @{ name="heating-water.jpg"; q="water heating experiment beakers" },
  @{ name="wilted-plant.jpg"; q="wilted plant in pot" },
  @{ name="ramp-box.jpg"; q="loading ramp box truck" },
  @{ name="pot-handle.jpg"; q="metal pot plastic handle" },
  @{ name="algae-bloom.jpg"; q="algae bloom dead fish" },
  @{ name="rusty-nail.jpg"; q="rusty nail salt water" },
  @{ name="ice-cloth.jpg"; q="ice wrapped in cloth insulation" },
  @{ name="forest-floor.jpg"; q="forest floor decomposing leaves" },
  @{ name="light-straight.jpg"; q="light travels in straight line experiment" },
  @{ name="biodegradable.jpg"; q="banana peel paper plastic decomposition" },
  @{ name="dog-panting.jpg"; q="dog panting hot weather" },
  @{ name="umbrella-fabric.jpg"; q="waterproof umbrella fabric rain" }
)

function Get-CommonsImageUrl($query) {
  $api = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&format=json&origin=*&gsrsearch=$([uri]::EscapeDataString($query))"
  $res = Invoke-RestMethod -Uri $api -UseBasicParsing
  if (-not $res.query.pages) { return $null }
  foreach ($page in $res.query.pages.PSObject.Properties.Value) {
    $url = $page.imageinfo[0].url
    if ($url -match '\.(jpg|jpeg|png)$') { return $url }
  }
  return $null
}

foreach ($item in $items) {
  $dest = Join-Path $outDir $item.name
  if ((Test-Path -LiteralPath $dest) -and ((Get-Item -LiteralPath $dest).Length -gt 20000)) {
    Write-Host "skip $($item.name)"
    continue
  }

  try {
    $url = Get-CommonsImageUrl $item.q
    if (-not $url) {
      Write-Warning "No image for $($item.name) / $($item.q)"
      continue
    }
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    Write-Host "downloaded $($item.name)"
  } catch {
    Write-Warning "Failed $($item.name): $($_.Exception.Message)"
  }
}

Get-ChildItem -LiteralPath $outDir -File | Select-Object Name,Length
