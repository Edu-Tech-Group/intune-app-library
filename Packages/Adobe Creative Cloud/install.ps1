$localprograms = choco list --localonly
if ($localprograms -like "*adobe-creative-cloud*")
{
    choco upgrade adobe-creative-cloud
}
Else
{
    choco install adobe-creative-cloud -y
}