if (Test-Path "${env:ProgramFiles}\SketchUp\SketchUp 2017\SketchUp.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}
