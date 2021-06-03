$localprograms = choco list --localonly
if ($localprograms -like "*choco-upgrade-all-at*")
{
    # Een upgrade werkt niet. Je moet eerst een uninstall uitvoeren en vervolgens opnieuw installeren.

    choco uninstall choco-upgrade-all-at

    # Laat één van deze regels staan - welke je wenst.

    #Update alle software elke dag om 23 uur en stopt by default om 4 uur.
    choco install choco-upgrade-all-at --params "'/TIME:23:00'"
    #Update alle software elke dag om 10:00 en stopt om 13:00
    choco install choco-upgrade-all-at --params "'/DAILY:yes /TIME:10:00 /ABORTTIME:13:00'" 
    #Update alle software elke zondag om 10:00 en stopt om 13:00
    choco install choco-upgrade-all-at --params "'/WEEKLY:yes /DAY:SUN /TIME:10:00 /ABORTTIME:13:00'"

}
Else
{
    # Laat één van deze regels staan - welke je wenst.

    #Update alle software elke dag om 23 uur en stopt by default om 4 uur.
    choco install choco-upgrade-all-at --params "'/TIME:23:00'"
    #Update alle software elke dag om 10:00 en stopt om 13:00
    choco install choco-upgrade-all-at --params "'/DAILY:yes /TIME:10:00 /ABORTTIME:13:00'" 
    #Update alle software elke zondag om 10:00 en stopt om 13:00
    choco install choco-upgrade-all-at --params "'/WEEKLY:yes /DAY:SUN /TIME:10:00 /ABORTTIME:13:00'"

}