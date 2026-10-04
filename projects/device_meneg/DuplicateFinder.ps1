Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = "Duplicate File Finder"
$form.Size = New-Object System.Drawing.Size(760,600)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(25,25,30)

$title = New-Object System.Windows.Forms.Label
$title.Text = "DUPLICATE FILE FINDER"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = [System.Drawing.Color]::Cyan
$title.Location = New-Object System.Drawing.Point(20,12)
$title.Size = New-Object System.Drawing.Size(500,35)
$form.Controls.Add($title)

$pathBox = New-Object System.Windows.Forms.TextBox
$pathBox.Location = New-Object System.Drawing.Point(20,55)
$pathBox.Size = New-Object System.Drawing.Size(520,28)
$pathBox.Text = "C:\Users\$env:USERNAME\Downloads"
$form.Controls.Add($pathBox)

$browseBtn = New-Object System.Windows.Forms.Button
$browseBtn.Text = "Browse"
$browseBtn.Location = New-Object System.Drawing.Point(550,55)
$browseBtn.Size = New-Object System.Drawing.Size(100,28)
$browseBtn.FlatStyle = "Flat"
$browseBtn.Add_Click({
    $f = New-Object System.Windows.Forms.FolderBrowserDialog
    if ($f.ShowDialog() -eq "OK") { $pathBox.Text = $f.SelectedPath }
})
$form.Controls.Add($browseBtn)

$output = New-Object System.Windows.Forms.TextBox
$output.Location = New-Object System.Drawing.Point(20,95)
$output.Size = New-Object System.Drawing.Size(710,420)
$output.Multiline = $true
$output.ScrollBars = "Vertical"
$output.ReadOnly = $true
$output.BackColor = "Black"
$output.ForeColor = "Lime"
$output.Font = New-Object System.Drawing.Font("Consolas", 9)
$form.Controls.Add($output)

$scanBtn = New-Object System.Windows.Forms.Button
$scanBtn.Text = "SCAN FOR DUPLICATES"
$scanBtn.Location = New-Object System.Drawing.Point(20,530)
$scanBtn.Size = New-Object System.Drawing.Size(220,40)
$scanBtn.BackColor = [System.Drawing.Color]::FromArgb(0,130,200)
$scanBtn.ForeColor = "White"
$scanBtn.FlatStyle = "Flat"
$scanBtn.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$scanBtn.Add_Click({
    $output.Clear()
    $output.AppendText("Scanning: $($pathBox.Text)`r`n`r`n")
    [System.Windows.Forms.Application]::DoEvents()
    $files = Get-ChildItem -Path $pathBox.Text -File -Recurse -ErrorAction SilentlyContinue
    $total = $files.Count
    $i = 0
    $hashes = @{}
    foreach ($f in $files) {
        $i++
        if ($i % 50 -eq 0) { [System.Windows.Forms.Application]::DoEvents() }
        if ($f.Length -eq 0) { continue }
        try {
            $h = (Get-FileHash -Path $f.FullName -Algorithm MD5 -ErrorAction SilentlyContinue).Hash
            if ($h) {
                if (-not $hashes[$h]) { $hashes[$h] = @() }
                $hashes[$h] += $f.FullName
            }
        } catch {}
    }
    $dups = $hashes.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 }
    $wasted = 0
    foreach ($d in $dups) {
        $output.AppendText("--- Duplicate set ($($d.Value.Count) copies) ---`r`n")
        foreach ($path in $d.Value) {
            $size = (Get-Item $path).Length
            $output.AppendText("  $path  [$([math]::Round($size/1KB,1)) KB]`r`n")
        }
        $wasted += (Get-Item $d.Value[0]).Length * ($d.Value.Count - 1)
        $output.AppendText("`r`n")
    }
    $output.AppendText("`r`nTotal duplicate groups: $($dups.Count)`r`n")
    $output.AppendText("Wasted space: $([math]::Round($wasted/1MB,2)) MB`r`n")
})
$form.Controls.Add($scanBtn)

$exitBtn = New-Object System.Windows.Forms.Button
$exitBtn.Text = "Exit"
$exitBtn.Location = New-Object System.Drawing.Point(630,530)
$exitBtn.Size = New-Object System.Drawing.Size(100,40)
$exitBtn.FlatStyle = "Flat"
$exitBtn.Add_Click({ $form.Close() })
$form.Controls.Add($exitBtn)

[void]$form.ShowDialog()