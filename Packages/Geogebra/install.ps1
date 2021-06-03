$localprograms = choco list --localonly
if ($localprograms -like "*geogebra*")
{
    choco upgrade geogebra
}
Else
{
    choco install geogebra-y
}