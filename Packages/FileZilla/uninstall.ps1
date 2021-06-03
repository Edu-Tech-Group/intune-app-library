$localprograms = choco list --localonly
if ($localprograms -like "*filezilla*")
{
    choco uninstall filezilla -y
}
