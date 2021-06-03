$localprograms = choco list --localonly
if ($localprograms -like "* k-litecodecpackbasic*")
{
    choco uninstall  k-litecodecpackbasic -y
}
