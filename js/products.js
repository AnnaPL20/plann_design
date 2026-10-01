/* =============================================================================
   PLANN Design — dane produktow sklepu
   Pola:
     id        — identyfikator (trafia do tematu maila "Notify me")
     name      — nazwa produktu; zostaje taka sama we wszystkich jezykach
     price     — cena jako tekst; 0 oznacza "Free". Wartosci ponizej sa
                 PLACEHOLDERAMI — do ustawienia przed startem sprzedazy.
     category  — 'ps' (efekty do Photoshopa) | 'ae' (szablony After Effects)
                 (nazwy kategorii sa w slowniku: sp.cPs, sp.cAe)
     descKey   — klucz krotkiego opisu w js/i18n.js
     formats   — formaty plikow (nazwy techniczne, nietlumaczone)
     buyUrl    — adres produktu w Payhip (https://payhip.com/b/XXXX);
                 'REPLACE-ME' dopoki nie ma prawdziwego linku
     status    — 'soon' (zapowiedz) albo 'live' (do kupienia)
     sample    — (opcjonalnie) sciezka do darmowej probki do pobrania

   01.10.2026 (prosba wlascicielki): w sklepie stoja dwa kierunki — efekty
   szkla i rozmycia do Photoshopa oraz animowane karty do After Effects.
   Probka karty AE lezy w files/plann-animated-card-sample.aep.

   Jak uruchomic sprzedaz (platnosci idą przez Payhip — on obsluguje karte,
   wysyla plik kupujacemu i przelewa pieniadze na konto wlascicielki):
   1. zalozyc konto na payhip.com i dodac produkt z plikiem i cena;
   2. skopiowac adres produktu do buyUrl ponizej i ustawic status 'live';
   3. w shop.html odkomentowac skrypt payhip.js — wtedy platnosc otworzy sie
      w nakladce na stronie, a nie w nowej karcie.
   ============================================================================= */
window.PLANN_PRODUCTS = [
  {
    id: 'glass-blur-effects',
    name: 'Glass & Blur Effects',
    price: '€12',
    category: 'ps',
    descKey: 'pr.glass',
    formats: 'PSD · PDF',
    buyUrl: 'REPLACE-ME',
    status: 'soon'
  },
  {
    id: 'animated-cards',
    name: 'Animated Cards',
    price: '€18',
    category: 'ae',
    descKey: 'pr.cards',
    formats: 'AEP · 1080 × 1350',
    buyUrl: 'REPLACE-ME',
    status: 'soon',
    sample: 'files/plann-animated-card-sample.aep'
  }
];
