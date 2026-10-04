# CacheCleaner.ps1
# Native WinForms cache cleaner - no encoding issues, full UI

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

# ---------- Admin check (native, no subprocess) ----------
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# ---------- Palette ----------
$colBg        = [System.Drawing.Color]::FromArgb(18, 18, 28)
$colPanel     = [System.Drawing.Color]::FromArgb(28, 30, 45)
$colConsole   = [System.Drawing.Color]::FromArgb(10, 10, 18)
$colAccent    = [System.Drawing.Color]::FromArgb(0, 200, 255)
$colGreen     = [System.Drawing.Color]::FromArgb(0, 220, 130)
$colRed       = [System.Drawing.Color]::FromArgb(255, 95, 95)
$colYellow    = [System.Drawing.Color]::FromArgb(255, 190, 60)
$colText      = [System.Drawing.Color]::FromArgb(220, 225, 235)
$colDim       = [System.Drawing.Color]::FromArgb(130, 140, 160)
$colBlue      = [System.Drawing.Color]::FromArgb(0, 130, 210)

# ---------- Form ----------
$form = New-Object System.Windows.Forms.Form
$form.Text = "Cache Memory Cleaner"
$form.Size = New-Object System.Drawing.Size(960, 700)
$form.MinimumSize = New-Object System.Drawing.Size(760, 560)
$form.StartPosition = "CenterScreen"
$form.BackColor = $colBg
$form.ForeColor = $colText
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)

# ---------- Header ----------
$header = New-Object System.Windows.Forms.Panel
$header.Location = New-Object System.Drawing.Point(0, 0)
$header.Size = New-Object System.Drawing.Size(960, 70)
$header.BackColor = [System.Drawing.Color]::FromArgb(22, 24, 38)
$header.Anchor = "Top,Left,Right"
$form.Controls.Add($header)

$title = New-Object System.Windows.Forms.Label
$title.Text = "CACHE MEMORY CLEANER"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = $colAccent
$title.Location = New-Object System.Drawing.Point(20, 12)
$title.Size = New-Object System.Drawing.Size(500, 30)
$header.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "Clean temp, prefetch, DNS, thumbnails, browser caches and more"
$subtitle.Font = New-Object System.Drawing.Font("Segoe UI", 8.5)
$subtitle.ForeColor = $colDim
$subtitle.Location = New-Object System.Drawing.Point(22, 42)
$subtitle.Size = New-Object System.Drawing.Size(600, 18)
$header.Controls.Add($subtitle)

# Admin status pill
$adminLbl = New-Object System.Windows.Forms.Label
$adminLbl.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$adminLbl.TextAlign = "MiddleCenter"
$adminLbl.Size = New-Object System.Drawing.Size(200, 30)
$adminLbl.Location = New-Object System.Drawing.Point(730, 20)
$adminLbl.Anchor = "Top,Right"
if ($isAdmin) {
    $adminLbl.Text = "ADMINISTRATOR"
    $adminLbl.ForeColor = $colGreen
    $adminLbl.BackColor = [System.Drawing.Color]::FromArgb(20, 60, 40)
} else {
    $adminLbl.Text = "USER MODE (limited)"
    $adminLbl.ForeColor = $colYellow
    $adminLbl.BackColor = [System.Drawing.Color]::FromArgb(70, 55, 15)
}
$header.Controls.Add($adminLbl)

# ---------- Left panel (checkbox list) ----------
$leftPanel = New-Object System.Windows.Forms.Panel
$leftPanel.Location = New-Object System.Drawing.Point(15, 85)
$leftPanel.Size = New-Object System.Drawing.Size(280, 480)
$leftPanel.BackColor = $colPanel
$leftPanel.Anchor = "Top,Bottom,Left"
$form.Controls.Add($leftPanel)

$listTitle = New-Object System.Windows.Forms.Label
$listTitle.Text = "CACHE TARGETS"
$listTitle.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$listTitle.ForeColor = $colAccent
$listTitle.Location = New-Object System.Drawing.Point(12, 10)
$listTitle.Size = New-Object System.Drawing.Size(200, 20)
$leftPanel.Controls.Add($listTitle)

$toggleAll = New-Object System.Windows.Forms.Button
$toggleAll.Text = "Toggle All"
$toggleAll.Font = New-Object System.Drawing.Font("Segoe UI", 8)
$toggleAll.ForeColor = $colDim
$toggleAll.BackColor = $colPanel
$toggleAll.FlatStyle = "Flat"
$toggleAll.FlatAppearance.BorderSize = 0
$toggleAll.Location = New-Object System.Drawing.Point(190, 8)
$toggleAll.Size = New-Object System.Drawing.Size(80, 22)
$toggleAll.Cursor = "Hand"
$leftPanel.Controls.Add($toggleAll)

$cacheList = New-Object System.Windows.Forms.CheckedListBox
$cacheList.Location = New-Object System.Drawing.Point(8, 38)
$cacheList.Size = New-Object System.Drawing.Size(264, 430)
$cacheList.BackColor = $colPanel
$cacheList.ForeColor = $colText
$cacheList.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$cacheList.BorderStyle = "None"
$cacheList.CheckOnClick = $true
$cacheList.Anchor = "Top,Bottom,Left,Right"

$cacheItems = @(
    "User Temp Files (%TEMP%)",
    "Windows Temp Folder",
    "Prefetch Cache",
    "DNS Resolver Cache",
    "Thumbnail Cache",
    "Windows Update Cache",
    "Delivery Optimization Cache",
    "Recycle Bin",
    "Chrome Cache",
    "Edge Cache",
    "Firefox Cache",
    "Explorer Recent Files",
    "Clipboard",
    "Standby Memory (RAM)"
)
foreach ($c in $cacheItems) { [void]$cacheList.Items.Add($c, $true) }
$leftPanel.Controls.Add($cacheList)

$toggleAll.Add_Click({
    $allChecked = $true
    for ($i = 0; $i -lt $cacheList.Items.Count; $i++) {
        if (-not $cacheList.GetItemChecked($i)) { $allChecked = $false; break }
    }
    for ($i = 0; $i -lt $cacheList.Items.Count; $i++) {
        $cacheList.SetItemChecked($i, -not $allChecked)
    }
})

# ---------- Right panel (console) ----------
$rightPanel = New-Object System.Windows.Forms.Panel
$rightPanel.Location = New-Object System.Drawing.Point(305, 85)
$rightPanel.Size = New-Object System.Drawing.Size(640, 480)
$rightPanel.BackColor = $colConsole
$rightPanel.Anchor = "Top,Bottom,Left,Right"
$form.Controls.Add($rightPanel)

$consoleHdr = New-Object System.Windows.Forms.Panel
$consoleHdr.Location = New-Object System.Drawing.Point(0, 0)
$consoleHdr.Size = New-Object System.Drawing.Size(640, 30)
$consoleHdr.BackColor = [System.Drawing.Color]::FromArgb(22, 24, 38)
$consoleHdr.Anchor = "Top,Left,Right"
$rightPanel.Controls.Add($consoleHdr)

$consoleTitle = New-Object System.Windows.Forms.Label
$consoleTitle.Text = "  OUTPUT"
$consoleTitle.Font = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$consoleTitle.ForeColor = $colAccent
$consoleTitle.Location = New-Object System.Drawing.Point(5, 7)
$consoleTitle.Size = New-Object System.Drawing.Size(200, 18)
$consoleHdr.Controls.Add($consoleTitle)

$consoleHint = New-Object System.Windows.Forms.Label
$consoleHint.Text = "Right-click for copy menu"
$consoleHint.Font = New-Object System.Drawing.Font("Segoe UI", 7.5)
$consoleHint.ForeColor = $colDim
$consoleHint.TextAlign = "MiddleRight"
$consoleHint.Location = New-Object System.Drawing.Point(440, 7)
$consoleHint.Size = New-Object System.Drawing.Size(195, 18)
$consoleHint.Anchor = "Top,Right"
$consoleHdr.Controls.Add($consoleHint)

$output = New-Object System.Windows.Forms.RichTextBox
$output.Location = New-Object System.Drawing.Point(0, 30)
$output.Size = New-Object System.Drawing.Size(640, 450)
$output.BackColor = $colConsole
$output.ForeColor = $colGreen
$output.Font = New-Object System.Drawing.Font("Consolas", 9.5)
$output.BorderStyle = "None"
$output.ReadOnly = $true
$output.WordWrap = $true
$output.ScrollBars = "Vertical"
$output.Anchor = "Top,Bottom,Left,Right"
$output.DetectUrls = $false
$rightPanel.Controls.Add($output)

# Right-click context menu for console
$ctxMenu = New-Object System.Windows.Forms.ContextMenuStrip
$miCopy     = $ctxMenu.Items.Add("Copy selection")
$miCopyAll  = $ctxMenu.Items.Add("Copy entire log")
$miClear    = $ctxMenu.Items.Add("Clear log")
$miCopy.Add_Click({ if ($output.SelectionLength -gt 0) { $output.Copy() } })
$miCopyAll.Add_Click({ [System.Windows.Forms.Clipboard]::SetText($output.Text) })
$miClear.Add_Click({ $output.Clear() })
$output.ContextMenuStrip = $ctxMenu

# ---------- Progress bar ----------
$progress = New-Object System.Windows.Forms.ProgressBar
$progress.Location = New-Object System.Drawing.Point(15, 575)
$progress.Size = New-Object System.Drawing.Size(930, 8)
$progress.Style = "Continuous"
$progress.Minimum = 0
$progress.Maximum = 100
$progress.Anchor = "Bottom,Left,Right"
$form.Controls.Add($progress)

# ---------- Button row ----------
$btnPanel = New-Object System.Windows.Forms.Panel
$btnPanel.Location = New-Object System.Drawing.Point(15, 595)
$btnPanel.Size = New-Object System.Drawing.Size(930, 55)
$btnPanel.BackColor = $colBg
$btnPanel.Anchor = "Bottom,Left,Right"
$form.Controls.Add($btnPanel)

function New-ActionBtn($text, $x, $width, $color, $handler) {
    $b = New-Object System.Windows.Forms.Button
    $b.Text = $text
    $b.Location = New-Object System.Drawing.Point($x, 5)
    $b.Size = New-Object System.Drawing.Size($width, 40)
    $b.BackColor = $color
    $b.ForeColor = [System.Drawing.Color]::White
    $b.FlatStyle = "Flat"
    $b.FlatAppearance.BorderSize = 0
    $b.Font = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
    $b.Cursor = "Hand"
    $b.Add_Click($handler)
    $btnPanel.Controls.Add($b)
    return $b
}

$btnAll = New-ActionBtn "CLEAN ALL"        15  160 $colBlue   { Invoke-Clean 'all' }
$btnSel = New-ActionBtn "CLEAN SELECTED"   185 160 $colGreen  { Invoke-Clean 'selected' }
$btnAna = New-ActionBtn "ANALYZE"          355 130 $colYellow { Invoke-Analyze }
$btnCpy = New-ActionBtn "COPY LOG"         495 130 ([System.Drawing.Color]::FromArgb(120,60,180)) { Copy-Log }
$btnClr = New-ActionBtn "Clear"            635 90  ([System.Drawing.Color]::FromArgb(160,50,50)) { $output.Clear(); $progress.Value = 0 }
$btnExt = New-ActionBtn "Exit"             735 90  ([System.Drawing.Color]::FromArgb(60,60,75))  { $form.Close() }
$btnCpy.Anchor = "Bottom,Right"
$btnClr.Anchor = "Bottom,Right"
$btnExt.Anchor = "Bottom,Right"

# ---------- Logging ----------
function Log($msg, $color = "Green") {
    $output.SelectionStart = $output.Text.Length
    $output.SelectionLength = 0
    switch ($color) {
        "Green"  { $output.SelectionColor = $colGreen }
        "Red"    { $output.SelectionColor = $colRed }
        "Yellow" { $output.SelectionColor = $colYellow }
        "Cyan"   { $output.SelectionColor = $colAccent }
        "Dim"    { $output.SelectionColor = $colDim }
        "White"  { $output.SelectionColor = $colText }
        default  { $output.SelectionColor = $colGreen }
    }
    $output.AppendText("$msg`r`n")
    $output.SelectionStart = $output.Text.Length
    $output.ScrollToCaret()
    [System.Windows.Forms.Application]::DoEvents()
}

function Divider { Log ("-" * 60) "Cyan" }

# ---------- Helpers ----------
function Get-FolderSize($path) {
    if (-not (Test-Path $path)) { return 0 }
    try {
        $sum = (Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue |
                Measure-Object -Property Length -Sum).Sum
        if ($null -eq $sum) { return 0 }
        return [int64]$sum
    } catch { return 0 }
}

function Format-Size($bytes) {
    if ($bytes -ge 1GB) { return "{0:N2} GB" -f ($bytes / 1GB) }
    elseif ($bytes -ge 1MB) { return "{0:N2} MB" -f ($bytes / 1MB) }
    elseif ($bytes -ge 1KB) { return "{0:N2} KB" -f ($bytes / 1KB) }
    else { return "$bytes B" }
}

function Clear-Folder($path, $label) {
    if (-not (Test-Path $path)) {
        Log "  [SKIP] $label - not found" "Dim"
        return 0
    }
    try {
        $before = Get-FolderSize $path
        $items = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        $count = 0
        foreach ($f in $items) {
            try {
                Remove-Item -LiteralPath $f.FullName -Force -Recurse -ErrorAction SilentlyContinue
                $count++
            } catch {}
        }
        $after = Get-FolderSize $path
        $freed = $before - $after
        if ($freed -lt 0) { $freed = 0 }
        Log ("  [OK] {0} - deleted {1} items, freed {2}" -f $label, $count, (Format-Size $freed)) "Green"
        return $freed
    } catch {
        Log ("  [ERR] {0} - {1}" -f $label, $_.Exception.Message) "Red"
        return 0
    }
}

# ---------- Main cleaner ----------
$script:totalFreed = 0

function Invoke-Clean($mode) {
    $script:totalFreed = 0
    $output.Clear()
    Divider
    Log "       CACHE MEMORY CLEANER - STARTED" "Cyan"
    Divider
    Log "Time: $(Get-Date)" "Dim"
    Log "Mode: $(if ($mode -eq 'all') {'CLEAN ALL'} else {'CLEAN SELECTED'})" "Dim"
    Log "Admin: $(if ($isAdmin) {'YES'} else {'NO - some caches will be skipped'})" "Dim"
    Log ""

    $selected = @()
    if ($mode -eq 'all') {
        for ($i = 0; $i -lt $cacheList.Items.Count; $i++) {
            $selected += $cacheList.Items[$i]
        }
    } else {
        foreach ($item in $cacheList.CheckedItems) { $selected += $item }
        if ($selected.Count -eq 0) {
            [System.Windows.Forms.MessageBox]::Show("Select at least one cache type.","Nothing selected")
            return
        }
    }

    $total = $selected.Count
    $step = 0
    $errCount = 0

    foreach ($item in $selected) {
        $step++
        $progress.Value = [int](($step / $total) * 100)
        Log "> $item" "Cyan"
        try {
            switch -Wildcard ($item) {
                "*User Temp*" {
                    $script:totalFreed += Clear-Folder $env:TEMP "User Temp"
                    $script:totalFreed += Clear-Folder "$env:LOCALAPPDATA\Temp" "LocalAppData Temp"
                }
                "*Windows Temp*" {
                    if ($isAdmin) { $script:totalFreed += Clear-Folder "C:\Windows\Temp" "Windows Temp" }
                    else { Log "  [SKIP] Needs admin" "Yellow" }
                }
                "*Prefetch*" {
                    if ($isAdmin) { Clear-Folder "C:\Windows\Prefetch" "Prefetch" | Out-Null }
                    else { Log "  [SKIP] Needs admin" "Yellow" }
                }
                "*DNS*" {
                    try {
                        ipconfig /flushdns | Out-Null
                        Log "  [OK] DNS cache flushed" "Green"
                    } catch { Log "  [ERR] $_" "Red"; $errCount++ }
                }
                "*Thumbnail*" {
                    $thumb = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer"
                    $before = Get-FolderSize $thumb
                    Get-ChildItem -Path $thumb -Filter "thumbcache_*.db" -Force -ErrorAction SilentlyContinue |
                        Remove-Item -Force -ErrorAction SilentlyContinue
                    $after = Get-FolderSize $thumb
                    $freed = $before - $after
                    if ($freed -lt 0) { $freed = 0 }
                    $script:totalFreed += $freed
                    Log ("  [OK] Thumbnails cleared - freed {0}" -f (Format-Size $freed)) "Green"
                }
                "*Windows Update*" {
                    if ($isAdmin) {
                        try {
                            Stop-Service wuauserv -Force -ErrorAction SilentlyContinue
                            Stop-Service bits -Force -ErrorAction SilentlyContinue
                            $script:totalFreed += Clear-Folder "C:\Windows\SoftwareDistribution\Download" "WU Download"
                            Start-Service bits -ErrorAction SilentlyContinue
                            Start-Service wuauserv -ErrorAction SilentlyContinue
                        } catch { Log "  [ERR] $_" "Red"; $errCount++ }
                    } else { Log "  [SKIP] Needs admin" "Yellow" }
                }
                "*Delivery Optimization*" {
                    if ($isAdmin) {
                        $script:totalFreed += Clear-Folder "C:\Windows\SoftwareDistribution\DeliveryOptimization" "Delivery Optimization"
                    } else { Log "  [SKIP] Needs admin" "Yellow" }
                }
                "*Recycle Bin*" {
                    try {
                        Clear-RecycleBin -Force -ErrorAction SilentlyContinue
                        Log "  [OK] Recycle Bin emptied" "Green"
                    } catch { Log "  [ERR] $_" "Red"; $errCount++ }
                }
                "*Chrome*" {
                    $script:totalFreed += Clear-Folder "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache" "Chrome Cache"
                    $script:totalFreed += Clear-Folder "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache" "Chrome Code Cache"
                }
                "*Edge*" {
                    $script:totalFreed += Clear-Folder "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache" "Edge Cache"
                }
                "*Firefox*" {
                    $ffPath = "$env:LOCALAPPDATA\Mozilla\Firefox\Profiles"
                    if (Test-Path $ffPath) {
                        Get-ChildItem $ffPath -Directory | ForEach-Object {
                            $script:totalFreed += Clear-Folder "$($_.FullName)\cache2" "Firefox ($($_.Name))"
                        }
                    } else { Log "  [SKIP] Firefox not found" "Dim" }
                }
                "*Recent*" {
                    $script:totalFreed += Clear-Folder "$env:APPDATA\Microsoft\Windows\Recent" "Recent files"
                    Clear-Folder "$env:APPDATA\Microsoft\Windows\Recent\AutomaticDestinations" "Jump Lists" | Out-Null
                }
                "*Clipboard*" {
                    try {
                        Set-Clipboard -Value $null
                        Log "  [OK] Clipboard cleared" "Green"
                    } catch { Log "  [ERR] $_" "Red"; $errCount++ }
                }
                "*Standby*" {
                    if ($isAdmin) {
                        try {
                            rundll32.exe advapi32.dll,ProcessIdleTasks
                            Log "  [OK] Standby list cleared" "Green"
                        } catch { Log "  [ERR] $_" "Red"; $errCount++ }
                    } else { Log "  [SKIP] Needs admin" "Yellow" }
                }
                default { Log "  [SKIP] Unknown item" "Dim" }
            }
        } catch {
            Log ("  [ERR] Exception: " + $_.Exception.Message) "Red"
            $errCount++
        }
        Log ""
    }

    $progress.Value = 100
    Divider
    Log ("  DONE - Total freed: {0}" -f (Format-Size $script:totalFreed)) "Cyan"
    if ($errCount -gt 0) { Log ("  Errors: {0}" -f $errCount) "Yellow" }
    Divider
    Log ""
    Log "Tip: use COPY LOG button or right-click in this area." "Dim"
}

# ---------- Analyze ----------
function Invoke-Analyze {
    $output.Clear()
    Divider
    Log "       CACHE SIZE ANALYSIS" "Cyan"
    Divider
    Log ""
    $targets = @(
        @{N="User Temp";          P=$env:TEMP},
        @{N="LocalAppData Temp";  P="$env:LOCALAPPDATA\Temp"},
        @{N="Windows Temp";       P="C:\Windows\Temp"},
        @{N="Prefetch";           P="C:\Windows\Prefetch"},
        @{N="WU Download";        P="C:\Windows\SoftwareDistribution\Download"},
        @{N="Thumbnails";         P="$env:LOCALAPPDATA\Microsoft\Windows\Explorer"},
        @{N="Chrome Cache";       P="$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"},
        @{N="Edge Cache";         P="$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"},
        @{N="Recent Files";       P="$env:APPDATA\Microsoft\Windows\Recent"}
    )
    $totalSize = 0
    $i = 0
    foreach ($t in $targets) {
        $i++
        $progress.Value = [int](($i / $targets.Count) * 100)
        $size = Get-FolderSize $t.P
        $totalSize += $size
        $line = "  " + $t.N.PadRight(22) + " : " + (Format-Size $size)
        Log $line "White"
    }
    Log ""
    Log ("  TOTAL CACHE SIZE       : {0}" -f (Format-Size $totalSize)) "Yellow"
    Log ""
    $progress.Value = 0
}

# ---------- Copy log ----------
function Copy-Log {
    if ($output.Text.Length -lt 3) {
        [System.Windows.Forms.MessageBox]::Show("Log is empty.","Nothing to copy")
        return
    }
    [System.Windows.Forms.Clipboard]::SetText($output.Text)
    $oldText = $btnCpy.Text
    $btnCpy.Text = "COPIED!"
    [System.Windows.Forms.Application]::DoEvents()
    Start-Sleep -Milliseconds 900
    $btnCpy.Text = $oldText
}

# ---------- Welcome ----------
Log "Cache Memory Cleaner ready." "Cyan"
Log "Select caches on the left, then click CLEAN SELECTED or CLEAN ALL." "White"
Log "Right-click in the output area to copy. Use COPY LOG for the whole log." "Dim"
Log "Tip: run as Administrator for full cleaning." "Yellow"
Log ""

# ---------- Show ----------
[void]$form.ShowDialog()