$localprograms = choco list --localonly
if ($localprograms -like "*python*")
{
    choco uninstall python -y
}
