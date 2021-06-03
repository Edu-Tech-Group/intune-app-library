$localprograms = choco list --localonly
if ($localprograms -like "*7zip*")
{
    choco upgrade 7zip
}
Else
{
    choco install 7zip -y
}