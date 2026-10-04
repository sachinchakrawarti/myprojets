# ZeroByteFinder.ps1
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
$form.Text = "Zero-Byte File Finder"
$form.Size = New-Object System.Drawing.Size(1050, 720)
$form.MinimumSize = New-Object System.Drawing.Size(850, 560)
$form.StartPosition = "CenterScreen"
$form.BackColor = $colBg
$form.ForeColor = $colText
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)

# Header
$header = New-Object System.Windows.Forms.Panel
$header.Location = New-Object System.Drawing.Point(0, 0)
$header.Size = New-Object System.Drawing.Size(1050, 70)
$header.BackColor = [System.Drawing.Color]::FromArgb(22, 24, 38)
$header.Anchor = "Top,Left,Right"
$form.Controls.Add($header)

$title = New-Object System.Windows.Forms.Label
$title.Text = "ZERO-BYTE FILE FINDER"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = $colAccent
$title.Location = New-Object System.Drawing.Point(20, 12)
$title.Size = New-Object System.Drawing.Size(500, 30)
$header.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "Find all 0-byte files inside a folder - safe to remove or inspect"
$subtitle.Font = New-Object System.Drawing.Font("Segoe UI", 8.5)
$subtitle.ForeColor = $colDim
$subtitle.Location = New-Object System.Drawing.Point(22, 42)
$subtitle.Size = New-Object System.Drawing.Size(600, 18)
$header.Controls.Add($subtitle)

# Folder row
$folderPanel = New-Object System.Windows.Forms.Panel
$folderPanel.Location = New-Object System.Drawing.Point(15, 85)
$folderPanel.Size = New-Object System.Drawing.Size(1020, 60)
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
$txtPath.Size = New-Object System.Drawing.Size(650, 26)
$txtPath.BackColor = $colConsole
$txtPath.ForeColor = $colText
$txtPath.BorderStyle = "FixedSingle"
$txtPath.Font = New-Object System.Drawing.Font("Consolas", 9.5)
$txtPath.Text = "$env:USERPROFILE"
$folderPanel.Controls.Add($txtPath)

$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "Browse..."
$btnBrowse.Location = New-Object System.Drawing.Point(735, 16)
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
$chkSub.Location = New-Object System.Drawing.Point(840, 18)
$chkSub.Size = New-Object System.Drawing.Size(160, 24)
$chkSub.Checked = $true
$folderPanel.Controls.Add($chkSub)

# ListView
$listView = New-Object System.Windows.Forms.ListView
$listView.Location = New-Object System.Drawing.Point(15, 155)
$listView.Size = New-Object System.Drawing.Size(1020, 440)
$listView.View = "Details"
$listView.FullRowSelect = $true
$listView.MultiSelect = $true
$listView.HideSelection = $false
$listView.GridLines = $false
$listView