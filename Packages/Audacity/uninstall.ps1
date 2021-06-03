$localprograms = choco list --localonly
if ($localprograms -like "*audacity*")
{
    choco uninstall audacity -y
}
