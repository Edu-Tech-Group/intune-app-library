$localprograms = choco list --localonly
if ($localprograms -like "*musescore*")
{
    choco uninstall musescore -y
}
