$localprograms = choco list --localonly
if ($localprograms -like "*maxima*")
{
    choco upgrade maxima 
}
Else
{
    choco install maxima -y
}