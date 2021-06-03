$localprograms = choco list --localonly
if ($localprograms -like "*adobereader-update*")
{
    choco upgrade adobereader-update
}
Else
{
    choco install adobereader-update -y
}