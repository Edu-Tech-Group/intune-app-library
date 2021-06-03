$localprograms = choco list --localonly
if ($localprograms -like "*opera*")
{
    choco upgrade opera
}
Else
{
    choco install opera -y
}