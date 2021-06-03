$localprograms = choco list --localonly
if ($localprograms -like "*visualstudio2019-workload-manageddesktop*")
{
    choco uninstall visualstudio2019-workload-manageddesktop -y
}
