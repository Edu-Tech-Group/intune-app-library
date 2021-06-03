$localprograms = choco list --localonly
if ($localprograms -like "*hotpotato*")
{
    choco upgrade hotpotato
}
Else
{
    choco install hotpotato -y
}