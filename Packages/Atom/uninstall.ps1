$localprograms = choco list --localonly
if ($localprograms -like "*atom*")
{
    choco uninstall atom -y
}
