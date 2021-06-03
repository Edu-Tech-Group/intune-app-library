$localprograms = choco list --localonly
if ($localprograms -like "*adobereader*")
{
    choco upgrade adobereader
}
Else
{
    choco install adobereader -y
}