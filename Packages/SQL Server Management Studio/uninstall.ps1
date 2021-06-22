$localprograms = choco list --localonly
if ($localprograms -like "*sql-server-management-studio*")
{
    choco uninstall sql-server-management-studio -y
}
