$localprograms = choco list --localonly
if ($localprograms -like "*firefox*")
{
    choco uninstall firefox -y
}
