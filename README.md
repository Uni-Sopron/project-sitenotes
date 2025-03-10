SITENOTES EXTENSION
--

Figyelem: a leírás a projekt befejezése előtt készült.
A feladat egy böngésző extension fejlesztése, amiben a felhasználók kedvük szerint tudnak kiválasztott oldalakon jegyzetet hagyni maguknak, illetve az oldalon is szerkesztéseket (kiemelés, rajzolás) végrehajtani.

## Tartalomjegyzék

1. [Eszközök](#eszközök)
2. [Alapvető feltételek](#alapvető-feltételek)
3. [Funkciók hozzáadása](#funkciók-hozzáadása)
4. [Fejlesztőknek](#fejlesztőknek)
4. [Megjegyzések](#megjegyzések)

## Eszközök

- React: UI komponens fejlesztéshez.
- TypeScript: Típusos fejlesztéshez.
- Vite: Kód gyors összefűzéséhez és buildeléséhez.
- Chrome Extension API: A böngészővel való kommunikációhoz.
- HTML & CSS: UI megjelenéséhez és stílusához.
- Git & GitHub: Verziókezeléshez és csapatmunkához.
- Node.js & npm: Fejlesztési környezet és csomagkezeléshez.
- Microsoft Teams: Fejlesztési periódusok ütemezéséhez és kommunikációhoz.

## Alapvető feltételek

- Az extension lokálisan működjön egy választott böngészőben
- Az extensionök között jelenjen meg és legyen egy interaktív popup az alapvető funkciókkal
- Legyen egy működő overlay, ami elmenti a cédulát a megfelelő oldalon és a popupból nyitjuk meg
- Lementi, mely oldalon vannak cédulák
- Lehetőleg törlés mellett keresést, illetve átnevezést is lehessen megadni neki, linkeket tudjon kezelni az extension oldalán (ez egy külön ablak, amit szintén a popupból nyitunk meg)
- Lásd: Note Anywhere (Chrome Extension)
- Amennyiben ezek teljesülnek, a verziószám átalakítható 1.0-ra.

## Funkciók hozzáadása

- 1.0 és afeletti verziónak tekinthetőek a következő változtatások:
- A jegyzetekhez tartozzon módosítás dátuma
- Pin: a monitor arányéhoz mérten kitűzve legyen, akármerre görgetünk
- Show/Hide: lehessen eltűntetni és megjeleníteni egyenként vagy összeset egyszerre
- a cédulán belül és akár kívül is lehessen rajzolni (toolbar)
- szöveget bárhol lehessen kiemelni az oldalon
    - ha a szöveg változna, akkor legyen róla figyelmeztetés, lehessen megtekinteni az előző változatot és azt elolvasni, netán kidobni, ha már nincs szükségünk rá
- lényegében egy komplett toolbar fejlesztése
    - rajz eszköz
    - kiemelés és dőlt betűk
    - színek
    - kép elhelyezése
- monitor, felbontáshoz igazodjanak a szerkesztések is
- exportálás és importálás lehetősége

## Fejlesztőknek

#### *~ Belépés a munka folderbe ~*
```
cd sitenotes-extension
```

#### *~ Dependeciák telepítése ~*
```
npm install
```

#### *~ Buildelés változtatások után ~*
```
npm run build
```
A dist folder felelős azért, hogy a stabil állapototát megtartsa az alkalmazásunknak.  
**FONTOS**: a dist folderben közvetlen ne hajtsunk végre változtatásokat! Arra van a public folder. A build után a dist folder tartalmas is változik. Amennyiben hibás a dist tartalma, a public folderben végezzük el a szükséges változtatásokat és indítsuk el újra a buildet, amíg nem stabil.  
**FONTOS**: nem a dist foldert pusholjuk, mivel az egy másolata a public folderünknek. Illetve amennyiben ténylegesen biztosak vagyunk a változtatások stabilitásában, azesetben commitolható és pusholható a változtatás (külön ágon elvégzett munkák esetén megbeszélés alapuló mergelés).  
**FONTOS**: Nincs npm start! Helyette ha először buildeltünk, utána a dist foldert kell betölteni a megosztott tutorial videó szerint (Empty Extension résznél, mindig azt a foldert kell betölteni, ahol van a manifest.json). Onnantól kezdve a többi buildnél csak újrafrissíteni kell az Extensions tab-nél.

Az src mappában vannak a script fájlok, a publicban az image és hasonló médiák.