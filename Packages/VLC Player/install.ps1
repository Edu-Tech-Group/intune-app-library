$localprograms = choco list --localonly
if ($localprograms -like "*vlc*")
{
    choco upgrade vlc
}
Else
{
    choco install vlc -y
}