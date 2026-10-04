# RecycleBinManager.ps1
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

$colBg      = [System.Drawing.Color]::FromArgb(18, 18, 28)
$colPanel   = [System.Drawing.Color]::FromArgb(28, 30, 45)
$colConsole = [System.Drawing.Color]::FromArgb(10, 10, 18)
$colAccent  = [System.Drawing.Color]::FromArgb(0, 200, 255)
$colGreen   = [System.Drawing.Color]::FromArgb(0, 220, 130)
$colRed     = [System.Drawing.Color]::FromArgb(255, 95, 95)
$colYellow  = [System.Drawing.Color]::FromArgb(255, 190, 60)
$colText    = [System.Drawing.Color]::FromArgb(220, 225, 235)
$colDim     = [System.Drawing.Color]::FromArgb(130, 140, 160)
$colBlue    = [System.Drawing.Color]::FromArgb(0, 130, 210)

$form = New-Object System.Windows.Forms.Form
$form.Text = "Recycle Bin Manager"
$form.Size = New-Object System.Drawing.Size(1000, 700)
$form.MinimumSize = New-Object System.Drawing.Size(800, 560)
$form.StartPosition = "CenterScreen"
$form.BackColor = $colBg
$form.ForeColor = $colText
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)

# Header
$header = New-Object System.Windows.Forms.Panel
$header.Location = New-Object System.Drawing.Point(0, 0)
$header.Size = New-Object System.Drawing.Size(1000, 70)
$header.BackColor = [System.Drawing.Color]::FromArgb(22, 24, 38)
$header.Anchor = "Top,Left,Right"
$form.Controls.Add($header)

$title = New-Object System.Windows.Forms.Label
$title.Text = "RECYCLE BIN MANAGER"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = $colAccent
$title.Location = New-Object System.Drawing.Point(20, 12)
$title.Size = New-Object System.Drawing.Size(500, 30)
$header.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "View, restore, or permanently delete items across all drives"
$subtitle.Font = New-Object System.Drawing.Font("Segoe UI", 8.5)
$subtitle.ForeColor = $colDim
$subtitle.Location = New-Object System.Drawing.Point(22, 42)
$subtitle.Size = New-Object System.Drawing.Size(600, 18)
$header.Controls.Add($subtitle)

$adminLbl = New-Object System.Windows.Forms.Label
$adminLbl.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$adminLbl.TextAlign = "MiddleCenter"
$adminLbl.Size = New-Object System.Drawing.Size(200, 30)
$adminLbl.Location = New-Object System.Drawing.Point(770, 20)
$adminLbl.Anchor = "Top,Right"
if ($isAdmin) {
    $adminLbl.Text = "ADMINISTRATOR"
    $adminLbl.ForeColor = $colGreen
    $adminLbl.BackColor = [System.Drawing.Color]::FromArgb(20, 60, 40)
} else {
    $adminLbl.Text = "USER MODE"
    $adminLbl.ForeColor = $colYellow
    $adminLbl.BackColor = [System.Drawing.Color]::FromArgb(70, 55, 15)
}
$header.Controls.Add($adminLbl)

# Stats bar
$statsPanel = New-Object System.Windows.Forms.Panel
$statsPanel.Location = New-Object System.Drawing.Point(15, 85)
$statsPanel.Size = New-Object System.Drawing.Size(970, 50)
$statsPanel.BackColor = $colPanel
$statsPanel.Anchor = "Top,Left,Right"
$form.Controls.Add($statsPanel)

$lblStats = New-Object System.Windows.Forms.Label
$lblStats.Text = "Items: --    Total size: --    Drives: --"
$lblStats.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$lblStats.ForeColor = $colAccent
$lblStats.Location = New-Object System.Drawing.Point(15, 15)
$lblStats.Size = New-Object System.Drawing.Size(940, 22)
$lblStats.Anchor = "Top,Left,Right"
$statsPanel.Controls.Add($lblStats)

# ListView
$listView = New-Object System.Windows.Forms.ListView
$listView.Location = New-Object System.Drawing.Point(15, 145)
$listView.Size = New-Object System.Drawing.Size(970, 420)
$listView.View = "Details"
$listView.FullRowSelect = $true
$listView.GridLines = $false
$listView.MultiSelect = $true
$listView.HideSelection = $false
$listView.BackColor = $colConsole
$listView.ForeColor = $colText
$listView.Font = New-Object System.Drawing.Font("Consolas", 9)
$listView.BorderStyle = "None"
$listView.Anchor = "Top,Bottom,Left,Right"
[void]$listView.Columns.Add("Name", 380)
[void]$listView.Columns.Add("Original Location", 280)
[void]$listView.Columns.Add("Deleted On", 140)
[void]$listView.Columns.Add("Size", 80)
[void]$listView.Columns.Add("Drive", 60)
$form.Controls.Add($listView)

$ctxList = New-Object System.Windows.Forms.ContextMenuStrip
$miRestore = $ctxList.Items.Add("Restore selected")
$miDelete  = $ctxList.Items.Add("Delete permanently")
$miCopyPath = $ctxList.Items.Add("Copy original path")
$miCopyName = $ctxList.Items.Add("Copy name")
$listView.ContextMenuStrip = $ctxList

# Progress
$progress = New-Object System.Windows.Forms.ProgressBar
$progress.Location = New-Object System.Drawing.Point(15, 575)
$progress.Size = New-Object System.Drawing.Size(970, 8)
$progress.Anchor = "Bottom,Left,Right"
$form.Controls.Add($progress)

# Buttons
$btnPanel = New-Object System.Windows.Forms.Panel
$btnPanel.Location = New-Object System.Drawing.Point(15, 595)
$btnPanel.Size = New-Object System.Drawing.Size(970, 55)
$btnPanel.BackColor = $colBg
$btnPanel.Anchor = "Bottom,Left,Right"
$form.Controls.Add($btnPanel)

function New-Btn($text, $x, $w, $color, $handler) {
    $b = New-Object System.Windows.Forms.Button
    $b.Text = $text
    $b.Location = New-Object System.Drawing.Point($x, 5)
    $b.Size = New-Object System.Drawing.Size($w, 40)
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

# -- Shell COM helper: enumerate recycle bin --
function Get-RecycleBinItems {
    $items = @()
    try {
        $shell = New-Object -ComObject Shell.Application
        $bin = $shell.Namespace(0xA)  # ssfBITBUCKET
        if ($null -eq $bin) { return @() }
        foreach ($it in $bin.Items()) {
            $name = $it.Name
            $origPath = $bin.GetDetailsOf($it, 1)   # Original Location
            $deleted  = $bin.GetDetailsOf($it, 2)   # Date Deleted
            $size     = $bin.GetDetailsOf($it, 3)   # Size
            $items += [PSCustomObject]@{
                Name     = $name
                OrigPath = $origPath
                Deleted  = $deleted
                Size     = $size
                Raw      = $it
            }
        }
    } catch {
        $items += [PSCustomObject]@{ Name="[ERROR] $($_.Exception.Message)"; OrigPath=""; Deleted=""; Size=""; Raw=$null }
    }
    return $items
}

function Load-Bin {
    $listView.Items.Clear()
    $lblStats.Text = "Loading..."
    [System.Windows.Forms.Application]::DoEvents()

    $items = Get-RecycleBinItems
    if ($items.Count -eq 0) {
        $lblStats.Text = "Recycle Bin is empty."
        return
    }

    foreach ($it in $items) {
        if ($null -eq $it.Raw) { continue }
        $drive = ""
        if ($it.OrigPath -match "^([A-Za-z]):") { $drive = $matches[1] + ":" }
        $li = New-Object System.Windows.Forms.ListViewItem($it.Name)
        [void]$li.SubItems.Add($it.OrigPath)
        [void]$li.SubItems.Add($it.Deleted)
        [void]$li.SubItems.Add($it.Size)
        [void]$li.SubItems.Add($drive)
        $li.Tag = $it.Raw
        $listView.Items.Add($li)
    }

    $totalSize = 0
    foreach ($it in $items) {
        if ($it.Size -match "([\d\.,]+)\s*(GB|MB|KB|B)") {
            $n = [double]($matches[1] -replace ",", "")
            switch ($matches[2]) {
                "GB" { $totalSize += $n * 1GB }
                "MB" { $totalSize += $n * 1MB }
                "KB" { $totalSize += $n * 1KB }
                "B"  { $totalSize += $n }
            }
        }
    }
    $sizeStr = if ($totalSize -ge 1GB) { "{0:N2} GB" -f ($totalSize/1GB) }
               elseif ($totalSize -ge 1MB) { "{0:N2} MB" -f ($totalSize/1MB) }
               elseif ($totalSize -ge 1KB) { "{0:N2} KB" -f ($totalSize/1KB) }
               else { "$([int]$totalSize) B" }
    $drives = ($listView.Items | ForEach-Object { $_.SubItems[4].Text } | Sort-Object -Unique) -join ", "
    $lblStats.Text = "Items: $($listView.Items.Count)    Total size: $sizeStr    Drives: $drives"
}

function Restore-Selected {
    if ($listView.SelectedItems.Count -eq 0) { return }
    $ok = [System.Windows.Forms.MessageBox]::Show("Restore $($listView.SelectedItems.Count) item(s)?", "Confirm", "YesNo", "Question")
    if ($ok -ne "Yes") { return }
    $shell = New-Object -ComObject Shell.Application
    $bin = $shell.Namespace(0xA)
    $restored = 0
    foreach ($li in $listView.SelectedItems) {
        try {
            $item = $li.Tag
            $verb = $item.Verbs() | Where-Object { $_.Name -replace "&","" -match "^Restore$" }
            if ($verb) { $verb.DoIt(); $restored++ }
        } catch {}
    }
    Start-Sleep -Milliseconds 500
    Load-Bin
    [System.Windows.Forms.MessageBox]::Show("Restored: $restored item(s)")
}

function Delete-SelectedPermanent {
    if ($listView.SelectedItems.Count -eq 0) { return }
    $ok = [System.Windows.Forms.MessageBox]::Show("PERMANENTLY delete $($listView.SelectedItems.Count) item(s)?`n`nThis cannot be undone!", "Confirm", "YesNo", "Warning")
    if ($ok -ne "Yes") { return }
    $deleted = 0
    foreach ($li in $listView.SelectedItems) {
        try {
            $item = $li.Tag
            # Use Delete verb via shell
            $verb = $item.Verbs() | Where-Object { $_.Name -replace "&","" -match "^Delete$" }
            if ($verb) { $verb.DoIt(); $deleted++ }
        } catch {}
    }
    Start-Sleep -Milliseconds 500
    Load-Bin
    [System.Windows.Forms.MessageBox]::Show("Permanently deleted: $deleted item(s)")
}

function Empty-Bin {
    $ok = [System.Windows.Forms.MessageBox]::Show("EMPTY the ENTIRE Recycle Bin on ALL drives?`n`nThis cannot be undone!", "Confirm", "YesNo", "Warning")
    if ($ok -ne "Yes") { return }
    try {
        Clear-RecycleBin -Force -ErrorAction Stop
        [System.Windows.Forms.MessageBox]::Show("Recycle Bin emptied.")
    } catch {
        # fallback via Shell COM
        try {
            $shell = New-Object -ComObject Shell.Application
            $bin = $shell.Namespace(0xA)
            $items = @($bin.Items())
            foreach ($it in $items) {
                $verb = $it.Verbs() | Where-Object { $_.Name -replace "&","" -match "^Delete$" }
                if ($verb) { $verb.DoIt() }
            }
        } catch {}
    }
    Load-Bin
}

$btnLoad   = New-Btn "REFRESH"          15  130 $colBlue                                   { Load-Bin }
$btnRest   = New-Btn "RESTORE"          155 130 $colGreen                                  { Restore-Selected }
$btnDel    = New-Btn "DELETE PERM"      295 150 ([System.Drawing.Color]::FromArgb(180,60,60)) { Delete-SelectedPermanent }
$btnEmpty  = New-Btn "EMPTY BIN"        455 150 $colRed                                    { Empty-Bin }
$btnExit   = New-Btn "Exit"             905 80  ([System.Drawing.Color]::FromArgb(60,60,75))  { $form.Close() }
$btnExit.Anchor = "Bottom,Right"

$miRestore.Add_Click({ Restore-Selected })
$miDelete.Add_Click({ Delete-SelectedPermanent })
$miCopyPath.Add_Click({
    if ($listView.SelectedItems.Count -gt 0) {
        $txt = ($listView.SelectedItems | ForEach-Object { $_.SubItems[1].Text + "\" + $_.Text }) -join "`r`n"
        [System.Windows.Forms.Clipboard]::SetText($txt)
    }
})
$miCopyName.Add_Click({
    if ($listView.SelectedItems.Count -gt 0) {
        $txt = ($listView.SelectedItems | ForEach-Object { $_.Text }) -join "`r`n"
        [System.Windows.Forms.Clipboard]::SetText($txt)
    }
})

Load-Bin
[void]$form.ShowDialog()