# DriveMemoryCheck.ps1
# Run from D: drive

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create main form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Drive Memory Checker"
$form.Size = New-Object System.Drawing.Size(700, 500)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)

# Title Label
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "Drive Memory Checker"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::Cyan
$titleLabel.Location = New-Object System.Drawing.Point(20, 10)
$titleLabel.Size = New-Object System.Drawing.Size(400, 35)
$form.Controls.Add($titleLabel)

# Drives ListBox
$drivesList = New-Object System.Windows.Forms.ListBox
$drivesList.Location = New-Object System.Drawing.Point(20, 60)
$drivesList.Size = New-Object System.Drawing.Size(200, 350)
$drivesList.BackColor = [System.Drawing.Color]::FromArgb(45, 45, 45)
$drivesList.ForeColor = [System.Drawing.Color]::Lime
$drivesList.Font = New-Object System.Drawing.Font("Consolas", 11)
$form.Controls.Add($drivesList)

# Output TextBox (Console style)
$outputBox = New-Object System.Windows.Forms.TextBox
$outputBox.Location = New-Object System.Drawing.Point(240, 60)
$outputBox.Size = New-Object System.Drawing.Size(430, 350)
$outputBox.Multiline = $true
$outputBox.ScrollBars = "Vertical"
$outputBox.BackColor = [System.Drawing.Color]::Black
$outputBox.ForeColor = [System.Drawing.Color]::Lime
$outputBox.Font = New-Object System.Drawing.Font("Consolas", 10)
$outputBox.ReadOnly = $true
$form.Controls.Add($outputBox)

# Function to write to output console
function Write-Console($msg) {
    $outputBox.AppendText("$msg`r`n")
    $outputBox.SelectionStart = $outputBox.Text.Length
    $outputBox.ScrollToCaret()
    [System.Windows.Forms.Application]::DoEvents()
}

# Load drives
function Load-Drives {
    $drivesList.Items.Clear()
    $drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -ne $null }
    foreach ($d in $drives) {
        [void]$drivesList.Items.Add($d.Name)
    }
}

# Check all drives button
$checkAllBtn = New-Object System.Windows.Forms.Button
$checkAllBtn.Text = "Check ALL Drives"
$checkAllBtn.Location = New-Object System.Drawing.Point(20, 420)
$checkAllBtn.Size = New-Object System.Drawing.Size(200, 30)
$checkAllBtn.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
$checkAllBtn.ForeColor = [System.Drawing.Color]::White
$checkAllBtn.FlatStyle = "Flat"
$form.Controls.Add($checkAllBtn)

# Check selected button
$checkSelBtn = New-Object System.Windows.Forms.Button
$checkSelBtn.Text = "Check Selected"
$checkSelBtn.Location = New-Object System.Drawing.Point(240, 420)
$checkSelBtn.Size = New-Object System.Drawing.Size(150, 30)
$checkSelBtn.BackColor = [System.Drawing.Color]::FromArgb(0, 150, 80)
$checkSelBtn.ForeColor = [System.Drawing.Color]::White
$checkSelBtn.FlatStyle = "Flat"
$form.Controls.Add($checkSelBtn)

# Clear button
$clearBtn = New-Object System.Windows.Forms.Button
$clearBtn.Text = "Clear"
$clearBtn.Location = New-Object System.Drawing.Point(410, 420)
$clearBtn.Size = New-Object System.Drawing.Size(100, 30)
$clearBtn.BackColor = [System.Drawing.Color]::FromArgb(150, 50, 50)
$clearBtn.ForeColor = [System.Drawing.Color]::White
$clearBtn.FlatStyle = "Flat"
$form.Controls.Add($clearBtn)

# Refresh drives button
$refreshBtn = New-Object System.Windows.Forms.Button
$refreshBtn.Text = "Refresh Drives"
$refreshBtn.Location = New-Object System.Drawing.Point(530, 420)
$refreshBtn.Size = New-Object System.Drawing.Size(140, 30)
$refreshBtn.BackColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
$refreshBtn.ForeColor = [System.Drawing.Color]::White
$refreshBtn.FlatStyle = "Flat"
$form.Controls.Add($refreshBtn)

# Function to convert bytes to readable format
function Format-Size($bytes) {
    if ($bytes -ge 1TB) { return "{0:N2} TB" -f ($bytes / 1TB) }
    elseif ($bytes -ge 1GB) { return "{0:N2} GB" -f ($bytes / 1GB) }
    elseif ($bytes -ge 1MB) { return "{0:N2} MB" -f ($bytes / 1MB) }
    elseif ($bytes -ge 1KB) { return "{0:N2} KB" -f ($bytes / 1KB) }
    else { return "$bytes B" }
}

# Function to check a drive using cmd (wmic)
function Check-Drive($driveLetter) {
    Write-Console "============================================"
    Write-Console "  DRIVE $driveLetter : MEMORY REPORT"
    Write-Console "============================================"
    Write-Console ""
    
    try {
        # Use cmd via wmic / PowerShell CIM for info
        $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='$driveLetter`:'" -ErrorAction Stop
        
        $totalBytes = $disk.Size
        $freeBytes  = $disk.FreeSpace
        $usedBytes  = $totalBytes - $freeBytes
        $usedPct    = if ($totalBytes -gt 0) { [math]::Round(($usedBytes / $totalBytes) * 100, 2) } else { 0 }
        $freePct    = [math]::Round(100 - $usedPct, 2)
        
        Write-Console "  Drive Letter : $driveLetter :"
        Write-Console "  Volume Label : $($disk.VolumeName)"
        Write-Console "  File System  : $($disk.FileSystem)"
        Write-Console "  Drive Type   : $(switch($disk.DriveType){2{'Removable'}3{'Fixed'}4{'Network'}5{'CD-ROM'}default{'Unknown'}})"
        Write-Console ""
        Write-Console "  Total Size   : $(Format-Size $totalBytes)"
        Write-Console "  Used Space   : $(Format-Size $usedBytes)  ($usedPct%)"
        Write-Console "  Free Space   : $(Format-Size $freeBytes)  ($freePct%)"
        Write-Console ""
        
        # Visual bar
        $barLen = 40
        $filled = [math]::Round(($usedPct / 100) * $barLen)
        $empty  = $barLen - $filled
        $bar = "[" + ("#" * $filled) + ("-" * $empty) + "]"
        Write-Console "  Usage: $bar $usedPct%"
        Write-Console ""
        
        # Also run native cmd dir to verify
        Write-Console "  --- CMD verification (dir $driveLetter`:\ ) ---"
        $cmdOut = cmd /c "dir $driveLetter`:\ /-c" 2>&1 | Select-Object -Last 4
        foreach ($line in $cmdOut) { Write-Console "  $line" }
        
        Write-Console ""
    }
    catch {
        Write-Console "  [ERROR] Cannot read drive $driveLetter : $_"
        Write-Console ""
    }
}

# Event: Check All
$checkAllBtn.Add_Click({
    $outputBox.Clear()
    Write-Console ">>> Starting FULL DRIVE SCAN..."
    Write-Console ""
    foreach ($item in $drivesList.Items) {
        Check-Drive $item
        Start-Sleep -Milliseconds 200
    }
    Write-Console ">>> SCAN COMPLETE."
})

# Event: Check Selected
$checkSelBtn.Add_Click({
    if ($drivesList.SelectedItem) {
        $outputBox.Clear()
        Check-Drive $drivesList.SelectedItem
    } else {
        [System.Windows.Forms.MessageBox]::Show("Please select a drive first.", "No Selection")
    }
})

# Event: Clear
$clearBtn.Add_Click({
    $outputBox.Clear()
})

# Event: Refresh
$refreshBtn.Add_Click({
    Load-Drives
    Write-Console ">>> Drive list refreshed."
})

# Load initial drives
Load-Drives

Write-Console "=== DRIVE MEMORY CHECKER ==="
Write-Console "Select a drive or click 'Check ALL Drives'"
Write-Console ""

# Show form
[void]$form.ShowDialog()