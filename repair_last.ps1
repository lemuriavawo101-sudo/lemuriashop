$path = "c:\Users\BlackJokeR\lemuria new shop\src\app\admin\page.tsx"
$lines = Get-Content $path
$lines[721] = "});"
$lines[817] = "});"
$lines | Set-Content $path
