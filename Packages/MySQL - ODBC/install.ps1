$localprograms = choco list --localonly
if ($localprograms -like "*mysql-odbc*")
{
    choco upgrade mysql-odbc
}
Else
{
    choco install mysql-odbc -y
}