$localprograms = choco list --localonly
if ($localprograms -like "*microsoft-teams*")
{
    choco uninstall microsoft-teams -y
}
