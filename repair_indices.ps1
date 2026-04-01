$path = "c:\Users\BlackJokeR\lemuria new shop\src\app\admin\page.tsx"
$lines = Get-Content $path
$lines[303] = "  });"
$lines[470] = "  }));"
$lines[507] = "  }));"
$lines[540] = "  }));"
$lines[615] = "  }));"
$lines[721] = "  });"
$lines[817] = "  });"
$lines | Set-Content $path
