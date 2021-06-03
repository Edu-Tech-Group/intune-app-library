$localprograms = choco list --localonly
if ($localprograms -like "*bitnami-xampp*")
{
    choco uninstall bitnami-xampp
}
