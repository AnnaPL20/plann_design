/* =============================================================================
   PLANN Design — dane produktow sklepu
   Pola:
     id        — identyfikator (trafia do tematu maila "Notify me")
     name      — nazwa produktu; zostaje taka sama we wszystkich jezykach
     price     — cena jako tekst; 0 oznacza "Free". Wartosci ponizej sa
                 PLACEHOLDERAMI — do ustawienia przed startem sprzedazy.
     category  — 'social' | 'decks' | 'kits' (nazwy kategorii sa w slowniku)
     descKey   — klucz krotkiego opisu w js/i18n.js
     formats   — formaty plikow (nazwy techniczne, nietlumaczone)
     buyUrl    — adres platnosci; 'REPLACE-ME' dopoki nie ma prawdziwego linku
     status    — 'soon' (zapowiedz) albo 'live' (do kupienia)

   Zeby uruchomic sprzedaz produktu: wpisz prawdziwy buyUrl, ustaw status 'live'
   i sprawdz cene. Lista "co zawiera" jest wspolna dla kategorii — klucze
   sp.inc<Kategoria>1..3 w slowniku.
   ============================================================================= */
window.PLANN_PRODUCTS = [
  {
    id: 'instagram-grid-starter',
    name: 'Instagram Grid Starter',
    price: '€18',
    category: 'social',
    descKey: 'pr.grid',
    formats: 'Figma · PNG',
    buyUrl: 'REPLACE-ME',
    status: 'soon'
  },
  {
    id: 'story-and-reel-covers',
    name: 'Story & Reel Covers',
    price: '€14',
    category: 'social',
    descKey: 'pr.covers',
    formats: 'Figma · PNG',
    buyUrl: 'REPLACE-ME',
    status: 'soon'
  },
  {
    id: 'pitch-deck-essentials',
    name: 'Pitch Deck Essentials',
    price: '€24',
    category: 'decks',
    descKey: 'pr.pitch',
    formats: 'Figma · PDF',
    buyUrl: 'REPLACE-ME',
    status: 'soon'
  },
  {
    id: 'brand-presentation-kit',
    name: 'Brand Presentation Kit',
    price: '€28',
    category: 'decks',
    descKey: 'pr.brandDeck',
    formats: 'Figma · PDF',
    buyUrl: 'REPLACE-ME',
    status: 'soon'
  },
  {
    id: 'identity-starter-kit',
    name: 'Identity Starter Kit',
    price: '€32',
    category: 'kits',
    descKey: 'pr.identity',
    formats: 'Figma · SVG · PDF',
    buyUrl: 'REPLACE-ME',
    status: 'soon'
  },
  {
    id: 'colour-and-type-foundations',
    name: 'Colour & Type Foundations',
    price: '€22',
    category: 'kits',
    descKey: 'pr.colourType',
    formats: 'Figma · PDF',
    buyUrl: 'REPLACE-ME',
    status: 'soon'
  }
];
