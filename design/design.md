# Concept Design 

## All Notes:
![all_notes_highlights](all_notes_highlights.png) ![all_notes_note](all_notes_note.png) ![all_notes_picture](all_notes_picture.png)
- ez egy külön álló oldal 
- a felső sorba egy kereső van, ami a jegyzetekben, illetve a kiemelések között keres 
- három különálló részből áll:
    - jegyzetek
        - id, cím(ez egy link, ami a jegyzethez visz, vagy csak ahhoz az oldalhoz), módosítás dátuma
        - törlés: törli az aktuális az elemet (+ megerősítő ablak)
        - figyelmeztetés: Ha elveszhet a jegyzet(oldal megszünése stb.....)
            - jegyzet elmentése (md fájl), vagy az aktuális oldalon a jegyzet módosítása
        - letöltés: md fájl formátumban
        - pl: "4. <u>Bevásárlólista</u>  1813.13.47. 58:13 ⬇️⚠️🚮"
    - kiemelések
        - id, kiemelt szöveg egy része (ez egy link, ami a kiemeléshez visz, vagy csak ahhoz az oldalhoz), módosítás dátuma
        - törlés: törli az aktuális az elemet (+ megerősítő ablak)
        - figyelmeztetés: Ha elveszhet a kiemelés(oldal megszünése stb.....)
            - kiemelés elmentése (md fájl), vagy az aktuális oldalon a kiemelés módosítása
        - letöltés: md fájl formátumban
        - pl: "15. <u>A levelibékák szaporodása....</u>  1813.13.47. 58:13 ⬇️⚠️🚮"
    - rajzok, képek
        - id, oldal link (ahhoz az oldalhoz), módosítás dátuma
        - törlés: törli az aktuális az elemet (+ megerősítő ablak)
        - figyelmeztetés: Ha elveszhet a rajz (oldal megszünése stb.....)(oldd meg!!!)
        - pl: "42. <u>https://hu.wikipedia.org/wiki/Z%C3%B6ld_levelib%C3%A9ka</u>  2000.10.15. 12:11 ⬇️⚠️🚮"


## Note:
![Note](note.png)
- ez egyetlen jegyzet kinézete
- új jegyzet hozzáadásakor jön létre
- elemei:
    - menüsor: 
        - horgony (alap esetben rögzít, más esetben az oldallal együtt gördül)
        - jegyzet színezése (alap 5 szín, rgb paletta)
        - feltöltés (md, txt) (felül írja az egész jegyzetet)
        - letöltés (md, txt)
        - előnézet/szerkesztőnézet
        - elrejtés
        - kuka (törlés)
        - ikonná varázsóló X (ha üres akkor törli, ha van venne valami akkor lekicsinyíti)
    - cím
    - szöveg helye
    - alap szerkesztő:
        - dőlt betű, aláhúzás, félkövér, színek, betűtípus, lista stb...
        - kép feltöltés
        - rajzolás 


## Popup
![popup1](popup1.png)
![popup2](popup2.png)
- elemei:
    - Add Note: új jegyzet létrehozása
    - Hide Notes / Show Notes :  megjelenít/ elrejt minden jegyzetet az oldalon
    - Iconizer/ Undo: lekicsinyít minden jegyzetet icon méretűre/ felnagyít minden jegyzetet normális méretre (milyen méret legyen?)
    - All Notes: átvisz arra az oldalra, ahol megjeleníti az összes jegyzetet
    - Hide Tools/ Tools: a rajzoló eszközök elrejtése és megjelenítése


## Toolbar
![toolbar](toolbar.png)
- Oldal jobb felső sarkában megjelenő eszközbár.
- ha sikerül megoldani mozdíthatóra, akkor mozdítható, ha nem akkor nem
- elemei:
    - 🔄️: elforgatja az eszközbárt
    - ✏️: lehet rajzolni az oldalra
    - kiemelő: Az oldalon lévő szöveget lehet ezzel kiemelni
    - radír: Törölni lehet a kiemeléseket és a rajzokat.
    - 3 alap szín (megjegyzi, hogy melyiket használta legutoljára a ceruzához, és melyiket a kiemeléshez)
    - Vastagság állítása opcionális:)


    