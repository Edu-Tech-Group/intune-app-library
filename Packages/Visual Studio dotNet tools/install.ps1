$localprograms = choco list --localonly
if ($localprograms -like "*visualstudio2019-workload-manageddesktop*")
{
    choco upgrade visualstudio2019-workload-manageddesktop
}
Else
{
    choco install visualstudio2019-workload-manageddesktop -y
}