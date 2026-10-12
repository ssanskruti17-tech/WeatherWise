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
// // Simple line icons (inline SVG, no emoji)
// const P = {
//   grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
//   therm:'<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>',
//   antenna:'<circle cx="12" cy="11" r="2"/><path d="M12 13v8M8 21h8M7.8 6.8a6 6 0 0 0 0 8.4M16.2 6.8a6 6 0 0 1 0 8.4"/>',
//   map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
//   trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
//   bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
//   chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
//   db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
//   fire:'<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
//   arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'
// };
// const icon = n => `<svg class="i" viewBox="0 0 24 24">${P[n]}</svg>`;
//
// // Chart.js helper (line = filled area, bar = columns)
// const charts = {}, COLORS = ['#B3262B', '#D4AF6A', '#4A1228'];
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
//   $('stats').innerHTML = [['db', 'Total Weather Records', s.total], ['antenna', 'Weather Stations', s.stations], ['map', 'Regions', s.regions],
//     ['therm', 'Average Temperature', s.avg_temp + '°C'], ['fire', 'Maximum Temperature', s.max_temp + '°C'], ['bell', 'Active Alerts', s.alerts]]
//     .map(([i, l, v]) => `<div class="stat"><span class="ico">${icon(i)}</span><div><div class="label">${l}</div><div class="value">${v}</div></div></div>`).join('');
//
//   chart('tempChart', 'line', d.temps.map(t => t.location), [
//     { label: 'Temperature (°C)', data: d.temps.map(t => +t.temperature) },
//     { label: 'Heat Index (°C)', data: d.temps.map(t => +t.heat_index) }]);
//
//   $('status').innerHTML = table(['Region', 'Predicted Temp', 'Severity', 'Heatwave'],
//     d.status.map(f => [f.region_name, f.predicted_temperature + '°C', badge(f.severity_level), badge(f.heatwave_status)]));
//
//   $('cities').innerHTML = d.cities.map(c => `<div class="city"><div class="head">${esc(c.location)}</div>
//     <div class="body"><div class="temp">${c.temperature}°C</div><p>Heat Index <b>${c.heat_index}°C</b></p><p>${esc(c.region_name)} · ${esc(c.climate_type)}</p></div></div>`).join('');
//
//   $('tiles').innerHTML = [['Explore Regions', 'regions', 'map', '#4A1228'], ['Forecast Insights', 'forecast', 'trend', '#7A1F3D'], ['Early Warnings', 'alerts', 'bell', '#8C6A25']]
//     .map(([t, v, i, c]) => `<a class="tile" href="#${v}" style="background:${c}">${icon(i)}<span>${t}</span>${icon('arrow')}</a>`).join('');
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
//   $('regionCards').innerHTML = rs.map(r => `<div class="city"><div class="head">${esc(r.region_name)}</div>
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
// const VIEWS = [['dash', 'Dashboard', 'grid', loadDash], ['data', 'Weather Data', 'therm', loadData], ['stations', 'Weather Stations', 'antenna', loadStations],
//   ['regions', 'Regions', 'map', loadRegions], ['forecast', 'Forecast', 'trend', loadForecast], ['alerts', 'Alerts', 'bell', loadAlerts], ['models', 'AI Models', 'chip', loadModels]];
// const loaded = {};
//
// $('nav').innerHTML = VIEWS.map(([id, name, ic]) => `<a href="#${id}" data-v="${id}">${icon(ic)}${name}</a>`).join('');
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
// window.onhashchange = go;
// go();
//
// // Extra features (works on top of app.js, nothing in app.js needs to change):
// //  1. Heat risk meter on the city cards   2. Safety advice for each alert
// //  3. Top 5 hottest regions               5. Download weather data as CSV
// (function () {
//   const $ = id => document.getElementById(id);
//   const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
//   const get = path => fetch('/api/' + path).then(r => r.json());
//   const watch = (id, fn) => { const el = $(id); if (el) new MutationObserver(() => fn().catch(console.error)).observe(el, { childList: true }); };
//
//   // ---- 1. Heat risk meter (based on the heat index) ----
//   const LEVELS = [[32, 'Safe', '#2E9E6B'], [41, 'Caution', '#F79A25'], [54, 'Danger', '#D64530'], [999, 'Extreme', '#8B1E3F']];
//   let heat = null;
//   async function addMeters() {
//     if (!heat) { heat = {}; (await get('dashboard')).temps.forEach(t => heat[t.location] = +t.heat_index); }
//     $('cities').querySelectorAll('.city').forEach(card => {
//       if (card.querySelector('.meter')) return;
//       const hi = heat[((card.querySelector('.photo span, .head') || {}).textContent || '').trim()];
//       if (hi == null) return;
//       const [, label, color] = LEVELS.find(l => hi < l[0]);
//       (card.querySelector('.body') || card).insertAdjacentHTML('beforeend',
//         `<div class="meter"><div class="meter-top"><span>Heat risk</span><b style="color:${color}">${label}</b></div>
//          <div class="meter-bar"><i style="width:${Math.min(hi / 54 * 100, 100)}%;background:${color}"></i></div></div>`);
//     });
//   }
//
//   // ---- 3. Top 5 hottest regions (highest recorded temperature) ----
//   async function hottest() {
//     const rs = (await get('regions')).filter(r => r.max_temp != null).sort((a, b) => b.max_temp - a.max_temp).slice(0, 5);
//     $('hottest').innerHTML = rs.map((r, i) => `<div class="rank"><span class="no">${i + 1}</span>
//       <div class="rk-main"><div class="rk-name">${esc(r.region_name)} <small>${esc(r.climate_type)}</small></div>
//       <div class="rk-bar"><i style="width:${Math.min(r.max_temp / 50 * 100, 100)}%"></i></div></div><b>${r.max_temp}°C</b></div>`).join('');
//   }
//
//   // ---- 2. Safety advice: click an alert row to see what people should do ----
//   const ADVICE = {
//     High: ['high', 'High alert: heatwave danger', ['Stay indoors between 12 pm and 4 pm.', 'Drink water often, even if not thirsty (ORS or buttermilk also help).',
//       'Wear light, loose, light-coloured cotton clothes and cover your head outdoors.', 'Check on the elderly, children and people who work outside.',
//       'Never leave children or pets in a parked vehicle.', 'Dizziness, confusion or very hot dry skin may be heat stroke: call 108 or 112 immediately.']],
//     Medium: ['moderate', 'Medium alert: be careful', ['Avoid heavy outdoor work or sport in the afternoon.', 'Carry water and drink small amounts regularly.',
//       'Take breaks in the shade or in a cool place.', 'Keep an eye on children and elderly family members.']],
//     Low: ['normal', 'Low alert: stay aware', ['Normal activities are fine.', 'Keep drinking enough water.', 'Check the forecast again later in the day.']]
//   };
//   let forecasts = null, cityOf = null, drawing = false;
//   const showAdvice = (level, info) => {
//     const [cls, title, tips] = ADVICE[level] || ADVICE.Low;
//     $('advice').innerHTML = `<div class="adv-head"><span class="badge ${cls}">${esc(level)}</span><h3>${title}</h3></div>
//       <p class="adv-info">${esc(info)}</p><ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>`;
//   };
//   // Alerts shown as cards (region, city, predicted temperature, channels) instead of a table
//   async function alertCards() {
//     const box = $('alertTable');
//     if (drawing || box.querySelector('.alert-grid')) return;
//     drawing = true;
//     try {
//       if (!forecasts) { forecasts = {}; (await get('forecast')).forEach(f => forecasts[f.forecast_id] = f); }
//       if (!cityOf) { cityOf = {}; (await get('stations')).forEach(s => (cityOf[s.region_name] = cityOf[s.region_name] || []).push(s.city)); }
//       const order = { High: 0, Medium: 1, Low: 2 };
//       const alerts = (await get('alerts')).sort((x, y) => (order[x.level] ?? 3) - (order[y.level] ?? 3) || x.alert_id - y.alert_id);
//       const info = a => { const f = forecasts[a.forecast_id] || {}; return `Alert #${a.alert_id} · ${f.region_name || ''} · ${(cityOf[f.region_name] || []).join(', ')} · predicted ${f.predicted_temperature ?? '–'}°C`; };
//       box.innerHTML = '<div class="alert-grid">' + alerts.map((a, i) => {
//         const f = forecasts[a.forecast_id] || {}, cls = (ADVICE[a.level] || ADVICE.Low)[0];
//         return `<div class="acard ${cls}" data-i="${i}">
//           <div class="ac-top"><span class="badge ${cls}">${esc(a.level)}</span><span class="ac-id">Alert #${a.alert_id}</span></div>
//           <div class="ac-region">${esc(f.region_name || '–')}</div>
//           <div class="ac-city">${esc((cityOf[f.region_name] || []).join(', ') || '–')}</div>
//           <div class="ac-temp">${f.predicted_temperature ?? '–'}°C <small>predicted</small></div>
//           <div class="ac-foot">${esc(a.date)} · ${esc(String(a.time).slice(0, 5))}</div>
//         </div>`;
//       }).join('') + '</div>';
//       const cards = box.querySelectorAll('.acard');
//       cards.forEach((c, i) => c.onclick = () => { cards.forEach(x => x.classList.remove('sel')); c.classList.add('sel'); showAdvice(alerts[i].level, info(alerts[i])); });
//       if (cards[0]) cards[0].click();
//     } finally { drawing = false; }
//   }
//
//   // ---- 5. Download the Weather Data table (all pages, current search and region) as CSV ----
//   async function downloadCsv() {
//     const q = encodeURIComponent($('search').value), region = $('region').value;
//     let rows = [], page = 1, pages = 1;
//     do { const d = await get(`weather-data?search=${q}&region=${region}&page=${page}`); rows = rows.concat(d.rows); pages = d.pages; page++; } while (page <= pages);
//     const cols = ['data_id', 'location', 'date', 'time', 'temperature', 'heat_index', 'region_name'];
//     const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
//     const text = [['Data ID', 'Location', 'Date', 'Time', 'Temperature (C)', 'Heat Index (C)', 'Region'].map(cell).join(','),
//       ...rows.map(r => cols.map(c => cell(r[c])).join(','))].join('\r\n');
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv' }));
//     a.download = 'weather_data.csv';
//     a.click();
//     setTimeout(() => URL.revokeObjectURL(a.href), 1000);
//   }
//
//   watch('cities', addMeters);
//   watch('alertTable', alertCards);
//   hottest().catch(console.error);
//   if ($('csvBtn')) $('csvBtn').onclick = () => downloadCsv().catch(e => alert(e.message));
// })();

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
const charts = {}, COLORS = ['#B3262B', '#D4AF6A', '#4A1228'];
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

  $('tiles').innerHTML = [['Explore Regions', 'regions', 'map', '#4A1228'], ['Forecast Insights', 'forecast', 'trend', '#7A1F3D'], ['Early Warnings', 'alerts', 'bell', '#8C6A25']]
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