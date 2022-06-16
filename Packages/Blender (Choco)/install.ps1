param($app)
$filter = "*" + $app + "*"
Set-ExecutionPolicy Bypass
./installChoco.ps1
$localprograms = choco list --localonly
if ($localprograms -like $filter)
{
    choco upgrade $app
}
Else
{
    choco install $app -y
}