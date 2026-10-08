# PLANN design — zasady pracy w tym projekcie

Serwis przebudowany 09.10.2026. Caly stary uklad (jasna strona z sekcjami,
`style.css`, `script.js` i kilkanascie modulow efektow) zostal usuniety na
wyrazna prosbe wlascicielki. Kod nie przepadl — siedzi w historii gita,
w commitach do `ba95a28` wlacznie.

## 1. Jak strona wyglada teraz

Jedna czarna scena na kazdej stronie: ten sam kroj, ziarno, winieta,
kwadratowy kursor w negatywie, nawigacja po srodku u gory, przelacznik
jezyka. Zadnych CDN-ow, zadnego dzwieku, zadnego odwroconego tekstu.

### Strona glowna (`index.html`, `css/plann.css`, `js/plann.js`)

| Efekt | Gdzie zyje |
| --- | --- |
| **Kula z kart prac** — kamera stoi w srodku, kula krazy sama, reaguje na mysz, da sie ja ciagnac i przyblizac kolkiem | `js/plann.js` (Three.js z `js/vendor/`) |
| **Napis z kwadracikow** — najpierw znak PA z maski SVG, potem slowa `web`, `branding`, `plan`; kwadraciki przelatuja miedzy slowami, uciekaja od kursora i robia sie blekitne | `js/plann.js` (`SLIDES`, `drawDots`), `css/plann.css` |
| **Tekst w rogach z efektem "scramble"** — litery przebieraja sie i skladaja w nowy napis przy zmianie slajdu | `js/plann.js` (`scramble`) |
| **Loader 00 → 100** z kreska postepu | `js/plann.js`, `css/plann.css` (`.ld`) |
| **Kursor** — kwadracik w negatywie (`mix-blend-mode: difference`), nad karta rozciaga sie w plakietke z napisem | `css/plann.css` (`.cur`), `js/plann.js` |
| **Otwarcie projektu** — czarny ekran, z ktorego wykreca sie znak PA i nazwa, potem pozioma stega kadrow z opisem | `js/plann.js` (`openProject`), `css/plann.css` (`.gate`, `.lb`) |
| **Ziarno filmowe i winieta** | `css/plann.css` (`.grain`, `.vig`) |

### Podstrony (`contact.html`, `shop.html`, `brief.html`)

Wspolna oprawa: `css/plann-pages.css` + `js/plann-shell.js` (jezyk, kursor,
rok w stopce oraz stare API `window.PLANN`, z ktorego korzystaja skrypty
formularzy). Logika formularzy zostala bez zmian: `js/contact-funnel.js`,
`js/shop.js` (+ `js/products.js`), `js/brief.js`.

## 2. Zasady ogolne

- Zadnych zewnetrznych CDN-ow. Three.js lezy w `js/vendor/three.module.min.js`,
  kroj w `fonts/`, ikony w `img/icons/`. Jedyny dozwolony obcy skrypt to
  bramka platnosci Payhip w `shop.html` (na razie zakomentowana).
- Zadnych tekstow, obrazow ani kodu z cudzych stron.
- Kazdy nowy tekst trafia do slownika we wszystkich trzech jezykach
  (EN / UA / PL) w `js/i18n.js`. Zero surowych kluczy na stronie.
  Wiersze w jednym kluczu oddziela pionowa kreska `|`.
- Nowe komentarze w kodzie po polsku.
- Zadnych dlugich myslnikow w tekstach na stronie.
- Nazwa marki to zawsze **PLANN design**.
- Kroj: **JetBrains Mono** (OFL, lokalnie w `fonts/`), wersaliki, drobny
  rozmiar. Kolory: tusz `#050506`, kosc `#f6f2ee`, blekit `#bcd6e8`.
- Kolo jest zarezerwowane dla kursora; reszta (kropki napisu, paginacja,
  przyciski) to kwadraty z lekko zaokraglonymi rogami.
- `prefers-reduced-motion` wylacza ruch.
- Po kazdej skonczonej zmianie: commit i push na `origin master`, zeby
  wlascicielka ogladala wynik na GitHub Pages. Przy zmianie CSS albo JS
  trzeba podbic `?v=` w adresach na wszystkich czterech stronach, bo
  GitHub Pages trzyma stare pliki okolo dziesieciu minut.

## 3. Struktura

| Plik | Rola |
| --- | --- |
| `index.html` | strona glowna: kula z prac i napis z kwadracikow |
| `contact.html` | krokowy lejek kontaktowy |
| `shop.html` | witryna sklepu |
| `brief.html` | rozszerzony brief (poza nawigacja, link tylko z autoodpowiedzi) |
| `css/plann.css` | strona glowna |
| `css/plann-pages.css` | podstrony |
| `js/plann.js` | kula, napis z kwadracikow, slajdy, podglad projektu |
| `js/plann-shell.js` | wspolna oprawa podstron + `window.PLANN` |
| `js/i18n.js` | slownik EN / UA / PL |
| `js/contact-funnel.js` | lejek kontaktowy |
| `js/shop.js`, `js/products.js` | sklep i dane towarow |
| `js/brief.js` | formularz briefu |
| `img/` | oryginaly prac (`1.png` … `10.png`, okladki) |
| `img/work/` | te same prace zmniejszone do 1200 px, uzywane przez kule |
| `files/` | pliki do pobrania ze sklepu |

### Jak wlascicielka zmienia tresc sama

- **Slowa napisu z kwadracikow**: lista `SLIDES` na gorze `js/plann.js`,
  pole `word`. Tempo: `SLIDE_MS` obok.
- **Teksty w rogach i opisy projektow**: klucze `ui.*`, `sl0.*` … `sl3.*`
  oraz `pj.*` w `js/i18n.js`.
- **Prace na kuli**: lista `IMGS` w `js/plann.js` (plik, wymiary, kierunek,
  projekt), a dane projektow w `PROJ` tuz pod nia.

Sklep: platnosci i wysylka plikow przez Payhip. Wlascicielka zaklada konto,
dodaje produkt z plikiem i cena, wkleja adres do `buyUrl` w `js/products.js`,
ustawia `status: 'live'` i odkomentowuje skrypt `payhip.js` w `shop.html`.
