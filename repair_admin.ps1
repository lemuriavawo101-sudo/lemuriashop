$filePath = "c:\Users\BlackJokeR\lemuria new shop\src\app\admin\page.tsx"
$content = Get-Content -Path $filePath -Raw

# Replace CategoryView end (line 304)
$content = $content -replace "302:     </div>`r?`n303:   );`r?`n304: };", "302:     </div>`r?`n303:   );`r?`n304: });"

# Wait, the above might not work if I include line numbers. I'll use regex for the actual content.
# I'll just look for the specific sequences based on line numbers I have.
$lines = Get-Content $filePath

# Line 304: CategoryView
if ($lines[303] -trim -eq "};" -and $lines[302] -trim -eq ");") {
    $lines[303] = "});"
}

# Line 471: OrdersView
if ($lines[470] -trim -eq ");" -and $lines[469] -trim -eq "  </div>") {
    $lines[470] = "));"
}

# Line 508: UsersView
if ($lines[507] -trim -eq ");" -and $lines[506] -trim -eq "  </div>") {
    $lines[507] = "));"
}

# Line 541: LeadsView
if ($lines[540] -trim -eq ");" -and $lines[539] -trim -eq "  </div>") {
    $lines[540] = "));"
}

# Line 616: EnquiriesView
if ($lines[615] -trim -eq ");" -and $lines[614] -trim -eq "  </div>") {
    $lines[615] = "));"
}

# Line 722: DealOfDayView
if ($lines[721] -trim -eq "};" -and $lines[720] -trim -eq ");") {
    $lines[721] = "});"
}

# Line 818: ShowcaseView
if ($lines[817] -trim -eq "};" -and $lines[816] -trim -eq ");") {
    $lines[817] = "});"
}

$lines | Set-Content $filePath
