$localprograms = choco list --localonly
if ($localprograms -like "*choco-upgrade-all-at*")
{
    choco uninstall choco-upgrade-all-at
}
