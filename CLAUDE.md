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
| **Plama negatywu w oknie portretu** — biale kolo 150 px `mix-blend-mode: difference` jezdzi za kursorem po znaku PA w sekcji "O mnie" (do 17.09.2026 mieszkalo w hero) | `style.css` sekcja 76; `js/hero-negative.js` |
| **Szklane krople (liquid glass)** na przyciskach, pigulkach, chipsach i ikonach socjalnych | `style.css` sekcja 20; `js/ui-liquid.js` |
| **Galaretowaty klik** (Web Animations API) i falka (ripple) | `js/ui-liquid.js` |
| **Plynna kropla przelacznika jezyka** z filtrem SVG gooey | `style.css` sekcja 20 + `js/ui-liquid.js` |
| **Pojawianie sie blokow przy przewijaniu** (fade-up z kaskada) | `script.js` + `js/scroll.js` |
| **Naglowki slowo po slowie** (`data-split`) | `script.js` |
| **Samoczynna fala kafelkow w stopce** | `js/footer-works.js` |
| **Kurtyna wejsciowa** — strona zaczyna sie czernia, z ktorej wykreca sie znak PA, potem wchodzi tresc | `style.css` sekcja 74; `js/intro-gate.js` |
| **Scena skrolu ze znakiem PA** — pierwszy akt strony: plotno na caly ekran za trescia; znak jest czarnym metalem w hero i rozjasnia sie do bieli przy przewijaniu, robi pol obrotu, rozpada sie na P i A, oblatuje sam siebie i sklada z powrotem, po czym idzie w gore i gasnie | `style.css` sekcje 77-78; `js/mono-scroll3d.js` |
| **Wyplywanie z rozmycia przy przewijaniu** — bloki ostrza sie z blura razem z wjazdem | `style.css` sekcja 74 (`[data-reveal]`) |
| **Galeria prac w siatce** — pasek przelacza gestosc 2 / 3 / 4 w rzedzie, wybor pamieta sie w przegladarce | `style.css` sekcja 75; `js/works-grid.js` |
| **Rozwijane kierunki uslug** — jeden otwarty naraz, plynna zmiana wysokosci | `style.css` sekcja 65; `js/svc3.js` |
| **Tekst ciemnieje w miare czytania** — slowa z `[data-manifesto]` przechodza z szarosci w kolor tekstu przy przewijaniu. Od 01.10.2026 BEZ rozmycia slow (wlascicielka: "nie da sie czytac"); zostaje samo przyciemnienie | `style.css` sekcje 90, 93 i 95; `js/manifesto.js` |
| **Wejscie hero** — bloki pierwszego ekranu wplywaja po kolei, gdy zejdzie kurtyna | `style.css` sekcja 94 (`.hero__in`) |
| **Pojawianie w obie strony** — blok, ktory wyjechal dolem ekranu, chowa sie i wplywa znow przy przewijaniu w dol (od 01.10.2026) | `script.js` + `js/scroll.js` (IntersectionObserver) |
| **Przyklejony naglowek uslug** — lewa kolumna "This is how I work." jedzie razem z lista kierunkow | `style.css` sekcja 98 |
| **Szklo menu** — kapsula i panel jak czysta kropla: przezroczyste tlo, rozmycie, blysk na krawedzi; na stronach na tuszu ciemne szklo | `style.css` sekcja 99 |
| **Przeplywanie miedzy stronami** — wyjscie z rozmyciem po kliknieciu odnosnika, wejscie tresci z rozmycia, `@view-transition` tam, gdzie jest | `style.css` sekcja 102; `js/page-flow.js` |
| **Wejscie lejka kontaktowego** — bloki formularza wplywaja po kolei z rozmycia | `style.css` sekcja 101 |
| **Filtry prac** — jedna siatka, kierunki przelaczane tekstowymi filtrami nad nia, siatka gasnie i wraca przy zmianie | `style.css` sekcja 96; `js/works-filter.js` |
| **Glebia prac przy przewijaniu** — kafelek przy srodku ekranu ostry i blisko, dalsze mniejsze i rozmyte; po najechaniu na jeden reszta sie rozmywa | `style.css` sekcja 96 (`--depth`, `--hb`); `js/works-depth.js` |
| **Krople na przyciskach** — przezroczyste, wypukle szklo z odblaskiem za kursorem na kazdym `.btn`, `.chip`, `.socialbtn`, pigulce menu | `style.css` sekcja 104; `--x/--y` z `js/ui-liquid.js` |
| **Czarny ekran z znakiem przy otwieraniu projektu** | `style.css` sekcja 106; znacznik `.case-loader` w `index.html` |
| **Znak patrzy za mysza, mokry lakier** — od 01.10.2026 odchyla sie do 38 / 18 stopni, material clearcoat 1, roughness .08 | `js/mono-scroll3d.js` |

Skala pisma (od 01.10.2026, `style.css` sekcja 105): naglowki sekcji jednej
wielkosci, light, z grubym `<strong>` na pierwszej czesci; tekst glowny jednej
wielkosci; podpisy to `.label`. Kazda zmiana wielkosci idzie do sekcji 105,
nie do pojedynczego bloku. Naglowki dzielone na dwie czesci maja po dwa
klucze w slowniku (`hero.titleA/B`, `fq.titleA/B`, `shp.titleA/B`).

02.10.2026 (prosby wlascicielki):
- kolor akcentu ZOSTAJE czerwony (proba niebieskiego odrzucona od razu:
  "lisz moj firmowy czerwony");
- krople jak na referencji studio.baseline ("Source BTN"): stalowy gradient
  z jasnej gory w ciemny dol, cienka metalowa obwodka (gradient w
  border-box), cien w srodku przy dolnej krawedzi, zadnych plam za kursorem
  (`style.css` sekcja 110). Ciemna stalowa wersja: `.btn--solid`,
  `.btn--ink`, wybrany chip, pigulka CONTACT; jasna: reszta na papierze;
  na stronach na tuszu i w ciemnym motywie wszystkie stalowe. Kapsula
  menu i panel maja te sama obwodke;
- kroj: Satoshi (sekcja 109; `fonts/Satoshi-300.woff2` dolozony z paczki
  Fontshare) zamiast Switzera — Switzer "za bardzo wydluzony"; naglowki
  Light 300 + Medium 500, rozmiar `clamp(2rem, 4.2vw, 4rem)`;
- sekcja "O mnie" zaraz pod hero, wysokosci ekranu: naglowek lewa gora,
  opis prawa gora, znak PA parkuje w lewej dolnej cwiartce, fakty prawa dol
  (sekcja 108; os aktu w `js/mono-scroll3d.js` konczy sie, gdy gora sekcji
  dojedzie pod pasek menu);
- znak patrzy za mysza zawsze, takze po zjezdzie z hero (`hand = 1`);
- znak zostaje czarnym, mokrym metalem — proba szkla (transmission)
  odrzucona tego samego dnia, wartosci w komentarzu w `js/mono-scroll3d.js`;
- glebia prac bez rozmycia — zostaje skala i przezroczystosc.

Hero od 01.10.2026 (wieczor): sam znak na pustym ekranie — status w prawym
gornym rogu, zegar z data w lewym dolnym, jeden przycisk na dole po srodku.
Zadnego naglowka ani akapitu w hero; h1 strony stoi w sekcji "O mnie".
Prace: najwyzej szesc kafelkow (wlascicielka nie chce wymyslac opisow do
wiekszej liczby projektow); reszta kadrow serii zyje w podgladzie projektu.

Scena skrolu ze znakiem PA od 01.10.2026 (prosba wlascicielki): os aktu
liczy sie od wejscia sekcji "O mnie" do chwili, gdy jej tekst stoi na srodku
okna — tam znak jest zlozony i stoi obok tekstu. Potem nie ma wlasnego ruchu
w gore: znak jedzie razem ze strona i gasnie. Dawne wyjscie w gore zostaje
w kodzie jako komentarz (`sOut`).

Jesli nowy element koliduje z istniejacym efektem — pytamy, ktory zostaje.
Nigdy nie decydujemy sami o usunieciu.

Jesli efekt trzeba chwilowo wylaczyc, robimy to komentarzem z data i powodem,
nie kasowaniem kodu.

Zdjete ze strony na wyrazna prosbe wlascicielki (kod zostaje, wraca
odkomentowaniem jednej linii w `index.html`):

| Co | Kiedy i dlaczego | Gdzie lezy |
| --- | --- | --- |
| **Stara scena hero ze znakiem PA** | 17.09.2026 — znak prowadzi teraz caly pierwszy akt na plotnie na caly ekran, dwie bryly gryzlyby sie w kadrze | `style.css` sekcja 68; `js/hero-logo3d.js` |
| **Wstega okladek na stronie kontaktu** | 17.09.2026 — kafelki i okragle krople psuly obraz strony | `style.css` sekcja okolo `.arc`; `js/reel-arc.js`, blok w `contact.html` |
| **Pryzma 3D pod menu** | 14.09.2026 — jedynym obiektem 3D ma byc znak PA w hero | `style.css` sekcja 66; `js/obj3d.js` |
| **Szklana kropla na ikonach socjalnych** | 14.09.2026 — robila z nich kafelki; na przyciskach i pigulkach dziala dalej | `style.css` sekcja 70 |
| **Nasuwanie kart prac** | 15.09.2026 — prace stoja teraz w siatce, gortanie po jednej meczylo | `style.css` sekcje 63 i 73; `js/works-stack.js` |
| **Model rzezbionej glowy** | 13.09.2026 | `js/obj3d-model.js`; `models/rodin-head.glb` |
| **Rozmycie nieoswietlonych slow** (`[data-manifesto] .mw`) | 01.10.2026 — tekst byl nieczytelny; samo przyciemnienie dziala dalej | `style.css` sekcja 93 (wylacza sekcja 95) |
| **Stary uklad hero** (naglowek na dwoch wagach nad scena, akapit i pasek faktow pod nia) | 01.10.2026 — za duzo tekstu na jednym ekranie, znak naplywal na naglowek; fakty przeszly do sekcji "O mnie" | `style.css` sekcje 89-91 (nadpisuje 94), znaczniki w historii git |

## 2. Zasady ogolne

- Zadnych zewnetrznych CDN-ow. Biblioteki, fonty i ikony leza lokalnie
  (`js/vendor/`, `fonts/`, `img/icons/`).
  Three.js i jego wtyczki (`SVGLoader`, `GLTFLoader`, `RoomEnvironment`, `BufferGeometryUtils`)
  maja w `js/vendor/` podmienione importy na `./three.module.min.js` — po
  aktualizacji biblioteki trzeba to powtorzyc.
- Zadnych tekstow, obrazow ani kodu z cudzych stron. Wszystkie okladki
  pochodza z `img/`, wszystkie sformulowania sa wlasne.
- Kazdy nowy tekst trafia do slownika we wszystkich trzech jezykach
  (EN / UA / PL) w `js/i18n.js`. Zero surowych kluczy na stronie.
- Nowe komentarze w kodzie po polsku.
- Kolory i typografia zmieniaja sie tylko na wyrazna prosbe.
  Kroje: Switzer (tekst, interfejs i duze naglowki — od 17.09.2026),
  Fragment Mono (podpisy), Inter (cyrylica). Wszystkie lokalnie w `fonts/`.
  Satoshi i Clash Display zostaja w repozytorium jako zapas — wracaja zmiana
  tokenow w `style.css` sekcja 83.
  Neue Haas Grotesk, PP Neue Montreal i Proto Mono sa platne — nie wolno
  ich podpinac.
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
| `js/works-grid.js` | gestosc siatki prac (2 / 3 / 4 w rzedzie) |
| `js/works-filter.js` | filtry kierunkow nad siatka prac |
| `js/works-depth.js` | glebia kafelkow prac przy przewijaniu |
| `js/page-flow.js` | przeplywanie miedzy stronami (na kazdej stronie) |
| `img/1.png` … `img/10.png` | seria "Nothing is seen" — kadry w siatce prac, przeplatane okladkami z Behance (od 01.10.2026) |
| `files/` | pliki do pobrania ze sklepu (probka karty AE: `plann-animated-card-sample.aep`) |

Sklep: platnosci i wysylka plikow przez Payhip. Wlascicielka zaklada konto,
dodaje produkt z plikiem i cena, wkleja adres do `buyUrl` w `js/products.js`,
ustawia `status: 'live'` i odkomentowuje skrypt `payhip.js` w `shop.html`
(jedyny dozwolony skrypt z obcego serwera — to bramka platnosci, nie
biblioteka). Pieniadze trafiaja na konto podpiete w Payhip.
| `js/works-stack.js` | nasuwanie kart prac — odlozone 15.09.2026 |
| `js/mono-scroll3d.js` | scena skrolu ze znakiem PA — pierwszy akt strony |
| `js/hero-logo3d.js` | stara scena hero (czarny metal) — odlozona 17.09.2026 |
| `js/intro-gate.js` | kurtyna wejsciowa ze znakiem |
| `js/hero-negative.js` | plama negatywu w oknie portretu (sekcja "O mnie") |
| `js/obj3d.js` | pryzma z okladek pod menu |
| `js/obj3d-model.js` | model glowy — odlozony 13.09.2026, skrypt wylaczony w `index.html` |
| `models/` | modele 3D (`.glb`); na razie nieuzywane przez strone |
| `js/svc3.js` | trzy rozwijane kierunki uslug |
