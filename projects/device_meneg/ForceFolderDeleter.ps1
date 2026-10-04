# ForceFolderDeleter.ps1
# Ask for a folder path and force-delete it with all known tricks.
# Auto-elevates to Administrator if not already admin.

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

# ---------- Auto-elevate ----------
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "powershell.exe"
        $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
        $psi.Verb = "runas"
        [System.Diagnostics.Process]::Start($psi) | Out-Null
    } catch {}
    exit
}

# ---------- Palette ----------
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

# ---------- Form ----------
$form = New-Object System.Windows.Forms.Form
$form.Text = "Force Folder Deleter"
$form.Size = New-Object System.Drawing.Size(900, 640)
$form.MinimumSize = New-Object System.Drawing.Size(760, 520)
$form.StartPosition = "CenterScreen"
$form.BackColor = $colBg
$form.ForeColor = $colText
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)

# ---------- Header ----------
$header = New-Object System.Windows.Forms.Panel
$header.Location = New-Object System.Drawing.Point(0, 0)
$header.Size = New-Object System.Drawing.Size(900, 70)
$header.BackColor = [System.Drawing.Color]::FromArgb(22, 24, 38)
$header.Anchor = "Top,Left,Right"
$form.Controls.Add($header)

$title = New-Object System.Windows.Forms.Label
$title.Text = "FORCE FOLDER DELETER"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = $colAccent
$title.Location = New-Object System.Drawing.Point(20, 12)
$title.Size = New-Object System.Drawing.Size(500, 30)
$header.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "Enter a folder path and force-delete it (long paths, locked files, permissions)"
$subtitle.Font = New-Object System.Drawing.Font("Segoe UI", 8.5)
$subtitle.ForeColor = $colDim
$subtitle.Location = New-Object System.Drawing.Point(22, 42)
$subtitle.Size = New-Object System.Drawing.Size(600, 18)
$header.Controls.Add($subtitle)

$adminLbl = New-Object System.Windows.Forms.Label
$adminLbl.Text = "ADMINISTRATOR"
$adminLbl.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$adminLbl.TextAlign = "MiddleCenter"
$adminLbl.Size = New-Object System.Drawing.Size(180, 30)
$adminLbl.Location = New-Object System.Drawing.Point(690, 20)
$adminLbl.Anchor = "Top,Right"
$adminLbl.ForeColor = $colGreen
$adminLbl.BackColor = [System.Drawing.Color]::FromArgb(20, 60, 40)
$header.Controls.Add($adminLbl)

# ---------- Path row ----------
$pathPanel = New-Object System.Windows.Forms.Panel
$pathPanel.Location = New-Object System.Drawing.Point(15, 85)
$pathPanel.Size = New-Object System.Drawing.Size(870, 70)
$pathPanel.BackColor = $colPanel
$pathPanel.Anchor = "Top,Left,Right"
$form.Controls.Add($pathPanel)

$lbl = New-Object System.Windows.Forms.Label
$lbl.Text = "Folder path:"
$lbl.ForeColor = $colText
$lbl.Location = New-Object System.Drawing.Point(12, 10)
$lbl.Size = New-Object System.Drawing.Size(100, 20)
$pathPanel.Controls.Add($lbl)

$txtPath = New-Object System.Windows.Forms.TextBox
$txtPath.Location = New-Object System.Drawing.Point(12, 32)
$txtPath.Size = New-Object System.Drawing.Size(720, 26)
$txtPath.BackColor = $colConsole
$txtPath.ForeColor = $colText
$txtPath.BorderStyle = "FixedSingle"
$txtPath.Font = New-Object System.Drawing.Font("Consolas", 10)
$pathPanel.Controls.Add($txtPath)

$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "Browse..."
$btnBrowse.Location = New-Object System.Drawing.Point(740, 30)
$btnBrowse.Size = New-Object System.Drawing.Size(115, 30)
$btnBrowse.BackColor = $colBlue
$btnBrowse.ForeColor = [System.Drawing.Color]::White
$btnBrowse.FlatStyle = "Flat"
$btnBrowse.FlatAppearance.BorderSize = 0
$btnBrowse.Cursor = "Hand"
$btnBrowse.Anchor = "Top,Right"
$pathPanel.Controls.Add($btnBrowse)

# ---------- Options row ----------
$optPanel = New-Object System.Windows.Forms.Panel
$optPanel.Location = New-Object System.Drawing.Point(15, 165)
$optPanel.Size = New-Object System.Drawing.Size(870, 40)
$optPanel.BackColor = $colBg
$optPanel.Anchor = "Top,Left,Right"
$form.Controls.Add($optPanel)

$chkKill = New-Object System.Windows.Forms.CheckBox
$chkKill.Text = "Kill processes locking files"
$chkKill.ForeColor = $colText
$chkKill.Location = New-Object System.Drawing.Point(5, 10)
$chkKill.Size = New-Object System.Drawing.Size(230, 22)
$chkKill.Checked = $true
$optPanel.Controls.Add($chkKill)

$chkTake = New-Object System.Windows.Forms.CheckBox
$chkTake.Text = "Take ownership + reset permissions"
$chkTake.ForeColor = $colText
$chkTake.Location = New-Object System.Drawing.Point(245, 10)
$chkTake.Size = New-Object System.Drawing.Size(290, 22)
$chkTake.Checked = $true
$optPanel.Controls.Add($chkTake)

$chkLong = New-Object System.Windows.Forms.CheckBox
$chkLong.Text = "Use long-path prefix (\\?\)"
$chkLong.ForeColor = $colText
$chkLong.Location = New-Object System.Drawing.Point(545, 10)
$chkLong.Size = New-Object System.Drawing.Size(240, 22)
$chkLong.Checked = $true
$optPanel.Controls.Add($chkLong)

# ---------- Console ----------
$output = New-Object System.Windows.Forms.RichTextBox
$output.Location = New-Object System.Drawing.Point(15, 215)
$output.Size = New-Object System.Drawing.Size(870, 320)
$output.BackColor = $colConsole
$output.ForeColor = $colGreen
$output.Font = New-Object System.Drawing.Font("Consolas", 10)
$output.BorderStyle = "None"
$output.ReadOnly = $true
$output.WordWrap = $true
$output.ScrollBars = "Vertical"
$output.Anchor = "Top,Bottom,Left,Right"
$output.DetectUrls = $false
$form.Controls.Add($output)

$ctx = New-Object System.Windows.Forms.ContextMenuStrip
$miCopySel = $ctx.Items.Add("Copy selection")
$miCopyAll = $ctx.Items.Add("Copy entire log")
$miClear   = $ctx.Items.Add("Clear log")
$miCopySel.Add_Click({ if ($output.SelectionLength -gt 0) { $output.Copy() } })
$miCopyAll.Add_Click({ [System.Windows.Forms.Clipboard]::SetText($output.Text) })
$miClear.Add_Click({ $output.Clear() })
$output.ContextMenuStrip = $ctx

# ---------- Progress ----------
$progress = New-Object System.Windows.Forms.ProgressBar
$progress.Location = New-Object System.Drawing.Point(15, 542)
$progress.Size = New-Object System.Drawing.Size(870, 8)
$progress.Anchor = "Bottom,Left,Right"
$form.Controls.Add($progress)

# ---------- Buttons ----------
$btnPanel = New-Object System.Windows.Forms.Panel
$btnPanel.Location = New-Object System.Drawing.Point(15, 555)
$btnPanel.Size = New-Object System.Drawing.Size(870, 55)
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

function Divider { Log ("-" * 70) "Cyan" }

# ---------- Helpers ----------
function Get-FolderSizeSafe($path) {
    try {
        $s = (Get-ChildItem -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue |
              Measure-Object -Property Length -Sum).Sum
        if ($null -eq $s) { return 0 }
        return [int64]$s
    } catch { return 0 }
}

function Format-Size($b) {
    if ($b -ge 1GB) { return "{0:N2} GB" -f ($b / 1GB) }
    elseif ($b -ge 1MB) { return "{0:N2} MB" -f ($b / 1MB) }
    elseif ($b -ge 1KB) { return "{0:N2} KB" -f ($b / 1KB) }
    else { return "$b B" }
}

function Clear-ReadOnlyAttrib($root) {
    try {
        Get-ChildItem -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue |
            ForEach-Object {
                try {
                    if ($_.Attributes -band [IO.FileAttributes]::ReadOnly) {
                        $_.Attributes = $_.Attributes -bxor [IO.FileAttributes]::ReadOnly
                    }
                } catch {}
            }
    } catch {}
}

function Take-Ownership($root) {
    try {
        $out = takeown.exe /F "$root" /R /D Y 2>&1
        $out | ForEach-Object { if ($_ -match "SUCCESS|ERROR|denied") { Log "    takeown: $_" "Dim" } }
    } catch { Log "    takeown failed: $($_.Exception.Message)" "Yellow" }
    try {
        $out = icacls.exe "$root" /grant "*S-1-5-32-544:F" /T /C /Q 2>&1
        $out | ForEach-Object { if ($_ -match "Successfully|Failed|denied") { Log "    icacls: $_" "Dim" } }
    } catch { Log "    icacls failed: $($_.Exception.Message)" "Yellow" }
}

function Kill-LockingProcesses($root) {
    # Kill common blocking processes
    $targets = @("explorer","SearchIndexer","SearchProtocolHost","SearchFilterHost","dllhost","OneDrive","Dropbox","GoogleDriveFS","AdobeCollabSync","Acrobat","WINWORD","EXCEL","POWERPNT","OUTLOOK","Code","devenv")
    foreach ($t in $targets) {
        $procs = Get-Process -Name $t -ErrorAction SilentlyContinue
        if ($procs) {
            foreach ($p in $procs) {
                try {
                    Stop-Process -Id $p.Id -Force -ErrorAction Stop
                    Log "    killed: $t (PID $($p.Id))" "Dim"
                } catch {}
            }
        }
    }
}

function Delete-Method1-Normal($root) {
    Log "  [1/5] Standard recursive delete..." "Cyan"
    try {
        Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction Stop
        return $true
    } catch {
        Log "    failed: $($_.Exception.Message)" "Dim"
        return $false
    }
}

function Delete-Method2-Attribs($root) {
    Log "  [2/5] Clearing read-only/system attributes then deleting..." "Cyan"
    try {
        Clear-ReadOnlyAttrib $root
        Get-ChildItem -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending |
            ForEach-Object {
                try { Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue } catch {}
            }
        Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction Stop
        return $true
    } catch {
        Log "    failed: $($_.Exception.Message)" "Dim"
        return $false
    }
}

function Delete-Method3-LongPath($root) {
    Log "  [3/5] Using \\?\ long-path prefix..." "Cyan"
    try {
        $lp = "\\?\$root"
        cmd /c "rd /s /q `"$lp`"" 2>&1 | Out-Null
        if (-not (Test-Path -LiteralPath $root)) { return $true }
        Log "    still exists after rd" "Dim"
        return $false
    } catch {
        Log "    failed: $($_.Exception.Message)" "Dim"
        return $false
    }
}

function Delete-Method4-Robocopy($root) {
    Log "  [4/5] Robocopy mirror-empty trick (works on stubborn folders)..." "Cyan"
    try {
        $empty = Join-Path $env:TEMP ("empty_" + [Guid]::NewGuid().ToString("N"))
        New-Item -ItemType Directory -Path $empty -Force | Out-Null
        $log = robocopy.exe "$empty" "$root" /MIR /R:0 /W:0 /NFL /NDL /NJH /NJS 2>&1
        Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $empty -Recurse -Force -ErrorAction SilentlyContinue
        if (-not (Test-Path -LiteralPath $root)) { return $true }
        Log "    still exists after robocopy" "Dim"
        return $false
    } catch {
        Log "    failed: $($_.Exception.Message)" "Dim"
        return $false
    }
}

function Delete-Method5-DotNet($root) {
    Log "  [5/5] .NET Directory.Delete fallback..." "Cyan"
    try {
        [System.IO.Directory]::Delete($root, $true)
        return $true
    } catch {
        Log "    failed: $($_.Exception.Message)" "Dim"
        return $false
    }
}

# ---------- Main action ----------
function Force-Delete {
    $path = $txtPath.Text.Trim().Trim('"')
    if ([string]::IsNullOrWhiteSpace($path)) {
        [System.Windows.Forms.MessageBox]::Show("Enter a folder path first.","Missing path","OK","Warning")
        return
    }

    # Normalize
    try { $path = (Resolve-Path -LiteralPath $path -ErrorAction Stop).Path } catch {
        [System.Windows.Forms.MessageBox]::Show("Path not found:`n$path","Error","OK","Error")
        return
    }

    # Safety checks
    if ($path.Length -le 3 -and $path -match "^[A-Za-z]:\\?$") {
        [System.Windows.Forms.MessageBox]::Show("Refusing to delete a drive root!","Blocked","OK","Error")
        return
    }
    $dangerous = @(
        "$env:SystemRoot", "$env:SystemRoot\System32", "$env:ProgramFiles",
        "${env:ProgramFiles(x86)}", "$env:ProgramData", "$env:USERPROFILE",
        "$env:LOCALAPPDATA", "$env:APPDATA"
    )
    foreach ($d in $dangerous) {
        if ($d -and $path.TrimEnd('\') -ieq $d.TrimEnd('\')) {
            [System.Windows.Forms.MessageBox]::Show("Refusing to delete protected system folder:`n$path","Blocked","OK","Error")
            return
        }
    }

    if (-not (Test-Path -LiteralPath $path)) {
        [System.Windows.Forms.MessageBox]::Show("Folder does not exist.","Info")
        return
    }

    $output.Clear()
    Divider
    Log "       FORCE FOLDER DELETER" "Cyan"
    Divider
    Log "Target : $path" "White"
    $sizeBefore = Get-FolderSizeSafe $path
    $countBefore = (Get-ChildItem -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object).Count
    Log "Size   : $(Format-Size $sizeBefore)" "White"
    Log "Items  : $countBefore files/folders" "White"
    Log "Time   : $(Get-Date)" "Dim"
    Log ""

    $confirm = [System.Windows.Forms.MessageBox]::Show(
        "PERMANENTLY delete this folder and everything inside?`n`n$path`n`nThis CANNOT be undone.",
        "Confirm Force Delete", "YesNo", "Warning")
    if ($confirm -ne "Yes") {
        Log "Cancelled by user." "Yellow"
        return
    }

    Log "Starting force-delete sequence..." "Cyan"
    Log ""

    # Optional steps
    if ($chkKill.Checked) {
        Log "  [pre] Killing processes that may lock files..." "Cyan"
        Kill-LockingProcesses $path
    }
    if ($chkTake.Checked) {
        Log "  [pre] Taking ownership + resetting permissions..." "Cyan"
        Take-Ownership $path
    }
    Log ""

    $progress.Value = 5
    [System.Windows.Forms.Application]::DoEvents()

    $success = $false
    if (Delete-Method1-Normal $path)      { $success = $true }
    if (-not $success) { $progress.Value = 25; if (Delete-Method2-Attribs $path)  { $success = $true } }
    if (-not $success -and $chkLong.Checked) { $progress.Value = 45; if (Delete-Method3-LongPath $path) { $success = $true } }
    if (-not $success) { $progress.Value = 65; if (Delete-Method4-Robocopy $path) { $success = $true } }
    if (-not $success) { $progress.Value = 85; if (Delete-Method5-DotNet $path)   { $success = $true } }

    $progress.Value = 100

    Log ""
    Divider
    if ($success -and -not (Test-Path -LiteralPath $path)) {
        Log "  [OK] Folder deleted successfully." "Green"
    } elseif (-not (Test-Path -LiteralPath $path)) {
        Log "  [OK] Folder no longer exists (deleted)." "Green"
    } else {
        Log "  [FAIL] Could not fully delete. Some files may still be locked." "Red"
        Log "  Try: close apps, reboot, then run again." "Yellow"
        Log "  Remaining items:" "Yellow"
        $left = Get-ChildItem -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue | Select-Object -First 30
        foreach ($l in $left) { Log "    $($l.FullName)" "Dim" }
        if (-not $left) { Log "    (folder still exists but appears empty - try again)" "Dim" }
    }
    Divider
    Log ""
    Log "Tip: right-click in this area to copy the log." "Dim"
}

$btnDelete = New-Btn "FORCE DELETE"  15  200 $colRed                                     { Force-Delete }
$btnCopy   = New-Btn "COPY LOG"      225 140 ([System.Drawing.Color]::FromArgb(120,60,180)) { if ($output.Text.Length -gt 3) { [System.Windows.Forms.Clipboard]::SetText($output.Text) } }
$btnClear  = New-Btn "Clear"         375 100 ([System.Drawing.Color]::FromArgb(160,50,50))  { $output.Clear(); $progress.Value = 0 }
$btnExit   = New-Btn "Exit"          780 90  ([System.Drawing.Color]::FromArgb(60,60,75))   { $form.Close() }
$btnExit.Anchor = "Bottom,Right"

$btnBrowse.Add_Click({
    $dlg = New-Object System.Windows.Forms.FolderBrowserDialog
    if ($dlg.ShowDialog() -eq "OK") { $txtPath.Text = $dlg.SelectedPath }
})

# ---------- Welcome ----------
Log "Force Folder Deleter ready." "Cyan"
Log "Paste or Browse to a folder, then click FORCE DELETE." "White"
Log "Methods applied in order:" "Dim"
Log "  1) Normal recursive delete" "Dim"
Log "  2) Clear attributes + delete" "Dim"
Log "  3) \\?\ long path (rd /s /q)" "Dim"
Log "  4) Robocopy mirror-empty trick" "Dim"
Log "  5) .NET Directory.Delete" "Dim"
Log "Safety: drive roots and protected system folders are blocked." "Yellow"
Log ""

[void]$form.ShowDialog()