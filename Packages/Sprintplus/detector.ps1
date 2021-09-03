if (Test-Path "${env:ProgramFiles(x86)}\SprintPlus 3\sprint.exe") {
    if (Test-Path "${env:ProgramFiles(x86)}\SprintPlus 3\Skippy.exe") {
        if (Test-Path "${env:ProgramFiles(x86)}\SprintPlus 3\Sprinter.exe") {
            Write-Host "Found it!"
        }
    }
}
