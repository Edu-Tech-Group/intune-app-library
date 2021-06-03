$localprograms = choco list --localonly
if ($localprograms -like "*audacity*")
{
    choco upgrade audacity
}
Else
{
    choco install audacity -y
}