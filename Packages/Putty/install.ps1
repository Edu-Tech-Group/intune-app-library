$localprograms = choco list --localonly
if ($localprograms -like "*putty*")
{
    choco upgrade putty
}
Else
{
    choco install putty -y
}