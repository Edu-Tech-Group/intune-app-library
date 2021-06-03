$localprograms = choco list --localonly
if ($localprograms -like "*filezilla*")
{
    choco upgrade filezilla
}
Else
{
    choco install filezilla -y
}