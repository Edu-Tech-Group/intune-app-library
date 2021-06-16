# __MathType__

Insert your product key in `install.ps1` before packaging to `.intunewin`

# 1. App information
Upload the generated `.intunewin` file

|Field|Value|
|-----------|-----------|
|Name|SMART Notebook|
|Description|SMART Notebook
|Publisher|SMART|

# 2. Program
|Field|Value|
|-----------|-----------|
|Install command|`powershell.exe -executionpolicy bypass .\install.ps1`|
|Uninstall command|`powershell.exe -executionpolicy bypass .\uninstall.ps1`|
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


|Argument|Value|
|-----------|-----------|
|Rule type|MSI|
|MSI product code|`D9469AC3-2946-42CA-B42B-74A226CB7557`|
|MSI product version check|`No`|

# 5. Dependencies
none

# 6. Supersedence
none

# 7. Assignments
Determin how the app should be deployed

# 8. Revieuw + create
Validate your configuration and create