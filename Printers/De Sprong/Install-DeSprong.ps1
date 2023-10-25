Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
<#
.Synopsis
Created on:   23/11/2022
Created by:   Swerts Gaëtan
Filename:     Install DeSprong.ps1

Simple script to install a network printer from an INF file. The INF and required CAB files should be in the same directory as the script when creating a Win32app

#### Win32App Commands ####

Install:
powershell.exe -executionpolicy bypass -file .\Install-Printer.ps1 -PortName "IP_192.168.1.45" -PrinterIP "192.168.1.45" -PrinterName "Kopieermachine Molenstraat" -DriverName "Canon Generic Plus PCL6" -INFFile "Cnp60MA64.INF"

Uninstall:
cmd /c

Detection:
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Print\Printers\Kopieermachine Molenstraat
Name = "Canon Printer Upstairs"
#>

Try {
	#Aanmaken variabelen
	$RandomNumber = Get-Random
	$VarPrinterName = "Printer DeSprong"
	$VarDriverName = "Canon Generic Plus UFR II"
	$VarPrinterPortName = "IP_10.20.0.37"
	$VarPrinterPortAdress = "10.20.0.37"
	
	Try {
		#Remove driver from driver store
    	pnputil.exe /delete-driver CNLB0MA64.INF
		Write-Warning "Driver removed from store successful"
	}
	Catch {
		Write-Warning "Error during the removal process."
	}

	Try {
    	#Add driver to driver store  -Wait -NoNewWindow
    	pnputil.exe /add-driver CNLB0MA64.INF
		Start-Sleep 5
		Write-Output "Succes pnputil"
	}
	Catch {
		Write-Warning "Something else !"
	}





	Try {
		#Install driver
		Add-PrinterDriver -Name $VarDriverName
		Write-Output "Add-PrinterDriver success"
	}
	Catch {
		Write-Warning "Printer driver gave an error"
		Remove-PrinterDriver -Name $VarDriverName
		Add-PrinterDriver -Name $VarDriverName
		Write-Warning "Printer driver added again"
	}




	
	Try {
		#Create Printer Port
		$PortExist = Get-Printerport -Name $VarPrinterPortName
		if (-not $PortExist) {
			Add-PrinterPort -name $VarPrinterPortName -PrinterHostAddress $VarPrinterPortAdress
			Write-Output "Create Printer Port"
		}
		else {
			Write-Output "Printer Port already exists"
			
			$VarPrinterPortName = $VarPrinterPortName + "-" + $RandomNumber
			Add-PrinterPort -name $VarPrinterPortName -PrinterHostAddress $VarPrinterPortAdress

			Write-Output "Printer port recreated"
		}
	}
	Catch {
		Write-Warning "Add-PrinterPort gave an error"
	}





	Try {
		#Add Printer
		Add-Printer -Name $VarPrinterName -DriverName $VarDriverName -PortName $VarPrinterPortName
		Write-Output "Add Printer"
	}
	Catch {
		Write-Warning "Printer already installed"
	}
	
}
Catch {
    Write-Warning "Error Installing Printer"
}