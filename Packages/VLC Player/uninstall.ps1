$localprograms = choco list --localonly
if ($localprograms -like "*vlc*")
{
    choco uninstall vlc -y
}
