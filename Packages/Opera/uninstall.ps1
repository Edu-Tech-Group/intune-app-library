$localprograms = choco list --localonly
if ($localprograms -like "*opera*")
{
    choco uninstall opera -y
}
