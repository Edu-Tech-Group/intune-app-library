$localprograms = choco list --localonly
if ($localprograms -like "*atom*")
{
    choco upgrade atom
}
Else
{
    choco install atom -y
}