$localprograms = choco list --localonly
if ($localprograms -like "*7zip*")
{
    choco uninstall 7zip -y
}
