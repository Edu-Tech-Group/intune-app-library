$localprograms = choco list --localonly
if ($localprograms -like "*mysql-odbc*")
{
    choco uninstall mysql-odbc
}
