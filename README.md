SITENOTES EXTENSION
--

A feladat egy böngésző extension fejlesztése, amiben a felhasználók kedvük szerint tudnak kiválasztott oldalakon jegyzetet hagyni maguknak, illetve az oldalon is szerkesztéseket (kiemelés, rajzolás) végrehajtani.

## Tartalomjegyzék

1. [Eszközök](#eszközök)
2. [Funkciók](#funkciók)
3. [Fejlesztőknek](#fejlesztőknek)

## Eszközök

- React: UI komponens fejlesztéshez.
- TypeScript: Típusos fejlesztéshez.
- Vite: Kód gyors összefűzéséhez és buildeléséhez.
- Chrome Extension API: A böngészővel való kommunikációhoz.
- HTML & CSS: UI megjelenéséhez és stílusához.
- Git & GitHub: Verziókezeléshez és csapatmunkához.
- Node.js & npm: Fejlesztési környezet és csomagkezeléshez.
- Microsoft Teams: Fejlesztési periódusok ütemezéséhez és kommunikációhoz.

## Funkciók

- Az extension lokálisan működik a Google Chrome böngészőjében
- Az extensionök között jelenik meg és van egy interaktív popup az alapvető funkciókkal
- Működő overlay, ami elmenti a cédulát, rajzot, kiemelést, képbeillesztést a megfelelő oldalon megfelelő paraméterekkel és a popupból nyitjuk meg toolbarként (cédulát Add Note-tal)
- Lementi, mely oldalon vannak cédulák és egyéb változtatások
- Törölni lehet tartalmat az oldalon, szerkesztéseket szintén ment, linkeket tudjon kezelni az extension oldalán (ez egy külön ablak, amit szintén a popupból nyitunk meg)

- Anchor: a monitor arányához mérten kitűzve legyen tartalom, akármerre görgetünk
- Show/Hide: lehessen eltűntetni és megjeleníteni toolbart
- cédulákat txt-ként le lehet menteni és visszatölteni, lehet színt változtatni rajtuk, ikonizálni, törölni, belső szövegbuborék méretét változtatni
- szabadon lehet rajzolni, szöveget kiemelni és képet illeszteni az oldalra
- rajznál radírral lehet törölni vagy teljesen törölni is, színt lehet választani
- kiemelőnél szintén (kivétel teljes törlés), csak az van kiemelve, amit kiemeltünk (hibás: más betűtípusú szöveg egy kiemelésen belül nem fog megjelenítődni újratöltéskor)
- képnél lehet forgatni 90 fokban, megfordítani a képet, kép arányai szerint növelni vagy csökkenteni a méretet
- szöveget bárhol lehessen kiemelni az oldalon
- lényegében egy komplett toolbar fejlesztése
    - rajz eszköz
    - kiemelés és dőlt betűk
    - színek
    - kép elhelyezése
- monitor, felbontáshoz igazodjanak a szerkesztések is
- exportálás és importálás lehetősége

Hiányzik:
- dinamikus tartalom szerinti figyelmeztetések, annak megfelelő kezelése
- linkek listázásánál törlés és összes törlése (tartalmukkal együtt)
- dátum nem szerepel sehol sem

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