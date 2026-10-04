# DuplicateFileFinder.ps1
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

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
$form.Text = "Duplicate File Finder"
$form.Size = New-Object System.Drawing.Size(1100, 720)
$form.MinimumSize = New-Object System.Drawing.Size(900, 560)
$form.StartPosition = "CenterScreen"
$form.BackColor = $colBg
$form.ForeColor = $colText
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)

# Header
$header = New-Object System.Windows.Forms.Panel
$header.Location = New-Object System.Drawing.Point(0, 0)
$header.Size = New-Object System.Drawing.Size(1100, 70)
$header.BackColor = [System.Drawing.Color]::FromArgb(22, 24, 38)
$header.Anchor = "Top,Left,Right"
$form.Controls.Add($header)

$title = New-Object System.Windows.Forms.Label
$title.Text = "DUPLICATE FILE FINDER"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = $colAccent
$title.Location = New-Object System.Drawing.Point(20, 12)
$title.Size = New-Object System.Drawing.Size(500, 30)
$header.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "Find duplicate files by hash (MD5) - pick a folder to scan"
$subtitle.Font = New-Object System.Drawing.Font("Segoe UI", 8.5)
$subtitle.ForeColor = $colDim
$subtitle.Location = New-Object System.Drawing.Point(22, 42)
$subtitle.Size = New-Object System.Drawing.Size(600, 18)
$header.Controls.Add($subtitle)

# Folder row
$folderPanel = New-Object System.Windows.Forms.Panel
$folderPanel.Location = New-Object System.Drawing.Point(15, 85)
$folderPanel.Size = New-Object System.Drawing.Size(1070, 60)
$folderPanel.BackColor = $colPanel
$folderPanel.Anchor = "Top,Left,Right"
$form.Controls.Add($folderPanel)

$lblFolder = New-Object System.Windows.Forms.Label
$lblFolder.Text = "Folder:"
$lblFolder.ForeColor = $colText
$lblFolder.Location = New-Object System.Drawing.Point(12, 20)
$lblFolder.Size = New-Object System.Drawing.Size(60, 20)
$folderPanel.Controls.Add($lblFolder)

$txtPath = New-Object System.Windows.Forms.TextBox
$txtPath.Location = New-Object System.Drawing.Point(75, 17)
$txtPath.Size = New-Object System.Drawing.Size(700, 26)
$txtPath.BackColor = $colConsole
$txtPath.ForeColor = $colText
$txtPath.BorderStyle = "FixedSingle"
$txtPath.Font = New-Object System.Drawing.Font("Consolas", 9.5)
$txtPath.Text = "$env:USERPROFILE\Downloads"
$folderPanel.Controls.Add($txtPath)

$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "Browse..."
$btnBrowse.Location = New-Object System.Drawing.Point(785, 16)
$btnBrowse.Size = New-Object System.Drawing.Size(90, 28)
$btnBrowse.BackColor = $colBlue
$btnBrowse.ForeColor = [System.Drawing.Color]::White
$btnBrowse.FlatStyle = "Flat"
$btnBrowse.FlatAppearance.BorderSize = 0
$btnBrowse.Cursor = "Hand"
$folderPanel.Controls.Add($btnBrowse)

$chkSub = New-Object System.Windows.Forms.CheckBox
$chkSub.Text = "Include subfolders"
$chkSub.ForeColor = $colText
$chkSub.Location = New-Object System.Drawing.Point(890, 18)
$chkSub.Size = New-Object System.Drawing.Size(160, 24)
$chkSub.Checked = $true
$folderPanel.Controls.Add($chkSub)

# TreeView for duplicate groups
$tree = New-Object System.Windows.Forms.TreeView
$tree.Location = New-Object System.Drawing.Point(15, 155)
$tree.Size = New-Object System.Drawing.Size(1070, 440)
$tree.BackColor = $colConsole
$tree.ForeColor = $colText
$tree.Font = New-Object System.Drawing.Font("Consolas", 9)
$tree.BorderStyle = "None"
$tree.Anchor = "Top,Bottom,Left,Right"
$tree.ShowLines = $true
$tree.ShowRootLines = $true
$form.Controls.Add($tree)

$ctxTree = New-Object System.Windows.Forms.ContextMenuStrip
$miOpenFile = $ctxTree.Items.Add("Open file location")
$miDelFile  = $ctxTree.Items.Add("Delete this file")
$miCopyPath = $ctxTree.Items.Add("Copy path")
$tree.ContextMenuStrip = $ctxTree

# Status
$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "Ready. Pick a folder and click SCAN."
$lblStatus.Font = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$lblStatus.ForeColor = $colAccent
$lblStatus.Location = New-Object System.Drawing.Point(20, 605)
$lblStatus.Size = New-Object System.Drawing.Size(1060, 22)
$lblStatus.Anchor = "Bottom,Left,Right"
$form.Controls.Add($lblStatus)

# Progress
$progress = New-Object System.Windows.Forms.ProgressBar
$progress.Location = New-Object System.Drawing.Point(15, 632)
$progress.Size = New-Object System.Drawing.Size(1070, 8)
$progress.Anchor = "Bottom,Left,Right"
$form.Controls.Add($progress)

# Buttons
$btnPanel = New-Object System.Windows.Forms.Panel
$btnPanel.Location = New-Object System.Drawing.Point(15, 650)
$btnPanel.Size = New-Object System.Drawing.Size(1070, 55)
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

function Format-Size($bytes) {
    if ($bytes -ge 1GB) { return "{0:N2} GB" -f ($bytes / 1GB) }
    elseif ($bytes -ge 1MB) { return "{0:N2} MB" -f ($bytes / 1MB) }
    elseif ($bytes -ge 1KB) { return "{0:N2} KB" -f ($bytes / 1KB) }
    else { return "$bytes B" }
}

$script:dupGroups = @{}

function Scan-Folder {
    $root = $txtPath.Text.Trim()
    if (-not (Test-Path $root)) {
        [System.Windows.Forms.MessageBox]::Show("Folder not found: $root", "Error")
        return
    }
    $tree.Nodes.Clear()
    $script:dupGroups = @{}
    $lblStatus.Text = "Scanning: $root"
    [System.Windows.Forms.Application]::DoEvents()

    # 1. Group by size
    $getParams = @{ Path = $root; File = $true; ErrorAction = "SilentlyContinue" }
    if ($chkSub.Checked) { $getParams.Recurse = $true }
    $allFiles = Get-ChildItem @getParams | Where-Object { $_.Length -gt 0 }

    $bySize = @{}
    foreach ($f in $allFiles) {
        if (-not $bySize.ContainsKey($f.Length)) { $bySize[$f.Length] = @() }
        $bySize[$f.Length] += $f
    }
    $candidates = $bySize.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 } | ForEach-Object { $_.Value }

    # 2. Hash candidates
    $hashMap = @{}
    $i = 0
    $total = ($candidates | Measure-Object).Count
    foreach ($f in $candidates) {
        $i++
        if ($total -gt 0) {
            $progress.Value = [int](($i / $total) * 100)
        }
        if ($i % 20 -eq 0) {
            $lblStatus.Text = "Hashing: $i / $total  ($($f.Name))"
            [System.Windows.Forms.Application]::DoEvents()
        }
        try {
            $h = (Get-FileHash -Path $f.FullName -Algorithm MD5 -ErrorAction Stop).Hash
            if (-not $hashMap.ContainsKey($h)) { $hashMap[$h] = @() }
            $hashMap[$h] += $f
        } catch {}
    }

    # 3. Build duplicate groups
    $dups = $hashMap.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 }
    $wasted = 0
    $groupCount = 0
    foreach ($d in $dups) {
        $groupCount++
        $size = $d.Value[0].Length
        $wasted += $size * ($d.Value.Count - 1)
        $first = $d.Value[0]
        $node = New-Object System.Windows.Forms.TreeNode("Group $groupCount  -  $($d.Value.Count) copies  -  $(Format-Size $size) each")
        $node.ForeColor = $colYellow
        foreach ($file in $d.Value) {
            $child = New-Object System.Windows.Forms.TreeNode($file.FullName)
            $child.ForeColor = $colGreen
            $child.Tag = $file.FullName
            [void]$node.Nodes.Add($child)
        }
        [void]$tree.Nodes.Add($node)
    }

    $progress.Value = 0
    if ($groupCount -eq 0) {
        $lblStatus.Text = "No duplicates found in: $root"
    } else {
        $lblStatus.Text = "Found $groupCount duplicate groups  -  Wasted space: $(Format-Size $wasted)"
        $tree.ExpandAll()
    }
}

$btnScan    = New-Btn "SCAN"        15  150 $colBlue                                    { Scan-Folder }
$btnExpand  = New-Btn "Expand All"  175 130 $colAccent                                  { $tree.ExpandAll() }
$btnCollaps = New-Btn "Collapse"    315 130 $colDim                                     { $tree.CollapseAll() }
$btnExit    = New-Btn "Exit"        980 90  ([System.Drawing.Color]::FromArgb(60,60,75)) { $form.Close() }
$btnExit.Anchor = "Bottom,Right"

$btnBrowse.Add_Click({
    $dlg = New-Object System.Windows.Forms.FolderBrowserDialog
    $dlg.SelectedPath = $txtPath.Text
    if ($dlg.ShowDialog() -eq "OK") { $txtPath.Text = $dlg.SelectedPath }
})

$miOpenFile.Add_Click({
    if ($tree.SelectedNode -and $tree.SelectedNode.Tag) {
        $path = $tree.SelectedNode.Tag
        Start-Process explorer.exe -ArgumentList "/select,`"$path`""
    }
})
$miCopyPath.Add_Click({
    if ($tree.SelectedNode -and $tree.SelectedNode.Tag) {
        [System.Windows.Forms.Clipboard]::SetText($tree.SelectedNode.Tag)
    }
})
$miDelFile.Add_Click({
    if ($tree.SelectedNode -and $tree.SelectedNode.Tag) {
        $path = $tree.SelectedNode.Tag
        $ok = [System.Windows.Forms.MessageBox]::Show("Delete (to Recycle Bin):`n$path", "Confirm", "YesNo", "Warning")
        if ($ok -eq "Yes") {
            try {
                Add-Type -AssemblyName Microsoft.VisualBasic
                [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($path, 'OnlyErrorDialogs', 'SendToRecycleBin')
                $tree.SelectedNode.Remove()
            } catch {
                [System.Windows.Forms.MessageBox]::Show("Failed: $($_.Exception.Message)")
            }
        }
    }
})

[void]$form.ShowDialog()