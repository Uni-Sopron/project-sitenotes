SITENOTES EXTENSION
--

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
- Webpack: Kód összefűzéséhez és buildeléséhez.
- Chrome Extension API: A böngészővel való kommunikációhoz.
- HTML & CSS: UI megjelenéséhez és stílusához.
- Git & GitHub: Verziókezeléshez és csapatmunkához.
- Node.js & npm: Fejlesztési környezet és csomagkezeléshez.
- Microsoft Teams: Fejlesztési periódusok ütemezéséhez és kommunikációhoz.

## Alapvető feltételek

- Az extension lokálisan működjön egy választott böngészőben
- Legyen egy működő overlay, ami elmenti a cédulát a megfelelő oldalon
- Lementi, mely oldalon vannak cédulák
- Lehetőleg törlés mellett keresést, illetve átnevezést is lehessen megadni neki, linkeket tudjon kezelni az extension oldalán
- Lásd: Note Anywhere (Chrome Extension)

## Funkciók hozzáadása

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

#### *~ Node-modules beszerzése ~*
```
cd sitenotes-extension
npm init -y
```

#### *~ Dependeciák telepítése ~*
```
npm install react react-dom
npm install typescript @types/react @types/react-dom
npm install webpack webpack-cli webpack-dev-server ts-loader html-webpack-plugin
npm install --save-dev @types/chrome
```

#### *~ Development szerver futtatása ~*

```
npm run start
```

#### *~ Buildelés ~*

```
npm run build
```

## Megjegyzések

A README.md fájl tartalma bármikor változhat a projekt időszakában.  
A fejlesztési időszakok Teamsre kerülnek ki meeting formában (aki nem tudna részt venni, az ott is tudja jelezni).  
Ezek az időszakok a következők:  
- Kedd: 14:30-16:30
- Szerda: 14:30-16:30
- Csütörtök: 14:30-16:30

Ezek mellett crunchtime-ok is lehetnek előzetes egyeztetés alapján a gyorsabb haladás érdekében.  
Ugyanúgy természetesen a feladataival magánidejében mindenki foglalkozhat, de mindenképpen jelezze, illetve a kanban táblában írja le a haladását és helyezze a megfelelő helyre.