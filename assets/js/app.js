;(function () {
  const center = [53.2521, 34.3717] // Брянск
  const initialZoom = 8
  const GLOBAL_ADMIN_KEY = 'bryanskAdminUnlocked'
  const GLOBAL_ADMIN_PASS = '123'

  function isGlobalAdminUnlocked() {
    try { return localStorage.getItem(GLOBAL_ADMIN_KEY) === '1' } catch (e) { return false }
  }

  // Демоданные: чистые и проблемные точки
  let cleanPlaces = [
    { name: 'Брянск — Центральный парк', coords: [53.2469, 34.3649], note: 'Низкая запыленность, хорошая вентиляция' },
    { name: 'Нацпарк «Брянский лес»', coords: [52.5660, 33.8360], note: 'Водоохранная зона, низкая антропогенная нагрузка' },
    { name: 'Карачевский район — лесной массив', coords: [53.1250, 34.9520], note: 'Преобладание лесов, удалённость от магистралей' },
    { name: 'Трубчевск — пойма Десны', coords: [52.5800, 33.7700], note: 'Природная пойма, хорошая аэрация' },
    { name: 'Жуковка — сосновый бор', coords: [53.5320, 33.7300], note: 'Близость лесного массива, низкий транспортный поток' },
    { name: 'Суражский район — заповедные участки', coords: [53.0200, 32.3800], note: 'Малая антропогенная нагрузка' },
    { name: 'Севский район — лесополоса', coords: [52.1500, 34.5000], note: 'Защитные лесополосы, проветриваемость' },
    { name: 'Почеп — прибрежная зона', coords: [52.9300, 33.4500], note: 'Береговая линия, зелёные насаждения' },
    { name: 'Стародуб — городской парк', coords: [52.5850, 32.7600], note: 'Высокая доля зелёных насаждений' },
    { name: 'Унеча — лесной массив', coords: [52.8500, 32.6800], note: 'Удалённость от крупных трасс' },
    { name: 'Злынка — природный ландшафт', coords: [52.4300, 31.7300], note: 'Низкая плотность застройки' },
    { name: 'Клинцы — городской сквер', coords: [52.7500, 32.2400], note: 'Локальная зона отдыха, зелёный каркас' }
  ]

  let dirtyPlaces = [
    { name: 'Промзона г. Брянска (Бежицкий р-н)', coords: [53.2900, 34.2900], severity: 'высокая', pollutant: 'PM10, NO₂' },
    { name: 'Окружная трасса (южный участок)', coords: [53.2000, 34.4500], severity: 'средняя', pollutant: 'PM2.5, NO₂' },
    { name: 'Неорганизованные свалки', coords: [53.3200, 34.5200], severity: 'высокая', pollutant: 'твердые отходы' },
    { name: 'Дятьково — промышленная зона', coords: [53.6000, 34.3300], severity: 'средняя', pollutant: 'PM10, VOC' },
    { name: 'Новозыбков — наследие техногенных воздействий', coords: [52.5400, 31.9400], severity: 'средняя', pollutant: 'почвенные загрязнения' },
    { name: 'Клинцы — транспортный узел', coords: [52.7500, 32.2600], severity: 'средняя', pollutant: 'NO₂, PM2.5' },
    { name: 'Почеп — склад ГСМ', coords: [52.9200, 33.4700], severity: 'высокая', pollutant: 'ЛВЖ, углеводороды' },
    { name: 'Трубчевск — участок у трассы', coords: [52.5900, 33.8000], severity: 'средняя', pollutant: 'PM2.5, NO₂' },
    { name: 'Севск — несанкционированный сброс', coords: [52.1400, 34.5200], severity: 'высокая', pollutant: 'бытовые отходы' },
    { name: 'Стародуб — промплощадка', coords: [52.5750, 32.7800], severity: 'средняя', pollutant: 'PM10' },
    { name: 'Унеча — перегрузочный узел', coords: [52.8600, 32.7000], severity: 'средняя', pollutant: 'пыль, шум' },
    { name: 'Жуковка — участок интенсивного движения', coords: [53.5400, 33.7500], severity: 'средняя', pollutant: 'NO₂' }
  ]

  // Демо-координаты (нужны для сброса к исходному состоянию)
  const cleanPlacesDemo = cleanPlaces.map((p) => ({ ...p, coords: [p.coords[0], p.coords[1]] }))
  const dirtyPlacesDemo = dirtyPlaces.map((p) => ({ ...p, coords: [p.coords[0], p.coords[1]] }))

  const CUSTOM_CLEAN_PLACES_KEY = 'customCleanPlaces'
  const CUSTOM_DIRTY_PLACES_KEY = 'customDirtyPlaces'
  const CUSTOM_EMITTERS_KEY = 'bryanskCustomEmitters'

  let customCleanPlaces = []
  let customDirtyPlaces = []
  let customEmitters = []

  function loadCustomPlaces(key, kind) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return []
      const parsed = JSON.parse(raw || '[]')
      if (!Array.isArray(parsed)) return []
      const out = []
      for (let i = 0; i < parsed.length; i++) {
        const p = parsed[i] || {}
        const coords = Array.isArray(p.coords) && p.coords.length >= 2 ? p.coords : (p.coord ? p.coord : null)
        const lat = coords ? coords[0] : (p.lat != null ? p.lat : null)
        const lon = coords ? coords[1] : (p.lon != null ? p.lon : null)
        const name = typeof p.name === 'string' ? p.name : ''
        if (!name || lat == null || lon == null) continue
        if (kind === 'clean') {
          out.push({
            name,
            coords: [Number(lat), Number(lon)],
            note: typeof p.note === 'string' ? p.note : (typeof p.n === 'string' ? p.n : '')
          })
        } else {
          const severity = (p.severity === 'высокая' || p.severity === 'средняя') ? p.severity : 'средняя'
          const pollutant = typeof p.pollutant === 'string' ? p.pollutant : (typeof p.pollutants === 'string' ? p.pollutants : '')
          out.push({
            name,
            coords: [Number(lat), Number(lon)],
            severity,
            pollutant
          })
        }
      }
      return out
    } catch (e) {
      return []
    }
  }

  function persistCustomPlaces(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(Array.isArray(arr) ? arr : [])) } catch (e) {}
  }

  function persistCustomEmitters(arr) {
    try { localStorage.setItem(CUSTOM_EMITTERS_KEY, JSON.stringify(Array.isArray(arr) ? arr : [])) } catch (e) {}
  }

  // KPI заполнение
  function setKpis() {
    const avgAqi = 58 // демо: ниже — лучше
    const waterIdx = 70 // демо индекс качества воды
    animateNumber(document.getElementById('kpi-air'), avgAqi)
    animateNumber(document.getElementById('kpi-water'), waterIdx)
    animateNumber(document.getElementById('kpi-clean'), cleanPlaces.length)
    animateNumber(document.getElementById('kpi-dirty'), dirtyPlaces.length)
  }

  function animateNumber(el, target) {
    if (!el) return
    const start = Number(el.textContent.replace(/[^0-9.-]/g, '')) || 0
    const duration = 700
    const startTime = performance.now()
    function frame(now) {
      const p = Math.min(1, (now - startTime) / duration)
      const val = Math.round(start + (target - start) * (1 - Math.cos(p * Math.PI)) / 2)
      el.textContent = val
      if (p < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }

  // Список загрязнённых зон
  function renderPollutionList() {
    const list = document.getElementById('pollutionList')
    if (!list) return
    const items = dirtyPlaces.map((p) => {
      const severity = p.severity === 'высокая' ? 'bad' : 'warn'
      return `<li>
        <div>
          <strong>${p.name}</strong>
          <div style="color:#b6c4bf;font-size:12px;margin-top:2px;">Потенциальные загрязнители: ${p.pollutant}</div>
        </div>
        <span class="badge ${severity}">${p.severity}</span>
      </li>`
    })
    list.innerHTML = items.join('')
  }

  // Предприятия (демоданные) и рендер списка
  const emittersBase = [
    { name: 'Брянсксельмаш', percent: 16 },
    { name: 'Дядьковский хрустальный завод', percent: 14 },
    { name: 'Брянский электромеханический завод', percent: 12 },
    { name: 'Газэнергокомплект', percent: 11 },
    { name: 'Брянский машиностроительный завод', percent: 9 },
    { name: 'Кондитерская фабрика „Брянконфи“', percent: 8 },
    { name: 'Карачевский завод „Электродеталь“', percent: 7 },
    { name: 'Консервсушпрод', percent: 6 },
    { name: 'Брасовские сыры', percent: 6 },
    { name: 'Клинцовский автокрановый завод', percent: 4 },
    { name: 'Брянский цементный завод (демо)', percent: 2 },
    { name: 'Клинцовский комбинат стройматериалов (демо)', percent: 2 },
    { name: 'Брянский теплоэнергетический узел (демо)', percent: 1 },
    { name: 'Брянский завод металлоконструкций (демо)', percent: 1 },
    { name: 'Новозыбковский перерабатывающий комплекс (демо)', percent: 1 }
  ]

  function jitterEmitter(i) {
    // детерминированное «разведение» точек рядом с зонами загрязнения
    const latStep = (i % 5 - 2) * 0.006
    const lonStep = (Math.floor(i / 5) % 5 - 2) * 0.006
    return { latStep, lonStep }
  }

  function coerceNum(v) {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  function normalizeCustomEmitters(arr) {
    if (!Array.isArray(arr)) return []
    const normalized = []
    for (let i = 0; i < arr.length; i++) {
      const e = arr[i] || {}
      const coords = Array.isArray(e.coords) && e.coords.length >= 2 ? e.coords : (Array.isArray(e.coord) ? e.coord : null)
      const lat = coords ? coords[0] : (e.lat != null ? e.lat : null)
      const lon = coords ? coords[1] : (e.lon != null ? e.lon : null)
      const severity = (e.severity === 'высокая' || e.severity === 'средняя') ? e.severity : 'средняя'
      const percent = coerceNum(e.percent)
      const pollutants = typeof e.pollutants === 'string' ? e.pollutants : (typeof e.pollutant === 'string' ? e.pollutant : '')
      const name = typeof e.name === 'string' ? e.name : ''
      if (!name || lat == null || lon == null || percent == null) continue
      normalized.push({
        name,
        percent,
        coords: [Number(lat), Number(lon)],
        pollutants,
        severity
      })
    }
    return normalized
  }

  function loadCustomEmitters() {
    try {
      const raw = localStorage.getItem(CUSTOM_EMITTERS_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw || '[]')
      return normalizeCustomEmitters(parsed)
    } catch (e) {
      return []
    }
  }

  function buildDefaultEmitters() {
    return emittersBase.map((e, idx) => {
      const dp = dirtyPlaces[idx % dirtyPlaces.length]
      const j = jitterEmitter(idx)
      return {
        ...e,
        coords: [dp.coords[0] + j.latStep, dp.coords[1] + j.lonStep],
        pollutants: dp.pollutant,
        severity: dp.severity
      }
    })
  }

  let emitters = []
  // Если пользователь добавлял предприятия через админ-панель — используем их.
  customEmitters = loadCustomEmitters()
  emitters = (customEmitters && customEmitters.length) ? customEmitters : buildDefaultEmitters()

  function renderEmittersList(arr) {
    const list = document.getElementById('emittersList')
    if (!list) return
    const source = Array.isArray(arr) ? arr : emitters
    list.innerHTML = source
      .map((e) => {
        const badgeClass = e.severity === 'высокая' ? 'bad' : 'warn'
        return `<li>
          <div>
            <strong>${e.name}</strong>
            <div style="color:#b6c4bf;font-size:12px;margin-top:2px;">Загрязнители: ${e.pollutants}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span class="chip">${e.percent}%</span>
            <span class="badge ${badgeClass}">${e.severity}</span>
          </div>
        </li>`
      })
      .join('')
  }

  function renderEmittersMarkers() {
    if (!emitterLayer) return
    emitterLayer.clearLayers()
    emitters.forEach((e) => {
      const isHigh = e.severity === 'высокая'
      const color = isHigh ? '#ef4444' : '#f97316'
      const marker = L.circleMarker(e.coords, {
        radius: 7,
        color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2
      })
        .bindPopup(`<strong>🏭 ${e.name}</strong><br>Вклад: ${e.percent}%<br>Степень: ${e.severity}<br>Загрязнители: ${e.pollutants}`)
        .bindTooltip(e.name, { direction: 'top', offset: [0, -8] })
      emitterLayer.addLayer(marker)
    })
  }

  function rebuildEmitters() {
    emitters = (customEmitters && customEmitters.length) ? customEmitters : buildDefaultEmitters()
    // Переиспользуем постраничную отрисовку графика/списка
    try {
      if (typeof window !== 'undefined' && typeof window.__bryanskUpdateEmittersChart === 'function') {
        window.__bryanskUpdateEmittersChart()
      } else {
        // fallback: показываем первые 5
        renderEmittersList(emitters.slice(0, EMITTERS_CHART_PAGE_SIZE))
      }
    } catch (e) {
      renderEmittersList(emitters.slice(0, EMITTERS_CHART_PAGE_SIZE))
    }
    renderEmittersMarkers()
  }

  // Зелёные точки — пункты приёма вторсырья (координаты для Брянска)
  const greenPointsDefault = [
    { name: 'Пункт приёма вторсырья (центр Брянска)', address: 'ул. Красноармейская', types: ['стекло', 'пластик', 'бумага'], note: 'Контейнеры у супермаркета', lat: 53.252, lon: 34.371 },
    { name: 'Экоконтейнер — батарейки и техника', address: 'пр. Ленина, у ТЦ', types: ['батарейки', 'мелкая техника'], note: 'У крупного супермаркета', lat: 53.248, lon: 34.368 },
    { name: 'Благотворительный пункт сбора одежды', address: 'ул. Фокина', types: ['одежда'], note: 'Вещи в хорошем состоянии', lat: 53.255, lon: 34.378 },
    { name: 'Пункт приёма макулатуры', address: 'Бежицкий район', types: ['бумага', 'картон'], note: 'По предварительной записи', lat: 53.29, lon: 34.292 },
    { name: 'Контейнеры для пластика', address: 'Советский район, жилые массивы', types: ['пластик'], note: 'Жёлтые контейнеры во дворах', lat: 53.242, lon: 34.398 }
  ]

  // Инициализация карты Leaflet
  let map, cleanLayer, dirtyLayer, greenLayer, emitterLayer
  let cleanCluster, dirtyCluster, heatLayer
  let addPointMode = false
  let applyTogglesFn = null
  const MAP_TOGGLES_KEY = 'bryanskOverviewMapToggles'
  const EMITTERS_VISIBLE_KEY = 'bryanskOverviewEmittersVisible'
  const ADD_POINT_MODE_KEY = 'bryanskOverviewAddPointMode'

  // baseline for admin reset
  let cleanPlacesBaseline = null
  let dirtyPlacesBaseline = null

  function getSavedMapToggles() {
    try {
      const raw = localStorage.getItem(MAP_TOGGLES_KEY)
      if (!raw) return null
      const obj = JSON.parse(raw)
      return obj && typeof obj === 'object' ? obj : null
    } catch (e) {
      return null
    }
  }

  function persistMapToggles(t) {
    try { localStorage.setItem(MAP_TOGGLES_KEY, JSON.stringify(t)) } catch (e) {}
  }

  function getEmittersVisible() {
    try {
      const v = localStorage.getItem(EMITTERS_VISIBLE_KEY)
      if (v === '0') return false
      if (v === '1') return true
    } catch (e) {}
    return true
  }

  function setEmittersVisible(visible, persist = true) {
    if (!map || !emitterLayer) return
    if (visible) emitterLayer.addTo(map)
    else map.removeLayer(emitterLayer)
    if (persist) {
      try { localStorage.setItem(EMITTERS_VISIBLE_KEY, visible ? '1' : '0') } catch (e) {}
    }
  }
  function initMap() {
    const mapContainer = document.getElementById('mapContainer')
    if (!mapContainer) return

    // Пользовательские точки (добавленные в интерфейсе или админ-панели)
    customCleanPlaces = loadCustomPlaces(CUSTOM_CLEAN_PLACES_KEY, 'clean')
    customDirtyPlaces = loadCustomPlaces(CUSTOM_DIRTY_PLACES_KEY, 'dirty')
    // Собираем полную коллекцию (демо + пользовательские)
    cleanPlaces = cleanPlacesDemo.concat(customCleanPlaces)
    dirtyPlaces = dirtyPlacesDemo.concat(customDirtyPlaces)

    map = L.map(mapContainer).setView(center, initialZoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    cleanLayer = L.layerGroup()
    dirtyLayer = L.layerGroup()
    greenLayer = L.layerGroup()
    emitterLayer = L.layerGroup()
    function makeMarkerDivIcon(color) {
      return L.divIcon({
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        html: '<div style="width:12px;height:12px;border-radius:999px;background:' + color + ';border:2px solid rgba(0,0,0,0.25);box-shadow:0 6px 18px rgba(0,0,0,0.25);"></div>'
      })
    }

    function makeClusterIcon(color) {
      return function (cluster) {
        const count = cluster.getChildCount()
        return L.divIcon({
          className: '',
          iconSize: [36, 36],
          html: '<div style="width:34px;height:34px;border-radius:999px;background:' + color + ';display:flex;align-items:center;justify-content:center;color:#071015;font-weight:900;border:2px solid rgba(255,255,255,0.15);box-shadow:0 12px 32px rgba(0,0,0,0.35);">' + count + '</div>'
        })
      }
    }

    const cleanColor = '#22c55e'
    const dirtyColor = '#ef4444'

    cleanCluster = L.markerClusterGroup({
      disableClusteringAtZoom: 14,
      iconCreateFunction: makeClusterIcon(cleanColor)
    })
    dirtyCluster = L.markerClusterGroup({
      disableClusteringAtZoom: 14,
      iconCreateFunction: makeClusterIcon(dirtyColor)
    })

    cleanPlaces.forEach((p) => {
      const marker = L.circleMarker(p.coords, {
        radius: 8,
        color: cleanColor,
        weight: 2,
        opacity: 1,
        fillColor: cleanColor,
        fillOpacity: 0.85
      })
        .bindPopup(`<strong>✅ ${p.name}</strong><br>${p.note}`)
        .bindTooltip(p.name, { direction: 'top', offset: [0, -8] })
      cleanLayer.addLayer(marker)
      cleanCluster.addLayer(L.marker(p.coords, { title: p.name, icon: makeMarkerDivIcon(cleanColor) }))
    })

    dirtyPlaces.forEach((p) => {
      const marker = L.circleMarker(p.coords, {
        radius: 8,
        color: dirtyColor,
        weight: 2,
        opacity: 1,
        fillColor: dirtyColor,
        fillOpacity: 0.88
      })
        .bindPopup(`<strong>⚠️ ${p.name}</strong><br>Степень: ${p.severity}<br>${p.pollutant}`)
        .bindTooltip(p.name, { direction: 'top', offset: [0, -8] })
      dirtyLayer.addLayer(marker)
      dirtyCluster.addLayer(L.marker(p.coords, { title: p.name, icon: makeMarkerDivIcon(dirtyColor) }))
    })

    // Предприятия-загрязнители (демо): маркеры на карте рядом с проблемными зонами
    renderEmittersMarkers()

    // Сохраняем baseline для админ-кнопки «Вернуть демо-точки»
    if (!cleanPlacesBaseline) {
      cleanPlacesBaseline = cleanPlacesDemo.map((p) => ({
        ...p,
        coords: [p.coords[0], p.coords[1]]
      }))
    }
    if (!dirtyPlacesBaseline) {
      dirtyPlacesBaseline = dirtyPlacesDemo.map((p) => ({
        ...p,
        coords: [p.coords[0], p.coords[1]]
      }))
    }

    function addGreenPointsToMap(list) {
      if (!list || !list.length) return
      list.forEach((p) => {
        const lat = p.lat != null ? p.lat : p.coords?.[0]
        const lon = p.lon != null ? p.lon : p.coords?.[1]
        if (lat == null || lon == null) return
        const coords = [Number(lat), Number(lon)]
        const typesStr = (p.types && p.types.length) ? p.types.join(', ') : ''
        const popup = `<strong>♻️ ${p.name}</strong><br><span style="color:#94a3b8;">${p.address || ''}</span><br>${p.note ? p.note + '<br>' : ''}<small>Приём: ${typesStr}</small>`
        const marker = L.circleMarker(coords, {
          radius: 10,
          color: '#059669',
          fillColor: '#10b981',
          fillOpacity: 0.9,
          weight: 2,
          className: 'marker-green-point'
        })
          .bindPopup(popup)
          .bindTooltip(p.name, { direction: 'top', offset: [0, -8] })
        greenLayer.addLayer(marker)
      })
    }

    // Сразу загружаем зелёные точки из встроенного списка (всегда видны)
    addGreenPointsToMap(greenPointsDefault)
    // Подгружаем из JSON и заменяем, если файл доступен (например, с сервера)
    fetch('data/green_points.json')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((arr) => {
        if (arr && arr.length) {
          greenLayer.clearLayers()
          addGreenPointsToMap(arr)
        }
      })
      .catch(() => {})

    cleanLayer.addTo(map)
    dirtyLayer.addTo(map)
    greenLayer.addTo(map)
    cleanCluster.addTo(map)
    dirtyCluster.addTo(map)
    setEmittersVisible(getEmittersVisible(), false)

    // Heatmap по проблемным точкам
    const heatData = dirtyPlaces.map((p) => [...p.coords, p.severity === 'высокая' ? 0.9 : 0.5])
    heatLayer = L.heatLayer(heatData, { radius: 22, blur: 18, maxZoom: 12 })

    const overlays = {
      'Чистые локации': cleanLayer,
      'Проблемные локации': dirtyLayer,
      'Зелёные точки (приём вторсырья)': greenLayer,
      'Предприятия-загрязнители (демо)': emitterLayer
    }
    L.control.layers({}, overlays, { collapsed: false, position: 'topright' }).addTo(map)

    // Легенда
    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'card')
      div.style.padding = '10px'
      div.innerHTML = `
        <div style="font-weight:700;margin-bottom:6px;">Легенда</div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;">
          <span style="width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block"></span>
          <span style="color:#b6c4bf;font-size:13px;">Чистая зона</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;">
          <span style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block"></span>
          <span style="color:#b6c4bf;font-size:13px;">Проблемная зона</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span style="width:10px;height:10px;border-radius:50%;background:#10b981;display:inline-block"></span>
          <span style="color:#b6c4bf;font-size:13px;">Приём вторсырья</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
          <span style="width:10px;height:10px;border-radius:50%;background:#f97316;display:inline-block"></span>
          <span style="color:#b6c4bf;font-size:13px;">Предприятия (демо)</span>
        </div>
      `
      return div
    }
    legend.addTo(map)

    // Переключатели
    const toggleClean = document.getElementById('toggleClean')
    const toggleDirty = document.getElementById('toggleDirty')
    const toggleClusters = document.getElementById('toggleClusters')
    const toggleHeat = document.getElementById('toggleHeat')
    const toggleGreen = document.getElementById('toggleGreen')
    const btnAddPoint = document.getElementById('btnAddPoint')

    const savedToggles = getSavedMapToggles()
    if (savedToggles) {
      if (typeof savedToggles.toggleClean === 'boolean') toggleClean.checked = savedToggles.toggleClean
      if (typeof savedToggles.toggleDirty === 'boolean') toggleDirty.checked = savedToggles.toggleDirty
      if (typeof savedToggles.toggleClusters === 'boolean') toggleClusters.checked = savedToggles.toggleClusters
      if (typeof savedToggles.toggleHeat === 'boolean') toggleHeat.checked = savedToggles.toggleHeat
      if (typeof savedToggles.toggleGreen === 'boolean' && toggleGreen) toggleGreen.checked = savedToggles.toggleGreen
    }

    // режим «Добавить точку кликом»
    try {
      const savedAddPointMode = localStorage.getItem(ADD_POINT_MODE_KEY)
      if (savedAddPointMode === '1') {
        addPointMode = true
        btnAddPoint.textContent = 'Отменить добавление'
        btnAddPoint.style.background = 'var(--danger)'
      }
    } catch (e) {}

    // Если админ уже разблокирован — включаем расширенный просмотр
    try {
      if (isGlobalAdminUnlocked()) {
        if (toggleClean) toggleClean.checked = true
        if (toggleDirty) toggleDirty.checked = true
        if (toggleClusters) toggleClusters.checked = true
        if (toggleHeat) toggleHeat.checked = true
        if (toggleGreen) toggleGreen.checked = true
        try { localStorage.setItem(EMITTERS_VISIBLE_KEY, '1') } catch (e) {}
        setEmittersVisible(true, false)
      }
    } catch (e) {}

    function applyToggles() {
      if (toggleClean.checked) cleanLayer.addTo(map)
      else map.removeLayer(cleanLayer)

      if (toggleDirty.checked) dirtyLayer.addTo(map)
      else map.removeLayer(dirtyLayer)

      if (toggleClusters.checked) {
        cleanCluster.addTo(map)
        dirtyCluster.addTo(map)
      } else {
        map.removeLayer(cleanCluster)
        map.removeLayer(dirtyCluster)
      }

      if (toggleHeat.checked) heatLayer.addTo(map)
      else map.removeLayer(heatLayer)

    if (toggleGreen) {
        if (toggleGreen.checked) greenLayer.addTo(map)
        else map.removeLayer(greenLayer)
      }
    }
    applyTogglesFn = applyToggles
    applyToggles()

    // Реакция на действия из глобальной админ-панели
    window.addEventListener('bryanskAdminAccessChanged', () => {
      try {
        if (!isGlobalAdminUnlocked()) return
      } catch (e) {
        return
      }

      const st = getSavedMapToggles()
      if (st) {
        if (typeof st.toggleClean === 'boolean') toggleClean.checked = st.toggleClean
        if (typeof st.toggleDirty === 'boolean') toggleDirty.checked = st.toggleDirty
        if (typeof st.toggleClusters === 'boolean') toggleClusters.checked = st.toggleClusters
        if (typeof st.toggleHeat === 'boolean') toggleHeat.checked = st.toggleHeat
        if (typeof st.toggleGreen === 'boolean' && toggleGreen) toggleGreen.checked = st.toggleGreen
      }

      applyToggles()
      setEmittersVisible(getEmittersVisible(), false)

      try {
        const savedAddPointMode = localStorage.getItem(ADD_POINT_MODE_KEY)
        addPointMode = savedAddPointMode === '1'
        if (addPointMode) {
          btnAddPoint.textContent = 'Отменить добавление'
          btnAddPoint.style.background = 'var(--danger)'
        } else {
          btnAddPoint.textContent = 'Добавить точку кликом'
          btnAddPoint.style.background = ''
        }
      } catch (e) {}
    })

    if (map) {
      map.on('overlayadd', (e) => {
        if (e.layer === emitterLayer) setEmittersVisible(true)
      })
      map.on('overlayremove', (e) => {
        if (e.layer === emitterLayer) setEmittersVisible(false)
      })
    }

    function persistCurrentToggles() {
      persistMapToggles({
        toggleClean: !!toggleClean.checked,
        toggleDirty: !!toggleDirty.checked,
        toggleClusters: !!toggleClusters.checked,
        toggleHeat: !!toggleHeat.checked,
        toggleGreen: !!(toggleGreen ? toggleGreen.checked : true)
      })
    }

    toggleClean.addEventListener('change', () => {
      applyToggles()
      persistCurrentToggles()
    })
    toggleDirty.addEventListener('change', () => {
      applyToggles()
      persistCurrentToggles()
    })
    toggleClusters.addEventListener('change', () => {
      applyToggles()
      persistCurrentToggles()
    })
    toggleHeat.addEventListener('change', () => {
      applyToggles()
      persistCurrentToggles()
    })
    if (toggleGreen) {
      toggleGreen.addEventListener('change', () => {
        applyToggles()
        persistCurrentToggles()
      })
    }

    // синхронизация между вкладками
    window.addEventListener('storage', (e) => {
      if (e.key !== MAP_TOGGLES_KEY && e.key !== EMITTERS_VISIBLE_KEY && e.key !== ADD_POINT_MODE_KEY) return
      if (e.key === EMITTERS_VISIBLE_KEY) {
        const v = getEmittersVisible()
        setEmittersVisible(v, false)
        if (typeof adminEmittersCheckbox !== 'undefined' && adminEmittersCheckbox) {
          adminEmittersCheckbox.checked = v
        }
      }
      if (e.key === ADD_POINT_MODE_KEY) {
        const enabled = e.newValue === '1'
        addPointMode = enabled
        if (enabled) {
          btnAddPoint.textContent = 'Отменить добавление'
          btnAddPoint.style.background = 'var(--danger)'
        } else {
          btnAddPoint.textContent = 'Добавить точку кликом'
          btnAddPoint.style.background = ''
          // Если режим выключили из другой вкладки — закрываем модалку и сбрасываем ожидание клика
          try { if (typeof closeModal === 'function') closeModal() } catch (err) {}
        }
      }
      if (e.key === MAP_TOGGLES_KEY) {
        let obj = null
        try { obj = JSON.parse(e.newValue) } catch (err) {}
        if (!obj) return
        if (typeof obj.toggleClean === 'boolean') toggleClean.checked = obj.toggleClean
        if (typeof obj.toggleDirty === 'boolean') toggleDirty.checked = obj.toggleDirty
        if (typeof obj.toggleClusters === 'boolean') toggleClusters.checked = obj.toggleClusters
        if (typeof obj.toggleHeat === 'boolean') toggleHeat.checked = obj.toggleHeat
        if (typeof obj.toggleGreen === 'boolean' && toggleGreen) toggleGreen.checked = obj.toggleGreen
        applyToggles()
      }
    })
    let pendingMarkerCoords = null
    const markerModal = document.getElementById('markerModal')
    const markerType = document.getElementById('markerType')
    const markerName = document.getElementById('markerName')
    const markerNote = document.getElementById('markerNote')
    const markerSeverity = document.getElementById('markerSeverity')
    const markerPollutant = document.getElementById('markerPollutant')
    const markerNoteGroup = document.getElementById('markerNoteGroup')
    const markerSeverityGroup = document.getElementById('markerSeverityGroup')
    const markerPollutantGroup = document.getElementById('markerPollutantGroup')
    const markerSubmit = document.getElementById('markerSubmit')
    const markerCancel = document.getElementById('markerCancel')
    const modalClose = document.getElementById('modalClose')

    // Переключение видимости полей при смене типа точки
    markerType.addEventListener('change', () => {
      if (markerType.value === 'clean') {
        markerNoteGroup.style.display = 'block'
        markerSeverityGroup.style.display = 'none'
        markerPollutantGroup.style.display = 'none'
      } else {
        markerNoteGroup.style.display = 'none'
        markerSeverityGroup.style.display = 'block'
        markerPollutantGroup.style.display = 'block'
      }
    })

    // Открытие модального окна
    btnAddPoint.addEventListener('click', () => {
      addPointMode = !addPointMode
      try { localStorage.setItem(ADD_POINT_MODE_KEY, addPointMode ? '1' : '0') } catch (e) {}
      if (addPointMode) {
        btnAddPoint.textContent = 'Отменить добавление'
        btnAddPoint.style.background = 'var(--danger)'
      } else {
        btnAddPoint.textContent = 'Добавить точку кликом'
        btnAddPoint.style.background = ''
        closeModal()
      }
    })

    // Обработка клика на карте
    map.on('click', (ev) => {
      if (!addPointMode) return
      pendingMarkerCoords = ev.latlng
      markerName.value = ''
      markerNote.value = ''
      markerPollutant.value = ''
      markerType.value = 'clean'
      markerSeverity.value = 'средняя'
      markerNoteGroup.style.display = 'block'
      markerSeverityGroup.style.display = 'none'
      markerPollutantGroup.style.display = 'none'
      markerModal.classList.add('show')
      markerName.focus()
    })

    // Закрытие модального окна
    function closeModal() {
      markerModal.classList.remove('show')
      addPointMode = false
      btnAddPoint.textContent = 'Добавить точку кликом'
      btnAddPoint.style.background = ''
      pendingMarkerCoords = null
    }

    modalClose.addEventListener('click', closeModal)
    markerCancel.addEventListener('click', closeModal)
    markerModal.addEventListener('click', (e) => {
      if (e.target === markerModal) closeModal()
    })

    // Отправка формы
    function submitMarker() {
      if (!pendingMarkerCoords) return
      const name = markerName.value.trim()
      if (!name) {
        markerName.focus()
        markerName.style.borderColor = 'var(--danger)'
        setTimeout(() => {
          markerName.style.borderColor = ''
        }, 2000)
        return
      }
      const { lat, lng } = pendingMarkerCoords
      
      if (markerType.value === 'clean') {
        cleanPlaces.push({ 
          name, 
          coords: [lat, lng], 
          note: markerNote.value.trim() || '' 
        })
        customCleanPlaces.push({
          name,
          coords: [lat, lng],
          note: markerNote.value.trim() || ''
        })
        persistCustomPlaces(CUSTOM_CLEAN_PLACES_KEY, customCleanPlaces)
      } else {
        dirtyPlaces.push({ 
          name, 
          coords: [lat, lng], 
          severity: markerSeverity.value || 'средняя', 
          pollutant: markerPollutant.value.trim() || '' 
        })
        customDirtyPlaces.push({
          name,
          coords: [lat, lng],
          severity: markerSeverity.value || 'средняя',
          pollutant: markerPollutant.value.trim() || ''
        })
        persistCustomPlaces(CUSTOM_DIRTY_PLACES_KEY, customDirtyPlaces)
      }
      closeModal()
      rerender()
    }

    markerSubmit.addEventListener('click', submitMarker)
    
    // Отправка по Enter
    markerName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        submitMarker()
      }
    })
    markerNote.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault()
        submitMarker()
      }
    })
    markerPollutant.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault()
        submitMarker()
      }
    })

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && markerModal.classList.contains('show')) {
        closeModal()
      }
    })
  }

  // Диаграммы (демо)
  let emittersChart = null
  let emittersChartPage = 0
  const EMITTERS_CHART_PAGE_SIZE = 5
  let emittersChartPrevBtn = null
  let emittersChartNextBtn = null
  let emittersChartPageInfo = null
  function initCharts() {
    const airCtx = document.getElementById('airChart')
    const waterCtx = document.getElementById('waterChart')
    const emittersCtx = document.getElementById('emittersChart')

    // Воздух: PM2.5, PM10, NO2, SO2
    if (airCtx && typeof Chart !== 'undefined') {
      new Chart(airCtx, {
        type: 'line',
        data: {
          labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
          datasets: [
            { label: 'PM2.5', data: [18, 22, 19, 16, 14, 12, 11, 12, 15, 18, 20, 23], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.15)', tension: 0.35, fill: true },
            { label: 'PM10', data: [28, 30, 27, 24, 20, 18, 16, 17, 19, 23, 25, 29], borderColor: '#6ee7b7', backgroundColor: 'rgba(110,231,183,0.15)', tension: 0.35, fill: true },
            { label: 'NO₂', data: [24, 26, 22, 20, 18, 17, 16, 16, 18, 21, 22, 24], borderColor: '#a7f3d0', backgroundColor: 'rgba(167,243,208,0.1)', tension: 0.35, fill: true },
            { label: 'SO₂', data: [10, 11, 10, 9, 8, 7, 7, 7, 8, 9, 10, 11], borderColor: '#86efac', backgroundColor: 'rgba(134,239,172,0.1)', tension: 0.35, fill: true },
          ]
        },
        options: {
          plugins: {
            legend: { labels: { color: '#e8f1ee' } },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const y = ctx.parsed.y
                  const name = ctx.dataset && ctx.dataset.label ? ctx.dataset.label : 'Значение'
                  return name + ': ' + y
                }
              }
            }
          },
          scales: {
            x: { ticks: { color: '#b6c4bf' }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#b6c4bf' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      })
    }

    // Вода: мутность, нитраты, БПК5, pH (относительно)
    if (waterCtx && typeof Chart !== 'undefined') {
      new Chart(waterCtx, {
        type: 'radar',
        data: {
          labels: ['Мутность', 'Нитраты', 'БПК5', 'pH', 'Жесткость'],
          datasets: [
            { label: 'Среднее по регионам', data: [65, 52, 58, 70, 60], backgroundColor: 'rgba(52,199,89,0.15)', borderColor: '#34c759' },
            { label: 'Брянская область', data: [60, 48, 62, 72, 58], backgroundColor: 'rgba(110,231,183,0.12)', borderColor: '#6ee7b7' }
          ]
        },
        options: {
          plugins: {
            legend: { labels: { color: '#e8f1ee' } },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const name = ctx.dataset && ctx.dataset.label ? ctx.dataset.label : 'Значение'
                  const v = ctx.parsed.r
                  return name + ': ' + v
                }
              }
            }
          },
          scales: {
            r: {
              angleLines: { color: 'rgba(255,255,255,0.06)' },
              grid: { color: 'rgba(255,255,255,0.06)' },
              pointLabels: { color: '#b6c4bf' },
              ticks: { display: false }
            }
          }
        }
      })
    }

    // Предприятия: горизонтальные бары (демоданные)
    if (emittersCtx && typeof Chart !== 'undefined') {
      emittersChartPrevBtn = document.getElementById('emittersChartPrev')
      emittersChartNextBtn = document.getElementById('emittersChartNext')
      emittersChartPageInfo = document.getElementById('emittersChartPageInfo')

      try {
        const saved = localStorage.getItem('bryanskOverviewEmittersChartPage')
        const n = saved != null ? Number(saved) : 0
        if (Number.isFinite(n) && n >= 0) emittersChartPage = Math.floor(n)
      } catch (e) {}

      function clampEmittersChartPage(totalPages) {
        const tp = totalPages || 1
        if (!Number.isFinite(emittersChartPage)) emittersChartPage = 0
        if (emittersChartPage < 0) emittersChartPage = 0
        if (emittersChartPage > tp - 1) emittersChartPage = tp - 1
      }

      function getEmittersSlice() {
        const total = Array.isArray(emitters) ? emitters.length : 0
        const totalPages = Math.max(1, Math.ceil(total / EMITTERS_CHART_PAGE_SIZE))
        clampEmittersChartPage(totalPages)
        const start = emittersChartPage * EMITTERS_CHART_PAGE_SIZE
        return emitters.slice(start, start + EMITTERS_CHART_PAGE_SIZE)
      }

      function updateEmittersChartAndList() {
        const total = Array.isArray(emitters) ? emitters.length : 0
        const totalPages = Math.max(1, Math.ceil(total / EMITTERS_CHART_PAGE_SIZE))
        clampEmittersChartPage(totalPages)
        const start = emittersChartPage * EMITTERS_CHART_PAGE_SIZE
        const end = Math.min(total, start + EMITTERS_CHART_PAGE_SIZE)
        const pageItems = emitters.slice(start, end)

        if (emittersChartPageInfo) emittersChartPageInfo.textContent = total
          ? ('Показано: ' + (start + 1) + '-' + end + ' из ' + total)
          : 'Нет данных'

        if (emittersChartPrevBtn) emittersChartPrevBtn.disabled = emittersChartPage <= 0
        if (emittersChartNextBtn) emittersChartNextBtn.disabled = emittersChartPage >= totalPages - 1

        // Список предприятий тоже показываем постранично
        renderEmittersList(pageItems)

        // График обновляем только постранично
        if (emittersChart) {
          const labels = pageItems.map((e) => e.name)
          const data = pageItems.map((e) => e.percent)
          emittersChart.data.labels = labels
          if (emittersChart.data.datasets && emittersChart.data.datasets[0]) {
            emittersChart.data.datasets[0].data = data
          }
          emittersChart.update()
        }
      }

      // Навигация стрелками (влево/вправо)
      if (emittersChartPrevBtn) {
        emittersChartPrevBtn.addEventListener('click', () => {
          emittersChartPage = Math.max(0, emittersChartPage - 1)
          try { localStorage.setItem('bryanskOverviewEmittersChartPage', String(emittersChartPage)) } catch (e) {}
          updateEmittersChartAndList()
        })
      }
      if (emittersChartNextBtn) {
        emittersChartNextBtn.addEventListener('click', () => {
          const total = Array.isArray(emitters) ? emitters.length : 0
          const totalPages = Math.max(1, Math.ceil(total / EMITTERS_CHART_PAGE_SIZE))
          emittersChartPage = Math.min(totalPages - 1, emittersChartPage + 1)
          try { localStorage.setItem('bryanskOverviewEmittersChartPage', String(emittersChartPage)) } catch (e) {}
          updateEmittersChartAndList()
        })
      }

      // Создаём график на первой странице
      const pageItems = getEmittersSlice()
      const labels = pageItems.map((e) => e.name)
      const data = pageItems.map((e) => e.percent)
      emittersChart = new Chart(emittersCtx, {
        type: 'bar',
        data: { labels, datasets: [{ label: '% вклада', data, backgroundColor: '#ef4444' }] },
        options: {
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const v = ctx.parsed.x
                  return 'Вклад: ' + v + '%'
                }
              }
            }
          },
          scales: {
            x: { ticks: { color: '#b6c4bf', callback: (v) => v + '%' }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#e8f1ee' }, grid: { display: false } }
          }
        }
      })

      // Кэш-функция обновления для случаев, когда emitters меняются
      // (rebuildEmitters вызывает её, если график уже создан)
      if (typeof window !== 'undefined') window.__bryanskUpdateEmittersChart = updateEmittersChartAndList
      updateEmittersChartAndList()
    }
  }

  // Админ-панель (обширная): расширенные настройки демо и карты
  let adminEmittersCheckbox = null
  function initAdminPanel() {
    const panel = document.getElementById('overviewAdminPanel')
    if (!panel) return

    const input = document.getElementById('overviewAdminPassword')
    const unlockBtn = document.getElementById('overviewAdminUnlockBtn')
    const statusEl = document.getElementById('overviewAdminStatus')
    const controls = document.getElementById('overviewAdminControls')
    if (!input || !unlockBtn || !controls) return

    const UNLOCK_KEY = 'bryanskOverviewAdminUnlocked'
    const ADMIN_PASS = '123'

    const adminToggleClean = document.getElementById('overviewAdminToggleClean')
    const adminToggleDirty = document.getElementById('overviewAdminToggleDirty')
    const adminToggleClusters = document.getElementById('overviewAdminToggleClusters')
    const adminToggleHeat = document.getElementById('overviewAdminToggleHeat')
    const adminToggleGreen = document.getElementById('overviewAdminToggleGreen')
    adminEmittersCheckbox = document.getElementById('overviewAdminToggleEmitters')

    const btnResetPoints = document.getElementById('overviewAdminBtnResetPoints')
    const btnRerender = document.getElementById('overviewAdminBtnRerender')
    const btnResetAll = document.getElementById('overviewAdminBtnResetAll')

    const mapToggleClean = document.getElementById('toggleClean')
    const mapToggleDirty = document.getElementById('toggleDirty')
    const mapToggleClusters = document.getElementById('toggleClusters')
    const mapToggleHeat = document.getElementById('toggleHeat')
    const mapToggleGreen = document.getElementById('toggleGreen')
    const btnAddPoint = document.getElementById('btnAddPoint')

    if (!adminToggleClean || !adminToggleDirty || !adminToggleClusters || !adminToggleHeat || !adminToggleGreen || !adminEmittersCheckbox) return

    function setMapToggle(el, value) {
      if (!el) return
      el.checked = !!value
      // событие обязательно, чтобы сработали обработчики applyToggles/persistCurrentToggles
      try { el.dispatchEvent(new Event('change', { bubbles: true })) } catch (e) {}
    }

    function syncAdminFromMap() {
      adminToggleClean.checked = !!mapToggleClean?.checked
      adminToggleDirty.checked = !!mapToggleDirty?.checked
      adminToggleClusters.checked = !!mapToggleClusters?.checked
      adminToggleHeat.checked = !!mapToggleHeat?.checked
      adminToggleGreen.checked = !!mapToggleGreen?.checked
      adminEmittersCheckbox.checked = getEmittersVisible()
    }

    function applyAdminState() {
      const unlocked = (sessionStorage.getItem(UNLOCK_KEY) === '1')
      if (unlocked) {
        input.closest('.admin-row') && (input.closest('.admin-row').style.display = 'none')
        controls.style.display = ''
        syncAdminFromMap()
      } else {
        input.closest('.admin-row') && (input.closest('.admin-row').style.display = '')
        controls.style.display = 'none'
      }
    }

    unlockBtn.addEventListener('click', () => {
      const v = (input.value || '').trim()
      if (v === ADMIN_PASS) {
        try { sessionStorage.setItem(UNLOCK_KEY, '1') } catch (e) {}
        if (statusEl) statusEl.textContent = ''
        applyAdminState()
      } else {
        if (statusEl) statusEl.textContent = 'Неверный пароль.'
      }
    })

    adminToggleClean.addEventListener('change', () => setMapToggle(mapToggleClean, adminToggleClean.checked))
    adminToggleDirty.addEventListener('change', () => setMapToggle(mapToggleDirty, adminToggleDirty.checked))
    adminToggleClusters.addEventListener('change', () => setMapToggle(mapToggleClusters, adminToggleClusters.checked))
    adminToggleHeat.addEventListener('change', () => setMapToggle(mapToggleHeat, adminToggleHeat.checked))
    adminToggleGreen.addEventListener('change', () => setMapToggle(mapToggleGreen, adminToggleGreen.checked))

    adminEmittersCheckbox.addEventListener('change', () => {
      setEmittersVisible(!!adminEmittersCheckbox.checked)
    })

    function closeMarkerModal() {
      const modal = document.getElementById('markerModal')
      if (modal) modal.classList.remove('show')
    }

    if (btnResetPoints) {
      btnResetPoints.addEventListener('click', () => {
        closeMarkerModal()
        addPointMode = false
        try { localStorage.setItem(ADD_POINT_MODE_KEY, '0') } catch (e) {}
        if (btnAddPoint) {
          btnAddPoint.textContent = 'Добавить точку кликом'
          btnAddPoint.style.background = ''
        }

        if (cleanPlacesBaseline && dirtyPlacesBaseline) {
          cleanPlaces = cleanPlacesBaseline.map((p) => ({ ...p, coords: [p.coords[0], p.coords[1]] }))
          dirtyPlaces = dirtyPlacesBaseline.map((p) => ({ ...p, coords: [p.coords[0], p.coords[1]] }))
        }
        rerender()
        syncAdminFromMap()
      })
    }

    if (btnRerender) {
      btnRerender.addEventListener('click', () => {
        rerender()
        syncAdminFromMap()
      })
    }

    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => {
        closeMarkerModal()
        addPointMode = false
        try {
          localStorage.removeItem(MAP_TOGGLES_KEY)
          localStorage.removeItem(EMITTERS_VISIBLE_KEY)
          localStorage.removeItem(ADD_POINT_MODE_KEY)
        } catch (e) {}

        // значения по умолчанию (как в разметке)
        setMapToggle(mapToggleClean, true)
        setMapToggle(mapToggleDirty, true)
        setMapToggle(mapToggleClusters, true)
        setMapToggle(mapToggleHeat, false)
        setMapToggle(mapToggleGreen, true)
        setEmittersVisible(true)

        if (btnAddPoint) {
          btnAddPoint.textContent = 'Добавить точку кликом'
          btnAddPoint.style.background = ''
        }
        syncAdminFromMap()
      })
    }

    // cross-tab sync for admin controls (без дублирования событий change)
    window.addEventListener('storage', (e) => {
      if (!e || !e.key) return
      if (e.key === MAP_TOGGLES_KEY && e.newValue) {
        let obj = null
        try { obj = JSON.parse(e.newValue) } catch (err) {}
        if (!obj) return
        adminToggleClean.checked = !!obj.toggleClean
        adminToggleDirty.checked = !!obj.toggleDirty
        adminToggleClusters.checked = !!obj.toggleClusters
        adminToggleHeat.checked = !!obj.toggleHeat
        adminToggleGreen.checked = !!obj.toggleGreen
      }
      if (e.key === EMITTERS_VISIBLE_KEY) {
        adminEmittersCheckbox.checked = getEmittersVisible()
      }
    })

    applyAdminState()
  }


  function rerender() {
    // Перерисовать KPI, список и слои карты
    setKpis()
    renderPollutionList()
    if (map) {
      const cleanColor = '#22c55e'
      const dirtyColor = '#ef4444'
      function makeMarkerDivIcon(color) {
        return L.divIcon({
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          html: '<div style="width:12px;height:12px;border-radius:999px;background:' + color + ';border:2px solid rgba(0,0,0,0.25);box-shadow:0 6px 18px rgba(0,0,0,0.25);"></div>'
        })
      }

      map.removeLayer(cleanLayer)
      map.removeLayer(dirtyLayer)
      cleanLayer = L.layerGroup()
      dirtyLayer = L.layerGroup()
      cleanCluster.clearLayers()
      dirtyCluster.clearLayers()
      cleanPlaces.forEach((p) => {
        const marker = L.circleMarker(p.coords, {
          radius: 8,
          color: cleanColor,
          weight: 2,
          opacity: 1,
          fillColor: cleanColor,
          fillOpacity: 0.85
        })
          .bindPopup(`<strong>✅ ${p.name}</strong><br>${p.note || ''}`)
          .bindTooltip(p.name, { direction: 'top', offset: [0, -8] })
        cleanLayer.addLayer(marker)
        cleanCluster.addLayer(L.marker(p.coords, { title: p.name, icon: makeMarkerDivIcon(cleanColor) }))
      })
      dirtyPlaces.forEach((p) => {
        const marker = L.circleMarker(p.coords, {
          radius: 8,
          color: dirtyColor,
          weight: 2,
          opacity: 1,
          fillColor: dirtyColor,
          fillOpacity: 0.88
        })
          .bindPopup(`<strong>⚠️ ${p.name}</strong><br>Степень: ${p.severity || ''}<br>${p.pollutant || ''}`)
          .bindTooltip(p.name, { direction: 'top', offset: [0, -8] })
        dirtyLayer.addLayer(marker)
        dirtyCluster.addLayer(L.marker(p.coords, { title: p.name, icon: makeMarkerDivIcon(dirtyColor) }))
      })
      cleanLayer.addTo(map)
      dirtyLayer.addTo(map)
      const heatData = dirtyPlaces.map((p) => [...p.coords, p.severity === 'высокая' ? 0.9 : 0.5])
      if (heatLayer) heatLayer.setLatLngs(heatData)

      // Сохраняем состояние переключателей после добавления меток
      if (typeof applyTogglesFn === 'function') applyTogglesFn()
    }
  }

  function initGlobalAdminPanel() {
    const FAB_ID = 'globalAdminFab'
    const OVERLAY_ID = 'globalAdminOverlay'
    if (document.getElementById(FAB_ID) || document.getElementById(OVERLAY_ID)) return

    const fab = document.createElement('button')
    fab.id = FAB_ID
    fab.type = 'button'
    fab.className = 'global-admin-fab'
    fab.textContent = '🛠️ Админ'
    document.body.appendChild(fab)

    const overlay = document.createElement('div')
    overlay.id = OVERLAY_ID
    overlay.className = 'global-admin-overlay'
    overlay.setAttribute('aria-hidden', 'true')

    overlay.innerHTML = `
      <div class="global-admin-modal" role="dialog" aria-modal="true" aria-label="Админ-панель">
        <div class="global-admin-header">
          <div>
            <h3>Админ-панель</h3>
            <p id="globalAdminStateText"></p>
          </div>
          <button type="button" class="global-admin-close" id="globalAdminCloseBtn" aria-label="Закрыть">×</button>
        </div>
        <div class="global-admin-body">
          <div id="globalAdminLocked" style="display:none;">
            <div class="card">
              <h3 style="margin-top:0;">Вход</h3>
              <p class="muted" style="margin-top:6px;">Пароль для демо: <strong>123</strong></p>
              <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px;">
                <input id="globalAdminPassword" type="password" class="form-input" placeholder="Введите пароль" />
                <button id="globalAdminUnlockBtn" type="button" class="btn">Войти</button>
              </div>
              <p id="globalAdminLockMsg" class="muted" style="margin-top:10px;font-size:13px;"></p>
            </div>
          </div>

          <div id="globalAdminUnlocked" style="display:none;">
            <div class="global-admin-tabs" role="tablist">
              <button type="button" class="global-admin-tab-btn active" data-tab="nav">Навигация</button>
              <button type="button" class="global-admin-tab-btn" data-tab="map">Карта</button>
              <button type="button" class="global-admin-tab-btn" data-tab="data">Данные</button>
              <button type="button" class="global-admin-tab-btn" data-tab="mode">Режим</button>
            </div>

            <div class="global-admin-tab-panel active" id="globalAdminTab-nav">
              <div class="grid-2">
                <div class="card">
                  <h3 style="margin-top:0;">Переходы</h3>
                  <div style="display:grid;gap:10px;margin-top:8px;">
                    <a class="btn-link" href="index.html">Главная</a>
                    <a class="btn-link" href="overview.html">Обзор</a>
                    <a class="btn-link" href="personal.html">Личный вклад</a>
                    <a class="btn-link" href="news.html">Новости</a>
                    <a class="btn-link" href="comparison.html">Сравнение</a>
                    <a class="btn-link" href="requirements.html">Требования</a>
                  </div>
                  <div style="margin-top:12px;">
                    <button type="button" id="globalAdminOpenSurvey" class="btn btn-secondary" style="width:100%;">Открыть анкету</button>
                  </div>
                </div>
                <div class="card">
                  <h3 style="margin-top:0;">Доступ</h3>
                  <p class="muted" style="margin-top:8px;">Активирует расширенные слои карты и предприятия.</p>
                  <div class="global-admin-divider"></div>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button type="button" id="globalAdminApplyAll" class="btn">Показать всё</button>
                    <button type="button" id="globalAdminLogout" class="btn btn-secondary">Выйти</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="global-admin-tab-panel" id="globalAdminTab-map">
              <div class="card">
                <h3 style="margin-top:0;">Слои карты</h3>
                <div style="display:grid;gap:10px;margin-top:12px;">
                  <label style="display:flex;gap:10px;align-items:center;"><input type="checkbox" id="adminToggleClean" /> Чистые локации</label>
                  <label style="display:flex;gap:10px;align-items:center;"><input type="checkbox" id="adminToggleDirty" /> Проблемные локации</label>
                  <label style="display:flex;gap:10px;align-items:center;"><input type="checkbox" id="adminToggleClusters" /> Кластеры</label>
                  <label style="display:flex;gap:10px;align-items:center;"><input type="checkbox" id="adminToggleHeat" /> Тепловая карта</label>
                  <label style="display:flex;gap:10px;align-items:center;"><input type="checkbox" id="adminToggleGreen" /> Зелёные точки</label>
                  <label style="display:flex;gap:10px;align-items:center;"><input type="checkbox" id="adminToggleEmitters" /> Предприятия-загрязнители</label>
                  <label style="display:flex;gap:10px;align-items:center;"><input type="checkbox" id="adminToggleAddPointMode" /> Добавление точек кликом</label>
                </div>
                <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
                  <button type="button" id="globalAdminApplyMap" class="btn">Применить</button>
                </div>
              </div>
            </div>

            <div class="global-admin-tab-panel" id="globalAdminTab-data">
              <div class="card">
                <h3 style="margin-top:0;">Демо-данные</h3>
                <p class="muted" style="margin-top:8px;">Очищает локальные сохранения в браузере.</p>
                <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
                  <button type="button" id="globalAdminResetLocal" class="btn btn-secondary">Очистить</button>
                </div>
                <p id="globalAdminDataMsg" class="muted" style="margin-top:10px;font-size:13px;"></p>

                <div class="global-admin-divider" style="margin:16px 0;"></div>

                <h3 style="margin:0 0 8px; font-size:16px;">Экспорт/Импорт (JSON)</h3>
                <p class="muted" style="margin-top:0; font-size:13px; line-height:1.5;">
                  Экспортирует выбранные данные из браузера. Импорт заменяет значения в localStorage.
                </p>
                <div style="display:grid;gap:10px;">
                  <textarea id="globalAdminExportArea" rows="6" class="form-input" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"></textarea>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button type="button" id="globalAdminExportBtn" class="btn">Экспорт</button>
                    <button type="button" id="globalAdminExportFillBtn" class="btn btn-secondary">Заполнить автоматически</button>
                  </div>
                  <textarea id="globalAdminImportArea" rows="6" class="form-input" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"></textarea>
                  <button type="button" id="globalAdminImportBtn" class="btn btn-secondary">Импорт</button>
                  <p id="globalAdminImportMsg" class="muted" style="margin:0; font-size:13px;"></p>
                </div>

                <div class="global-admin-divider" style="margin:16px 0;"></div>

                <h3 style="margin:0 0 8px; font-size:16px;">Парсер точек на карте</h3>
                <p class="muted" style="margin-top:0; font-size:13px; line-height:1.5;">
                  Формат строк: <strong>lat,lon | название | доп.поле</strong>.
                  Для грязных точек доп.поле = <strong>степень (высокая/средняя)</strong> и <strong>загрязнитель</strong> через ;.
                  Пример грязных: <em>52.56,33.84 | Промка | средняя; PM10, NO₂</em>
                </p>
                <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:10px;">
                  <select id="globalAdminParserPointsTarget" class="form-input" style="min-width:220px;">
                    <option value="clean">Чистая точка</option>
                    <option value="dirty">Проблемная точка</option>
                  </select>
                  <button type="button" id="globalAdminClearCustomPointsBtn" class="btn btn-secondary">Очистить пользовательские точки</button>
                </div>
                <textarea id="globalAdminParserPointsInput" rows="6" class="form-input" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"></textarea>
                <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                  <button type="button" id="globalAdminParserPointsAddBtn" class="btn">Добавить</button>
                  <button type="button" id="globalAdminParserPointsPreviewBtn" class="btn btn-secondary">Показать превью</button>
                </div>
                <p id="globalAdminParserPointsMsg" class="muted" style="margin:0; margin-top:8px; font-size:13px;"></p>

                <div class="global-admin-divider" style="margin:16px 0;"></div>

                <h3 style="margin:0 0 8px; font-size:16px;">Парсер предприятий (заводы)</h3>
                <p class="muted" style="margin-top:0; font-size:13px; line-height:1.5;">
                  Формат строк: <strong>lat,lon | название | степень | вклад% | загрязнители</strong>.
                  Пример: <em>53.29,34.29 | Завод X | высокая | 12 | PM10, NO₂</em>
                </p>
                <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:10px;">
                  <button type="button" id="globalAdminClearCustomEmittersBtn" class="btn btn-secondary">Сбросить пользовательские предприятия</button>
                </div>
                <textarea id="globalAdminParserEmittersInput" rows="6" class="form-input" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"></textarea>
                <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                  <button type="button" id="globalAdminParserEmittersAddBtn" class="btn">Загрузить</button>
                  <button type="button" id="globalAdminParserEmittersPreviewBtn" class="btn btn-secondary">Показать превью</button>
                </div>
                <p id="globalAdminParserEmittersMsg" class="muted" style="margin:0; margin-top:8px; font-size:13px;"></p>

                <div class="global-admin-divider" style="margin:16px 0;"></div>

                <h3 style="margin:0 0 8px; font-size:16px;">Доп. действия (предприятия)</h3>
                <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:6px;">
                  <button type="button" id="globalAdminNormalizeCustomEmittersBtn" class="btn btn-secondary">Нормализовать % пользовательских до 100</button>
                </div>
                <p id="globalAdminNormalizeEmittersMsg" class="muted" style="margin:0; font-size:13px;"></p>

                <h3 style="margin:0 0 8px; font-size:16px;">Табличный редактор</h3>
                <p class="muted" style="margin-top:0; font-size:13px; line-height:1.5;">
                  Можно менять поля и удалять строки. Изменения применяются на карту и в списки сразу.
                </p>
                <div style="display:grid; gap:12px;">
                  <div class="card" style="padding:12px;">
                    <h4 style="margin:0 0 8px; font-size:14px;">Чистые точки</h4>
                    <div id="globalAdminEditorClean"></div>
                  </div>
                  <div class="card" style="padding:12px;">
                    <h4 style="margin:0 0 8px; font-size:14px;">Проблемные точки</h4>
                    <div id="globalAdminEditorDirty"></div>
                  </div>
                  <div class="card" style="padding:12px;">
                    <h4 style="margin:0 0 8px; font-size:14px;">Предприятия (заводы)</h4>
                    <div id="globalAdminEditorEmitters"></div>
                  </div>
                </div>
                <p id="globalAdminEditorMsg" class="muted" style="margin:10px 0 0; font-size:13px;"></p>
              </div>
            </div>

            <div class="global-admin-tab-panel" id="globalAdminTab-mode">
              <div class="card">
                <h3 style="margin-top:0;">Режим главной</h3>
                <p class="muted" style="margin-top:8px;">Устанавливает bryanskEcoMode и ведёт на главную.</p>
                <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
                  <button type="button" id="globalAdminModeEco" class="btn">Экология</button>
                  <button type="button" id="globalAdminModeHistory" class="btn btn-secondary">История</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    const closeBtn = overlay.querySelector('#globalAdminCloseBtn')
    const lockedRoot = overlay.querySelector('#globalAdminLocked')
    const unlockedRoot = overlay.querySelector('#globalAdminUnlocked')
    const stateText = overlay.querySelector('#globalAdminStateText')
    const unlockBtn = overlay.querySelector('#globalAdminUnlockBtn')
    const passInput = overlay.querySelector('#globalAdminPassword')
    const lockMsg = overlay.querySelector('#globalAdminLockMsg')
    const logoutBtn = overlay.querySelector('#globalAdminLogout')
    const applyAllBtn = overlay.querySelector('#globalAdminApplyAll')
    const applyMapBtn = overlay.querySelector('#globalAdminApplyMap')
    const resetLocalBtn = overlay.querySelector('#globalAdminResetLocal')
    const dataMsg = overlay.querySelector('#globalAdminDataMsg')
    const exportArea = overlay.querySelector('#globalAdminExportArea')
    const exportBtn = overlay.querySelector('#globalAdminExportBtn')
    const exportFillBtn = overlay.querySelector('#globalAdminExportFillBtn')
    const importArea = overlay.querySelector('#globalAdminImportArea')
    const importBtn = overlay.querySelector('#globalAdminImportBtn')
    const importMsg = overlay.querySelector('#globalAdminImportMsg')

    const parserPointsTarget = overlay.querySelector('#globalAdminParserPointsTarget')
    const clearCustomPointsBtn = overlay.querySelector('#globalAdminClearCustomPointsBtn')
    const parserPointsInput = overlay.querySelector('#globalAdminParserPointsInput')
    const parserPointsAddBtn = overlay.querySelector('#globalAdminParserPointsAddBtn')
    const parserPointsPreviewBtn = overlay.querySelector('#globalAdminParserPointsPreviewBtn')
    const parserPointsMsg = overlay.querySelector('#globalAdminParserPointsMsg')

    const clearCustomEmittersBtn = overlay.querySelector('#globalAdminClearCustomEmittersBtn')
    const parserEmittersInput = overlay.querySelector('#globalAdminParserEmittersInput')
    const parserEmittersAddBtn = overlay.querySelector('#globalAdminParserEmittersAddBtn')
    const parserEmittersPreviewBtn = overlay.querySelector('#globalAdminParserEmittersPreviewBtn')
    const parserEmittersMsg = overlay.querySelector('#globalAdminParserEmittersMsg')

    const normalizeCustomEmittersBtn = overlay.querySelector('#globalAdminNormalizeCustomEmittersBtn')
    const normalizeEmittersMsg = overlay.querySelector('#globalAdminNormalizeEmittersMsg')

    const editorCleanEl = overlay.querySelector('#globalAdminEditorClean')
    const editorDirtyEl = overlay.querySelector('#globalAdminEditorDirty')
    const editorEmittersEl = overlay.querySelector('#globalAdminEditorEmitters')
    const editorMsgEl = overlay.querySelector('#globalAdminEditorMsg')
    const modeEcoBtn = overlay.querySelector('#globalAdminModeEco')
    const modeHistoryBtn = overlay.querySelector('#globalAdminModeHistory')
    const openSurveyBtn = overlay.querySelector('#globalAdminOpenSurvey')

    const tabButtons = overlay.querySelectorAll('.global-admin-tab-btn')
    const tabPanels = overlay.querySelectorAll('.global-admin-tab-panel')

    const ADMIN_TAB_KEY = 'bryanskGlobalAdminActiveTab'

    function activateAdminTab(tabId) {
      if (!tabId) return
      tabButtons.forEach((b) => {
        const t = b.getAttribute('data-tab')
        b.classList.toggle('active', t === tabId)
      })
      tabPanels.forEach((p) => p.classList.remove('active'))
      const active = overlay.querySelector('#globalAdminTab-' + tabId)
      if (active) active.classList.add('active')
    }

    try {
      const savedTab = localStorage.getItem(ADMIN_TAB_KEY)
      if (savedTab && overlay.querySelector('#globalAdminTab-' + savedTab)) activateAdminTab(savedTab)
    } catch (e) {}

    function readSavedMapToggles() {
      try {
        const raw = localStorage.getItem(MAP_TOGGLES_KEY)
        if (!raw) return null
        return JSON.parse(raw)
      } catch (e) {
        return null
      }
    }

    function syncMapCheckboxes() {
      const t = readSavedMapToggles()
      const adminToggleClean = overlay.querySelector('#adminToggleClean')
      const adminToggleDirty = overlay.querySelector('#adminToggleDirty')
      const adminToggleClusters = overlay.querySelector('#adminToggleClusters')
      const adminToggleHeat = overlay.querySelector('#adminToggleHeat')
      const adminToggleGreen = overlay.querySelector('#adminToggleGreen')
      const adminToggleEmitters = overlay.querySelector('#adminToggleEmitters')
      const adminToggleAddPointMode = overlay.querySelector('#adminToggleAddPointMode')
      if (!adminToggleClean || !adminToggleDirty || !adminToggleClusters || !adminToggleHeat || !adminToggleGreen || !adminToggleEmitters || !adminToggleAddPointMode) return

      if (t) {
        adminToggleClean.checked = !!t.toggleClean
        adminToggleDirty.checked = !!t.toggleDirty
        adminToggleClusters.checked = !!t.toggleClusters
        adminToggleHeat.checked = !!t.toggleHeat
        adminToggleGreen.checked = !!t.toggleGreen
      } else {
        adminToggleClean.checked = true
        adminToggleDirty.checked = true
        adminToggleClusters.checked = true
        adminToggleHeat.checked = false
        adminToggleGreen.checked = true
      }
      adminToggleEmitters.checked = getEmittersVisible()

      try {
        const ap = localStorage.getItem(ADD_POINT_MODE_KEY)
        adminToggleAddPointMode.checked = ap === '1'
      } catch (e) {
        adminToggleAddPointMode.checked = false
      }
    }

    function renderState() {
      const unlocked = isGlobalAdminUnlocked()
      if (!lockedRoot || !unlockedRoot) return
      if (unlocked) {
        lockedRoot.style.display = 'none'
        unlockedRoot.style.display = ''
        if (stateText) stateText.textContent = 'Статус: админ разблокирован'
        syncMapCheckboxes()
      } else {
        lockedRoot.style.display = ''
        unlockedRoot.style.display = 'none'
        if (stateText) stateText.textContent = 'Статус: закрыто'
      }
    }

    function applyAllAccess() {
      try {
        localStorage.setItem(EMITTERS_VISIBLE_KEY, '1')
        localStorage.setItem(
          MAP_TOGGLES_KEY,
          JSON.stringify({
            toggleClean: true,
            toggleDirty: true,
            toggleClusters: true,
            toggleHeat: true,
            toggleGreen: true
          })
        )
        localStorage.setItem(ADD_POINT_MODE_KEY, '0')
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('bryanskAdminAccessChanged'))
    }

    function openPanel() {
      overlay.classList.add('open')
      overlay.setAttribute('aria-hidden', 'false')
      renderState()
    }

    function closePanel() {
      overlay.classList.remove('open')
      overlay.setAttribute('aria-hidden', 'true')
      if (lockMsg) lockMsg.textContent = ''
    }

    fab.addEventListener('click', openPanel)
    if (closeBtn) closeBtn.addEventListener('click', closePanel)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePanel()
    })
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel()
    })

    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        const v = (passInput && passInput.value ? passInput.value : '').trim()
        if (v === GLOBAL_ADMIN_PASS) {
          try { localStorage.setItem(GLOBAL_ADMIN_KEY, '1') } catch (e) {}
          if (lockMsg) lockMsg.textContent = ''
          applyAllAccess()
          renderState()
        } else {
          if (lockMsg) lockMsg.textContent = 'Неверный пароль.'
        }
      })
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        try { localStorage.removeItem(GLOBAL_ADMIN_KEY) } catch (e) {}
        window.dispatchEvent(new CustomEvent('bryanskAdminAccessChanged'))
        renderState()
      })
    }

    if (applyAllBtn) {
      applyAllBtn.addEventListener('click', () => {
        applyAllAccess()
        renderState()
      })
    }

    if (applyMapBtn) {
      applyMapBtn.addEventListener('click', () => {
        const adminToggleClean = overlay.querySelector('#adminToggleClean')
        const adminToggleDirty = overlay.querySelector('#adminToggleDirty')
        const adminToggleClusters = overlay.querySelector('#adminToggleClusters')
        const adminToggleHeat = overlay.querySelector('#adminToggleHeat')
        const adminToggleGreen = overlay.querySelector('#adminToggleGreen')
        const adminToggleEmitters = overlay.querySelector('#adminToggleEmitters')
        const adminToggleAddPointMode = overlay.querySelector('#adminToggleAddPointMode')
        if (!adminToggleClean || !adminToggleDirty || !adminToggleClusters || !adminToggleHeat || !adminToggleGreen || !adminToggleEmitters || !adminToggleAddPointMode) return

        try {
          localStorage.setItem(
            MAP_TOGGLES_KEY,
            JSON.stringify({
              toggleClean: !!adminToggleClean.checked,
              toggleDirty: !!adminToggleDirty.checked,
              toggleClusters: !!adminToggleClusters.checked,
              toggleHeat: !!adminToggleHeat.checked,
              toggleGreen: !!adminToggleGreen.checked
            })
          )
          localStorage.setItem(EMITTERS_VISIBLE_KEY, adminToggleEmitters.checked ? '1' : '0')
          localStorage.setItem(ADD_POINT_MODE_KEY, adminToggleAddPointMode.checked ? '1' : '0')
        } catch (e) {}
        window.dispatchEvent(new CustomEvent('bryanskAdminAccessChanged'))
        renderState()
      })
    }

    if (resetLocalBtn) {
      resetLocalBtn.addEventListener('click', () => {
        try {
          var keys = [
            'customCleanPlaces',
            'customDirtyPlaces',
            'bryanskNewsActiveTab',
            'bryanskPersonalTestsActivePane',
            'bryanskDocSidebarOpen',
            'bryanskDocSidebarActiveTab',
            'bryanskOverviewMapToggles',
            'bryanskOverviewEmittersVisible',
            'bryanskOverviewAddPointMode',
            'ecoHabits',
            'ecoToday',
            'ecoSelectedTips',
            'ecoChallengeDays',
            'ecoPledge',
            'ecoQuizActivist',
            'ecoQuizFootprint',
            'ecoQuizRegion',
            'bryanskSurveyAnswers',
            CUSTOM_EMITTERS_KEY
          ]
          for (var i = 0; i < keys.length; i++) localStorage.removeItem(keys[i])
        } catch (e) {}
        if (dataMsg) dataMsg.textContent = 'Очищено.'
      })
    }

    // --- Экспорт/Импорт, парсеры и расширенные действия ---
    const exportKeys = [
      'bryanskEcoMode',
      'bryanskNewsActiveTab',
      'bryanskPersonalTestsActivePane',
      'bryanskDocSidebarOpen',
      'bryanskDocSidebarActiveTab',
      MAP_TOGGLES_KEY,
      EMITTERS_VISIBLE_KEY,
      ADD_POINT_MODE_KEY,
      'ecoHabits',
      'ecoToday',
      'ecoSelectedTips',
      'ecoChallengeDays',
      'ecoPledge',
      'ecoQuizActivist',
      'ecoQuizFootprint',
      'ecoQuizRegion',
      'bryanskSurveyAnswers',
      'customCleanPlaces',
      'customDirtyPlaces',
      CUSTOM_EMITTERS_KEY
    ]

    function buildExportPayload() {
      const items = {}
      for (let i = 0; i < exportKeys.length; i++) {
        const k = exportKeys[i]
        try {
          const v = localStorage.getItem(k)
          if (v != null) items[k] = v
        } catch (e) {}
      }
      return JSON.stringify({
        meta: { exportedAt: new Date().toISOString(), app: 'bryansk-eco-demo' },
        items
      }, null, 2)
    }

    function safeSetLocalStorageValue(k, v) {
      try {
        const value = (typeof v === 'string') ? v : JSON.stringify(v)
        localStorage.setItem(k, value)
      } catch (e) {}
    }

    function refreshFromStorage() {
      // пользовательские точки
      customCleanPlaces = loadCustomPlaces(CUSTOM_CLEAN_PLACES_KEY, 'clean')
      customDirtyPlaces = loadCustomPlaces(CUSTOM_DIRTY_PLACES_KEY, 'dirty')
      cleanPlaces = cleanPlacesDemo.concat(customCleanPlaces)
      dirtyPlaces = dirtyPlacesDemo.concat(customDirtyPlaces)

      // пользовательские предприятия
      customEmitters = loadCustomEmitters()

      rebuildEmitters()
      rerender()
      try {
        if (typeof applyTogglesFn === 'function') applyTogglesFn()
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('bryanskAdminAccessChanged'))
    }

    function setMsg(el, text) {
      if (!el) return
      el.textContent = text || ''
    }

    if (exportFillBtn) {
      exportFillBtn.addEventListener('click', () => {
        if (exportArea) exportArea.value = buildExportPayload()
        setMsg(dataMsg, 'Экспорт сформирован.')
      })
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (exportArea) exportArea.value = buildExportPayload()
        setMsg(dataMsg, 'Экспорт готов. Можно копировать/скачивать.')
      })
    }

    if (importBtn) {
      importBtn.addEventListener('click', () => {
        setMsg(importMsg, '')
        if (!importArea) return
        const raw = importArea.value || ''
        if (!raw.trim()) {
          setMsg(importMsg, 'Вставьте JSON для импорта.')
          return
        }
        try {
          const parsed = JSON.parse(raw)
          const items = parsed && typeof parsed === 'object' ? (parsed.items || parsed) : null
          if (!items || typeof items !== 'object') throw new Error('Некорректный формат JSON')

          const keys = Object.keys(items)
          for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            safeSetLocalStorageValue(k, items[k])
          }

          refreshFromStorage()
          setMsg(importMsg, 'Импорт выполнен. Данные применены.')
          try { syncMapCheckboxes() } catch (e) {}
        } catch (e) {
          setMsg(importMsg, 'Ошибка импорта: ' + (e && e.message ? e.message : 'неизвестно'))
        }
      })
    }

    function parseCsvLikePoints(text, target) {
      const lines = (text || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && l.indexOf('#') !== 0)
      const parsed = []
      const errors = []
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const parts = line.split('|').map((p) => p.trim()).filter(Boolean)
        if (parts.length < 2) {
          errors.push('Строка ' + (i + 1) + ': не хватает частей')
          continue
        }
        const coordsStr = parts[0]
        const name = parts[1]
        const coordParts = coordsStr.split(',').map((p) => p.trim())
        if (coordParts.length < 2) {
          errors.push('Строка ' + (i + 1) + ': неверные координаты')
          continue
        }
        const lat = coerceNum(coordParts[0])
        const lon = coerceNum(coordParts[1])
        if (lat == null || lon == null) {
          errors.push('Строка ' + (i + 1) + ': неверные координаты')
          continue
        }
        if (target === 'clean') {
          const note = parts.length >= 3 ? parts.slice(2).join(' | ') : ''
          parsed.push({ name, coords: [lat, lon], note })
        } else {
          let severity = 'средняя'
          let pollutant = ''
          if (parts.length >= 4) {
            severity = parts[2]
            pollutant = parts[3]
          } else if (parts.length >= 3) {
            const sub = parts[2].split(';').map((p) => p.trim()).filter(Boolean)
            if (sub.length >= 1) severity = sub[0]
            if (sub.length >= 2) pollutant = sub.slice(1).join('; ')
          }
          severity = (severity === 'высокая') ? 'высокая' : 'средняя'
          pollutant = pollutant || ''
          parsed.push({ name, coords: [lat, lon], severity, pollutant })
        }
      }
      return { parsed, errors }
    }

    if (clearCustomPointsBtn) {
      clearCustomPointsBtn.addEventListener('click', () => {
        try { localStorage.removeItem(CUSTOM_CLEAN_PLACES_KEY) } catch (e) {}
        try { localStorage.removeItem(CUSTOM_DIRTY_PLACES_KEY) } catch (e) {}
        customCleanPlaces = []
        customDirtyPlaces = []
        cleanPlaces = cleanPlacesDemo.concat(customCleanPlaces)
        dirtyPlaces = dirtyPlacesDemo.concat(customDirtyPlaces)
        rerender()
        setMsg(parserPointsMsg, 'Пользовательские точки очищены.')
      })
    }

    if (parserPointsPreviewBtn) {
      parserPointsPreviewBtn.addEventListener('click', () => {
        setMsg(parserPointsMsg, '')
        if (!parserPointsInput) return
        const target = parserPointsTarget && parserPointsTarget.value ? parserPointsTarget.value : 'clean'
        const { parsed, errors } = parseCsvLikePoints(parserPointsInput.value, target)
        setMsg(parserPointsMsg, 'Превью: '+ parsed.length +' точек. Ошибок: ' + errors.length + (errors[0] ? ('. Пример: ' + errors[0]) : ''))
      })
    }

    if (parserPointsAddBtn) {
      parserPointsAddBtn.addEventListener('click', () => {
        setMsg(parserPointsMsg, '')
        if (!parserPointsInput) return
        const target = parserPointsTarget && parserPointsTarget.value ? parserPointsTarget.value : 'clean'
        const { parsed, errors } = parseCsvLikePoints(parserPointsInput.value, target)
        if (!parsed.length) {
          setMsg(parserPointsMsg, 'Нет корректных точек для добавления. Ошибки: ' + errors.length)
          return
        }
        if (target === 'clean') {
          customCleanPlaces = customCleanPlaces.concat(parsed)
          persistCustomPlaces(CUSTOM_CLEAN_PLACES_KEY, customCleanPlaces)
          cleanPlaces = cleanPlacesDemo.concat(customCleanPlaces)
        } else {
          customDirtyPlaces = customDirtyPlaces.concat(parsed)
          persistCustomPlaces(CUSTOM_DIRTY_PLACES_KEY, customDirtyPlaces)
          dirtyPlaces = dirtyPlacesDemo.concat(customDirtyPlaces)
        }
        rerender()
        setMsg(parserPointsMsg, 'Добавлено: ' + parsed.length + ' точек.' + (errors.length ? (' Ошибок: ' + errors.length) : ''))
      })
    }

    function parseEmitters(text) {
      const lines = (text || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && l.indexOf('#') !== 0)
      const parsed = []
      const errors = []
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const parts = line.split('|').map((p) => p.trim()).filter(Boolean)
        if (parts.length < 4) {
          errors.push('Строка ' + (i + 1) + ': не хватает частей')
          continue
        }
        const coordsStr = parts[0]
        const name = parts[1]
        let severity = parts[2]
        const percent = coerceNum(parts[3])
        const pollutants = (parts.length >= 5) ? parts.slice(4).join(' | ') : ''
        const coordParts = coordsStr.split(',').map((p) => p.trim())
        if (coordParts.length < 2) {
          errors.push('Строка ' + (i + 1) + ': неверные координаты')
          continue
        }
        const lat = coerceNum(coordParts[0])
        const lon = coerceNum(coordParts[1])
        if (!name || lat == null || lon == null || percent == null) {
          errors.push('Строка ' + (i + 1) + ': неверные поля')
          continue
        }
        severity = (severity === 'высокая') ? 'высокая' : 'средняя'
        parsed.push({ name, coords: [lat, lon], severity, percent, pollutants })
      }
      return { parsed, errors }
    }

    if (clearCustomEmittersBtn) {
      clearCustomEmittersBtn.addEventListener('click', () => {
        try { localStorage.removeItem(CUSTOM_EMITTERS_KEY) } catch (e) {}
        customEmitters = []
        persistCustomEmitters([])
        rebuildEmitters()
        setMsg(parserEmittersMsg, 'Пользовательские предприятия очищены.')
      })
    }

    if (parserEmittersPreviewBtn) {
      parserEmittersPreviewBtn.addEventListener('click', () => {
        setMsg(parserEmittersMsg, '')
        if (!parserEmittersInput) return
        const { parsed, errors } = parseEmitters(parserEmittersInput.value)
        setMsg(parserEmittersMsg, 'Превью: ' + parsed.length + ' предприятий. Ошибок: ' + errors.length + (errors[0] ? ('. Пример: ' + errors[0]) : ''))
      })
    }

    if (parserEmittersAddBtn) {
      parserEmittersAddBtn.addEventListener('click', () => {
        setMsg(parserEmittersMsg, '')
        if (!parserEmittersInput) return
        const { parsed, errors } = parseEmitters(parserEmittersInput.value)
        if (!parsed.length) {
          setMsg(parserEmittersMsg, 'Нет корректных предприятий. Ошибок: ' + errors.length)
          return
        }
        customEmitters = parsed
        persistCustomEmitters(customEmitters)
        rebuildEmitters()
        if (typeof setEmittersVisible === 'function') setEmittersVisible(getEmittersVisible(), false)
        setMsg(parserEmittersMsg, 'Загружено: ' + parsed.length + ' предприятий.' + (errors.length ? (' Ошибок: ' + errors.length) : ''))
      })
    }

    if (normalizeCustomEmittersBtn) {
      normalizeCustomEmittersBtn.addEventListener('click', () => {
        setMsg(normalizeEmittersMsg, '')
        customEmitters = loadCustomEmitters()
        if (!customEmitters || !customEmitters.length) {
          setMsg(normalizeEmittersMsg, 'Нет пользовательских предприятий.')
          return
        }
        let sum = 0
        for (let i = 0; i < customEmitters.length; i++) sum += Number(customEmitters[i].percent) || 0
        if (!sum || sum <= 0) {
          setMsg(normalizeEmittersMsg, 'Сумма вкладов = 0. Нормализация невозможна.')
          return
        }

        const rawPercents = customEmitters.map((e) => (Number(e.percent) || 0) / sum * 100)
        const floors = rawPercents.map((p) => Math.floor(p))
        let remaining = 100
        for (let i = 0; i < floors.length; i++) remaining -= floors[i]

        const fracList = rawPercents.map((p, i) => ({ i, frac: p - floors[i] }))
          .sort((a, b) => b.frac - a.frac)

        for (let r = 0; r < remaining; r++) {
          const idx = fracList[r % fracList.length].i
          floors[idx] += 1
        }

        customEmitters = customEmitters.map((e, i) => ({ ...e, percent: floors[i] }))
        persistCustomEmitters(customEmitters)
        rebuildEmitters()
        setMsg(normalizeEmittersMsg, 'Нормализовано: сумма вкладов = ' + floors.reduce((a, b) => a + b, 0) + '%.')
      })
    }

    function escapeHtml(str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    function renderEditorPoints(tableEl, points, kind) {
      if (!tableEl) return
      const isClean = kind === 'clean'

      if (!Array.isArray(points) || !points.length) {
        tableEl.innerHTML = '<p class="muted" style="margin:0;">Пользовательских точек нет.</p>'
        return
      }

      const rowsHtml = points
        .map((p, idx) => {
          const name = escapeHtml(p.name || '')
          const lat = escapeHtml(p.coords && p.coords.length ? p.coords[0] : '')
          const lon = escapeHtml(p.coords && p.coords.length ? p.coords[1] : '')
          const note = escapeHtml(p.note || p.n || '')

          const severity = escapeHtml(p.severity || 'средняя')
          const pollutant = escapeHtml(p.pollutant || p.pollutants || '')

          const severitySelect = !isClean
            ? '<select data-field="severity" style="width: 140px;"><option value="средняя">средняя</option><option value="высокая">высокая</option></select>'
            : ''

          const severityValueAttr = !isClean ? (severity === 'высокая' ? ' selected="selected"' : '') : ''

          return `
            <div style="border:1px solid var(--border); border-radius:12px; padding:10px; margin-bottom:10px; background: rgba(255,255,255,0.02);">
              <div style="display:grid; gap:8px; grid-template-columns: 1.4fr 0.7fr 0.7fr ${isClean ? '1.2fr' : '1.0fr'} ${isClean ? '1.4fr' : '1.6fr'} 1fr;">
                <div>
                  <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Название</label>
                  <input data-field="name" class="form-input" value="${name}" />
                </div>
                <div>
                  <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Lat</label>
                  <input data-field="lat" class="form-input" value="${lat}" />
                </div>
                <div>
                  <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Lon</label>
                  <input data-field="lon" class="form-input" value="${lon}" />
                </div>
                ${
                    isClean
                      ? `<div>
                           <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Заметка</label>
                           <input data-field="note" class="form-input" value="${note}" />
                         </div>`
                      : `<div style="display:flex; flex-direction:column;">
                           <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Степень</label>
                           <select data-field="severity" class="form-input" style="min-width: 140px;">
                             <option value="средняя"${severityValueAttr ? '' : ''}>средняя</option>
                             <option value="высокая"${severity === 'высокая' ? ' selected="selected"' : ''}>высокая</option>
                           </select>
                         </div>`
                  }
                ${
                    isClean
                      ? ''
                      : `<div>
                           <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Загрязнитель</label>
                           <input data-field="pollutant" class="form-input" value="${pollutant}" />
                         </div>`
                  }
                <div style="display:flex; align-items:flex-end; gap:8px;">
                  <button type="button" class="btn" data-editor-action="save" data-idx="${idx}" data-kind="${kind}">Сохранить</button>
                  <button type="button" class="btn btn-secondary" data-editor-action="delete" data-idx="${idx}" data-kind="${kind}">Удалить</button>
                </div>
              </div>
            </div>
          `
        })
        .join('')

      tableEl.innerHTML = rowsHtml
    }

    function renderEditorEmitters(tableEl, emitters) {
      if (!tableEl) return
      if (!Array.isArray(emitters) || !emitters.length) {
        tableEl.innerHTML = '<p class="muted" style="margin:0;">Пользовательских предприятий нет.</p>'
        return
      }

      const rowsHtml = emitters
        .map((e, idx) => {
          const name = escapeHtml(e.name || '')
          const lat = escapeHtml(e.coords && e.coords.length ? e.coords[0] : '')
          const lon = escapeHtml(e.coords && e.coords.length ? e.coords[1] : '')
          const severity = escapeHtml(e.severity || 'средняя')
          const percent = escapeHtml(e.percent == null ? '' : e.percent)
          const pollutants = escapeHtml(e.pollutants || e.pollutant || '')

          return `
            <div style="border:1px solid var(--border); border-radius:12px; padding:10px; margin-bottom:10px; background: rgba(255,255,255,0.02);">
              <div style="display:grid; gap:8px; grid-template-columns: 1.5fr 0.7fr 0.7fr 0.9fr 0.6fr 1.2fr 1fr; align-items:end;">
                <div>
                  <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Название</label>
                  <input data-field="name" class="form-input" value="${name}" />
                </div>
                <div>
                  <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Lat</label>
                  <input data-field="lat" class="form-input" value="${lat}" />
                </div>
                <div>
                  <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Lon</label>
                  <input data-field="lon" class="form-input" value="${lon}" />
                </div>
                <div>
                  <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Степень</label>
                  <select data-field="severity" class="form-input" style="min-width: 140px;">
                    <option value="средняя"${severity === 'средняя' ? ' selected="selected"' : ''}>средняя</option>
                    <option value="высокая"${severity === 'высокая' ? ' selected="selected"' : ''}>высокая</option>
                  </select>
                </div>
                <div>
                  <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">%</label>
                  <input data-field="percent" class="form-input" value="${percent}" />
                </div>
                <div>
                  <label class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Загрязнители</label>
                  <input data-field="pollutants" class="form-input" value="${pollutants}" />
                </div>
                <div style="display:flex; gap:8px;">
                  <button type="button" class="btn" data-editor-em-action="save" data-idx="${idx}">Сохранить</button>
                  <button type="button" class="btn btn-secondary" data-editor-em-action="delete" data-idx="${idx}">Удалить</button>
                </div>
              </div>
            </div>
          `
        })
        .join('')

      tableEl.innerHTML = rowsHtml
    }

    function renderEditors() {
      if (!editorCleanEl || !editorDirtyEl || !editorEmittersEl) return
      const clean = loadCustomPlaces(CUSTOM_CLEAN_PLACES_KEY, 'clean')
      const dirty = loadCustomPlaces(CUSTOM_DIRTY_PLACES_KEY, 'dirty')
      const em = loadCustomEmitters()
      renderEditorPoints(editorCleanEl, clean, 'clean')
      renderEditorPoints(editorDirtyEl, dirty, 'dirty')
      renderEditorEmitters(editorEmittersEl, em)
    }

    function setEditorMsg(text) {
      if (!editorMsgEl) return
      editorMsgEl.textContent = text || ''
    }

    // Делегирование событий для редактора точек
    if (editorCleanEl || editorDirtyEl) {
      ;[editorCleanEl, editorDirtyEl].forEach((el) => {
        if (!el) return
        el.addEventListener('click', (ev) => {
          const btn = ev.target && ev.target.closest ? ev.target.closest('button') : null
          if (!btn) return
          const action = btn.getAttribute('data-editor-action')
          const kind = btn.getAttribute('data-kind')
          const idxRaw = btn.getAttribute('data-idx')
          const idx = idxRaw != null ? Number(idxRaw) : NaN
          if (!kind || !action || !Number.isFinite(idx)) return

          const container = btn.closest('div[style*="background"]') || btn.parentElement
          const row = btn.closest('div')
          if (!row) return

          const name = row.querySelector('input[data-field="name"]') ? row.querySelector('input[data-field="name"]').value : ''
          const lat = row.querySelector('input[data-field="lat"]') ? row.querySelector('input[data-field="lat"]').value : ''
          const lon = row.querySelector('input[data-field="lon"]') ? row.querySelector('input[data-field="lon"]').value : ''

          if (action === 'delete') {
            if (kind === 'clean') {
              const arr = loadCustomPlaces(CUSTOM_CLEAN_PLACES_KEY, 'clean')
              if (idx >= 0 && idx < arr.length) arr.splice(idx, 1)
              persistCustomPlaces(CUSTOM_CLEAN_PLACES_KEY, arr)
            } else {
              const arr = loadCustomPlaces(CUSTOM_DIRTY_PLACES_KEY, 'dirty')
              if (idx >= 0 && idx < arr.length) arr.splice(idx, 1)
              persistCustomPlaces(CUSTOM_DIRTY_PLACES_KEY, arr)
            }
            setEditorMsg('Удалено.')
            refreshFromStorage()
            renderEditors()
            return
          }

          // save
          const latNum = coerceNum(lat)
          const lonNum = coerceNum(lon)
          if (!name.trim() || latNum == null || lonNum == null) {
            setEditorMsg('Ошибка: проверьте название и координаты.')
            return
          }

          if (kind === 'clean') {
            const note = row.querySelector('input[data-field="note"]') ? row.querySelector('input[data-field="note"]').value : ''
            const arr = loadCustomPlaces(CUSTOM_CLEAN_PLACES_KEY, 'clean')
            if (idx >= 0 && idx < arr.length) {
              arr[idx] = { ...arr[idx], name: name.trim(), coords: [latNum, lonNum], note: note || '' }
            }
            persistCustomPlaces(CUSTOM_CLEAN_PLACES_KEY, arr)
          } else {
            const severity = row.querySelector('select[data-field="severity"]') ? row.querySelector('select[data-field="severity"]').value : 'средняя'
            const pollutant = row.querySelector('input[data-field="pollutant"]') ? row.querySelector('input[data-field="pollutant"]').value : ''
            const arr = loadCustomPlaces(CUSTOM_DIRTY_PLACES_KEY, 'dirty')
            if (idx >= 0 && idx < arr.length) {
              arr[idx] = { ...arr[idx], name: name.trim(), coords: [latNum, lonNum], severity: severity, pollutant: pollutant || '' }
            }
            persistCustomPlaces(CUSTOM_DIRTY_PLACES_KEY, arr)
          }

          setEditorMsg('Сохранено.')
          refreshFromStorage()
          renderEditors()
        })
      })
    }

    // Делегирование событий для редактора предприятий
    if (editorEmittersEl) {
      editorEmittersEl.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('button') : null
        if (!btn) return
        const action = btn.getAttribute('data-editor-em-action')
        const idxRaw = btn.getAttribute('data-idx')
        const idx = idxRaw != null ? Number(idxRaw) : NaN
        if (!action || !Number.isFinite(idx)) return

        const row = btn.closest('div')
        if (!row) return

        if (action === 'delete') {
          const arr = loadCustomEmitters()
          if (idx >= 0 && idx < arr.length) arr.splice(idx, 1)
          persistCustomEmitters(arr)
          setEditorMsg('Удалено.')
          refreshFromStorage()
          renderEditors()
          return
        }

        const name = row.querySelector('input[data-field="name"]') ? row.querySelector('input[data-field="name"]').value : ''
        const lat = row.querySelector('input[data-field="lat"]') ? row.querySelector('input[data-field="lat"]').value : ''
        const lon = row.querySelector('input[data-field="lon"]') ? row.querySelector('input[data-field="lon"]').value : ''
        const severity = row.querySelector('select[data-field="severity"]') ? row.querySelector('select[data-field="severity"]').value : 'средняя'
        const percent = row.querySelector('input[data-field="percent"]') ? row.querySelector('input[data-field="percent"]').value : ''
        const pollutants = row.querySelector('input[data-field="pollutants"]') ? row.querySelector('input[data-field="pollutants"]').value : ''

        const latNum = coerceNum(lat)
        const lonNum = coerceNum(lon)
        const percentNum = coerceNum(percent)
        if (!name.trim() || latNum == null || lonNum == null || percentNum == null) {
          setEditorMsg('Ошибка: проверьте название, координаты и вклад%.')
          return
        }

        const arr = loadCustomEmitters()
        if (idx >= 0 && idx < arr.length) {
          arr[idx] = {
            ...arr[idx],
            name: name.trim(),
            coords: [latNum, lonNum],
            severity: severity === 'высокая' ? 'высокая' : 'средняя',
            percent: percentNum,
            pollutants: pollutants || ''
          }
        }
        persistCustomEmitters(arr)
        setEditorMsg('Сохранено.')
        refreshFromStorage()
        renderEditors()
      })
    }

    // Первичная отрисовка редактора
    renderEditors()

    if (modeEcoBtn) {
      modeEcoBtn.addEventListener('click', () => {
        try { localStorage.setItem('bryanskEcoMode', 'eco') } catch (e) {}
        window.location.href = 'index.html'
      })
    }
    if (modeHistoryBtn) {
      modeHistoryBtn.addEventListener('click', () => {
        try { localStorage.setItem('bryanskEcoMode', 'history') } catch (e) {}
        window.location.href = 'index.html#history-knowledge'
      })
    }

    if (openSurveyBtn) {
      openSurveyBtn.addEventListener('click', () => {
        try { localStorage.setItem('bryanskSurveyOpenRequested', '1') } catch (e) {}
        window.location.href = 'personal.html'
      })
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-tab')
        activateAdminTab(t)
        try { localStorage.setItem(ADMIN_TAB_KEY, t) } catch (e) {}
      })
    })

    renderState()
  }


  // Инициализация
  initGlobalAdminPanel()
  setKpis()
  renderPollutionList()
  renderEmittersList()
  initMap()
  initCharts()
  initAdminPanel()

  // Установка глобальных переменных для features.js
  if (typeof setGlobalVars === 'function') {
    setGlobalVars(cleanPlaces, dirtyPlaces, map, rerender)
  }

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible')
    })
  }, { threshold: 0.15 })
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

})()


