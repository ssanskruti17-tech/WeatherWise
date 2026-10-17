# 🌦️ WeatherWise — Weather Monitoring & Heatwave Prediction System

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
</p>

<p align="center">
  <b>Monitor weather data. Explore heatwave conditions. Support early warnings.</b>
  <br/>
  A college project focused on weather analytics and heatwave monitoring.
</p>

<p align="center">
  <a href="#-about-the-project">About</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-setup-and-installation">Setup</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-future-improvements">Future Plans</a>
</p>

---

## 📌 About the Project

**WeatherWise** is a weather monitoring and heatwave prediction system designed to present weather information through a centralized analytics dashboard.

The application connects a web-based interface to a Flask backend, which retrieves weather records, regional information, station details, forecasts, and alerts from a PostgreSQL database.

The dashboard is designed to help users explore temperature trends, compare regions, and view heatwave-related information in an organized way.

This project combines frontend development, backend API development, and database management to demonstrate how weather information can be presented through a data-driven web application.

## ✨ Features

- 📊 **Weather Analytics Dashboard** — Summary cards and temperature visualizations
- 🌡️ **Temperature Overview** — Explore temperature and heat-index records
- 🔎 **Weather Data Search** — Search locations and filter records by region
- 📄 **Paginated Records** — Browse weather data in smaller sections
- 📥 **CSV Export** — Download weather records from the interface
- 🗺️ **Region Analysis** — Explore regional temperature statistics
- 📡 **Weather Stations** — View station and location information
- 🔥 **Heatwave Forecasts** — Display predicted temperatures and severity information
- 🚨 **Alert Monitoring** — View alerts and their distribution channels
- 🧪 **API Testing** — Test backend endpoints using the included test script

*Note: The application reads from a configured PostgreSQL database. Forecast and heatwave results depend on the data stored in that database; the presence of forecast records does not by itself mean a new prediction model is trained by the application.*

## 🖥️ Dashboard Preview

Add a screenshot of your running application to make the repository more engaging.

1. Run the application locally.
2. Take a screenshot of the dashboard.
3. Create a folder named `screenshots` in the project directory.
4. Save the screenshot as `weatherwise-dashboard.png`.

Then this section will display it:

<p align="center">
  <img src="screenshots/weatherwise-dashboard.png" alt="WeatherWise Dashboard" width="95%"/>
</p>

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend application logic |
| Flask | Web server and REST API endpoints |
| PostgreSQL | Stores weather, region, station, forecast, and alert records |
| psycopg2 | Connects Python to PostgreSQL |
| HTML5 | Webpage structure |
| CSS3 | Dashboard layout and styling |
| JavaScript | Frontend interactions and API communication |
| Chart.js | Weather data visualizations |
| Git & GitHub | Version control and project hosting |

## 🏗️ System Architecture

```text
User
  |
  v
Web Dashboard
(HTML + CSS + JavaScript)
  |
  v
Flask Backend
  |
  v
REST API Endpoints
  |
  v
PostgreSQL Database
  |
  v
Weather Records, Regions,
Stations, Forecasts & Alerts
  |
  v
Dashboard Displays Results
```

## 📂 Project Structure

```text
WeatherWise/
├── app.py
├── requirements.txt
├── test_api.py
├── static/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── hero.jpg
│   └── img/
│       ├── city.svg
│       ├── coast.svg
│       ├── desert.svg
│       ├── hero.svg
│       ├── mountains.svg
│       └── plains.svg
└── README.md
```

## ⚙️ Setup and Installation

### Prerequisites

Install the following before running the application:

- [Python](https://www.python.org/downloads/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads/)

You will also need a PostgreSQL database containing the tables and data expected by the application.

### 1. Clone the repository

```bash
git clone https://github.com/ssanskruti17-tech/WeatherWise.git
```

### 2. Open the project folder

```bash
cd WeatherWise
```

### 3. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure PostgreSQL

The backend currently expects a PostgreSQL database named `climate` on `localhost:5432`, with a PostgreSQL user named `postgres`.

**Important:** The database password is currently configured directly in `app.py`. Before sharing or deploying the project, move database credentials into environment variables and never publish real passwords.

Make sure the required tables exist and contain the data needed for the dashboard.

### 6. Start the application

```bash
python app.py
```

Open the following URL in your browser:

**http://localhost:5000**

The Flask application serves the frontend and provides the API endpoints.

## 🔗 API Endpoints

The backend exposes the following endpoints:

| Endpoint | Purpose |
|---|---|
| `/api/health` | Check database connectivity and table counts |
| `/api/dashboard` | Retrieve dashboard summaries, temperatures, city data, and heatwave status |
| `/api/weather-data` | Retrieve searchable and paginated weather records |
| `/api/stations` | Retrieve weather station details |
| `/api/regions` | Retrieve regional temperature statistics |
| `/api/forecast` | Retrieve forecast and severity records |
| `/api/alerts` | Retrieve alerts and their distribution channels |
| `/api/models` | Retrieve AI model metadata stored in the database |

Example request:

```text
http://localhost:5000/api/health
```

The endpoints return JSON responses. The database must be available for successful requests.

## 🧪 Testing the API

With the Flask application running and the database populated, open another terminal and execute:

```bash
python test_api.py
```

The test script checks the expected API endpoints and prints `PASS` or `FAIL` for each check.

Some tests require existing records in the database, so an empty or incomplete database may cause failures.

## 📚 What I Learned

- Connecting a Flask application to PostgreSQL
- Writing SQL queries for dashboard data
- Building backend API endpoints
- Displaying database results in a web interface
- Working with weather records, regions, forecasts, and alerts
- Organizing frontend and backend files
- Testing API responses and debugging database connectivity


## 👩‍💻 Author

**Sanskruti Sonawane**

- GitHub: [@ssanskruti17-tech](https://github.com/ssanskruti17-tech)
- Project: [WeatherWise](https://github.com/ssanskruti17-tech/WeatherWise)

---

<p align="center">
  Built with 💻, ☀️, and a passion for learning.
</p>

<p align="center">
  <sub>WeatherWise is an educational project. Its displayed forecasts and alerts depend on the configured database and should not be treated as official weather warnings.</sub>
</p>
