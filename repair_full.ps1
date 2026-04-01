$path = "c:\Users\BlackJokeR\lemuria new shop\src\app\admin\page.tsx"
$c = Get-Content $path -Raw

# 1. CategoryView (Line 304)
$c = $c -replace "(?s)(const CategoryView = memo\(.*?</div>\s+);\s+};", '$1  );`r`n});'

# 2. OrdersView (Line 471)
$c = $c -replace "(?s)(const OrdersView = memo\(.*?</div>\s+)\);\s+const UsersView", '$1));`r`n`r`nconst UsersView'

# 3. UsersView (Line 508)
$c = $c -replace "(?s)(const UsersView = memo\(.*?</div>\s+)\);\s+const LeadsView", '$1));`r`n`r`nconst LeadsView'

# 4. LeadsView (Line 541)
$c = $c -replace "(?s)(const LeadsView = memo\(.*?</div>\s+)\);\s+const EnquiriesView", '$1));`r`n`r`nconst EnquiriesView'

# 5. EnquiriesView (Line 616)
$c = $c -replace "(?s)(const EnquiriesView = memo\(.*?</div>\s+)\);\s+const DealOfDayView", '$1));`r`n`r`nconst DealOfDayView'

# 6. DealOfDayView (Line 722)
$c = $c -replace "(?s)(const DealOfDayView = memo\(.*?</div>\s+);\s+};", '$1  );`r`n});'

# 7. ShowcaseView (Line 818)
$c = $c -replace "(?s)(const ShowcaseView = memo\(.*?</div>\s+);\s+};", '$1  );`r`n});'

$c | Set-Content $path -NoNewline
