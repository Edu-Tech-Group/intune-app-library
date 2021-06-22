$localprograms = choco list --localonly
if ($localprograms -like "*zoom-outlook")
{
    choco uninstall zoom-outlook -y
}
