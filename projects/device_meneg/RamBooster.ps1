Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = "RAM Booster"
$form.Size = New-Object System.Drawing.Size(500,420)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(20,20,25)

$title = New-Object System.Windows.Forms.Label
$title.Text = "RAM BOOSTER"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = [System.Drawing.Color]::Cyan
$title.Location = New-Object System.Drawing.Point(20,12)
$title.Size = New-Object System.Drawing.Size(400,35)
$form.Controls.Add($title)

$bar = New-Object System.Windows.Forms.ProgressBar
$bar.Location = New-Object System.Drawing.Point(20,70)
$bar.Size = New-Object System.Drawing.Size(440,30)
$bar.Maximum = 100
$form.Controls.Add($bar)

$info = New-Object System.Windows.Forms.Label
$info.Location = New-Object System.Drawing.Point(20,110)
$info.Size = New-Object System.Drawing.Size(440,30)
$info.ForeColor = "Lime"
$info.Font = New-Object System.Drawing.Font("Consolas", 11)
$form.Controls.Add($info)

$log = New-Object System.Windows.Forms.TextBox
$log.Location = New-Object System.Drawing.Point(20,150)
$log.Size = New-Object System.Drawing.Size(440,160)
$log.Multiline = $true
$log.ScrollBars = "Vertical"
$log.ReadOnly = $true
$log.BackColor = "Black"
$log.ForeColor = "Lime"
$log.Font = New-Object System.Drawing.Font("Consolas", 9)
$form.Controls.Add($log)

function Update-RAM {
    $os = Get-CimInstance Win32_OperatingSystem
    $total = [math]::Round($os.TotalVisibleMemorySize/1MB,2)
    $free  = [math]::Round($os.FreePhysicalMemory/1MB,2)
    $used  = [math]::Round($total-$free,2)
    $pct   = [int](($used/$total)*100)
    $bar.Value = $pct
    $info.Text = "Used: $used GB / $total GB  ($pct%)"
}

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1000
$timer.Add_Tick({ Update-RAM })
$timer.Start()

$boostBtn = New-Object System.Windows.Forms.Button
$boostBtn.Text = "BOOST RAM NOW"
$boostBtn.Location = New-Object System.Drawing.Point(20,320)
$boostBtn.Size = New-Object System.Drawing.Size(200,40)
$boostBtn.BackColor = [System.Drawing.Color]::FromArgb(200,50,50)
$boostBtn.ForeColor = "White"
$boostBtn.FlatStyle = "Flat"
$boostBtn.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$boostBtn.Add_Click({
    $log.AppendText("Trimming working sets...`r`n")
    Get-Process | ForEach-Object {
        try { [System.Diagnostics.Process]::GetProcessById($_.Id).MinWorkingSet = 1 } catch {}
    }
    rundll32.exe advapi32.dll,ProcessIdleTasks
    Start-Sleep -Seconds 2
    Update-RAM
    $log.AppendText("Done. RAM freed.`r`n")
})
$form.Controls.Add($boostBtn)

$exitBtn = New-Object System.Windows.Forms.Button
$exitBtn.Text = "Exit"
$exitBtn.Location = New-Object System.Drawing.Point(360,320)
$exitBtn.Size = New-Object System.Drawing.Size(100,40)
$exitBtn.FlatStyle = "Flat"
$exitBtn.Add_Click({ $form.Close() })
$form.Controls.Add($exitBtn)

Update-RAM
[void]$form.ShowDialog()