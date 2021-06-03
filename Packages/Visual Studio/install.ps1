$localprograms = choco list --localonly
if ($localprograms -like "*visualstudio2019community*")
{
    choco upgrade visualstudio2019community
}
Else
{
    choco install visualstudio2019community -y
}