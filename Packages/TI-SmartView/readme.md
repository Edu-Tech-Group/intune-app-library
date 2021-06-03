# __VideoPad__
# 0. Modify the config exe
Open `Texas-instruments-config.exe` with [WinRar](https://www.winrar.be/en/download) <br>
Modify the `settings.properties` inside the exe and enter the license servers. Save the file in the exe.

# 1. App information
Wrap the folder with [microsoft/Microsoft-Win32-Content-Prep-Tool](https://github.com/Microsoft/Microsoft-Win32-Content-Prep-Tool) and upload the generated `.intunewin` file

|Field|Value|
|-----------|-----------|
|Name|TI-SmartView|
|Description|Emulator for the TI-84|
|Publisher|Texas Instruments|

# 2. Program
|Field|Value|
|-----------|-----------|
|Install command|`.\install.ps1`|
|Uninstall command|`.\install.ps1`|
|Install behavior|System|
|Device restart behavior|App install may force a device restart|

# 3. Requirements
|Field|Value|
|-----------|-----------|
|Operating system architecture|32-bit & 64-bit|
|Minimum operating system|Windows 10 1607|
|Disk space required (MB)||
|Physical memory required (MB)||
|Minimum number of logical processors required||
|Minimum CPU speed required (MHz)||


# 4. Detection rules

Manually configure detection rules

## Rule 1
|Argument|Value|
|-----------|-----------|
|Rule type|File|
|Path|C:\ProgramData\TI-SmartView CE 84\res|
|File or folder|settings.properties|
|Detection method|File or folder exists|
|Associated with a 32-bit app on 64-bit clients|No|

## Rule 2
|Argument|Value|
|-----------|-----------|
|Rule type|File|
|Path|C:\Program Files (x86)\TI Education\TI-SmartView CE for the TI-84 Plus Family|
|File or folder|TI-SmartView CE for the TI-84 Plus Family.exe|
|Detection method|File or folder exists|
|Associated with a 32-bit app on 64-bit clients|No|

# 5. Dependencies
none

# 6. Supersedence
none

# 7. Assignments
Determin how the app should be deployed

# 8. Revieuw + create
Validate your configuration and create