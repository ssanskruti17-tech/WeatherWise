// // Frontend: asks the Flask API for data and draws the pages. Everything is in this one file.
// const $ = id => document.getElementById(id);
// const esc = t => String(t ?? '–').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
//
// // Asks the Flask API for data (the URL is /api/<path>)
// async function api(path) {
//   const res = await fetch('/api/' + path);
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.error || 'API error');
//   return data;
// }
//
// // Coloured status badge: High = red, Yes = dark red (heatwave), Moderate/Medium = amber, No/Low = green
// const badge = v => ({ html: `<span class="badge ${{High:'high', Yes:'heatwave', Moderate:'moderate', Medium:'moderate'}[v] || 'normal'}">${esc(v)}</span>` });
//
// // Builds a table; cells made by badge() are kept as HTML, everything else is escaped
// function table(heads, rows) {
//   const cell = c => `<td>${c && c.html !== undefined ? c.html : esc(c)}</td>`;
//   const body = rows.map(r => `<tr>${r.map(cell).join('')}</tr>`).join('') || `<tr><td colspan="${heads.length}">No records found.</td></tr>`;
//   return `<div class="table-wrap"><table><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
// }
//
// // Picture for a region / city, chosen from its climate type
// const picture = climate => /hot|dry/i.test(climate) ? 'desert' : /arid/i.test(climate) ? 'city'
//   : /trop|humid|coast/i.test(climate) ? 'coast' : /hill|mount|cold/i.test(climate) ? 'mountains' : 'plains';
// const bg = name => `background-image:url(img/${name}.svg)`;
//
// // Chart.js helper (line = filled area, bar = columns)
// const charts = {}, COLORS = ['#D64530', '#F79A25', '#8B1E3F'];
// function chart(id, type, labels, sets) {
//   if (charts[id]) charts[id].destroy();
//   charts[id] = new Chart($(id), {
//     type,
//     data: { labels, datasets: sets.map((s, i) => ({ ...s, borderColor: COLORS[i], backgroundColor: type === 'line' ? COLORS[i] + '33' : COLORS[i],
//                                                    fill: type === 'line', tension: .35, borderRadius: 5 })) },
//     options: { maintainAspectRatio: false, scales: { y: { beginAtZero: type === 'bar' } } }
//   });
// }
//
// // ---------- Pages ----------
// async function loadDash() {
//   const d = await api('dashboard'), s = d.summary;
//   $('stats').innerHTML = [['📋', 'Total Weather Records', s.total], ['🛰️', 'Weather Stations', s.stations], ['🗺️', 'Regions', s.regions],
//     ['🌡️', 'Average Temperature', s.avg_temp + '°C'], ['🔥', 'Maximum Temperature', s.max_temp + '°C'], ['🔔', 'Active Alerts', s.alerts]]
//     .map(([i, l, v]) => `<div class="stat"><span class="ico">${i}</span><div><div class="label">${l}</div><div class="value">${v}</div></div></div>`).join('');
//
//   chart('tempChart', 'line', d.temps.map(t => t.location), [
//     { label: 'Temperature (°C)', data: d.temps.map(t => +t.temperature) },
//     { label: 'Heat Index (°C)', data: d.temps.map(t => +t.heat_index) }]);
//
//   $('status').innerHTML = table(['Region', 'Predicted Temp', 'Severity', 'Heatwave'],
//     d.status.map(f => [f.region_name, f.predicted_temperature + '°C', badge(f.severity_level), badge(f.heatwave_status)]));
//
//   $('cities').innerHTML = d.cities.map(c => `<div class="city"><div class="photo" style="${bg(picture(c.climate_type))}"><span>${esc(c.location)}</span></div>
//     <div class="body"><div class="temp">${c.temperature}°C</div><p>Heat Index <b>${c.heat_index}°C</b></p><p>${esc(c.region_name)} · ${esc(c.climate_type)}</p></div></div>`).join('');
//
//   $('tiles').innerHTML = [['Explore Regions', 'regions', 'desert'], ['Forecast Insights', 'forecast', 'coast'], ['Early Warnings', 'alerts', 'city']]
//     .map(([t, v, i]) => `<a class="tile" href="#${v}" style="${bg(i)}"><span>${t}</span><b>→</b></a>`).join('');
// }
//
// let page = 1;
// async function loadData(p = 1) {
//   page = p;
//   if ($('region').options.length === 1) (await api('regions')).forEach(r => $('region').add(new Option(r.region_name, r.region_id)));
//   const d = await api(`weather-data?search=${encodeURIComponent($('search').value)}&region=${$('region').value}&page=${page}`);
//   $('dataTable').innerHTML = table(['Data ID', 'Location', 'Date', 'Time', 'Temperature', 'Heat Index', 'Region'],
//     d.rows.map(r => [r.data_id, r.location, r.date, r.time, r.temperature + '°C', r.heat_index + '°C', r.region_name]));
//   $('pageInfo').textContent = `Page ${d.page} of ${d.pages}`;
//   $('prev').disabled = page <= 1;
//   $('next').disabled = page >= d.pages;
// }
//
// async function loadStations() {
//   $('stationTable').innerHTML = table(['AWS ID', 'City', 'State', 'Installation Date', 'Latitude', 'Longitude', 'Region'],
//     (await api('stations')).map(s => [s.aws_id, s.city, s.state, s.installation_date, s.latitude, s.longitude, s.region_name]));
// }
//
// async function loadRegions() {
//   const rs = await api('regions');
//   $('regionCards').innerHTML = rs.map(r => `<div class="city"><div class="photo" style="${bg(picture(r.climate_type))}"><span>${esc(r.region_name)}</span></div>
//     <div class="body"><p>${esc(r.climate_type)}</p><div class="temp">${r.avg_temp ?? '–'}°C</div><p>average temperature</p></div></div>`).join('');
//   chart('regionChart', 'bar', rs.map(r => r.region_name), [
//     { label: 'Average', data: rs.map(r => +r.avg_temp) }, { label: 'Maximum', data: rs.map(r => +r.max_temp) }, { label: 'Minimum', data: rs.map(r => +r.min_temp) }]);
//   const t = v => v == null ? '–' : v + '°C';
//   $('regionTable').innerHTML = table(['Region ID', 'Region Name', 'Climate Type', 'Average', 'Maximum', 'Minimum'],
//     rs.map(r => [r.region_id, r.region_name, r.climate_type, t(r.avg_temp), t(r.max_temp), t(r.min_temp)]));
// }
//
// async function loadForecast() {
//   const fs = await api('forecast');
//   $('forecastTable').innerHTML = table(['Forecast ID', 'Region', 'Predicted Temperature', 'Severity Level', 'Hotspot Status', 'Heatwave Status', 'AI Model'],
//     fs.map(f => [f.forecast_id, f.region_name, f.predicted_temperature + '°C', badge(f.severity_level), badge(f.hotspot_status), badge(f.heatwave_status), f.model_name]));
//   chart('forecastChart', 'bar', fs.map(f => f.region_name), [{ label: 'Predicted Temperature (°C)', data: fs.map(f => +f.predicted_temperature) }]);
// }
//
// async function loadAlerts() {
//   $('alertTable').innerHTML = table(['Alert ID', 'Date', 'Time', 'Level', 'Forecast ID', 'Distribution Channel'],
//     (await api('alerts')).map(a => [a.alert_id, a.date, a.time, badge(a.level), a.forecast_id, a.channels]));
// }
//
// async function loadModels() {
//   $('modelTable').innerHTML = table(['Model ID', 'Model Name', 'Heatwave Prediction', 'Attribute'],
//     (await api('models')).map(m => [m.model_id, m.model_name, badge(m.heatwave_prediction), m.attribute]));
// }
//
// // ---------- Navigation (the page is chosen by the #part of the address) ----------
// const VIEWS = [['dash', 'Dashboard', '🏠', loadDash], ['data', 'Weather Data', '🌡️', loadData], ['stations', 'Weather Stations', '📡', loadStations],
//   ['regions', 'Regions', '🗺️', loadRegions], ['forecast', 'Forecast', '📈', loadForecast], ['alerts', 'Alerts', '🔔', loadAlerts], ['models', 'AI Models', '🤖', loadModels]];
// const loaded = {};
//
// $('nav').innerHTML = VIEWS.map(([id, name, icon]) => `<a href="#${id}" data-v="${id}">${icon} ${name}</a>`).join('');
//
// function go() {
//   const id = location.hash.slice(1) || 'dash', view = VIEWS.find(v => v[0] === id) || VIEWS[0];
//   document.querySelectorAll('.view').forEach(v => v.classList.toggle('show', v.id === view[0]));
//   document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.v === view[0]));
//   if (!loaded[view[0]]) {            // load each page's data the first time it is opened
//     loaded[view[0]] = true;
//     view[3]().catch(err => { loaded[view[0]] = false; showError(view[0], err); });
//   }
//   scrollTo(0, 0);
// }
//
// function showError(id, err) {
//   document.querySelectorAll(`#${id} .error`).forEach(e => e.remove());
//   $(id).insertAdjacentHTML('afterbegin', `<p class="error">${esc(err.message)}</p>`);
// }
//
// // Weather Data controls
// const reload = () => loadData(1).catch(e => showError('data', e));
// $('searchBtn').onclick = reload;
// $('resetBtn').onclick = () => { $('search').value = ''; $('region').value = 0; reload(); };
// $('prev').onclick = () => loadData(page - 1).catch(e => showError('data', e));
// $('next').onclick = () => loadData(page + 1).catch(e => showError('data', e));
//
// // Search box in the dashboard banner opens Weather Data with that search
// $('heroGo').onclick = () => { $('search').value = $('heroSearch').value; location.hash = 'data'; if (loaded.data) reload(); };
// $('heroSearch').onkeydown = e => { if (e.key === 'Enter') $('heroGo').click(); };
//
// // API status in the sidebar: proves the database connection works
// api('health').then(h => $('apiStatus').textContent = `● API connected · ${Object.keys(h.tables).length} tables`)
//              .catch(() => $('apiStatus').textContent = '● API not connected');
//
// window.onhashchange = go;
// go();

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
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'
};
const icon = n => `<svg class="i" viewBox="0 0 24 24">${P[n]}</svg>`;

// Chart.js helper (line = filled area, bar = columns)
const charts = {}, COLORS = ['#D64530', '#F79A25', '#8B1E3F'];
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

  $('tiles').innerHTML = [['Explore Regions', 'regions', 'map', '#8B1E3F'], ['Forecast Insights', 'forecast', 'trend', '#D64530'], ['Early Warnings', 'alerts', 'bell', '#A0522D']]
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
  $('stationTable').innerHTML = table(['AWS ID', 'City', 'State', 'Installation Date', 'Latitude', 'Longitude', 'Region'],
    (await api('stations')).map(s => [s.aws_id, s.city, s.state, s.installation_date, s.latitude, s.longitude, s.region_name]));
}

async function loadRegions() {
  const rs = await api('regions');
  $('regionCards').innerHTML = rs.map(r => `<div class="city"><div class="head">${esc(r.region_name)}</div>
    <div class="body"><p>${esc(r.climate_type)}</p><div class="temp">${r.avg_temp ?? '–'}°C</div><p>average temperature</p></div></div>`).join('');
  chart('regionChart', 'bar', rs.map(r => r.region_name), [
    { label: 'Average', data: rs.map(r => +r.avg_temp) }, { label: 'Maximum', data: rs.map(r => +r.max_temp) }, { label: 'Minimum', data: rs.map(r => +r.min_temp) }]);
  const t = v => v == null ? '–' : v + '°C';
  $('regionTable').innerHTML = table(['Region ID', 'Region Name', 'Climate Type', 'Average', 'Maximum', 'Minimum'],
    rs.map(r => [r.region_id, r.region_name, r.climate_type, t(r.avg_temp), t(r.max_temp), t(r.min_temp)]));
}

async function loadForecast() {
  const fs = await api('forecast');
  $('forecastTable').innerHTML = table(['Forecast ID', 'Region', 'Predicted Temperature', 'Severity Level', 'Hotspot Status', 'Heatwave Status', 'AI Model'],
    fs.map(f => [f.forecast_id, f.region_name, f.predicted_temperature + '°C', badge(f.severity_level), badge(f.hotspot_status), badge(f.heatwave_status), f.model_name]));
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

// ---------- Navigation (the page is chosen by the #part of the address) ----------
const VIEWS = [['dash', 'Dashboard', 'grid', loadDash], ['data', 'Weather Data', 'therm', loadData], ['stations', 'Weather Stations', 'antenna', loadStations],
  ['regions', 'Regions', 'map', loadRegions], ['forecast', 'Forecast', 'trend', loadForecast], ['alerts', 'Alerts', 'bell', loadAlerts], ['models', 'AI Models', 'chip', loadModels]];
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