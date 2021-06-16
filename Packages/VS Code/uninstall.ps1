$localprograms = choco list --localonly
if ($localprograms -like "*vscode")
{
    choco uninstall vscode -y
}
