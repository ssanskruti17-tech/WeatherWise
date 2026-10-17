// Frontend: asks the Flask API for data and draws the pages. Everything is in this one file.
const $ = id => document.getElementById(id);
const esc = t => String(t ?? '–').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Asks the Flask API for data (the URL is /api/<path>)
async function api(path) {
  const res = await fetch('/api/' + path);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

// Coloured status badge: High = red, Yes = dark red (heatwave), Moderate/Medium = amber, No/Low = green
const badge = v => ({ html: `<span class="badge ${{High:'high', Yes:'heatwave', Moderate:'moderate', Medium:'moderate'}[v] || 'normal'}">${esc(v)}</span>` });

// Builds a table; cells made by badge() are kept as HTML, everything else is escaped
function table(heads, rows) {
  const cell = c => `<td>${c && c.html !== undefined ? c.html : esc(c)}</td>`;
  const body = rows.map(r => `<tr>${r.map(cell).join('')}</tr>`).join('') || `<tr><td colspan="${heads.length}">No records found.</td></tr>`;
  return `<div class="table-wrap"><table><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}

// Simple line icons (inline SVG, no emoji)
const P = {
  grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  therm:'<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>',
  antenna:'<circle cx="12" cy="11" r="2"/><path d="M12 13v8M8 21h8M7.8 6.8a6 6 0 0 0 0 8.4M16.2 6.8a6 6 0 0 1 0 8.4"/>',
  map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  fire:'<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin:'<path d="M12 21s7-6 7-11.5a7 7 0 0 0-14 0C5 15 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>'
};
const icon = n => `<svg class="i" viewBox="0 0 24 24">${P[n]}</svg>`;

// Chart.js helper (line = filled area, bar = columns)
const charts = {}, COLORS = ['#C85A47', '#D4AF6A', '#A84A62'];
function chart(id, type, labels, sets) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart($(id), {
    type,
    data: { labels, datasets: sets.map((s, i) => ({ ...s, borderColor: COLORS[i], backgroundColor: type === 'line' ? COLORS[i] + '33' : COLORS[i],
                                                   fill: type === 'line', tension: .35, borderRadius: 5 })) },
    options: { maintainAspectRatio: false, scales: { y: { beginAtZero: type === 'bar' } } }
  });
}

// ---------- Pages ----------
async function loadDash() {
  const d = await api('dashboard'), s = d.summary;
  $('stats').innerHTML = [['db', 'Total Weather Records', s.total], ['antenna', 'Weather Stations', s.stations], ['map', 'Regions', s.regions],
    ['therm', 'Average Temperature', s.avg_temp + '°C'], ['fire', 'Maximum Temperature', s.max_temp + '°C'], ['bell', 'Active Alerts', s.alerts]]
    .map(([i, l, v]) => `<div class="stat"><span class="ico">${icon(i)}</span><div><div class="label">${l}</div><div class="value">${v}</div></div></div>`).join('');

  chart('tempChart', 'line', d.temps.map(t => t.location), [
    { label: 'Temperature (°C)', data: d.temps.map(t => +t.temperature) },
    { label: 'Heat Index (°C)', data: d.temps.map(t => +t.heat_index) }]);

  $('status').innerHTML = table(['Region', 'Predicted Temp', 'Severity', 'Heatwave'],
    d.status.map(f => [f.region_name, f.predicted_temperature + '°C', badge(f.severity_level), badge(f.heatwave_status)]));

  $('cities').innerHTML = d.cities.map(c => `<div class="city"><div class="head">${esc(c.location)}</div>
    <div class="body"><div class="temp">${c.temperature}°C</div><p>Heat Index <b>${c.heat_index}°C</b></p><p>${esc(c.region_name)} · ${esc(c.climate_type)}</p></div></div>`).join('');

  $('tiles').innerHTML = [['Open Heat Map', 'map', 'pin', '#A84A62'], ['Forecast Insights', 'forecast', 'trend', '#D9604A'], ['Early Warnings', 'alerts', 'bell', '#B58B4D']]
    .map(([t, v, i, c]) => `<a class="tile" href="#${v}" style="background:${c}">${icon(i)}<span>${t}</span>${icon('arrow')}</a>`).join('');
}

let page = 1;
async function loadData(p = 1) {
  page = p;
  if ($('region').options.length === 1) (await api('regions')).forEach(r => $('region').add(new Option(r.region_name, r.region_id)));
  const d = await api(`weather-data?search=${encodeURIComponent($('search').value)}&region=${$('region').value}&page=${page}`);
  $('dataTable').innerHTML = table(['Data ID', 'Location', 'Date', 'Time', 'Temperature', 'Heat Index', 'Region'],
    d.rows.map(r => [r.data_id, r.location, r.date, r.time, r.temperature + '°C', r.heat_index + '°C', r.region_name]));
  $('pageInfo').textContent = `Page ${d.page} of ${d.pages}`;
  $('prev').disabled = page <= 1;
  $('next').disabled = page >= d.pages;
}

async function loadStations() {
  $('stationTable').innerHTML = table(['AWS ID', 'City', 'State', 'Installation Date', 'Latitude', 'Longitude'],
    (await api('stations')).map(s => [s.aws_id, s.city, s.state, s.installation_date, s.latitude, s.longitude]));
}

async function loadRegions() {
  const rs = await api('regions');
  $('regionCards').innerHTML = rs.map(r => `<div class="city clickable" data-id="${r.region_id}" title="Click for details"><div class="head">${esc(r.region_name)}</div>
    <div class="body"><p>${esc(r.climate_type)}</p><div class="temp">${r.avg_temp ?? '–'}°C</div><p>average temperature</p></div></div>`).join('');
  $('regionCards').onclick = e => { const c = e.target.closest('.clickable'); if (c) regionModal(c.dataset.id); };
  chart('regionChart', 'bar', rs.map(r => r.region_name), [
    { label: 'Average', data: rs.map(r => +r.avg_temp) }, { label: 'Maximum', data: rs.map(r => +r.max_temp) }, { label: 'Minimum', data: rs.map(r => +r.min_temp) }]);
  const t = v => v == null ? '–' : v + '°C';
  $('regionTable').innerHTML = table(['Region ID', 'Region Name', 'Climate Type', 'Average', 'Maximum', 'Minimum'],
    rs.map(r => [r.region_id, r.region_name, r.climate_type, t(r.avg_temp), t(r.max_temp), t(r.min_temp)]));
}

let forecastData = [];
async function loadForecast() {
  forecastData = await api('forecast');
  const order = ['High', 'Moderate', 'Medium', 'Low'];
  $('fSeverity').options.length = 1;
  [...new Set(forecastData.map(f => f.severity_level))].sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .forEach(v => $('fSeverity').add(new Option(v, v)));
  drawForecast();
}

// Shows only the regions of the severity picked in the dropdown (High / Medium / Low)
function drawForecast() {
  const s = $('fSeverity').value;
  const fs = forecastData.filter(f => !s || f.severity_level === s);
  $('forecastTable').innerHTML = table(['Forecast ID', 'Region', 'Predicted Temperature', 'Severity Level', 'Hotspot Status', 'Heatwave Status'],
    fs.map(f => [f.forecast_id, f.region_name, f.predicted_temperature + '°C', badge(f.severity_level), badge(f.hotspot_status), badge(f.heatwave_status)]));
  chart('forecastChart', 'bar', fs.map(f => f.region_name), [{ label: 'Predicted Temperature (°C)', data: fs.map(f => +f.predicted_temperature) }]);
}

async function loadAlerts() {
  $('alertTable').innerHTML = table(['Alert ID', 'Date', 'Time', 'Level', 'Forecast ID', 'Distribution Channel'],
    (await api('alerts')).map(a => [a.alert_id, a.date, a.time, badge(a.level), a.forecast_id, a.channels]));
}

async function loadModels() {
  $('modelTable').innerHTML = table(['Model ID', 'Model Name', 'Heatwave Prediction', 'Attribute'],
    (await api('models')).map(m => [m.model_id, m.model_name, badge(m.heatwave_prediction), m.attribute]));
}

// ================= Interactive features =================
// Every API answer is kept in `cache`, so a page can reuse it without asking Flask again.
const cache = {};
const cached = path => cache[path] || (cache[path] = api(path));

// Heat risk levels (same bands everywhere): heat index below 32 = Safe, 41 = Caution, 54 = Danger, above = Extreme
const RISK = [[32, 'Safe', '#6FAE7F'], [41, 'Caution', '#F0B24A'], [54, 'Danger', '#E0553F'], [999, 'Extreme', '#8E1B3F']];
const riskOf = v => RISK.find(r => v < r[0]);

// Opens the Weather Data page with a search text and/or region already applied
async function openData({ search = '', region = 0 } = {}) {
  if ($('region').options.length === 1) (await cached('regions')).forEach(r => $('region').add(new Option(r.region_name, r.region_id)));
  $('search').value = search;
  $('region').value = region;
  loaded.data = true;                       // we load the data ourselves below
  location.hash = 'data';
  await loadData(1);
}

// ---------- Heat Map: every weather station drawn on a map of India ----------
// A rough outline of India as [longitude, latitude] points
const INDIA = [[74.4,37],[75.9,36.8],[77.8,35.5],[78.9,34.3],[78.7,32.8],[79.9,31],[80.5,30.2],[81,30.1],[80.3,28.9],[81.8,28],[84.1,27.4],[86,27.9],[88.1,27.9],
  [88.9,27.2],[89.8,28.2],[91.6,27.8],[92.8,27.9],[94.5,29.2],[96.1,29.4],[97.4,28.3],[96.3,27.2],[95.2,26.3],[94.6,24.6],[93.4,23],[92.4,22.1],[92.3,24],
  [91.2,25.2],[90,25.2],[89.8,26],[89,26.3],[88.9,24.9],[88.2,24.4],[88.8,23.2],[89,22.1],[88.5,21.6],[87,21.5],[86.8,20.7],[85.9,19.7],[84.8,19],
  [83,17.6],[82.3,16.5],[80.9,15.8],[80.2,14.3],[80.1,12.9],[79.8,11.6],[79.3,10.3],[78.2,8.9],[77.5,8.1],[76.6,8.9],[75.8,11],[74.9,12.8],[74.2,14.5],
  [73.4,16.2],[72.8,19],[72.7,20.5],[72,21.2],[72.6,21.6],[72.2,22.3],[70.6,20.8],[69.2,22],[68.2,23.6],[68.8,24.3],[70.2,24.2],[71.1,24.4],[70.6,25.7],
  [69.5,26.8],[70.3,27.8],[71.9,27.9],[72.8,29],[74.2,30],[74.6,31.1],[75.3,32.2],[74.3,32.8],[74.5,34],[73.5,34.5],[73.8,35.5]];
const mx = lon => ((lon - 67) * 19.3).toFixed(1), my = lat => ((37.5 - lat) * 19.3).toFixed(1);   // longitude/latitude -> x/y on the drawing
const map = { stations: [], level: 'All', min: 20, selected: null };

async function loadMap() {
  const [stations, dash, regions, forecast] = await Promise.all([cached('stations'), cached('dashboard'), cached('regions'), cached('forecast')]);
  const reading = {}; dash.temps.forEach(t => reading[t.location.toLowerCase()] = t);        // latest reading of each city
  const regionOf = {}; regions.forEach(r => regionOf[r.region_name] = r);
  const forecastOf = {}; forecast.forEach(f => forecastOf[f.region_name] = f);
  map.stations = stations.map(s => {
    const r = reading[s.city.toLowerCase()], reg = regionOf[s.region_name] || {};
    const temp = r ? +r.temperature : (reg.avg_temp != null ? +reg.avg_temp : null);       // no reading for this city: use the region average
    return { ...s, lat: +s.latitude, lon: +s.longitude, temp, hi: r ? +r.heat_index : temp, measured: !!r, forecast: forecastOf[s.region_name] };
  }).filter(s => s.hi != null && !isNaN(s.lat) && !isNaN(s.lon));
  drawMap();
}

function drawMap() {
  const { stations, level, min } = map;
  // level buttons with the number of stations in each level
  $('mapChips').innerHTML = ['All', ...RISK.map(r => r[1])].map(l => {
    const n = stations.filter(s => l === 'All' || riskOf(s.hi)[1] === l).length, c = (RISK.find(r => r[1] === l) || [0, 0, '#B8794F'])[2];
    return `<button type="button" class="chip ${l === level ? 'on' : ''}" data-l="${l}"><i style="background:${c}"></i>${l} <b>${n}</b></button>`;
  }).join('');
  $('mapMinV').textContent = min + '°C';
  const shown = stations.map((s, i) => ({ s, i })).filter(({ s }) => (level === 'All' || riskOf(s.hi)[1] === level) && s.hi >= min);
  $('mapSvg').innerHTML = `<polygon class="india" points="${INDIA.map(p => mx(p[0]) + ',' + my(p[1])).join(' ')}"/>` + shown.map(({ s, i }) => {
    const [, label, color] = riskOf(s.hi), hot = label === 'Danger' || label === 'Extreme';
    return `<g class="mk ${hot ? 'pulse' : ''} ${map.selected === i ? 'sel' : ''}" data-i="${i}">
      <circle class="halo" cx="${mx(s.lon)}" cy="${my(s.lat)}" r="13" fill="${color}"/><circle class="dot" cx="${mx(s.lon)}" cy="${my(s.lat)}" r="7" fill="${color}"/></g>`;
  }).join('');
  if (!shown.length) $('mapSvg').insertAdjacentHTML('beforeend', '<text x="310" y="320" text-anchor="middle" class="empty">No stations match this filter</text>');
  showStation();
}

// Details of the clicked station (or the three hottest ones when nothing is selected)
function showStation() {
  const s = map.stations[map.selected];
  if (!s) {
    const top = map.stations.map((x, i) => ({ x, i })).sort((a, b) => b.x.hi - a.x.hi).slice(0, 3);
    $('mapInfo').innerHTML = `<h2>Station details</h2><p class="adv-info">Click a station on the map. Red dots pulse when the heat index is Danger or Extreme.</p>
      <h3 class="mini">Hottest right now</h3>` + top.map(({ x, i }) => `<div class="rank link" data-i="${i}"><span class="no">${top.findIndex(t => t.i === i) + 1}</span>
      <div class="rk-main"><div class="rk-name">${esc(x.city)} <small>${esc(x.state)}</small></div></div><b>${x.hi}°C</b></div>`).join('');
    return;
  }
  const [, label, color] = riskOf(s.hi), f = s.forecast;
  $('mapInfo').innerHTML = `<h2>${esc(s.city)}</h2><p class="adv-info">${s.state === s.region_name ? esc(s.state) : esc(s.state) + ' · ' + esc(s.region_name)} · AWS ${s.aws_id}</p>
    <div class="bigtemp" style="color:${color}">${s.hi}°C <span class="pill" style="background:${color}">${label}</span></div>
    <p class="adv-info">${s.measured ? `Heat index (temperature ${s.temp}°C)` : 'Region average temperature (no reading for this city yet)'}</p>
    ${f ? `<p>Forecast <b>${f.predicted_temperature}°C</b> ${badge(f.severity_level).html} Heatwave ${badge(f.heatwave_status).html}</p>` : ''}
    <p class="adv-info">Installed ${esc(s.installation_date)} · ${s.lat.toFixed(2)}°N, ${s.lon.toFixed(2)}°E</p>
    <button type="button" id="mapRead">View readings</button> <button type="button" class="alt" id="mapBack">Back</button>`;
  $('mapRead').onclick = () => openData({ search: s.city });
  $('mapBack').onclick = () => { map.selected = null; drawMap(); };
}

// Clicks and hover on the map (one listener for all dots)
$('mapSvg').onclick = e => { const g = e.target.closest('.mk'); if (g) { map.selected = +g.dataset.i; drawMap(); } };
$('mapInfo').onclick = e => { const r = e.target.closest('.link'); if (r) { map.selected = +r.dataset.i; drawMap(); } };
$('mapChips').onclick = e => { const b = e.target.closest('.chip'); if (b) { map.level = b.dataset.l; drawMap(); } };
$('mapMin').oninput = e => { map.min = +e.target.value; drawMap(); };
$('mapSvg').onmousemove = e => {
  const g = e.target.closest('.mk'), tip = $('mapTip');
  if (!g) { tip.style.display = 'none'; return; }
  const s = map.stations[+g.dataset.i], box = $('mapSvg').getBoundingClientRect();
  tip.innerHTML = `<b>${esc(s.city)}</b><br>${s.hi}°C · ${riskOf(s.hi)[1]}`;
  tip.style.display = 'block';
  tip.style.left = (e.clientX - box.left + 14) + 'px';
  tip.style.top = (e.clientY - box.top + 14) + 'px';
};
$('mapSvg').onmouseleave = () => $('mapTip').style.display = 'none';

// ---------- Insights: compare two regions + heat risk calculator ----------
async function loadInsights() {
  const rs = await cached('regions');
  ['cmpA', 'cmpB'].forEach((id, k) => { $(id).innerHTML = rs.map((r, i) => `<option value="${i}" ${i === k ? 'selected' : ''}>${esc(r.region_name)}</option>`).join(''); });
  $('calcCity').innerHTML = '<option value="">Start from a city…</option>' + (await cached('dashboard')).temps.map(t => `<option value="${t.temperature}">${esc(t.location)} (${t.temperature}°C)</option>`).join('');
  compareRegions();
  calculate();
}

// Two regions side by side: average, maximum and minimum temperature
async function compareRegions() {
  const rs = await cached('regions'), a = rs[+$('cmpA').value], b = rs[+$('cmpB').value];
  if (!a || !b) return;
  chart('cmpChart', 'bar', ['Average', 'Maximum', 'Minimum'], [
    { label: a.region_name, data: [+a.avg_temp, +a.max_temp, +a.min_temp] }, { label: b.region_name, data: [+b.avg_temp, +b.max_temp, +b.min_temp] }]);
  const d = (+a.avg_temp - +b.avg_temp).toFixed(1);
  $('cmpText').textContent = a === b ? 'Pick two different regions to compare.' : d == 0 ? `${a.region_name} and ${b.region_name} have the same average temperature.`
    : `${d > 0 ? a.region_name : b.region_name} is ${Math.abs(d)}°C hotter on average than ${d > 0 ? b.region_name : a.region_name}.`;
}

// Heat index from temperature (°C) and humidity (%) using the standard Rothfusz formula
function heatIndex(c, rh) {
  const t = c * 9 / 5 + 32;                                   // the formula works in °F
  let hi = 0.5 * (t + 61 + (t - 68) * 1.2 + rh * 0.094);      // simple version for mild weather
  if ((hi + t) / 2 >= 80) {
    hi = -42.379 + 2.04901523 * t + 10.14333127 * rh - 0.22475541 * t * rh - 0.00683783 * t * t - 0.05481717 * rh * rh
       + 0.00122874 * t * t * rh + 0.00085282 * t * rh * rh - 0.00000199 * t * t * rh * rh;
    if (rh < 13 && t >= 80 && t <= 112) hi -= (13 - rh) / 4 * Math.sqrt((17 - Math.abs(t - 95)) / 17);
    if (rh > 85 && t >= 80 && t <= 87) hi += (rh - 85) / 10 * (87 - t) / 5;
  }
  return Math.max((hi - 32) * 5 / 9, c);                      // back to °C (never below the air temperature)
}
const TIPS = { Safe: 'Normal conditions. Keep drinking water.', Caution: 'Tiredness is possible with long exposure. Take breaks in the shade.',
  Danger: 'Heat cramps and exhaustion are likely. Avoid outdoor work from 12 pm to 4 pm.', Extreme: 'Heat stroke is highly likely. Stay indoors and call 108 / 112 if someone feels unwell.' };

// The gauge: four coloured arcs (20°C to 60°C) and a needle that swings to the heat index
const arc = (f1, f2) => { const p = f => [120 + 90 * Math.cos(Math.PI * (1 - f)), 120 - 90 * Math.sin(Math.PI * (1 - f))].map(n => n.toFixed(1));
  const [x1, y1] = p(f1), [x2, y2] = p(f2); return `M${x1} ${y1}A90 90 0 0 1 ${x2} ${y2}`; };
$('gauge').innerHTML = [[20, 32], [32, 41], [41, 54], [54, 60]].map(([a, b], i) => `<path d="${arc((a - 20) / 40, (b - 20) / 40)}" stroke="${RISK[i][2]}" stroke-width="18" fill="none"/>`).join('')
  + '<g id="needle"><line x1="120" y1="120" x2="120" y2="48" stroke="#3A1F1A" stroke-width="4" stroke-linecap="round"/></g><circle cx="120" cy="120" r="8" fill="#3A1F1A"/>';

function calculate() {
  const t = +$('calcT').value, h = +$('calcH').value, hi = heatIndex(t, h), [, label, color] = riskOf(hi);
  $('calcTV').textContent = t + '°C'; $('calcHV').textContent = h + '%';
  $('needle').style.transform = `rotate(${Math.max(-90, Math.min(90, -90 + 180 * (hi - 20) / 40))}deg)`;
  $('calcOut').innerHTML = `<div class="bigtemp" style="color:${color}">${hi.toFixed(1)}°C <span class="pill" style="background:${color}">${label}</span></div><p class="adv-info">Feels-like (heat index). ${TIPS[label]}</p>`;
}
$('cmpA').onchange = $('cmpB').onchange = compareRegions;
$('calcT').oninput = $('calcH').oninput = calculate;
$('calcCity').onchange = e => { if (e.target.value) { $('calcT').value = e.target.value; calculate(); } };

// ---------- Region details: click a region card to see its stations, forecast and alerts ----------
async function regionModal(id) {
  const [rs, st, fc, al] = await Promise.all([cached('regions'), cached('stations'), cached('forecast'), cached('alerts')]);
  const r = rs.find(x => x.region_id == id), f = fc.filter(x => x.region_name === r.region_name), ids = new Set(f.map(x => x.forecast_id));
  const t = v => v == null ? '–' : v + '°C';
  $('modalBody').innerHTML = `<button type="button" class="close" id="modalX">×</button><h2>${esc(r.region_name)}</h2><p class="adv-info">${esc(r.climate_type)}</p>
    <div class="mini-stats"><div><span>Average</span><b>${t(r.avg_temp)}</b></div><div><span>Maximum</span><b>${t(r.max_temp)}</b></div><div><span>Minimum</span><b>${t(r.min_temp)}</b></div></div>
    <h3 class="mini">Weather stations</h3><p>${st.filter(s => s.region_name === r.region_name).map(s => esc(s.city)).join(', ') || 'No station linked to this region'}</p>
    <h3 class="mini">Forecast</h3>${f.map(x => `<p>${x.predicted_temperature}°C ${badge(x.severity_level).html} Hotspot ${badge(x.hotspot_status).html} Heatwave ${badge(x.heatwave_status).html}</p>`).join('') || '<p>No forecast yet</p>'}
    <h3 class="mini">Alerts</h3><p>${al.filter(a => ids.has(a.forecast_id)).map(a => badge(a.level).html).join(' ') || 'No alerts'}</p>`;
  $('modal').classList.add('show');
  $('modalX').onclick = () => $('modal').classList.remove('show');
}
$('modal').onclick = e => { if (e.target === $('modal')) $('modal').classList.remove('show'); };

// ---------- Quick search (Ctrl + K): jump to a page, a region or a city ----------
let cmdItems = [], cmdPos = 0;
async function openCmd() {
  const [rs, st] = await Promise.all([cached('regions'), cached('stations')]);
  cmdItems = [...VIEWS.filter(v => v[0] !== 'models').map(v => ({ t: v[1], s: 'Page', run: () => location.hash = v[0] })),
    ...rs.map(r => ({ t: r.region_name, s: 'Region', run: () => openData({ region: r.region_id }) })),
    ...st.map(s => ({ t: s.city + ', ' + s.state, s: 'Station', run: () => openData({ search: s.city }) }))];
  $('cmd').classList.add('show'); $('cmdIn').value = ''; drawCmd(); $('cmdIn').focus();
}
const closeCmd = () => $('cmd').classList.remove('show');
function cmdMatches() { const q = $('cmdIn').value.toLowerCase(); return cmdItems.filter(i => i.t.toLowerCase().includes(q)).slice(0, 8); }
function drawCmd() {
  const list = cmdMatches(); cmdPos = Math.min(cmdPos, Math.max(list.length - 1, 0));
  $('cmdList').innerHTML = list.map((i, k) => `<div class="cmd-item ${k === cmdPos ? 'on' : ''}" data-k="${k}"><span>${esc(i.t)}</span><small>${i.s}</small></div>`).join('') || '<div class="cmd-item"><span>Nothing found</span></div>';
}
function runCmd(k) { const it = cmdMatches()[k]; if (it) { closeCmd(); it.run(); } }
$('cmdBtn').onclick = openCmd;
$('cmdIn').oninput = () => { cmdPos = 0; drawCmd(); };
$('cmdList').onclick = e => { const i = e.target.closest('.cmd-item'); if (i && i.dataset.k) runCmd(+i.dataset.k); };
$('cmd').onclick = e => { if (e.target === $('cmd')) closeCmd(); };
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmd(); return; }
  if (e.key === 'Escape') { closeCmd(); $('modal').classList.remove('show'); }
  if (!$('cmd').classList.contains('show')) return;
  if (e.key === 'ArrowDown') { cmdPos = Math.min(cmdPos + 1, cmdMatches().length - 1); drawCmd(); e.preventDefault(); }
  if (e.key === 'ArrowUp') { cmdPos = Math.max(cmdPos - 1, 0); drawCmd(); e.preventDefault(); }
  if (e.key === 'Enter') runCmd(cmdPos);
});

// ---------- Click any table heading to sort that column (numbers and text) ----------
document.addEventListener('click', e => {
  const th = e.target.closest('.table-wrap th');
  if (!th) return;
  const tbody = th.closest('table').tBodies[0], col = th.cellIndex, dir = th.classList.contains('asc') ? -1 : 1;
  const rows = [...tbody.rows].filter(r => r.cells.length > 1);
  if (rows.length < 2) return;
  const val = r => r.cells[col].textContent.trim(), num = s => parseFloat(s.replace(/[^0-9.\-]/g, ''));
  rows.sort((a, b) => { const x = val(a), y = val(b), nx = num(x), ny = num(y);
    return dir * ((!isNaN(nx) && !isNaN(ny)) ? nx - ny : x.localeCompare(y)); });
  rows.forEach(r => tbody.appendChild(r));
  th.parentNode.querySelectorAll('th').forEach(h => h.classList.remove('asc', 'desc'));
  th.classList.add(dir === 1 ? 'asc' : 'desc');
});

// ---------- Refresh button, auto refresh and "last updated" time ----------
const stamp = () => $('lastUpdated').textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
function refreshNow() {
  Object.keys(cache).forEach(k => delete cache[k]);           // forget old answers so Flask is asked again
  const id = location.hash.slice(1) || 'dash';
  loaded[id] = false;
  go();
  stamp();
}
$('refreshBtn').onclick = refreshNow;
let timer = null;
$('autoRefresh').onchange = e => { clearInterval(timer); if (e.target.checked) timer = setInterval(refreshNow, 30000); };

// ---------- Navigation (the page is chosen by the #part of the address) ----------
const VIEWS = [['dash', 'Dashboard', 'grid', loadDash], ['data', 'Weather Data', 'therm', loadData], ['stations', 'Weather Stations', 'antenna', loadStations],
  ['regions', 'Regions', 'map', loadRegions], ['forecast', 'Forecast', 'trend', loadForecast], ['alerts', 'Alerts', 'bell', loadAlerts], ['map', 'Heat Map', 'pin', loadMap], ['insights', 'Insights', 'calc', loadInsights], ['models', 'AI Models', 'chip', loadModels]];
const loaded = {};

$('nav').innerHTML = VIEWS.map(([id, name, ic]) => `<a href="#${id}" data-v="${id}">${icon(ic)}${name}</a>`).join('');

function go() {
  const id = location.hash.slice(1) || 'dash', view = VIEWS.find(v => v[0] === id) || VIEWS[0];
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('show', v.id === view[0]));
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.v === view[0]));
  if (!loaded[view[0]]) {            // load each page's data the first time it is opened
    loaded[view[0]] = true;
    view[3]().catch(err => { loaded[view[0]] = false; showError(view[0], err); });
  }
  scrollTo(0, 0);
}

function showError(id, err) {
  document.querySelectorAll(`#${id} .error`).forEach(e => e.remove());
  $(id).insertAdjacentHTML('afterbegin', `<p class="error">${esc(err.message)}</p>`);
}

// Forecast dropdown
$('fSeverity').onchange = drawForecast;

// Weather Data controls
const reload = () => loadData(1).catch(e => showError('data', e));
$('searchBtn').onclick = reload;
$('resetBtn').onclick = () => { $('search').value = ''; $('region').value = 0; reload(); };
$('prev').onclick = () => loadData(page - 1).catch(e => showError('data', e));
$('next').onclick = () => loadData(page + 1).catch(e => showError('data', e));

// Search box in the dashboard banner opens Weather Data with that search
$('heroGo').onclick = () => { $('search').value = $('heroSearch').value; location.hash = 'data'; if (loaded.data) reload(); };
$('heroSearch').onkeydown = e => { if (e.key === 'Enter') $('heroGo').click(); };

window.onhashchange = go;
go();
stamp();

// Extra features (works on top of app.js, nothing in app.js needs to change):
//  1. Heat risk meter on the city cards   2. Safety advice for each alert
//  3. Top 5 hottest regions               5. Download weather data as CSV
(function () {
  const $ = id => document.getElementById(id);
  const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const get = path => fetch('/api/' + path).then(r => r.json());
  const watch = (id, fn) => { const el = $(id); if (el) new MutationObserver(() => fn().catch(console.error)).observe(el, { childList: true }); };

  // ---- 1. Heat risk meter (based on the heat index) ----
  const LEVELS = [[32, 'Safe', '#2E9E6B'], [41, 'Caution', '#F79A25'], [54, 'Danger', '#D64530'], [999, 'Extreme', '#8B1E3F']];
  let heat = null;
  async function addMeters() {
    if (!heat) { heat = {}; (await get('dashboard')).temps.forEach(t => heat[t.location] = +t.heat_index); }
    $('cities').querySelectorAll('.city').forEach(card => {
      if (card.querySelector('.meter')) return;
      const hi = heat[((card.querySelector('.photo span, .head') || {}).textContent || '').trim()];
      if (hi == null) return;
      const [, label, color] = LEVELS.find(l => hi < l[0]);
      (card.querySelector('.body') || card).insertAdjacentHTML('beforeend',
        `<div class="meter"><div class="meter-top"><span>Heat risk</span><b style="color:${color}">${label}</b></div>
         <div class="meter-bar"><i style="width:${Math.min(hi / 54 * 100, 100)}%;background:${color}"></i></div></div>`);
    });
  }

  // ---- 3. Top 5 hottest regions (highest recorded temperature) ----
  async function hottest() {
    const rs = (await get('regions')).filter(r => r.max_temp != null).sort((a, b) => b.max_temp - a.max_temp).slice(0, 5);
    $('hottest').innerHTML = rs.map((r, i) => `<div class="rank"><span class="no">${i + 1}</span>
      <div class="rk-main"><div class="rk-name">${esc(r.region_name)} <small>${esc(r.climate_type)}</small></div>
      <div class="rk-bar"><i style="width:${Math.min(r.max_temp / 50 * 100, 100)}%"></i></div></div><b>${r.max_temp}°C</b></div>`).join('');
  }

  // ---- 2. Safety advice: click an alert row to see what people should do ----
  const ADVICE = {
    High: ['high', 'High alert: heatwave danger', ['Stay indoors between 12 pm and 4 pm.', 'Drink water often, even if not thirsty (ORS or buttermilk also help).',
      'Wear light, loose, light-coloured cotton clothes and cover your head outdoors.', 'Check on the elderly, children and people who work outside.',
      'Never leave children or pets in a parked vehicle.', 'Dizziness, confusion or very hot dry skin may be heat stroke: call 108 or 112 immediately.']],
    Medium: ['moderate', 'Medium alert: be careful', ['Avoid heavy outdoor work or sport in the afternoon.', 'Carry water and drink small amounts regularly.',
      'Take breaks in the shade or in a cool place.', 'Keep an eye on children and elderly family members.']],
    Low: ['normal', 'Low alert: stay aware', ['Normal activities are fine.', 'Keep drinking enough water.', 'Check the forecast again later in the day.']]
  };
  let forecasts = null, cityOf = null, drawing = false;
  const showAdvice = (level, info) => {
    const [cls, title, tips] = ADVICE[level] || ADVICE.Low;
    $('advice').innerHTML = `<div class="adv-head"><span class="badge ${cls}">${esc(level)}</span><h3>${title}</h3></div>
      <p class="adv-info">${esc(info)}</p><ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>`;
  };
  // Alerts shown as cards (region, city, predicted temperature, channels) instead of a table
  async function alertCards() {
    const box = $('alertTable');
    if (drawing || box.querySelector('.alert-grid')) return;
    drawing = true;
    try {
      if (!forecasts) { forecasts = {}; (await get('forecast')).forEach(f => forecasts[f.forecast_id] = f); }
      if (!cityOf) { cityOf = {}; (await get('stations')).forEach(s => (cityOf[s.region_name] = cityOf[s.region_name] || []).push(s.city)); }
      const order = { High: 0, Medium: 1, Low: 2 };
      const alerts = (await get('alerts')).sort((x, y) => (order[x.level] ?? 3) - (order[y.level] ?? 3) || x.alert_id - y.alert_id);
      const info = a => { const f = forecasts[a.forecast_id] || {}; return `Alert #${a.alert_id} · ${f.region_name || ''} · ${(cityOf[f.region_name] || []).join(', ')} · predicted ${f.predicted_temperature ?? '–'}°C`; };
      box.innerHTML = '<div class="alert-grid">' + alerts.map((a, i) => {
        const f = forecasts[a.forecast_id] || {}, cls = (ADVICE[a.level] || ADVICE.Low)[0];
        return `<div class="acard ${cls}" data-i="${i}">
          <div class="ac-top"><span class="badge ${cls}">${esc(a.level)}</span><span class="ac-id">Alert #${a.alert_id}</span></div>
          <div class="ac-region">${esc(f.region_name || '–')}</div>
          <div class="ac-city">${esc((cityOf[f.region_name] || []).join(', ') || '–')}</div>
          <div class="ac-temp">${f.predicted_temperature ?? '–'}°C <small>predicted</small></div>
          <div class="ac-foot">${esc(a.date)} · ${esc(String(a.time).slice(0, 5))}</div>
        </div>`;
      }).join('') + '</div>';
      const cards = box.querySelectorAll('.acard');
      cards.forEach((c, i) => c.onclick = () => { cards.forEach(x => x.classList.remove('sel')); c.classList.add('sel'); showAdvice(alerts[i].level, info(alerts[i])); });
      if (cards[0]) cards[0].click();
    } finally { drawing = false; }
  }

  // ---- 5. Download the Weather Data table (all pages, current search and region) as CSV ----
  async function downloadCsv() {
    const q = encodeURIComponent($('search').value), region = $('region').value;
    let rows = [], page = 1, pages = 1;
    do { const d = await get(`weather-data?search=${q}&region=${region}&page=${page}`); rows = rows.concat(d.rows); pages = d.pages; page++; } while (page <= pages);
    const cols = ['data_id', 'location', 'date', 'time', 'temperature', 'heat_index', 'region_name'];
    const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const text = [['Data ID', 'Location', 'Date', 'Time', 'Temperature (C)', 'Heat Index (C)', 'Region'].map(cell).join(','),
      ...rows.map(r => cols.map(c => cell(r[c])).join(','))].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv' }));
    a.download = 'weather_data.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  watch('cities', addMeters);
  watch('alertTable', alertCards);
  hottest().catch(console.error);
  if ($('csvBtn')) $('csvBtn').onclick = () => downloadCsv().catch(e => alert(e.message));
})();