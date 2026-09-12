/* =============================================================================
   PLANN Design — dane produktow sklepu
   Tu dopisujesz i edytujesz towary. Pola:
     id       — unikalny identyfikator (uzywany w temacie maila "Notify me")
     name     — nazwa produktu (zostaje taka sama we wszystkich jezykach)
     price    — cena jako tekst, np. '€19'; 0 oznacza "Free"; null = brak ceny
     covers   — jedna lub dwie okladki z folderu img/; przy dwoch druga
                pokazuje sie po najechaniu
     category — 'social' | 'decks' | 'kits' (nazwy kategorii sa w slowniku)
     buyUrl   — adres produktu w Payhip; dopoki jest null, przycisk to "Notify me"
     status   — 'soon' (zapowiedz) albo 'live' (do kupienia)

   Zeby uruchomic sprzedaz: wpisz buyUrl, ustaw status na 'live', podaj price
   i odkomentuj skrypt Payhip na dole pliku shop.html.
   ============================================================================= */
window.PLANN_PRODUCTS = [
  {
    id: 'instagram-grid-starter',
    name: 'Instagram Grid Starter',
    price: null,
    covers: ['img/cover-portfolio.png', 'img/cover-aura.jpg'],
    category: 'social',
    buyUrl: null,
    status: 'soon'
  },
  {
    id: 'story-and-reel-covers',
    name: 'Story & Reel Covers',
    price: null,
    covers: ['img/cover-aura.jpg', 'img/cover-magazine.jpg'],
    category: 'social',
    buyUrl: null,
    status: 'soon'
  },
  {
    id: 'pitch-deck-essentials',
    name: 'Pitch Deck Essentials',
    price: null,
    covers: ['img/cover-biveris.jpg', 'img/cover-synq.jpg'],
    category: 'decks',
    buyUrl: null,
    status: 'soon'
  },
  {
    id: 'brand-presentation-kit',
    name: 'Brand Presentation Kit',
    price: null,
    covers: ['img/cover-magazine.jpg', 'img/cover-portfolio.png'],
    category: 'decks',
    buyUrl: null,
    status: 'soon'
  },
  {
    id: 'identity-starter-kit',
    name: 'Identity Starter Kit',
    price: null,
    covers: ['img/cover-synq.jpg', 'img/cover-biveris.jpg'],
    category: 'kits',
    buyUrl: null,
    status: 'soon'
  },
  {
    id: 'colour-and-type-foundations',
    name: 'Colour & Type Foundations',
    price: null,
    covers: ['img/cover-portfolio.png', 'img/cover-synq.jpg'],
    category: 'kits',
    buyUrl: null,
    status: 'soon'
  }
];
