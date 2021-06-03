$localprograms = choco list --localonly
if ($localprograms -like "*visualstudio2019community*")
{
    choco uninstall visualstudio2019community -y
}
