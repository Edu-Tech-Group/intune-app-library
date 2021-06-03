$localprograms = choco list --localonly
if ($localprograms -like "*putty*")
{
    choco uninstall putty -y
}
