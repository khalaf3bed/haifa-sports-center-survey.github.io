/**
 * דשבורד מרכז הספורט האוניברסיטאי - תשפ״ה
 * קובץ הלוגיקה, הגרפים והאינטראקטיביות
 */

document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  initCharts();
  initQuotesSystem();
  initScrollSpy();
  initExportCsv();
});

// ==========================================
// 1. אנימציית מוני מספרים (KPI Counters)
// ==========================================
function initCounters() {
  const counterElements = document.querySelectorAll('[data-counter]');
  
  counterElements.forEach(el => {
    const target = parseFloat(el.getAttribute('data-counter'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 1200; // ms
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easedProgress * target;

      el.textContent = decimals > 0 ? currentVal.toFixed(decimals) : Math.floor(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

// ==========================================
// 2. הגדרת גרפים עם Chart.js
// ==========================================
let awarenessChartInstance = null;

function initCharts() {
  Chart.defaults.font.family = "'Heebo', sans-serif";
  Chart.defaults.color = "#475569";
  Chart.defaults.plugins.tooltip.rtl = true;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.animation.duration = 1000;

  // 1. התפלגות שנת לימוד
  new Chart(document.getElementById('yearsChart'), {
    type: 'doughnut',
    data: {
      labels: ["שנה א'", "שנה ב'", "שנה ג'", "שנה ד' וסגל"],
      datasets: [{
        data: [133, 92, 40, 18],
        backgroundColor: ['#4f46e5', '#38bdf8', '#818cf8', '#cbd5e1'],
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

  // 3. מודעות וחשיפה (כולל לחיצה אינטראקטיבית לסינון)
  const awarenessCanvas = document.getElementById('awarenessChart');
  awarenessChartInstance = new Chart(awarenessCanvas, {
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
        backgroundColor: ['#ef4444', '#4f46e5', '#06b6d4', '#8b5cf6', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          handleAwarenessSliceClick(index);
        }
      },
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
        backgroundColor: '#4f46e5',
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

// לחיצה על גרף מודעות המקשרת לקולות השטח
function handleAwarenessSliceClick(index) {
  if (index === 0) { // לא היו מודעים
    showToast('מסנן משובים הקשורים למודעות ומיקום...');
    const searchInput = document.getElementById('commentSearch');
    searchInput.value = 'מכון';
    filterQuotes();
    document.getElementById('student-voices').scrollIntoView({ behavior: 'smooth' });
  } else if (index === 4) { // רשתות חברתיות
    showToast('מסנן משובים הקשורים לדיגיטל ורשתות...');
    const searchInput = document.getElementById('commentSearch');
    searchInput.value = 'Instagram';
    filterQuotes();
    document.getElementById('student-voices').scrollIntoView({ behavior: 'smooth' });
  }
}

// ==========================================
// 3. מאגר המשובים הפתוחים ומנוע החיפוש
// ==========================================
const studentQuotes = [
  { text: "הפרדה בין נשים לגברים בחדר כושר, זה יכול להיות חלוקת שעות. אם זה יהיה אני והחבירות ממחר מצטרפות.", tag: "הפרדה ושעות נשים" },
  { text: "הפרדה בין נשים וגברים בחדר כושר", tag: "הפרדה ושעות נשים" },
  { text: "חייב ניקיון טוב יותר לחדר כושר ובבקשה תוסיפו עוד משקולות פעמון (בקושי יש )", tag: "מתקנים ותחזוקה" },
  { text: "שיהיה בחדר הכושר שעות הפרדה בין נשים וגברים (בטכניון יש הפרדה וזה הולך טוב למה אצלנו לא???)", tag: "הפרדה ושעות נשים" },
  { text: "כאישה לא נוח לי להתאמן כשיש גברים בחדר כושר. תמצאו פתרון לזה בבקשה.", tag: "הפרדה ושעות נשים" },
  { text: "שירותי ייעוץ אישי – להציע שירותי ייעוץ אישי בתחום האימונים והכושר, כולל תוכניות אימון מותאמות אישית. ייעוץ תזונתי או פיזיותרפי. והדרכות במדיה – לפרסם סרטוני הדרכה ברשת כדי להחיות את המותג.", tag: "חוגים ובריאות" },
  { text: "קבוצות לנשים בלבד - גברים בלבד", tag: "הפרדה ושעות נשים" },
  { text: "להוסיף ריקוד.", tag: "חוגים ובריאות" },
  { text: "תוסיפו שיעורי יוגה. וחוגי כושר בהפרדה לגברים ונשים", tag: "הפרדה ושעות נשים" },
  { text: "נשמח לחוגים כגון יוגה, טאי צ'י, צ'י גונג", tag: "חוגים ובריאות" },
  { text: "שיהיה זמן רק לבנות, כי אני ועוד מלא בנות רוצות להתאמן בחדר הכושר וכל הזמן יש בנים ובחורים וזה לא נוח…", tag: "הפרדה ושעות נשים" },
  { text: "להרחיב אותו יותר ולהוסיף הרבה מכשירים", tag: "מתקנים ותחזוקה" },
  { text: "שיהיו פעילויות בחינם, פעילויות או הגרלות נושאות פרסים וכד'", tag: "שירות, קהילה ומחיר" },
  { text: "נרשמתי לשנה. הגעתי כשהמזכירה הייתה בהפסקה ובכל זאת נתנה מענה ורשמה אותי. גם פגשתי את מאמן נבחרת הכדורעף – צוות מדהים! מגיע להם כל ההשקעה.", tag: "שירות, קהילה ומחיר" },
  { text: "שיפוץ כללי ומכשירים חדשים", tag: "מתקנים ותחזוקה" },
  { text: "שיפוץ חדר הכושר והרחבתו", tag: "מתקנים ותחזוקה" },
  { text: "אתר אינטרנט מסודר להרשמה", tag: "שירות, קהילה ומחיר" },
  { text: "לעשות שעות הפרדה בין נשים לגברים בחדר כושר", tag: "הפרדה ושעות נשים" },
  { text: "המחיר ביחס למה שמקבלים הוא הזוי - החדר כושר הוא מקלט עם כמה מכשירים שתמיד עם ריח רע.... לא ברור לי למה הוא עולה כל כך הרבה לסטודנטים.", tag: "מתקנים ותחזוקה" },
  { text: "אשמח אם יוסיפו גם חוגים של סגנונות ריקוד וזומבה", tag: "חוגים ובריאות" },
  { text: "לעשות שעות ספציפיות לבנות. קצת לא נעים להתאמן כשכולם סביב גברים", tag: "הפרדה ושעות נשים" },
  { text: "חידוש מתקני חדר כושר במכון כושר", tag: "מתקנים ותחזוקה" },
  { text: "שיעורי שחייה - יש הרבה סטודנטים שמעוניינים לדעת לשחות אך אין מקום שנותן מענה, וכל בריכה מחוץ לקמפוס יקרה מדי (אפילו בטכניון).", tag: "חוגים ובריאות" },
  { text: "עדיף לעשות שיפוץ של כל מרכז הספורט והיה טוב להוסיף בריכה", tag: "חוגים ובריאות" },
  { text: "Instagram reels bro", tag: "שירות, קהילה ומחיר" },
  { text: "לשפר את המכשור, לשים יותר גומיות וקופסאות לתרגילים יצירתיים. לנקות את הרצפה המלוכלכת ולהקפיד שמתאמנים מנקים אחריהם. ניקיון יותר טוב של המלתחות.", tag: "מתקנים ותחזוקה" },
  { text: "בניית אימונים אישיים למתחילים", tag: "חוגים ובריאות" },
  { text: "צריך להסביר איפה המכון בקמפוס (לא מצאתי אותו)", tag: "שירות, קהילה ומחיר" },
  { text: "הקמת עוד קבוצות של ענפי ספורט לרמת מתחילים, ויצירת אפשרות לסטודנטים להירשם לקבוצות ספונטניות (הפסקות פעילות).", tag: "שירות, קהילה ומחיר" },
  { text: "מגרשי הטניס מושכרים ברוב השעות למאמנים פרטיים, ככה שבפועל אין לסטודנטים אפשרות להשתמש בהם. זו שאלה למי המגרשים מיועדים ומה מטרתם.", tag: "שירות, קהילה ומחיר" },
  { text: "יצירת זמנים לנשים/גברים בנפרד", tag: "הפרדה ושעות נשים" },
  { text: "חוג קרב מגע והגנה עצמית", tag: "חוגים ובריאות" },
  { text: "שלבנות יהיה מקלחות בקומה של החדר כושר ולא מעל, להכניס לוקרים לשירותים, להוסיף מכשירים וספוגים, וצוות שעוזר לבנות אימון.", tag: "הפרדה ושעות נשים" },
  { text: "הפרדה בין נשים וגברים - חשוב מאוד!", tag: "הפרדה ושעות נשים" },
  { text: "הקמת קבוצות לא מתקדמות בענפים שונים, ואפשרות לתאם משחקים ספונטניים בין סטודנטים בזמנם הפנוי.", tag: "שירות, קהילה ומחיר" },
  { text: "שיעורים כמו יוגה, פילאטיס, גמישות בשעות מוגדרות ובמחיר סביר, שיהיה אפשר ללכת בחלון או אחרי הלימודים ולהמשיך הלאה.", tag: "חוגים ובריאות" },
  { text: "שיהיה תפריט בריא בקפיטריה הצמודה למרכז הספורט", tag: "חוגים ובריאות" },
  { text: "יותר סדנאות שמתמקדות באכילה בריאה ואיזון אורח חיים", tag: "חוגים ובריאות" },
  { text: "יותר פילאטיס, ופרסום ברור של המחירים שלא ידרוש בירור מיוחד", tag: "שירות, קהילה ומחיר" },
  { text: "חוגים כמו יוגה וריקוד", tag: "חוגים ובריאות" }
];

let activeFilter = 'all';

function initQuotesSystem() {
  const searchInput = document.getElementById('commentSearch');
  const clearBtn = document.getElementById('clearSearchBtn');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // Input event
  searchInput.addEventListener('input', () => {
    clearBtn.classList.toggle('hidden', searchInput.value.trim().length === 0);
    filterQuotes();
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    filterQuotes();
    searchInput.focus();
  });

  // Filter button clicks
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.className = 'filter-btn px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium rounded-xl transition';
      });
      btn.className = 'filter-btn active-filter px-3 py-1.5 bg-slate-900 text-white font-medium rounded-xl shadow-sm transition';
      
      activeFilter = btn.getAttribute('data-filter');
      filterQuotes();
    });
  });

  // Initial Render
  filterQuotes();
}

function filterQuotes() {
  const searchInput = document.getElementById('commentSearch');
  const term = searchInput.value.trim().toLowerCase();

  const filtered = studentQuotes.filter(item => {
    const matchesTerm = item.text.toLowerCase().includes(term);
    const matchesFilter = (activeFilter === 'all') || (item.tag === activeFilter);
    return matchesTerm && matchesFilter;
  });

  renderQuotes(filtered, term);
}

function renderQuotes(list, searchTerm = '') {
  const container = document.getElementById('quotesContainer');
  const badge = document.getElementById('quotesCountBadge');
  badge.textContent = `מציג ${list.length} מתוך ${studentQuotes.length} משובים`;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
        <span class="text-2xl block mb-2">🔎</span>
        לא נמצאו משובים התואמים את החיפוש הנוכחי. נסה מונח אחר.
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(q => {
    let tagClasses = "bg-indigo-50 text-indigo-700 border-indigo-200/60";
    if (q.tag === 'הפרדה ושעות נשים') tagClasses = "bg-rose-50 text-rose-700 border-rose-200/60";
    else if (q.tag === 'מתקנים ותחזוקה') tagClasses = "bg-amber-50 text-amber-800 border-amber-200/60";
    else if (q.tag === 'חוגים ובריאות') tagClasses = "bg-emerald-50 text-emerald-800 border-emerald-200/60";
    else if (q.tag === 'שירות, קהילה ומחיר') tagClasses = "bg-sky-50 text-sky-800 border-sky-200/60";

    // Text highlighting for search term
    let displayText = q.text;
    if (searchTerm) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      displayText = displayText.replace(regex, '<mark>$1</mark>');
    }

    return `
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition duration-150 group">
        <p class="text-xs text-slate-700 italic leading-relaxed">"${displayText}"</p>
        <div class="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[11px]">
          <span class="px-2 py-0.5 rounded-lg border font-medium ${tagClasses}">${q.tag}</span>
          <span class="text-slate-400 font-normal">סקר תשפ״ה</span>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 4. פס התקדמות גלילה ו-ScrollSpy לתפריט
// ==========================================
function initScrollSpy() {
  const progressBar = document.getElementById('scrollProgressBar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // 1. Progress Bar
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';

    // 2. Active Tab Detection
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').substring(1);
      if (href === currentId) {
        link.classList.add('text-indigo-400', 'border-indigo-500', 'font-bold');
        link.classList.remove('text-slate-400', 'border-transparent');
      } else {
        link.classList.remove('text-indigo-400', 'border-indigo-500', 'font-bold');
        link.classList.add('text-slate-400', 'border-transparent');
      }
    });
  });
}

// ==========================================
// 5. ייצוא משובים ל-CSV (כולל תמיכה בעברית)
// ==========================================
function initExportCsv() {
  const exportBtn = document.getElementById('exportCsvBtn');
  exportBtn.addEventListener('click', () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM עבור Excel בעברית
    csvContent += "קטגוריה,תוכן המשוב\n";

    studentQuotes.forEach(q => {
      const cleanText = q.text.replace(/"/g, '""');
      csvContent += `"${q.tag}","${cleanText}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `משובי_סקר_מרכז_הספורט_תשפה.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('הקובץ יוצא בהצלחה ל-CSV!');
  });
}

// ==========================================
// 6. מערכת הודעות קופצות (Toast Notifications)
// ==========================================
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 transform transition-all duration-300 translate-y-4 opacity-0';
  toast.innerHTML = `<span>⚡</span><span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  // Fade out
  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
