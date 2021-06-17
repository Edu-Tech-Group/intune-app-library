$localprograms = choco list --localonly
if ($localprograms -like "*microsoft-teams.install*")
{
    choco uninstall microsoft-teams.install -y
}
