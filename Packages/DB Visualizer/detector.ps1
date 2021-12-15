if (Test-Path "${env:ProgramFiles}\DbVisualizer\dbvis.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}