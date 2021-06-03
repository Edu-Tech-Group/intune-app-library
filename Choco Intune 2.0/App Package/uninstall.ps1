param($app)

$filter = "*" + $app + "*"

$localprograms = choco list --localonly
if ($localprograms -like $filter)
{
    choco uninstall $app -y
}