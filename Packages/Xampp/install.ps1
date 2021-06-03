$localprograms = choco list --localonly
if ($localprograms -like "*bitnami-xampp*")
{
    choco upgrade bitnami-xampp
}
Else
{
    choco install bitnami-xampp -y
}