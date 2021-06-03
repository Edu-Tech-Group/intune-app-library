$localprograms = choco list --localonly
if ($localprograms -like "*google-drive-file-stream*")
{
    choco uninstall google-drive-file-stream -y
}
