/* =============================================================================
   PLANN Design — Anna Pytsko · logika strony
   Wydzielone z index.html; laduje sie z atrybutem defer, wiec DOM jest gotowy.
   Zawartosc: slownik tlumaczen UA/EN/PL, motyw, menu, kursor, animacje wejscia
   (IntersectionObserver), podglad projektow, zegar studia.
   Zadnych zewnetrznych bibliotek — wszystko wlasnym kodem.
   ============================================================================= */
(() => {
  'use strict';

  /* ---------- Konfiguracja ---------- */
  const STUDIO_TZ = 'Europe/Warsaw'; // strefa czasowa zegara w sekcji hero

  /* ---------- Słownik tłumaczeń (UA / EN / PL) ---------- */
  const I18N = {
    en: {
      'meta.title': 'Anna Pytsko · PLANN Design · Graphic & Web Designer',
      'meta.desc': 'PLANN Design by Anna Pytsko: bold brand identities, high-converting digital experiences and social media content that make brands impossible to ignore.',
      'a11y.skip': 'Skip to content', 'a11y.menuOpen': 'Open menu', 'a11y.menuClose': 'Close menu', 'a11y.theme': 'Switch color theme', 'a11y.home': 'PLANN Design — home', 'cursor.view': 'View',
      'nav.home': 'Home', 'nav.projects': 'Projects', 'nav.services': 'Services', 'nav.shop': 'Shop', 'nav.contact': 'Contact', 'nav.cta': 'Get in touch',
      'hero.label': 'Graphic & web designer', 'hero.status': 'Available for new projects',
      'hero.title': 'Make your brand impossible to ignore.',
      'hero.lead': 'Elevate your brand with strategic identity and impactful visual design. Showcase your story through bold aesthetics and purposeful creativity.',
      'hero.btnProjects': 'View projects', 'hero.btnContact': 'Let’s talk', 'hero.based': 'Poland — working worldwide', 'hero.time': 'Local time', 'hero.scroll': 'Scroll to explore',
      'mq.1': 'Brand identity', 'mq.2': 'Social media design', 'mq.3': 'Web & UI design', 'mq.4': 'Packaging', 'mq.5': 'Print & posters', 'mq.6': 'Motion & video', 'mq.7': 'Presentations',
      'projects.label': 'Selected work', 'projects.title': 'Projects',
      'projects.lead': 'A selection of identities, digital experiences and social content. Full case studies live on Behance, daily work on Instagram.',
      'projects.behance': 'All projects on Behance', 'projects.instagram': 'Daily work on Instagram',
      'card.sheet': 'Project',
      'cat.brand': 'Brand identity', 'cat.social': 'Social media', 'cat.web': 'Web & UI', 'cat.pack': 'Packaging', 'cat.print': 'Print', 'cat.motion': 'Motion & video',
      'p1.desc': 'Branding, web and social media — selected work in one portfolio.',
      'p2.desc': 'Clinical brand identity and UX system for a skincare lab.',
      'p3.desc': 'Fashion banner series for a puffer jacket collection.',
      'p4.desc': 'Logo and brand identity for a loft bar.',
      'p5.desc': 'Editorial design for a fashion magazine.',
      'p6.desc': 'Website design concept for a taxi service.',
      'p7.desc': 'Self-promotional portfolio publication.',
      'p8.desc': 'Video and motion graphics work.',
      'about.label': 'About me', 'about.title': 'Hi, I’m Anna',
      'about.text': 'Hi, I’m Anna, a multidisciplinary graphic and web designer. I craft bold visual identities, high-converting digital experiences, and engaging social media content that helps brands stand out and connect with their audience.',
      'about.f1k': 'Name', 'about.f1v': 'Anna Pytsko', 'about.f2k': 'Studio', 'about.f3k': 'Focus', 'about.f3v': 'Branding, social media, web',
      'about.f4k': 'Languages', 'about.f4v': 'Ukrainian, English, Polish', 'about.f5k': 'Location', 'about.f5v': 'Poland — remote, worldwide', 'about.cta': 'Start a project',
      'services.label': 'Services', 'services.title': 'What I do', 'services.titleA': 'What I', 'services.titleB': 'do.',
      'services.lead': 'From the first brief to the final file — strategy, identity and content that work together.', 'services.cta': 'Get in touch',
      's1.title': 'Brand identity', 's1.desc': 'Logo, typography, color and a system that works at every touchpoint.',
      's2.title': 'Social media design', 's2.desc': 'Content systems, templates and visuals that stop the scroll.',
      's3.title': 'Web & UI design', 's3.desc': 'Landing pages and interfaces that look premium and convert.',
      's4.title': 'Packaging & print', 's4.desc': 'Packaging, posters, editorial and print materials with attention to every detail.',
      's5.title': 'Motion & video', 's5.desc': 'Short-form video, reels and animated visuals for social platforms.',
      's6.title': 'Presentations & templates', 's6.desc': 'Pitch decks, brand presentations and ready-to-use templates.',
      'pill.1': 'Logo design', 'pill.2': 'Brand guidelines', 'pill.3': 'Instagram content', 'pill.4': 'Reels', 'pill.5': 'Landing pages', 'pill.6': 'Art direction',
      'pill.7': 'Typography', 'pill.8': 'Packaging', 'pill.9': 'Posters', 'pill.10': 'Pitch decks', 'pill.11': 'Templates', 'pill.12': 'Visual systems',
      'shop.label': 'Shop', 'shop.title': 'Templates for designers & brands', 'shop.badge': 'Coming soon',
      'shop.lead': 'Ready-to-use templates for social media, presentations and brand kits — made to save you hours and keep every post on-brand.',
      'sh1.title': 'Social media templates', 'sh1.desc': 'Post, story and carousel layouts for Instagram.',
      'sh2.title': 'Presentation decks', 'sh2.desc': 'Pitch and brand presentations, fully editable.',
      'sh3.title': 'Brand kit starters', 'sh3.desc': 'Logo lockups, color and type systems to build on.',
      'shop.cta': 'Notify me at launch', 'shop.note': 'Be the first to know when the store opens.',
      'contact.label': 'Contact', 'contact.title': 'Let’s create something impossible to ignore.',
      'contact.lead': 'Have a project in mind? Send a message and I’ll get back to you soon.', 'contact.socials': 'Find me on',
      'footer.tagline': 'Brand, social & web design', 'footer.rights': 'All rights reserved.', 'footer.top': 'Back to top'
    },
    uk: {
      'meta.title': 'Анна Питсько · PLANN Design · Графічна та веб-дизайнерка',
      'meta.desc': 'PLANN Design від Анни Питсько — сміливі айдентики, ефективні цифрові продукти та контент для соцмереж, що роблять бренди помітними.',
      'a11y.skip': 'Перейти до контенту', 'a11y.menuOpen': 'Відкрити меню', 'a11y.menuClose': 'Закрити меню', 'a11y.theme': 'Змінити тему', 'a11y.home': 'PLANN Design — головна', 'cursor.view': 'Подивитись',
      'nav.home': 'Головна', 'nav.projects': 'Проєкти', 'nav.services': 'Послуги', 'nav.shop': 'Магазин', 'nav.contact': 'Контакти', 'nav.cta': 'Написати мені',
      'hero.label': 'Графічна та веб-дизайнерка', 'hero.status': 'Відкрита до нових проєктів',
      'hero.title': 'Зробіть бренд, який неможливо не помітити.',
      'hero.lead': 'Підсильте свій бренд стратегічною айдентикою та виразним візуальним дизайном. Розкажіть свою історію через сміливу естетику й осмислену креативність.',
      'hero.btnProjects': 'Переглянути проєкти', 'hero.btnContact': 'Обговорити проєкт', 'hero.based': 'Польща — працюю з клієнтами по всьому світу', 'hero.time': 'Місцевий час', 'hero.scroll': 'Гортайте далі',
      'mq.1': 'Айдентика бренду', 'mq.2': 'Дизайн для соцмереж', 'mq.3': 'Веб та UI-дизайн', 'mq.4': 'Пакування', 'mq.5': 'Друк і постери', 'mq.6': 'Моушн і відео', 'mq.7': 'Презентації',
      'projects.label': 'Вибрані роботи', 'projects.title': 'Проєкти',
      'projects.lead': 'Добірка айдентик, цифрових продуктів і контенту для соцмереж. Повні кейси — на Behance, щоденна робота — в Instagram.',
      'projects.behance': 'Усі проєкти на Behance', 'projects.instagram': 'Щоденна робота в Instagram',
      'card.sheet': 'Проєкт',
      'cat.brand': 'Айдентика', 'cat.social': 'Соцмережі', 'cat.web': 'Веб та UI', 'cat.pack': 'Пакування', 'cat.print': 'Друк', 'cat.motion': 'Моушн і відео',
      'p1.desc': 'Брендинг, веб і соцмережі — вибрані роботи в одному портфоліо.',
      'p2.desc': 'Клінічна айдентика та UX-система для косметичного бренду.',
      'p3.desc': 'Серія fashion-банерів для колекції пуховиків.',
      'p4.desc': 'Логотип та айдентика для лофт-бару.',
      'p5.desc': 'Редакційний дизайн fashion-журналу.',
      'p6.desc': 'Дизайн сайту для сервісу таксі.',
      'p7.desc': 'Самопрезентаційне портфоліо-видання.',
      'p8.desc': 'Відео та моушн-графіка.',
      'about.label': 'Про мене', 'about.title': 'Привіт, я Анна',
      'about.text': 'Привіт, я Анна — мультидисциплінарна графічна та веб-дизайнерка. Я створюю сміливі візуальні айдентики, ефективні цифрові продукти та захопливий контент для соцмереж, що допомагає брендам вирізнятися та встановлювати зв’язок зі своєю аудиторією.',
      'about.f1k': 'Ім’я', 'about.f1v': 'Анна Питсько', 'about.f2k': 'Студія', 'about.f3k': 'Фокус', 'about.f3v': 'Брендинг, соцмережі, веб',
      'about.f4k': 'Мови', 'about.f4v': 'Українська, англійська, польська', 'about.f5k': 'Локація', 'about.f5v': 'Польща — віддалено, по всьому світу', 'about.cta': 'Розпочати проєкт',
      'services.label': 'Послуги', 'services.title': 'Чим я займаюся', 'services.titleA': 'Чим я', 'services.titleB': 'займаюся.',
      'services.lead': 'Від першого брифу до фінального файлу — стратегія, айдентика та контент, що працюють разом.', 'services.cta': 'Написати мені',
      's1.title': 'Айдентика бренду', 's1.desc': 'Логотип, типографіка, кольори та система, що працює на кожній точці контакту.',
      's2.title': 'Дизайн для соцмереж', 's2.desc': 'Контент-системи, шаблони та візуали, які зупиняють скрол.',
      's3.title': 'Веб та UI-дизайн', 's3.desc': 'Лендінги та інтерфейси, що виглядають преміально й конвертують.',
      's4.title': 'Пакування та друк', 's4.desc': 'Пакування, постери, редакційні та друковані матеріали з увагою до кожної деталі.',
      's5.title': 'Моушн і відео', 's5.desc': 'Короткі відео, reels та анімована графіка для соцмереж.',
      's6.title': 'Презентації та шаблони', 's6.desc': 'Пітч-деки, брендові презентації та готові до використання шаблони.',
      'pill.1': 'Дизайн логотипу', 'pill.2': 'Брендбук', 'pill.3': 'Контент для Instagram', 'pill.4': 'Reels', 'pill.5': 'Лендінги', 'pill.6': 'Арт-дирекшн',
      'pill.7': 'Типографіка', 'pill.8': 'Пакування', 'pill.9': 'Постери', 'pill.10': 'Пітч-деки', 'pill.11': 'Шаблони', 'pill.12': 'Візуальні системи',
      'shop.label': 'Магазин', 'shop.title': 'Шаблони для дизайнерів і брендів', 'shop.badge': 'Незабаром',
      'shop.lead': 'Готові шаблони для соцмереж, презентацій та бренд-кітів — щоб економити години роботи й тримати кожен пост у стилі бренду.',
      'sh1.title': 'Шаблони для соцмереж', 'sh1.desc': 'Макети постів, сторіс і каруселей для Instagram.',
      'sh2.title': 'Презентації', 'sh2.desc': 'Пітч-деки та брендові презентації, повністю редаговані.',
      'sh3.title': 'Стартові бренд-кіти', 'sh3.desc': 'Логотипи, кольори та типографіка як основа для розвитку.',
      'shop.cta': 'Повідомити про запуск', 'shop.note': 'Дізнайтеся першими про відкриття магазину.',
      'contact.label': 'Контакти', 'contact.title': 'Створімо щось, що неможливо не помітити.',
      'contact.lead': 'Маєте ідею проєкту? Напишіть мені — і я незабаром відповім.', 'contact.socials': 'Я в соцмережах',
      'footer.tagline': 'Брендинг, соцмережі та веб-дизайн', 'footer.rights': 'Усі права захищені.', 'footer.top': 'Нагору'
    },
    pl: {
      'meta.title': 'Anna Pytsko · PLANN Design · Projektantka graficzna i webowa',
      'meta.desc': 'PLANN Design — Anna Pytsko. Odważne identyfikacje wizualne, skuteczne projekty cyfrowe i treści do social mediów, dzięki którym marek nie da się zignorować.',
      'a11y.skip': 'Przejdź do treści', 'a11y.menuOpen': 'Otwórz menu', 'a11y.menuClose': 'Zamknij menu', 'a11y.theme': 'Zmień motyw', 'a11y.home': 'PLANN Design — strona główna', 'cursor.view': 'Zobacz',
      'nav.home': 'Start', 'nav.projects': 'Projekty', 'nav.services': 'Usługi', 'nav.shop': 'Sklep', 'nav.contact': 'Kontakt', 'nav.cta': 'Napisz do mnie',
      'hero.label': 'Projektantka graficzna i webowa', 'hero.status': 'Otwarta na nowe projekty',
      'hero.title': 'Zbuduj markę, której nie da się zignorować.',
      'hero.lead': 'Wzmocnij swoją markę strategiczną identyfikacją i wyrazistym designem. Opowiedz swoją historię przez odważną estetykę i świadomą kreatywność.',
      'hero.btnProjects': 'Zobacz projekty', 'hero.btnContact': 'Porozmawiajmy', 'hero.based': 'Polska — pracuję z klientami z całego świata', 'hero.time': 'Czas lokalny', 'hero.scroll': 'Przewiń dalej',
      'mq.1': 'Identyfikacja wizualna', 'mq.2': 'Social media design', 'mq.3': 'Web & UI design', 'mq.4': 'Opakowania', 'mq.5': 'Druk i plakaty', 'mq.6': 'Motion i wideo', 'mq.7': 'Prezentacje',
      'projects.label': 'Wybrane prace', 'projects.title': 'Projekty',
      'projects.lead': 'Wybór identyfikacji, projektów cyfrowych i treści do social mediów. Pełne case studies znajdziesz na Behance, codzienną pracę na Instagramie.',
      'projects.behance': 'Wszystkie projekty na Behance', 'projects.instagram': 'Codzienna praca na Instagramie',
      'card.sheet': 'Projekt',
      'cat.brand': 'Identyfikacja', 'cat.social': 'Social media', 'cat.web': 'Web & UI', 'cat.pack': 'Opakowania', 'cat.print': 'Druk', 'cat.motion': 'Motion i wideo',
      'p1.desc': 'Branding, web i social media — wybrane prace w jednym portfolio.',
      'p2.desc': 'Kliniczna identyfikacja i system UX dla marki skincare.',
      'p3.desc': 'Seria banerów modowych dla kolekcji puchówek.',
      'p4.desc': 'Logo i identyfikacja wizualna loftowego baru.',
      'p5.desc': 'Projekt edytorski magazynu modowego.',
      'p6.desc': 'Projekt strony internetowej dla usługi taxi.',
      'p7.desc': 'Autopromocyjna publikacja portfolio.',
      'p8.desc': 'Wideo i motion graphics.',
      'about.label': 'O mnie', 'about.title': 'Cześć, jestem Anna',
      'about.text': 'Cześć, jestem Anna — multidyscyplinarna projektantka graficzna i webowa. Tworzę odważne identyfikacje wizualne, skuteczne projekty cyfrowe i angażujące treści do social mediów, które pomagają markom wyróżnić się i budować relację z odbiorcami.',
      'about.f1k': 'Imię', 'about.f1v': 'Anna Pytsko', 'about.f2k': 'Studio', 'about.f3k': 'Specjalizacja', 'about.f3v': 'Branding, social media, web',
      'about.f4k': 'Języki', 'about.f4v': 'Ukraiński, angielski, polski', 'about.f5k': 'Lokalizacja', 'about.f5v': 'Polska — zdalnie, na całym świecie', 'about.cta': 'Zacznijmy projekt',
      'services.label': 'Usługi', 'services.title': 'Czym się zajmuję', 'services.titleA': 'Czym się', 'services.titleB': 'zajmuję.',
      'services.lead': 'Od pierwszego briefu do finalnego pliku — strategia, identyfikacja i treści, które działają razem.', 'services.cta': 'Napisz do mnie',
      's1.title': 'Identyfikacja wizualna', 's1.desc': 'Logo, typografia, kolory i system, który działa w każdym punkcie styku z marką.',
      's2.title': 'Social media design', 's2.desc': 'Systemy treści, szablony i grafiki, które zatrzymują scroll.',
      's3.title': 'Web & UI design', 's3.desc': 'Landing pages i interfejsy, które wyglądają premium i konwertują.',
      's4.title': 'Opakowania i druk', 's4.desc': 'Opakowania, plakaty, materiały edytorskie i drukowane z dbałością o każdy detal.',
      's5.title': 'Motion i wideo', 's5.desc': 'Krótkie wideo, reels i animowane grafiki do social mediów.',
      's6.title': 'Prezentacje i szablony', 's6.desc': 'Pitch decki, prezentacje marki i gotowe do użycia szablony.',
      'pill.1': 'Projekt logo', 'pill.2': 'Księga znaku', 'pill.3': 'Treści na Instagram', 'pill.4': 'Reels', 'pill.5': 'Landing pages', 'pill.6': 'Art direction',
      'pill.7': 'Typografia', 'pill.8': 'Opakowania', 'pill.9': 'Plakaty', 'pill.10': 'Pitch decki', 'pill.11': 'Szablony', 'pill.12': 'Systemy wizualne',
      'shop.label': 'Sklep', 'shop.title': 'Szablony dla projektantów i marek', 'shop.badge': 'Wkrótce',
      'shop.lead': 'Gotowe szablony do social mediów, prezentacji i brand kitów — by oszczędzać godziny pracy i utrzymać każdy post w stylu marki.',
      'sh1.title': 'Szablony social media', 'sh1.desc': 'Układy postów, stories i karuzel na Instagram.',
      'sh2.title': 'Prezentacje', 'sh2.desc': 'Pitch decki i prezentacje marki, w pełni edytowalne.',
      'sh3.title': 'Startowe brand kity', 'sh3.desc': 'Logo, kolory i typografia jako baza do rozwoju.',
      'shop.cta': 'Powiadom mnie o starcie', 'shop.note': 'Bądź na bieżąco z otwarciem sklepu.',
      'contact.label': 'Kontakt', 'contact.title': 'Stwórzmy coś, czego nie da się zignorować.',
      'contact.lead': 'Masz pomysł na projekt? Napisz do mnie — odpowiem wkrótce.', 'contact.socials': 'Znajdziesz mnie na',
      'footer.tagline': 'Branding, social media i web design', 'footer.rights': 'Wszelkie prawa zastrzeżone.', 'footer.top': 'Do góry'
    }
  };

  /* ---------- Pomocnicze ---------- */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = matchMedia('(pointer: fine)').matches;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* tryb prywatny */ } }
  };
  const t = (lang, key) => (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? '';
  let currentLang = 'en';

  /* ---------- Motyw (ciemny / jasny) ---------- */
  const themeBtn = $('#themeToggle');
  const applyTheme = theme => {
    root.dataset.theme = theme;
    store.set('plann-theme', theme);
    themeBtn && themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
    const meta = $('meta[name="theme-color"]');
    meta && meta.setAttribute('content', theme === 'light' ? '#faf9f7' : '#0b0b0c');
  };
  applyTheme(store.get('plann-theme') || 'light');
  themeBtn && themeBtn.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* ---------- Dzielenie nagłówków na słowa (animacja słowo po słowie) ---------- */
  const splitWords = el => {
    const text = el.textContent.trim();
    el.textContent = '';
    text.split(/\s+/).forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.style.setProperty('--i', i);
      span.textContent = word;
      el.appendChild(span);
      el.appendChild(document.createTextNode(' '));
    });
  };
  const replay = el => {
    el.classList.remove('is-in');
    void el.offsetWidth; // wymuszenie reflow, aby animacja odtworzyła się ponownie
    requestAnimationFrame(() => el.classList.add('is-in'));
  };

  /* ---------- Język ---------- */
  const setLang = (lang, initial = false) => {
    if (!I18N[lang]) lang = 'en';
    currentLang = lang;
    $$('[data-i18n]').forEach(el => { el.textContent = t(lang, el.dataset.i18n); });
    $$('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) el.setAttribute(attr, t(lang, key));
      });
    });
    root.lang = lang;
    const cursorLabel = $('.cursor span');
    if (cursorLabel) cursorLabel.textContent = t(lang, 'cursor.view');
    document.title = t(lang, 'meta.title');
    const desc = $('meta[name="description"]');
    desc && desc.setAttribute('content', t(lang, 'meta.desc'));
    $$('[data-split]').forEach(el => {
      splitWords(el);
      if (!initial && (el.classList.contains('is-in') || !el.hasAttribute('data-reveal'))) replay(el);
    });
    $$('.lang__btn').forEach(b => {
      const on = b.dataset.lang === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    store.set('plann-lang', lang);
  };
  // Strona zawsze otwiera się po angielsku; wybór języka zapamiętywany w localStorage
  setLang(store.get('plann-lang') || 'en', true);
  $$('.lang__btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ---------- Start strony: animacje wejścia hero ---------- */
  const start = () => {
    if (document.body.classList.contains('is-loaded')) return;
    document.body.classList.add('is-loaded');
    $$('[data-split]:not([data-reveal])').forEach(el => el.classList.add('is-in'));
  };
  addEventListener('load', start);
  setTimeout(start, 1400); // zabezpieczenie, gdyby zasoby ładowały się długo

  /* ---------- Pojawianie się sekcji przy przewijaniu ---------- */
  $$('[data-reveal-stagger]').forEach(group => {
    $$(':scope > *', group).forEach((child, i) => child.style.setProperty('--d', (i * 0.07).toFixed(2) + 's'));
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        if (e.target.hasAttribute('data-split')) e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(el => io.observe(el));
  } else {
    $$('[data-reveal]').forEach(el => el.classList.add('is-visible', 'is-in'));
  }

  /* ---------- Nawigacja: stan po przewinięciu + aktywna sekcja ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('nav--scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav__link[href^="#"]');
  const sections = navLinks.map(l => $(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(l => {
          if (l.getAttribute('href') === '#' + e.target.id) l.setAttribute('aria-current', 'true');
          else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => so.observe(s));
  }

  /* ---------- Menu mobilne ---------- */
  const burger = $('#burger');
  const menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', t(currentLang, open ? 'a11y.menuClose' : 'a11y.menuOpen'));
    document.body.classList.toggle('is-locked', open);
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 1025px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Zegar (czas studia) ---------- */
  const clocks = $$('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: STUDIO_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tzName = () => {
      try {
        const part = new Intl.DateTimeFormat('en-GB', { timeZone: STUDIO_TZ, timeZoneName: 'short' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName');
        return part ? part.value : '';
      } catch (e) { return ''; }
    };
    $$('[data-tz]').forEach(el => { el.textContent = tzName(); });
    const tick = () => { const s = fmt.format(new Date()); clocks.forEach(c => { c.textContent = s; }); };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Siatka odsłaniana wokół kursora ---------- */
  const spot = $('.gridlayer__spot');
  if (spot && finePointer && !reduceMotion) {
    let x = -9999, y = -9999, raf = 0;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        spot.style.setProperty('--mx', x + 'px');
        spot.style.setProperty('--my', y + 'px');
        raf = 0;
      });
    }, { passive: true });
    root.addEventListener('mouseleave', () => { spot.style.setProperty('--mx', '-9999px'); spot.style.setProperty('--my', '-9999px'); });
  }

  /* ---------- Niestandardowy kursor ---------- */
  const cursor = $('.cursor');
  if (cursor && finePointer && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, shown = false;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; cx = tx; cy = ty; cursor.classList.add('is-visible'); }
    }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', e => {
      const target = e.target instanceof Element ? e.target : null;
      const work = target?.closest('.card[data-case]');
      cursor.classList.toggle('is-work', Boolean(work));
      cursor.classList.toggle('is-hover', Boolean(work || target?.closest('a, button, [data-cursor]')));
    });
    root.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    root.addEventListener('mouseenter', () => shown && cursor.classList.add('is-visible'));
  }

  /* ---------- Рухомий інверсійний ефект на обкладинках ---------- */
  $$('.card__media').forEach(media => {
    media.addEventListener('pointerenter', () => media.classList.add('is-liquid'));
    media.addEventListener('pointermove', event => {
      const bounds = media.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const tilt = ((x / bounds.width) - .5) * 8;
      media.style.setProperty('--card-x', `${x}px`);
      media.style.setProperty('--card-y', `${y}px`);
      media.style.setProperty('--card-tilt', `${tilt}deg`);
    }, { passive: true });
    media.addEventListener('pointerleave', () => media.classList.remove('is-liquid'));
  });

  /* ---------- Горизонтальний перегляд кейсу ---------- */
  const caseViewer = $('#caseViewer');
  const caseMedia = $('[data-case-media]');
  const caseTitle = $('[data-case-title]');
  const caseDescription = $('[data-case-description]');
  const caseLink = $('[data-case-link]');
  const caseTrack = $('[data-case-track]');
  const caseProgress = $('[data-case-progress]');
  const caseAbout = $('[data-case-about]');
  const caseLoader = $('.case-loader');
  const caseLoaderTitle = $('[data-case-loader-title]');
  let caseOpenTimer = 0;
  const localGalleries = {
    'Creative Portfolio 2026': ['img/cover-portfolio.png', 'img/cover-aura.png', 'img/cover-biveris.png'],
    'BIVERIS Skin Lab': ['img/cover-biveris.png', 'img/cover-synq.jpg'],
    'AURA PUFFER': ['img/cover-aura.png', 'img/cover-magazine.png'],
    'SYNQ Loft Bar': ['img/cover-synq.jpg', 'img/cover-portfolio.png'],
    'Sweet Fashion Magazine': ['img/cover-magazine.png', 'img/cover-aura.png'],
    'Taxi Website': ['img/cover-portfolio.png', 'img/cover-synq.jpg'],
    'Video & Motion': ['img/hero-loop.mp4', 'img/motion-loop.mp4']
  };
  const caseDescriptions = {
    'Creative Portfolio 2026': 'A focused collection of visual identities, digital experiences and social direction.',
    'BIVERIS Skin Lab': 'A precise visual system built around clarity, trust and a considered digital experience.',
    'AURA PUFFER': 'A fashion-led visual direction with bold image-making and a strong editorial rhythm.',
    'SYNQ Loft Bar': 'A distinctive identity concept shaped for an atmospheric hospitality brand.',
    'Sweet Fashion Magazine': 'Editorial composition, typography and image direction brought into one visual language.',
    'Taxi Website': 'A clear digital concept designed to make the journey simple and memorable.',
    'Video & Motion': 'Short-form motion studies and visual experiments for social-first storytelling.'
  };
  const closeCase = () => {
    clearTimeout(caseOpenTimer);
    if (caseViewer && caseViewer.open) caseViewer.close();
    caseLoader?.classList.remove('is-active');
    document.body.classList.remove('is-locked');
  };
  $$('[data-case]').forEach(card => card.addEventListener('click', event => {
    if (!caseViewer || !caseMedia || !caseTitle) return;
    event.preventDefault();
    const title = card.dataset.case;
    const sources = localGalleries[title] || [$('.card__img', card)?.src];
    caseMedia.replaceChildren(...sources.filter(Boolean).map(source => {
      const isVideo = /\.mp4$/i.test(source);
      const media = document.createElement(isVideo ? 'video' : 'img');
      media.src = source;
      media.alt = `${title} project preview`;
      if (isVideo) {
        media.muted = true;
        media.loop = true;
        media.autoplay = true;
        media.playsInline = true;
      }
      return media;
    }));
    caseTitle.textContent = title;
    caseDescription.textContent = caseDescriptions[title] || '';
    caseLink.href = card.href;
    if (caseLoader && caseLoaderTitle) {
      caseLoaderTitle.textContent = card.dataset.case;
      caseLoader.classList.add('is-active');
    }
    document.body.classList.add('is-locked');
    caseOpenTimer = setTimeout(() => {
      caseViewer.showModal();
      caseTrack.scrollTo({ left: 0, behavior: 'instant' });
      caseProgress.textContent = '0%';
      setTimeout(() => caseLoader?.classList.remove('is-active'), 240);
    }, 620);
  }));
  caseTrack?.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    caseTrack.scrollLeft += event.deltaY;
  }, { passive: false });
  caseTrack?.addEventListener('scroll', () => {
    const max = caseTrack.scrollWidth - caseTrack.clientWidth;
    const progress = max > 0 ? Math.round((caseTrack.scrollLeft / max) * 100) : 100;
    if (caseProgress) caseProgress.textContent = `${progress}%`;
  }, { passive: true });
  caseAbout?.addEventListener('click', () => caseDescription?.classList.toggle('is-expanded'));

  /* ---------- Фокус послуг під час скролу ---------- */
  const serviceRows = $$('.svc__row');
  const focusService = () => {
    const target = innerHeight * .48;
    let closest = null;
    let distance = Infinity;
    serviceRows.forEach(row => {
      const rowDistance = Math.abs(row.getBoundingClientRect().top + row.offsetHeight / 2 - target);
      if (rowDistance < distance) {
        closest = row;
        distance = rowDistance;
      }
    });
    serviceRows.forEach(row => row.classList.toggle('is-focus', row === closest));
  };
  addEventListener('scroll', focusService, { passive: true });
  addEventListener('resize', focusService);
  requestAnimationFrame(focusService);

  $('[data-case-close]')?.addEventListener('click', closeCase);
  caseViewer?.addEventListener('click', event => {
    if (event.target === caseViewer) closeCase();
  });
  addEventListener('keydown', event => { if (event.key === 'Escape') closeCase(); });

  /* ---------- Rok w stopce ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
