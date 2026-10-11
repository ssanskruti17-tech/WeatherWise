"""Checks every API endpoint and prints PASS / FAIL.
1) Start the server (run app.py)   2) Run this file."""
import json
import sys
import urllib.request

BASE = 'http://localhost:5000'
CHECKS = [   # (endpoint, test that the returned data must pass)
    ('/api/health',                   lambda d: d['status'] == 'ok' and len(d['tables']) == 9),
    ('/api/dashboard',                lambda d: d['summary']['total'] > 0 and d['cities'] and d['status']),
    ('/api/weather-data',             lambda d: len(d['rows']) > 0),
    ('/api/weather-data?search=pune', lambda d: len(d['rows']) > 0 and all('pune' in r['location'].lower() for r in d['rows'])),
    ('/api/stations',                 lambda d: len(d) > 0),
    ('/api/regions',                  lambda d: len(d) > 0),
    ('/api/forecast',                 lambda d: len(d) > 0),
    ('/api/alerts',                   lambda d: len(d) > 0),
    ('/api/models',                   lambda d: len(d) > 0),
]

failed = 0
for path, is_ok in CHECKS:
    try:
        with urllib.request.urlopen(BASE + path, timeout=10) as response:
            result = 'PASS' if is_ok(json.load(response)) else 'FAIL (data missing or unexpected)'
    except Exception as e:
        result = f'FAIL ({e})'
    failed += result != 'PASS'
    print(f'{result:<8} {path}')

print('\nAll endpoints working.' if not failed else f'\n{failed} endpoint(s) failed.')
sys.exit(1 if failed else 0)
