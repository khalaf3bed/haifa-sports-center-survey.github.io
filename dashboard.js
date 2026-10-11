/**
 * דשבורד מרכז הספורט האוניברסיטאי - סקר 2025
 * קובץ הלוגיקה, הגרפים והאינטראקטיביות
 */

document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  initCharts();
  initPageMotion();
  preventTextCopy();
});

function preventTextCopy() {
  document.addEventListener('copy', event => event.preventDefault());
  document.addEventListener('cut', event => event.preventDefault());
  document.addEventListener('selectstart', event => event.preventDefault());
  document.addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'x'].includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
  });
}

// ==========================================
// 1. אנימציית מוני מספרים (KPI Counters)
// ==========================================
function initCounters() {
  prepareTextCounters();

  const counterElements = document.querySelectorAll('[data-counter]');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    counterElements.forEach(setCounterTarget);
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animateCounter(entry.target);
    });
  }, { threshold: 0.2 });

  counterElements.forEach(el => {
    observer.observe(el);
  });
}

function prepareTextCounters() {
  const main = document.querySelector('main');
  if (!main) return;

  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || !/\d/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      return parent.closest('nav, .step-label, .timeline-marker, [data-counter], canvas, script, style')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    }
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(node => {
    const text = node.nodeValue;
    const numberPattern = /\d+(?:\.\d+)?/g;
    const timeRanges = Array.from(text.matchAll(/\d{1,2}:\d{2}/g), time => ({
      start: time.index,
      end: time.index + time[0].length
    }));
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    let hasCounter = false;

    while ((match = numberPattern.exec(text))) {
      const value = Number(match[0]);
      const isTime = timeRanges.some(time => match.index >= time.start && numberPattern.lastIndex <= time.end);
      if (isTime || (value >= 1900 && value <= 2099)) continue;

      fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));
      const counter = document.createElement('span');
      counter.className = 'count-up';
      counter.setAttribute('data-counter', match[0]);
      counter.setAttribute('data-decimals', (match[0].split('.')[1] || '').length);
      counter.textContent = match[0];
      fragment.append(counter);
      lastIndex = numberPattern.lastIndex;
      hasCounter = true;
    }

    if (hasCounter) {
      fragment.append(document.createTextNode(text.slice(lastIndex)));
      node.parentNode.replaceChild(fragment, node);
    }
  });

  main.querySelectorAll('[data-counter]').forEach(el => el.classList.add('count-up'));
}

function setCounterTarget(el) {
  const target = Number(el.getAttribute('data-counter'));
  const decimals = Number(el.getAttribute('data-decimals') || 0);
  if (!Number.isFinite(target)) return;
  el.textContent = decimals > 0 ? target.toFixed(decimals) : String(target);
}

function animateCounter(el) {
  const target = Number(el.getAttribute('data-counter'));
  const decimals = Number(el.getAttribute('data-decimals') || 0);
  if (!Number.isFinite(target)) return;

  const duration = 1000;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = easedProgress * target;
    el.textContent = decimals > 0
      ? currentValue.toFixed(decimals)
      : String(Math.floor(currentValue));

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      setCounterTarget(el);
    }
  }

  requestAnimationFrame(updateCounter);
}

function initPageMotion() {
  initStationProgress();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const main = document.querySelector('main');
  if (!main) return;

  const revealElements = [
    ...main.querySelectorAll('#survey-overview > div > div'),
    ...main.querySelectorAll('.station-timeline li'),
    ...main.querySelectorAll('main > section[id]:not(#survey-overview) > div:first-child'),
    ...main.querySelectorAll('main > section[id] > .grid > div'),
    ...main.querySelectorAll('#action-plan .timeline-item'),
    ...main.querySelectorAll('#report-end > div, #report-end > a')
  ];
  const uniqueRevealElements = [...new Set(revealElements)];

  uniqueRevealElements.forEach((element, index) => {
    element.setAttribute('data-reveal', '');
    element.style.setProperty('--reveal-delay', `${(index % 4) * 85}ms`);
  });

  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);

      entry.target.querySelectorAll('canvas').forEach(canvas => {
        const chart = Chart.getChart(canvas);
        if (!chart) return;
        chart.reset();
        chart.update();
      });
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  uniqueRevealElements.forEach(element => observer.observe(element));
}

function initStationProgress() {
  const stationLinks = document.querySelectorAll('.station-timeline a[href^="#"]');
  if (!stationLinks.length || !('IntersectionObserver' in window)) return;

  const linksByTarget = new Map(
    [...stationLinks].map(link => [link.getAttribute('href').slice(1), link])
  );
  const observer = new IntersectionObserver(entries => {
    const current = entries
      .filter(entry => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
    if (!current) return;

    stationLinks.forEach(link => {
      const isCurrent = link === linksByTarget.get(current.target.id);
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }, { threshold: [0.2, 0.45, 0.7], rootMargin: '-15% 0px -55% 0px' });

  linksByTarget.forEach((_, id) => {
    const station = document.getElementById(id);
    if (station) observer.observe(station);
  });
}

// ==========================================
// 2. הגדרת גרפים עם Chart.js
// ==========================================
function initCharts() {
  Chart.defaults.font.family = "'Heebo', sans-serif";
  Chart.defaults.color = "#475569";
  Chart.defaults.plugins.tooltip.rtl = true;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.backgroundColor = '#102a2a';
  Chart.defaults.plugins.tooltip.titleColor = '#a7f3d0';
  Chart.defaults.animation.duration = 1000;

  // 1. התפלגות שנת לימוד
  new Chart(document.getElementById('yearsChart'), {
    type: 'doughnut',
    data: {
      labels: ["שנה א'", "שנה ב'", "שנה ג'", "שנה ד' וסגל"],
      datasets: [{
        data: [133, 92, 40, 18],
        backgroundColor: ['#059669', '#06b6d4', '#34d399', '#cbd5e1'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', rtl: true, labels: { boxWidth: 12, font: { size: 11 } } }
      }
    }
  });

  // 2. התפלגות קבוצות גיל
  new Chart(document.getElementById('ageChart'), {
    type: 'pie',
    data: {
      labels: ['גילאי 18-24', 'גילאי 25-34', '35 ומעלה'],
      datasets: [{
        data: [214, 67, 2],
        backgroundColor: ['#10b981', '#f59e0b', '#64748b'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', rtl: true, labels: { boxWidth: 12, font: { size: 11 } } }
      }
    }
  });

  // 3. מודעות וחשיפה
  new Chart(document.getElementById('awarenessChart'), {
    type: 'doughnut',
    data: {
      labels: [
        'לא היו מודעים כלל לקיום המרכז (58.7%)',
        'חברים ומכרים (28.3%)',
        'אתר האוניברסיטה (6.0%)',
        'פרסומות בקמפוס (3.9%)',
        'רשתות חברתיות (3.2%)'
      ],
      datasets: [{
        data: [166, 80, 17, 11, 9],
        backgroundColor: ['#ef4444', '#059669', '#06b6d4', '#14b8a6', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom', 
          rtl: true, 
          labels: { boxWidth: 12, font: { size: 11 }, padding: 10 } 
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const total = 283;
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label.split('(')[0].trim()}: ${ctx.parsed} משיבים (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // 4. עשרת הגורמים המעודדים
  new Chart(document.getElementById('driversChart'), {
    type: 'bar',
    data: {
      labels: [
        'שיפור ציוד בחדר הכושר (מכשירים/מגוון)',
        'הוספת חוגים (קרוספיט/כוח/פילאטיס)',
        'שיפור מקלחות ולוקרים',
        'הרחבת שעות פתיחה (בוקר/סופ״ש)',
        'אפליקציה ייעודית למרכז',
        'שירותי בריאות (תזונאי/פיזיו)',
        'טורנירים ותחרויות',
        'הפרדת נשים וגברים',
        'שיפור ניקיון ותחזוקה',
        'נגישות למוגבלויות'
      ],
      datasets: [{
        label: 'מספר בחירות',
        data: [78, 76, 66, 65, 55, 41, 38, 25, 17, 8],
        backgroundColor: '#0f766e',
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });

  // 5. פעילויות חברתיות מבוקשות
  new Chart(document.getElementById('activitiesChart'), {
    type: 'bar',
    data: {
      labels: [
        'סדנאות אורח חיים בריא 🍀',
        'טורנירים ספורטיביים 🔥',
        'פעילויות סוציאליות וקבוצות ריצה 🏃🏻‍♀️',
        'ימי ספורט קבוצתיים 🤼‍♂️'
      ],
      datasets: [{
        label: 'מספר משיבים',
        data: [82, 66, 63, 61],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      }
    }
  });

  // 6. תפיסת מותג (10 מאפיינים)
  new Chart(document.getElementById('brandPerceptionChart'), {
    type: 'bar',
    data: {
      labels: [
        'נגיש ונוח בקמפוס',
        'מקום לבריאות ואיזון',
        'חסר תחושת חדשנות',
        'מציע פעילויות מגוונות',
        'מתאים למגוון רמות כושר',
        'ציוד מיושן / לא מספק',
        'שעות פעילות מוגבלות מדי',
        'לא תמיד נקי או מתוחזק',
        'צפוף מדי בשעות השיא',
        'חלק מקהילה תומכת'
      ],
      datasets: [{
        label: 'מספר בחירות',
        data: [20, 15, 10, 10, 8, 7, 6, 6, 6, 4],
        backgroundColor: [
          '#10b981', '#10b981', '#ef4444', '#10b981', '#3b82f6',
          '#ef4444', '#f59e0b', '#ef4444', '#f59e0b', '#3b82f6'
        ],
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });

  // 7. משפך שימוש ומודעות
  new Chart(document.getElementById('usageChart'), {
    type: 'doughnut',
    data: {
      labels: [
        'לא מודעים לקיום המרכז (58.7%)',
        'מודעים אך טרם השתמשו (27.6%)',
        'משתמשים בחדר כושר (12.7%)',
        'משתמשים במגרשי ספורט (5.7%)',
        'משתמשים בחוגים/סטודיו (1.1%)'
      ],
      datasets: [{
        data: [166, 78, 36, 16, 3],
        backgroundColor: ['#ef4444', '#cbd5e1', '#3b82f6', '#10b981', '#8b5cf6'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', rtl: true, labels: { boxWidth: 12, font: { size: 11 } } }
      }
    }
  });
}
