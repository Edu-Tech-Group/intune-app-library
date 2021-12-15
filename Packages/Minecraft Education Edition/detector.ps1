if (Test-Path "${Env:ProgramFiles(x86)}\Microsoft Studios\Minecraft Education Edition\Minecraft.Windows.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}