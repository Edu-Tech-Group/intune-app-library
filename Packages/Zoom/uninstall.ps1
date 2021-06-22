$localprograms = choco list --localonly
if ($localprograms -like "*zoom")
{
    choco uninstall zoom -y
}
