$localprograms = choco list --localonly
if ($localprograms -like "*virtualbox*")
{
    choco uninstall virtualbox -y
}
