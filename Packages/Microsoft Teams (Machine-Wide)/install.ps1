$localprograms = choco list --localonly
if ($localprograms -like "*microsoft-teams*")
{
    choco upgrade microsoft-teams.install
}
Else
{
    choco install microsoft-teams.install -y
}