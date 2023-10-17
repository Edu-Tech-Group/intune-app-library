Set-ExecutionPolicy Bypass

$Transcript_Path = "$env:TEMP\" + $app + ".log"
Start-Transcript $Transcript_Path

try{

Write "Installing Middleware"
$install='BeidMW_64_5.1.8.6030.msi'
start-process $install -argumentList '/quiet /norestart' -Wait
Write "Installation launched"

Write "Installing Viewer"
$install2='BeidViewer_5.1.8.6019.msi'
start-process $install2 -argumentList '/quiet /norestart' -Wait
Write "Installation launched"

Write "Installing the certificate"
certutil -addstore TrustedPublisher fedict_codesigning.cer
Write "Installation launched"

Write "Installing the driver"
pnputil /add-driver beidmdrv.inf
Write "Installation launched"

Write "Installation finished"

Stop-Transcript 
    
    exit 0
}catch{

Stop-Transcript 

    exit 1618
}