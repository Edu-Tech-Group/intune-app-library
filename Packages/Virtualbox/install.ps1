$localprograms = choco list --localonly
if ($localprograms -like "*virtualbox*")
{
    choco upgrade virtualbox
}
Else
{
    choco install virtualbox -y
}