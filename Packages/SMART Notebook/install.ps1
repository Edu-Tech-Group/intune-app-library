./smart21-0web.exe /q

$installedSoftware = Get-WmiObject -Class Win32_Product

while (!($installedSoftware -like "*D9469AC3-2946-42CA-B42B-74A226CB7557*")) {
    Start-Sleep -Seconds 10
    $installedSoftware = Get-WmiObject -Class Win32_Product
}

$path = "C:\Program Files (x86)\Common Files\SMART Technologies\SMART Activation Wizard\activationwizard.exe"
&$path --puid=notebook_14 --m=4 --v=5 --a --pk=NC-2ABSW-DEGPI-MRF44-SEASA-AAA
