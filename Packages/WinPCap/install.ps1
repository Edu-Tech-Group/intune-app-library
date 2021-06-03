$localprograms = choco list --localonly
if ($localprograms -like "*winpcap*")
{
    choco upgrade winpcap
}
Else
{
    choco install winpcap -y
}