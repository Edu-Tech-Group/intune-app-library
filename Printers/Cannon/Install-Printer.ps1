$INFARGS = @(
    "-i"
    "-a"
    "Cnp60MA64.INF"
)

Try {
    #Add driver to driver store
    Start-Process pnputil.exe -ArgumentList $INFARGS -Wait -NoNewWindow

    #Install driver
    Add-PrinterDriver -Name "Canon Generic Plus PCL6" -Confirm:$false

    #Create Printer Port
    $PortExist = Get-Printerport -Name "IP_192.168.1.45" -ErrorAction SilentlyContinue
    if (-not $PortExist) {
        Add-PrinterPort -name "IP_192.168.1.45" -PrinterHostAddress "192.168.1.45" -Confirm:$false
    }

    #Add Printer
    Add-Printer -Name "Kopieermachine Molenstraat" -DriverName "Canon Generic Plus PCL6" -PortName "IP_192.168.1.45" -Confirm:$false
}
Catch {
    Write-Warning "Error Installing Printer"
}