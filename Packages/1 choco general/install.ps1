param($app)

$filter = "*" + $app + "*"

$localprograms = choco list --localonly
if ($localprograms -like $filter)
{
    choco upgrade $app
}
Else
{
    choco install $app -y
}