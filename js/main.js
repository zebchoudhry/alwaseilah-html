/* ==========================================================
   ALWASEILAH TOURS — main.js
   All site interactivity in one file. No libraries needed.
   ==========================================================

   SECTIONS:
   1. DATA  — tours, departures, settings
   2. WORLD CLOCKS
   3. DEPARTURE TICKER
   4. COUNTDOWN TIMERS
   5. TOUR FILTER
   6. NAV (mobile burger)
   7. INIT
   ========================================================== */


/* ----------------------------------------------------------
   1. DATA
   ---------------------------------------------------------- */

const SETTINGS = {
  whatsapp:   '+447947138673',   // no spaces or dashes
  phone_uk:   '+44 7947 138673',
  email:      'info@alwaseilahtours.com',
  founded:    2009,
};

const TOURS = [
  { slug:'islamic-pilgrimage-najaf-karbala',   title:'Islamic Pilgrimage — Najaf, Karbala & Kufa',       category:'islamic',    days:10, price:1800 },
  { slug:'historical-iraq',                     title:'Cradle of Civilisation — Historical Iraq',          category:'historical', days:9,  price:1600 },
  { slug:'iraq-iran-pilgrimage',                title:'Iraq & Iran Pilgrimage — Najaf to Mashhad',         category:'combo',      days:14, price:2400 },
  { slug:'high-flyer-south-iraq',               title:'High Flyer — South Iraq Express',                   category:'combo',      days:4,  price:950  },
  { slug:'high-flyer-baghdad',                  title:'High Flyer — Baghdad & Babylon',                    category:'historical', days:4,  price:850  },
  { slug:'islamic-short-tour-baghdad-karbala',  title:'Islamic Short Tour — Baghdad & Holy Cities',        category:'islamic',    days:4,  price:950  },
  { slug:'historical-iraq-8-day',               title:'Historical Iraq — 8-Day Classic',                   category:'historical', days:8,  price:1500 },
  { slug:'north-iraq-mosul-kurdistan',          title:'North Iraq Explorer — Mosul, Erbil & Kurdistan',    category:'historical', days:8,  price:1600 },
  { slug:'federal-iraq-kurdistan',              title:'Federal Iraq & Kurdistan — The Grand Tour',          category:'historical', days:16, price:2800 },
];

// Each entry: { tourSlug, date:'YYYY-MM-DD', seats }
const DEPARTURES = [
  { tourSlug:'islamic-pilgrimage-najaf-karbala',  date:'2026-10-12', seats:4  },
  { tourSlug:'islamic-pilgrimage-najaf-karbala',  date:'2027-01-18', seats:8  },
  { tourSlug:'islamic-pilgrimage-najaf-karbala',  date:'2027-04-05', seats:3  },
  { tourSlug:'historical-iraq',                   date:'2026-11-03', seats:10 },
  { tourSlug:'historical-iraq',                   date:'2027-02-09', seats:6  },
  { tourSlug:'historical-iraq',                   date:'2027-03-23', seats:4  },
  { tourSlug:'iraq-iran-pilgrimage',              date:'2026-10-26', seats:5  },
  { tourSlug:'iraq-iran-pilgrimage',              date:'2027-02-22', seats:9  },
  { tourSlug:'iraq-iran-pilgrimage',              date:'2027-04-12', seats:3  },
  { tourSlug:'high-flyer-south-iraq',             date:'2026-09-22', seats:3  },
  { tourSlug:'high-flyer-south-iraq',             date:'2026-11-10', seats:7  },
  { tourSlug:'high-flyer-south-iraq',             date:'2027-03-08', seats:9  },
  { tourSlug:'high-flyer-baghdad',                date:'2026-09-15', seats:6  },
  { tourSlug:'high-flyer-baghdad',                date:'2026-11-17', seats:8  },
  { tourSlug:'high-flyer-baghdad',                date:'2027-02-01', seats:10 },
  { tourSlug:'islamic-short-tour-baghdad-karbala',date:'2026-09-29', seats:5  },
  { tourSlug:'islamic-short-tour-baghdad-karbala',date:'2026-12-08', seats:2  },
  { tourSlug:'islamic-short-tour-baghdad-karbala',date:'2027-03-15', seats:10 },
  { tourSlug:'historical-iraq-8-day',             date:'2026-10-19', seats:7  },
  { tourSlug:'historical-iraq-8-day',             date:'2027-02-15', seats:4  },
  { tourSlug:'north-iraq-mosul-kurdistan',        date:'2026-10-05', seats:8  },
  { tourSlug:'north-iraq-mosul-kurdistan',        date:'2027-04-19', seats:11 },
  { tourSlug:'federal-iraq-kurdistan',            date:'2026-10-15', seats:4  },
  { tourSlug:'federal-iraq-kurdistan',            date:'2027-03-20', seats:8  },
];

function getNextDeparture(slug) {
  const now = new Date();
  return DEPARTURES
    .filter(d => d.tourSlug === slug && new Date(d.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}


/* ----------------------------------------------------------
   2. WORLD CLOCKS
   ---------------------------------------------------------- */

const CLOCK_ZONES = [
  { label:'London',   tz:'Europe/London'    },
  { label:'Baghdad',  tz:'Asia/Baghdad'     },
  { label:'New York', tz:'America/New_York' },
  { label:'Tokyo',    tz:'Asia/Tokyo'       },
  { label:'Sydney',   tz:'Australia/Sydney' },
];

function getHMS(date, tz) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone:tz, hourCycle:'h23', hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const parts = Object.fromEntries(f.formatToParts(date).map(p => [p.type, +p.value]));
  return { h: parts.hour||0, m: parts.minute||0, s: parts.second||0 };
}

function getLocalDate(date, tz) {
  return new Intl.DateTimeFormat('en-GB', { timeZone:tz, weekday:'short', day:'numeric', month:'short' }).format(date);
}

function buildClockSVG(uid) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('width', '84');
  svg.setAttribute('height', '84');

  // Gradient
  const defs = document.createElementNS(NS, 'defs');
  const grad = document.createElementNS(NS, 'radialGradient');
  grad.id = 'face-' + uid;
  grad.setAttribute('cx','42%'); grad.setAttribute('cy','38%'); grad.setAttribute('r','72%');
  [['0%','#FFFDF8'],['45%','#FBF3E0'],['100%','#E5DBC8']].forEach(([o,c]) => {
    const s = document.createElementNS(NS, 'stop');
    s.setAttribute('offset',o); s.setAttribute('stop-color',c);
    grad.appendChild(s);
  });
  defs.appendChild(grad);
  svg.appendChild(defs);

  // Face
  const face = document.createElementNS(NS, 'circle');
  face.setAttribute('cx','50'); face.setAttribute('cy','50'); face.setAttribute('r','48');
  face.setAttribute('fill',`url(#face-${uid})`);
  svg.appendChild(face);

  // Outer ring
  const ring = document.createElementNS(NS, 'circle');
  ring.setAttribute('cx','50'); ring.setAttribute('cy','50'); ring.setAttribute('r','47.5');
  ring.setAttribute('fill','none'); ring.setAttribute('stroke','#B8892D'); ring.setAttribute('stroke-width','1.4'); ring.setAttribute('opacity','0.9');
  svg.appendChild(ring);

  // Tick marks
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const a = (i * 6 * Math.PI) / 180;
    const r1 = major ? 39.5 : 41.5, r2 = 44.8;
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', (50 + r1 * Math.sin(a)).toFixed(2));
    line.setAttribute('y1', (50 - r1 * Math.cos(a)).toFixed(2));
    line.setAttribute('x2', (50 + r2 * Math.sin(a)).toFixed(2));
    line.setAttribute('y2', (50 - r2 * Math.cos(a)).toFixed(2));
    line.setAttribute('stroke', major ? '#2A2218' : '#7D6E5A');
    line.setAttribute('stroke-width', major ? '1.4' : '0.5');
    line.setAttribute('stroke-linecap','round');
    line.setAttribute('opacity', major ? '0.92' : '0.58');
    svg.appendChild(line);
  }

  // Hour numerals
  [12,1,2,3,4,5,6,7,8,9,10,11].forEach((n,i) => {
    const rad = (i * 30 * Math.PI) / 180;
    const r = 31.5;
    const txt = document.createElementNS(NS, 'text');
    txt.setAttribute('x', (50 + r * Math.sin(rad)).toFixed(2));
    txt.setAttribute('y', (50 - r * Math.cos(rad)).toFixed(2));
    txt.setAttribute('text-anchor','middle');
    txt.setAttribute('dominant-baseline','central');
    txt.setAttribute('font-family','Inter,sans-serif');
    txt.setAttribute('font-size','6.5');
    txt.setAttribute('font-weight','600');
    txt.setAttribute('fill','#1A1410');
    txt.textContent = n;
    svg.appendChild(txt);
  });

  // Hands (will be rotated via setAttribute)
  function makeHand(len, width, color, id) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform','rotate(0 50 50)');
    g.dataset.hand = id;
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1','50'); line.setAttribute('y1','50');
    line.setAttribute('x2','50'); line.setAttribute('y2', 50 - len);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', width);
    line.setAttribute('stroke-linecap','round');
    g.appendChild(line);
    return g;
  }

  const hourHand   = makeHand(20, '3',    '#14100C', 'hour');
  const minuteHand = makeHand(28, '1.85', '#1C1610', 'minute');
  const secondHand = makeHand(34, '0.65', '#9B2335', 'second');

  // Second hand counterweight
  const cw = document.createElementNS(NS, 'line');
  cw.setAttribute('x1','50'); cw.setAttribute('y1','50'); cw.setAttribute('x2','50'); cw.setAttribute('y2','58');
  cw.setAttribute('stroke','#9B2335'); cw.setAttribute('stroke-width','0.55'); cw.setAttribute('opacity','0.75');
  secondHand.appendChild(cw);

  svg.appendChild(hourHand);
  svg.appendChild(minuteHand);
  svg.appendChild(secondHand);

  // Center dot
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('cx','50'); dot.setAttribute('cy','50'); dot.setAttribute('r','3.2');
  dot.setAttribute('fill','#14100C'); dot.setAttribute('stroke','#C9962A'); dot.setAttribute('stroke-width','0.45');
  svg.appendChild(dot);
  const dotInner = document.createElementNS(NS, 'circle');
  dotInner.setAttribute('cx','50'); dotInner.setAttribute('cy','50'); dotInner.setAttribute('r','1.1');
  dotInner.setAttribute('fill','#C9962A'); dotInner.setAttribute('opacity','0.95');
  svg.appendChild(dotInner);

  return { svg, hourHand, minuteHand, secondHand };
}

function updateHands(hands, h, m, s) {
  const sec = s * 6;
  const min = m * 6 + s * 0.1;
  const hr  = (h % 12) * 30 + m * 0.5 + s / 120;
  hands.hourHand.setAttribute('transform',   `rotate(${hr.toFixed(2)} 50 50)`);
  hands.minuteHand.setAttribute('transform', `rotate(${min.toFixed(2)} 50 50)`);
  hands.secondHand.setAttribute('transform', `rotate(${sec.toFixed(2)} 50 50)`);
}

function initWorldClocks() {
  const bar = document.getElementById('clock-bar');
  if (!bar) return;

  const clocks = CLOCK_ZONES.map((zone, i) => {
    const wrap = document.createElement('figure');
    wrap.className = 'clock-face';

    const { svg, hourHand, minuteHand, secondHand } = buildClockSVG('clk' + i);
    wrap.appendChild(svg);

    const label = document.createElement('figcaption');
    label.innerHTML = `<span class="clock-face__label">${zone.label}</span><span class="clock-face__date" data-tz="${zone.tz}"></span>`;
    wrap.appendChild(label);
    bar.appendChild(wrap);
    return { zone, hourHand, minuteHand, secondHand, dateEl: label.querySelector('[data-tz]') };
  });

  function tick() {
    const now = new Date();
    clocks.forEach(({ zone, hourHand, minuteHand, secondHand, dateEl }) => {
      const { h, m, s } = getHMS(now, zone.tz);
      updateHands({ hourHand, minuteHand, secondHand }, h, m, s);
      dateEl.textContent = getLocalDate(now, zone.tz);
    });
  }
  tick();
  setInterval(tick, 1000);
}


/* ----------------------------------------------------------
   3. DEPARTURE TICKER
   ---------------------------------------------------------- */

function initTicker() {
  const track = document.getElementById('ticker-inner');
  if (!track) return;

  const now = new Date();
  const upcoming = DEPARTURES
    .filter(d => new Date(d.date) > now && d.seats > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 14);

  if (upcoming.length === 0) { document.getElementById('ticker')?.remove(); return; }

  // Double for seamless loop
  const items = [...upcoming, ...upcoming];

  track.innerHTML = items.map(dep => {
    const tour = TOURS.find(t => t.slug === dep.tourSlug);
    const urgent = dep.seats <= 3;
    return `
      <a href="tour-${dep.tourSlug}.html" class="ticker__item">
        <span class="ticker__dot ${urgent ? 'ticker__dot--urgent' : ''}"></span>
        <span class="ticker__name">${tour ? tour.title : dep.tourSlug}</span>
        <span class="ticker__sep">·</span>
        <span>${formatDate(dep.date)}</span>
        <span class="ticker__sep">·</span>
        <span class="${urgent ? 'ticker__urgent' : ''}">${dep.seats} seat${dep.seats===1?'':'s'} left</span>
      </a>`;
  }).join('');
}


/* ----------------------------------------------------------
   4. COUNTDOWN TIMERS
   ---------------------------------------------------------- */

function renderCountdown(el, dep) {
  function update() {
    const diff = new Date(dep.date) - new Date();
    if (diff <= 0) { el.remove(); return; }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const urgent = days <= 21;
    const seatsClass = dep.seats <= 3 ? 'countdown__seats--critical' : dep.seats <= 6 ? 'countdown__seats--low' : 'countdown__seats';

    el.innerHTML = `
      <span class="countdown__time ${urgent ? 'countdown__time--urgent' : ''}">
        ${days < 21
          ? `<strong>${days}d ${hours}h</strong> until departure`
          : `Departs in <strong>${days} days</strong>`}
      </span>
      <span class="${seatsClass}">
        ${dep.seats <= 0 ? 'Sold out' : dep.seats === 1 ? '1 seat left' : dep.seats + ' seats left'}
      </span>`;
  }
  update();
  setInterval(update, 60000);
}

function initCountdowns() {
  document.querySelectorAll('[data-countdown]').forEach(el => {
    const slug = el.dataset.countdown;
    const dep  = getNextDeparture(slug);
    if (dep) renderCountdown(el, dep);
  });
}


/* ----------------------------------------------------------
   5. TOUR FILTER
   ---------------------------------------------------------- */

function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.tour-card[data-category]');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.category === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}


/* ----------------------------------------------------------
   6. NAV — mobile burger
   ---------------------------------------------------------- */

function initNav() {
  const burger = document.querySelector('.nav__burger');
  const links  = document.querySelector('.nav__links');
  if (!burger || !links) return;
  burger.addEventListener('click', () => links.classList.toggle('open'));
}


/* ----------------------------------------------------------
   7. INIT
   ---------------------------------------------------------- */

/* ----------------------------------------------------------
   8. NAV SCROLL SHADOW
   ---------------------------------------------------------- */
function initNavShadow() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('nav--scrolled', window.scrollY > 10);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ----------------------------------------------------------
   9. BROKEN IMAGE FALLBACK
   Hides any tour card img that 404s — reveals the CSS gradient
   ---------------------------------------------------------- */
function initImageFallbacks() {
  document.querySelectorAll('.tour-card__img, .about-profile__img').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
  });
}

/* ----------------------------------------------------------
   7. INIT
   ---------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initWorldClocks();
  initTicker();
  initCountdowns();
  initFilter();
  initNav();
  initNavShadow();
  initImageFallbacks();
});
