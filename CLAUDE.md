# PLANN Design — zasady pracy w tym projekcie

## 1. Animacje i efekty interaktywne sa nietykalne

**Istniejacych animacji i efektow interaktywnych nie wolno usuwac ani zmieniac
bez wyraznej zgody wlascicielki strony.** Przy kazdej przebudowie sekcji trzeba
je zachowac i przeniesc w nowe miejsce bez zmian — te same rozmiary, czasy,
krzywe i zachowanie.

Dotyczy to w szczegolnosci:

| Efekt | Gdzie zyje |
| --- | --- |
| **Negatyw pod kursorem** — kwadracik `mix-blend-mode: difference`, 18×18 px w spoczynku, 34×34 px nad kartami prac | `style.css` sekcja 14 `.cursor` + nadpisania ponizej; logika w `script.js` (`is-visible` / `is-hover` / `is-work`) |
| **Szklane krople (liquid glass)** na przyciskach, pigulkach, chipsach i ikonach socjalnych | `style.css` sekcja 20; `js/ui-liquid.js` |
| **Galaretowaty klik** (Web Animations API) i falka (ripple) | `js/ui-liquid.js` |
| **Plynna kropla przelacznika jezyka** z filtrem SVG gooey | `style.css` sekcja 20 + `js/ui-liquid.js` |
| **Pojawianie sie blokow przy przewijaniu** (fade-up z kaskada) | `script.js` + `js/scroll.js` |
| **Naglowki slowo po slowie** (`data-split`) | `script.js` |
| **Samoczynna fala kafelkow w stopce** | `js/footer-works.js` |
| **Nasuwanie kart prac** — kolejny projekt wysuwa sie spod poprzedniego, ten pod spodem zmniejsza sie i rozmywa | `style.css` sekcja 63; `js/works-stack.js` (zmienna `--cover`) |
| **Bryla 3D pod menu** — pryzma z czterech wlasnych okladek, obrot przy przewijaniu, pochylenie i swiatlo za kursorem | `style.css` sekcja 66; `js/obj3d.js` (`--ry`, `--rx`, `--lx`, `--ly`) |
| **Rozwijane kierunki uslug** — jeden otwarty naraz, plynna zmiana wysokosci | `style.css` sekcja 65; `js/svc3.js` |

Jesli nowy element koliduje z istniejacym efektem — pytamy, ktory zostaje.
Nigdy nie decydujemy sami o usunieciu.

Jesli efekt trzeba chwilowo wylaczyc, robimy to komentarzem z data i powodem,
nie kasowaniem kodu.

## 2. Zasady ogolne

- Zadnych zewnetrznych CDN-ow. Biblioteki, fonty i ikony leza lokalnie
  (`js/vendor/`, `fonts/`, `img/icons/`).
- Zadnych tekstow, obrazow ani kodu z cudzych stron. Wszystkie okladki
  pochodza z `img/`, wszystkie sformulowania sa wlasne.
- Kazdy nowy tekst trafia do slownika we wszystkich trzech jezykach
  (EN / UA / PL) w `js/i18n.js`. Zero surowych kluczy na stronie.
- Nowe komentarze w kodzie po polsku.
- Kolory i typografia zmieniaja sie tylko na wyrazna prosbe.
  Kroje: Satoshi (tekst i interfejs), Clash Display (duze naglowki),
  Fragment Mono (podpisy), Inter (cyrylica). Wszystkie lokalnie w `fonts/`.
  Neue Haas Grotesk i PP Neue Montreal sa platne — nie wolno ich podpinac.
- `prefers-reduced-motion` wylacza ruch, zostawiajac krotkie przejscia
  przezroczystosci.

## 3. Struktura

| Plik | Rola |
| --- | --- |
| `index.html` | strona glowna |
| `contact.html` | krokowy lejek kontaktowy |
| `shop.html` | witryna sklepu |
| `brief.html` | rozszerzony brief (poza nawigacja, link tylko z autoodpowiedzi) |
| `js/i18n.js` | wspolny slownik EN / UA / PL |
| `script.js` | rdzen: motyw, jezyk, menu, kursor, zegar, podglad projektow |
| `js/products.js` | dane towarow sklepu |
| `js/works-stack.js` | nasuwanie kart prac |
| `js/obj3d.js` | bryla 3D pod menu |
| `js/svc3.js` | trzy rozwijane kierunki uslug |
