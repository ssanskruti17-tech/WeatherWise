"""Weather Monitoring & Heatwave Prediction System - Flask backend.
Flow:  browser (index.html + app.js)  ->  Flask API (this file)  ->  PostgreSQL (the database you made in pgAdmin)
"""
import os
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, request

# ---- Database settings: change these to match your pgAdmin / PostgreSQL setup ----
DB = dict(
    host='localhost',
    port='5432',
    dbname='Climate',
    user='postgres',
    password='123456789',
    connect_timeout=5
)

app = Flask(__name__, static_folder='static', static_url_path='')
# Decimal numbers go out as numbers, dates/times as text
app.json.default = lambda o: float(o) if isinstance(o, Decimal) else str(o)


def query(sql, params=None):
    """Run one SELECT and return the rows as a list of dictionaries."""
    conn = psycopg2.connect(**DB)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            return cur.fetchall()
    finally:
        conn.close()


def api(path):
    """Register an API route; if anything fails, send the error message as JSON."""
    def wrap(fn):
        def handler():
            try:
                return jsonify(fn())
            except Exception as e:
                return jsonify(error=str(e)), 500
        handler.__name__ = fn.__name__
        return app.route(path)(handler)
    return wrap


@app.route('/')
def home():
    return app.send_static_file('index.html')


# Health check: confirms the database connects and every table can be read
TABLES = ['imd', 'region', 'weather_data', 'weather_station', 'weather_observation',
          'ai_model', 'forecast', 'alerts', 'alert_distribution']

@api('/api/health')
def health():
    counts = {t: query(f'SELECT COUNT(*) AS n FROM {t}')[0]['n'] for t in TABLES}
    return {'status': 'ok', 'database': DB['dbname'], 'tables': counts}


# Dashboard: summary cards, chart data, current weather, heatwave status
@api('/api/dashboard')
def dashboard():
    summary = query("""SELECT
        (SELECT COUNT(*) FROM weather_data) AS total,
        (SELECT COUNT(*) FROM weather_station) AS stations,
        (SELECT COUNT(*) FROM region) AS regions,
        (SELECT ROUND(AVG(temperature), 1) FROM weather_data) AS avg_temp,
        (SELECT MAX(temperature) FROM weather_data) AS max_temp,
        (SELECT COUNT(*) FROM alerts) AS alerts""")[0]
    temps = query("SELECT location, temperature, heat_index FROM weather_data ORDER BY data_id")
    cities = query("""SELECT w.location, w.temperature, w.heat_index, r.region_name, r.climate_type
        FROM weather_data w JOIN region r ON w.region_id = r.region_id
        WHERE w.location IN ('Pune', 'Jaipur', 'Delhi') ORDER BY w.data_id""")
    status = query("""SELECT r.region_name, f.predicted_temperature, f.severity_level, f.heatwave_status
        FROM forecast f JOIN region r ON f.region_id = r.region_id ORDER BY f.forecast_id""")
    return {'summary': summary, 'temps': temps, 'cities': cities, 'status': status}


# Weather Data: search by location, filter by region, 10 rows per page
@api('/api/weather-data')
def weather_data():
    search = '%' + request.args.get('search', '') + '%'
    region = request.args.get('region', 0, type=int)
    page = max(1, request.args.get('page', 1, type=int))
    per_page = 10
    where = 'WHERE w.location ILIKE %s AND (%s = 0 OR w.region_id = %s)'
    total = query(f'SELECT COUNT(*) AS n FROM weather_data w {where}', (search, region, region))[0]['n']
    rows = query(f"""SELECT w.data_id, w.location, w.date, w.time, w.temperature, w.heat_index, r.region_name
        FROM weather_data w JOIN region r ON w.region_id = r.region_id
        {where} ORDER BY w.data_id LIMIT %s OFFSET %s""",
        (search, region, region, per_page, (page - 1) * per_page))
    return {'rows': rows, 'page': page, 'pages': max(1, -(-total // per_page))}


@api('/api/stations')
def stations():
    return query("""SELECT s.aws_id, s.city, s.state, s.installation_date, s.latitude, s.longitude, r.region_name
        FROM weather_station s JOIN region r ON s.region_id = r.region_id ORDER BY s.aws_id""")


# Regions: each region with its average / maximum / minimum temperature
@api('/api/regions')
def regions():
    return query("""SELECT r.region_id, r.region_name, r.climate_type,
        ROUND(AVG(w.temperature), 1) AS avg_temp, MAX(w.temperature) AS max_temp, MIN(w.temperature) AS min_temp
        FROM region r LEFT JOIN weather_data w ON r.region_id = w.region_id
        GROUP BY r.region_id, r.region_name, r.climate_type ORDER BY r.region_id""")


@api('/api/forecast')
def forecast():
    return query("""SELECT f.forecast_id, r.region_name, f.predicted_temperature, f.severity_level,
        f.hotspot_status, f.heatwave_status, m.model_name
        FROM forecast f JOIN region r ON f.region_id = r.region_id
        JOIN ai_model m ON f.model_id = m.model_id ORDER BY f.forecast_id""")


# Alerts: the channels from ALERT_DISTRIBUTION are joined into one text, e.g. "SMS, Email"
@api('/api/alerts')
def alerts():
    return query("""SELECT a.alert_id, a.date, a.time, a.level, a.forecast_id,
        string_agg(d.distribution_channel, ', ') AS channels
        FROM alerts a LEFT JOIN alert_distribution d ON a.alert_id = d.alert_id
        GROUP BY a.alert_id, a.date, a.time, a.level, a.forecast_id ORDER BY a.alert_id""")


@api('/api/models')
def models():
    return query("SELECT model_id, model_name, heatwave_prediction, attribute FROM ai_model ORDER BY model_id")


if __name__ == '__main__':
    app.run(debug=True, port=5000)
