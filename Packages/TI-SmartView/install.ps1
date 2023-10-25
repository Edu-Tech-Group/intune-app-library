#smartvieuw instalatie
Start-Process -FilePath msiexec.exe -ArgumentList "/i TI-SmartView-CE-T-5.6.0.2092.msi", "/passive" -Wait

#connection details
./Texas-instruments-config.exe