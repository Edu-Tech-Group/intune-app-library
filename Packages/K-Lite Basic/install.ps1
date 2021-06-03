$localprograms = choco list --localonly
if ($localprograms -like "*k-litecodecpackbasic*")
{
    choco upgrade  k-litecodecpackbasic
}
Else
{
    choco install k-litecodecpackbasic -y
}