$localprograms = choco list --localonly
if ($localprograms -like "*adobe-creative-cloud*")
{
    choco uninstall adobe-creative-cloud -y
}
