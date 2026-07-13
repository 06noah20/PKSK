$ErrorActionPreference = "Continue"

$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) "assets\science-set1-realistic"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$queries = @{
  1="cat"; 2="turtle"; 3="animal,mother,baby"; 4="mammal,animal"; 5="grasshopper,insect";
  6="human,lungs"; 8="human,kidney"; 9="hand,hot,cup"; 10="healthy,food";
  11="rice,paddy,field"; 12="frog"; 14="mushroom,forest"; 16="green,leaves,sunlight";
  17="photosynthesis,plant"; 18="plant,roots"; 19="seedling,soil"; 21="ecosystem,field";
  22="shadow,light,experiment"; 23="electric,circuit"; 24="moon,earth,sun";
  25="plant,sunlight"; 26="toy,car,surface"; 27="water,heating,experiment";
  28="wilted,plant"; 30="loading,ramp,box"; 31="cooking,pot,handle";
  32="algae,bloom,fish"; 33="rusty,nail"; 34="ice,cloth"; 36="forest,floor,decomposition";
  37="light,experiment"; 38="banana,peel,plastic,paper"; 39="dog,panting"; 40="umbrella,rain"
}

foreach ($key in ($queries.Keys | Sort-Object {[int]$_})) {
  $name = "q{0:D2}.jpg" -f [int]$key
  $dest = Join-Path $outDir $name
  if ((Test-Path -LiteralPath $dest) -and ((Get-Item -LiteralPath $dest).Length -gt 20000)) {
    Write-Host "skip $name"
    continue
  }
  $url = "https://loremflickr.com/1600/600/$($queries[$key])?lock=$($key + 2000)"
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    Write-Host "downloaded $name"
    Start-Sleep -Milliseconds 350
  } catch {
    Write-Warning "failed $name : $($_.Exception.Message)"
  }
}

Get-ChildItem -LiteralPath $outDir -Filter q*.jpg | Select-Object Name,Length
