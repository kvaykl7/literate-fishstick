;(function () {
  // Расширенные данные для сравнения регионов
  const regionalData = [
    { 
      name: 'Брянская область', 
      aqi: 58, 
      waterIndex: 70, 
      emissions: 45.2, 
      wasteProcessing: 32,
      pm25: 18,
      pm10: 28,
      no2: 24,
      so2: 10,
      forestCover: 28.5,
      population: 1200,
      area: 34.9
    },
    { 
      name: 'Орловская область', 
      aqi: 52, 
      waterIndex: 68, 
      emissions: 38.5, 
      wasteProcessing: 28,
      pm25: 15,
      pm10: 24,
      no2: 20,
      so2: 8,
      forestCover: 22.3,
      population: 724,
      area: 24.7
    },
    { 
      name: 'Курская область', 
      aqi: 61, 
      waterIndex: 65, 
      emissions: 52.8, 
      wasteProcessing: 35,
      pm25: 22,
      pm10: 32,
      no2: 28,
      so2: 12,
      forestCover: 18.7,
      population: 1100,
      area: 30.0
    },
    { 
      name: 'Калужская область', 
      aqi: 55, 
      waterIndex: 72, 
      emissions: 41.3, 
      wasteProcessing: 42,
      pm25: 17,
      pm10: 26,
      no2: 22,
      so2: 9,
      forestCover: 45.2,
      population: 1000,
      area: 29.8
    },
    { 
      name: 'Смоленская область', 
      aqi: 49, 
      waterIndex: 69, 
      emissions: 36.7, 
      wasteProcessing: 38,
      pm25: 14,
      pm10: 22,
      no2: 18,
      so2: 7,
      forestCover: 38.9,
      population: 934,
      area: 49.8
    },
    { 
      name: 'Белгородская область', 
      aqi: 64, 
      waterIndex: 66, 
      emissions: 58.1, 
      wasteProcessing: 31,
      pm25: 25,
      pm10: 35,
      no2: 30,
      so2: 14,
      forestCover: 12.4,
      population: 1540,
      area: 27.1
    }
  ]

  // Вычисление общего рейтинга
  function calculateRanking(region) {
    // Нормализуем показатели (чем меньше/больше - тем лучше)
    const aqiScore = 100 - (region.aqi / 80) * 100 // AQI: меньше лучше
    const waterScore = region.waterIndex // Вода: больше лучше
    const emissionsScore = 100 - (region.emissions / 60) * 100 // Выбросы: меньше лучше
    const wasteScore = region.wasteProcessing // Переработка: больше лучше
    const pm25Score = 100 - (region.pm25 / 30) * 100 // PM2.5: меньше лучше
    const forestScore = region.forestCover * 2 // Лес: больше лучше
    
    // Средний балл
    return Math.round((aqiScore + waterScore + emissionsScore + wasteScore + pm25Score + forestScore) / 6)
  }

  // График AQI
  function initAirChart() {
    const ctx = document.getElementById('comparisonAirChart')
    if (!ctx || typeof Chart === 'undefined') return

    const labels = regionalData.map(r => r.name)
    const aqiData = regionalData.map(r => r.aqi)
    const bryanskIndex = labels.indexOf('Брянская область')
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'AQI',
          data: aqiData,
          backgroundColor: aqiData.map((val, idx) => idx === bryanskIndex ? '#34c759' : 'rgba(110,231,183,0.6)'),
          borderColor: aqiData.map((val, idx) => idx === bryanskIndex ? '#2db351' : '#6ee7b7'),
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'AQI: ' + context.parsed.y + ' (чем ниже, тем лучше)'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 80,
            ticks: { color: '#b6c4bf' },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          x: {
            ticks: { color: '#e8f1ee', maxRotation: 45, minRotation: 45 },
            grid: { display: false }
          }
        }
      }
    })
  }

  // График качества воды
  function initWaterChart() {
    const ctx = document.getElementById('comparisonWaterChart')
    if (!ctx || typeof Chart === 'undefined') return

    const labels = regionalData.map(r => r.name)
    const waterData = regionalData.map(r => r.waterIndex)
    const bryanskIndex = labels.indexOf('Брянская область')
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Индекс качества воды',
          data: waterData,
          backgroundColor: waterData.map((val, idx) => idx === bryanskIndex ? '#34c759' : 'rgba(110,231,183,0.6)'),
          borderColor: waterData.map((val, idx) => idx === bryanskIndex ? '#2db351' : '#6ee7b7'),
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Индекс: ' + context.parsed.y + ' (чем выше, тем лучше)'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: '#b6c4bf' },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          x: {
            ticks: { color: '#e8f1ee', maxRotation: 45, minRotation: 45 },
            grid: { display: false }
          }
        }
      }
    })
  }

  // График выбросов
  function initEmissionsChart() {
    const ctx = document.getElementById('comparisonEmissionsChart')
    if (!ctx || typeof Chart === 'undefined') return

    const labels = regionalData.map(r => r.name)
    const emissionsData = regionalData.map(r => r.emissions)
    const bryanskIndex = labels.indexOf('Брянская область')
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Выбросы (тыс. т/год)',
          data: emissionsData,
          backgroundColor: emissionsData.map((val, idx) => idx === bryanskIndex ? '#34c759' : 'rgba(239,68,68,0.6)'),
          borderColor: emissionsData.map((val, idx) => idx === bryanskIndex ? '#2db351' : '#ef4444'),
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Выбросы: ' + context.parsed.y + ' тыс. т/год'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#b6c4bf', callback: (v) => v + ' тыс.т' },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          x: {
            ticks: { color: '#e8f1ee', maxRotation: 45, minRotation: 45 },
            grid: { display: false }
          }
        }
      }
    })
  }

  // График переработки отходов
  function initWasteChart() {
    const ctx = document.getElementById('comparisonWasteChart')
    if (!ctx || typeof Chart === 'undefined') return

    const labels = regionalData.map(r => r.name)
    const wasteData = regionalData.map(r => r.wasteProcessing)
    const bryanskIndex = labels.indexOf('Брянская область')
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Переработка отходов (%)',
          data: wasteData,
          backgroundColor: wasteData.map((val, idx) => idx === bryanskIndex ? '#34c759' : 'rgba(110,231,183,0.6)'),
          borderColor: wasteData.map((val, idx) => idx === bryanskIndex ? '#2db351' : '#6ee7b7'),
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Переработка: ' + context.parsed.y + '%'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: '#b6c4bf', callback: (v) => v + '%' },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          x: {
            ticks: { color: '#e8f1ee', maxRotation: 45, minRotation: 45 },
            grid: { display: false }
          }
        }
      }
    })
  }

  // График загрязнителей
  function initPollutantsChart() {
    const ctx = document.getElementById('comparisonPollutantsChart')
    if (!ctx || typeof Chart === 'undefined') return

    const labels = regionalData.map(r => r.name)
    const bryanskIndex = labels.indexOf('Брянская область')
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'PM2.5',
            data: regionalData.map(r => r.pm25),
            backgroundColor: labels.map((_, idx) => idx === bryanskIndex ? 'rgba(52,199,89,0.7)' : 'rgba(110,231,183,0.5)'),
            borderColor: labels.map((_, idx) => idx === bryanskIndex ? '#34c759' : '#6ee7b7'),
            borderWidth: 1
          },
          {
            label: 'PM10',
            data: regionalData.map(r => r.pm10),
            backgroundColor: labels.map((_, idx) => idx === bryanskIndex ? 'rgba(52,199,89,0.5)' : 'rgba(167,243,208,0.4)'),
            borderColor: labels.map((_, idx) => idx === bryanskIndex ? '#2db351' : '#a7f3d0'),
            borderWidth: 1
          },
          {
            label: 'NO₂',
            data: regionalData.map(r => r.no2),
            backgroundColor: labels.map((_, idx) => idx === bryanskIndex ? 'rgba(52,199,89,0.4)' : 'rgba(134,239,172,0.3)'),
            borderColor: labels.map((_, idx) => idx === bryanskIndex ? '#1e9e45' : '#86efac'),
            borderWidth: 1
          },
          {
            label: 'SO₂',
            data: regionalData.map(r => r.so2),
            backgroundColor: labels.map((_, idx) => idx === bryanskIndex ? 'rgba(52,199,89,0.3)' : 'rgba(110,231,183,0.2)'),
            borderColor: labels.map((_, idx) => idx === bryanskIndex ? '#158a3a' : '#6ee7b7'),
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: {
          legend: { 
            labels: { color: '#e8f1ee' },
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + ' мкг/м³'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#b6c4bf', callback: (v) => v + ' мкг/м³' },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          x: {
            ticks: { color: '#e8f1ee', maxRotation: 45, minRotation: 45 },
            grid: { display: false }
          }
        }
      }
    })
  }

  // График рейтинга
  function initRankingChart() {
    const ctx = document.getElementById('comparisonRankingChart')
    if (!ctx || typeof Chart === 'undefined') return

    // Сортируем по рейтингу
    const sortedData = [...regionalData].map(r => ({
      ...r,
      ranking: calculateRanking(r)
    })).sort((a, b) => b.ranking - a.ranking)

    const labels = sortedData.map(r => r.name)
    const rankingData = sortedData.map(r => r.ranking)
    const bryanskIndex = labels.indexOf('Брянская область')
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Экологический рейтинг',
          data: rankingData,
          backgroundColor: rankingData.map((val, idx) => idx === bryanskIndex ? '#34c759' : 'rgba(110,231,183,0.6)'),
          borderColor: rankingData.map((val, idx) => idx === bryanskIndex ? '#2db351' : '#6ee7b7'),
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Рейтинг: ' + context.parsed.x + ' баллов'
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: { color: '#b6c4bf', callback: (v) => v + ' баллов' },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          y: {
            ticks: { color: '#e8f1ee' },
            grid: { display: false }
          }
        }
      }
    })
  }

  // Рендер таблицы сравнения
  function renderComparisonTable() {
    const tbody = document.getElementById('comparisonTableBody')
    if (!tbody) return
    
    tbody.innerHTML = regionalData.map(region => {
      const isBryansk = region.name === 'Брянская область'
      const rowClass = isBryansk ? 'highlight' : ''
      return `
        <tr class="${rowClass}">
          <td><strong>${region.name}</strong></td>
          <td>${region.aqi}</td>
          <td>${region.waterIndex}</td>
          <td>${region.emissions}</td>
          <td>${region.wasteProcessing}%</td>
          <td>${region.pm25}</td>
          <td>${region.pm10}</td>
          <td>${region.no2}</td>
          <td>${region.forestCover}%</td>
        </tr>
      `
    }).join('')
  }

  // Инициализация всех графиков
  function init() {
    initAirChart()
    initWaterChart()
    initEmissionsChart()
    initWasteChart()
    initPollutantsChart()
    initRankingChart()
    renderComparisonTable()
  }

  // Запуск при загрузке
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible')
    })
  }, { threshold: 0.15 })
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

})()

