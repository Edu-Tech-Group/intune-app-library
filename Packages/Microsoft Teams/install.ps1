$localprograms = choco list --localonly
if ($localprograms -like "*microsoft-teams*")
{
    choco upgrade microsoft-teams
}
Else
{
    choco install microsoft-teams -y
}