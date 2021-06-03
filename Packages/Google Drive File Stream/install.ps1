$localprograms = choco list --localonly
if ($localprograms -like "*google-drive-file-stream*")
{
    choco upgrade google-drive-file-stream
}
Else
{
    choco install google-drive-file-stream -y
}