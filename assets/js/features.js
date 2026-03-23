// Дополнительные функции платформы

// Глобальные переменные для доступа из других скриптов
// Эти переменные будут установлены из app.js
let cleanPlaces = [];
let dirtyPlaces = [];
let map = null;
let rerender = null;

// Функция для установки глобальных переменных
function setGlobalVars(clean, dirty, mapInstance, rerenderFunc) {
  cleanPlaces = clean;
  dirtyPlaces = dirty;
  map = mapInstance;
  rerender = rerenderFunc;
}



// Экологический калькулятор
function initCalculator() {
  const btnCalc = document.getElementById('btnCalculate');
  if (!btnCalc) return;
  
  btnCalc.addEventListener('click', () => {
    const car = parseFloat(document.getElementById('calcCar').value) || 0;
    const public = parseFloat(document.getElementById('calcPublic').value) || 0;
    const flights = parseFloat(document.getElementById('calcFlights').value) || 0;
    const energy = parseFloat(document.getElementById('calcEnergy').value) || 0;
    const gas = parseFloat(document.getElementById('calcGas').value) || 0;
    const waste = parseFloat(document.getElementById('calcWaste').value) || 0;
    
    // Коэффициенты выбросов CO2
    const carEmissions = car * 0.21; // кг CO2 на км
    const publicEmissions = public * 0.05; // кг CO2 на км
    const flightEmissions = flights * 250; // кг CO2 на час полёта
    const energyEmissions = energy * 0.5; // кг CO2 на кВт·ч
    const gasEmissions = gas * 2; // кг CO2 на м³
    const wasteEmissions = waste * 0.5; // кг CO2 на кг отходов
    
    const total = (carEmissions + publicEmissions + flightEmissions + 
                   energyEmissions + gasEmissions + wasteEmissions) / 1000; // в тоннах
    
    document.getElementById('calcTotal').textContent = total.toFixed(2);
    
    const recommendations = [];
    if (carEmissions > 1000) recommendations.push('🚗 Сократите использование автомобиля, используйте общественный транспорт или велосипед');
    if (energyEmissions > 500) recommendations.push('💡 Установите энергосберегающие лампы и используйте бытовую технику класса A+++');
    if (wasteEmissions > 200) recommendations.push('♻️ Начните раздельный сбор отходов и компостирование органических отходов');
    if (gasEmissions > 300) recommendations.push('🏠 Улучшите теплоизоляцию дома для снижения потребления газа');
    
    const recHtml = recommendations.length > 0 
      ? '<h4 style="margin-top: 0; margin-bottom: 20px; color: var(--accent); font-size: 18px;">💡 Рекомендации по снижению:</h4><ul class="highlights" style="text-align: left; margin: 0;">' + 
        recommendations.map(r => '<li style="margin: 14px 0; font-size: 15px; line-height: 1.6;">' + r + '</li>').join('') + 
        '</ul>'
      : '<div style="text-align: center; padding: 24px;"><div style="font-size: 56px; margin-bottom: 16px;">✅</div><p style="color: var(--accent); font-weight: 600; font-size: 18px; margin: 0;">Отличные показатели! Продолжайте в том же духе.</p></div>';
    
    document.getElementById('calcRecommendations').innerHTML = recHtml;
    document.getElementById('calcResult').style.display = 'block';
    
    // Плавная прокрутка к результату
    setTimeout(() => {
      document.getElementById('calcResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  });
}


// База знаний
const knowledgeBase = {
  'knowledge-air': {
    title: 'Качество воздуха и его влияние',
    content: `
      <h3>Качество воздуха и его влияние на здоровье</h3>
      <p>Качество воздуха напрямую влияет на здоровье человека. Основные загрязнители:</p>
      <ul>
        <li><strong>PM2.5 и PM10</strong> — мелкие частицы пыли, проникающие в лёгкие</li>
        <li><strong>NO₂</strong> — диоксид азота, раздражающий дыхательные пути</li>
        <li><strong>SO₂</strong> — диоксид серы, вызывающий проблемы с дыханием</li>
      </ul>
      <p>Рекомендации: при высоком уровне загрязнения ограничьте пребывание на улице, используйте маски, проветривайте помещения в утренние часы.</p>
    `
  },
  'knowledge-water': {
    title: 'Водные ресурсы и их охрана',
    content: `
      <h3>Водные ресурсы и их охрана</h3>
      <p>Чистая вода — основа жизни. Основные показатели качества:</p>
      <ul>
        <li><strong>Мутность</strong> — показатель прозрачности воды</li>
        <li><strong>Нитраты</strong> — соединения азота, могут быть вредны в больших количествах</li>
        <li><strong>БПК</strong> — биологическое потребление кислорода</li>
        <li><strong>pH</strong> — кислотно-щелочной баланс</li>
      </ul>
      <p>Как помочь: не сливайте химикаты в водоёмы, экономьте воду, участвуйте в очистке берегов.</p>
    `
  },
  'knowledge-waste': {
    title: 'Обращение с отходами',
    content: `
      <h3>Правильное обращение с отходами</h3>
      <p>Раздельный сбор отходов помогает сохранить ресурсы:</p>
      <ul>
        <li><strong>Пластик</strong> — перерабатывается в новые изделия</li>
        <li><strong>Бумага</strong> — экономит деревья</li>
        <li><strong>Стекло</strong> — перерабатывается бесконечно</li>
        <li><strong>Органика</strong> — компостируется для удобрений</li>
      </ul>
      <p>Начните с малого: установите контейнеры для разных типов отходов дома.</p>
    `
  },
  'knowledge-climate': {
    title: 'Изменение климата',
    content: `
      <h3>Изменение климата и что мы можем сделать</h3>
      <p>Изменение климата — глобальная проблема. Каждый может помочь:</p>
      <ul>
        <li>Сократите использование автомобиля</li>
        <li>Экономьте электроэнергию</li>
        <li>Посадите дерево</li>
        <li>Поддерживайте местные экологические инициативы</li>
      </ul>
    `
  },
  'knowledge-tips': {
    title: 'Экологичный образ жизни',
    content: `
      <h3>Простые шаги к экологичному образу жизни</h3>
      <ul>
        <li>Используйте многоразовые сумки вместо пластиковых пакетов</li>
        <li>Покупайте местные продукты</li>
        <li>Экономьте воду и электроэнергию</li>
        <li>Выбирайте вещи длительного использования</li>
        <li>Участвуйте в экологических акциях</li>
      </ul>
    `
  },
  'knowledge-recycling': {
    title: 'Раздельный сбор отходов',
    content: `
      <h3>Как начать раздельный сбор отходов</h3>
      <p>Шаг за шагом:</p>
      <ol>
        <li>Узнайте, какие виды отходов принимаются в вашем районе</li>
        <li>Установите контейнеры для разных типов отходов</li>
        <li>Мойте упаковку перед сдачей</li>
        <li>Найдите ближайшие пункты приёма</li>
      </ol>
    `
  },
  'knowledge-energy': {
    title: 'Энергосбережение',
    content: `
      <h3>Как экономить энергию дома</h3>
      <ul>
        <li>Используйте LED-лампы</li>
        <li>Выключайте приборы из розетки</li>
        <li>Установите программируемый термостат</li>
        <li>Улучшите теплоизоляцию</li>
        <li>Используйте энергоэффективную технику</li>
      </ul>
    `
  },
  'knowledge-transport': {
    title: 'Экологичный транспорт',
    content: `
      <h3>Альтернативы автомобилю</h3>
      <ul>
        <li><strong>Общественный транспорт</strong> — снижает выбросы на пассажира</li>
        <li><strong>Велосипед</strong> — полезно для здоровья и экологии</li>
        <li><strong>Пешие прогулки</strong> — для коротких расстояний</li>
        <li><strong>Каршеринг</strong> — делите поездки с другими</li>
      </ul>
    `
  }
};

function initKnowledgeBase() {
  const links = document.querySelectorAll('.knowledge-link');
  const contentDiv = document.getElementById('knowledgeContent');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href').substring(1);
      const content = knowledgeBase[id];
      if (content) {
        document.getElementById('knowledgeText').innerHTML = `<h2>${content.title}</h2>${content.content}`;
        
        // Плавное появление без прокрутки страницы
        if (contentDiv.style.display === 'none') {
          contentDiv.style.display = 'block';
          contentDiv.style.opacity = '0';
          contentDiv.style.transform = 'translateY(-20px)';
          contentDiv.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          
          setTimeout(() => {
            contentDiv.style.opacity = '1';
            contentDiv.style.transform = 'translateY(0)';
          }, 10);
        } else {
          // Если уже открыто, просто обновляем содержимое с анимацией
          contentDiv.style.opacity = '0.5';
          setTimeout(() => {
            contentDiv.style.opacity = '1';
          }, 200);
        }
      }
    });
  });
}



// Навигация с активным состоянием
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  
  function updateActiveNav() {
    let current = '';
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = sectionId;
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#' + current || (current === '' && href === '#overview')) {
        link.classList.add('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveNav);
  window.addEventListener('load', updateActiveNav);
  
  // Обработка кликов по ссылкам
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = 80;
          const targetPosition = target.offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Обновление активного состояния
          setTimeout(updateActiveNav, 100);
        }
      }
    });
  });
}

// Открытие/закрытие модального окна калькулятора
function initCalculatorModal() {
  const modal = document.getElementById('calculatorModal');
  const btnOpen = document.getElementById('btnOpenCalculator');
  const btnClose = document.getElementById('btnCloseCalculator');
  
  if (!modal || !btnOpen) return;
  
  // Открытие модального окна
  btnOpen.addEventListener('click', () => {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  });
  
  // Закрытие модального окна
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }
  
  // Закрытие при клике вне модального окна
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
  
  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
}

// Инициализация всех функций
function initAllFeatures() {
  // Ждём загрузки данных из app.js (если он используется на странице)
  setTimeout(() => {
    initNavigation();
    initCalculatorModal();
    initCalculator();
    initKnowledgeBase();

    // Индикатор AQI на главной
    const airValueEl = document.getElementById('homeAirValue');
    const airStatusEl = document.getElementById('homeAirStatus');
    const airFillEl = document.getElementById('homeAirFill');
    if (airValueEl && airStatusEl && airFillEl) {
      const aqi = 58; // демо-значение, может быть заменено реальными данными
      airValueEl.textContent = aqi;

      let status = 'Хорошее качество воздуха';
      let color = '#22c55e';
      if (aqi > 50 && aqi <= 100) {
        status = 'Умеренное качество воздуха';
        color = '#eab308';
      } else if (aqi > 100) {
        status = 'Неблагоприятное качество воздуха';
        color = '#ef4444';
      }
      airStatusEl.textContent = status;

      const clamped = Math.max(0, Math.min(aqi, 200));
      const percent = clamped / 200;
      const left = 4 + percent * 92;
      airFillEl.style.left = left + '%';
      airFillEl.style.backgroundColor = color;
    }
  }, 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllFeatures);
} else {
  initAllFeatures();
}

