$svg = [System.IO.File]::ReadAllText('c:\Users\BlackJokeR\lemuria new shop\public\favicon.svg')
# Remove the circle
$svg = $svg -replace '<circle cx="50" cy="50" r="48" fill="#e50914" opacity="0.5"/>', ''
# Zoom in: 2x scale (width 200) centered at 50,50 -> x = 50 - 200/2 = -50
$svg = $svg -replace 'x="2" y="2" width="96" height="96"', 'x="-50" y="-50" width="200" height="200"'
[System.IO.File]::WriteAllText('c:\Users\BlackJokeR\lemuria new shop\public\favicon.svg', $svg)
