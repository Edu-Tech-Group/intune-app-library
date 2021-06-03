$localprograms = choco list --localonly
if ($localprograms -like "*googlechrome*")
{
    choco upgrade googlechrome
}
Else
{
    choco install googlechrome -y
}