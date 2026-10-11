/**
 * דשבורד מרכז הספורט האוניברסיטאי - סקר 2025
 * קובץ הלוגיקה, הגרפים והאינטראקטיביות
 */

document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  initCharts();
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
