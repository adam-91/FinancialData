<h1 align="center">📈 Currency & GPW Data Collector</h1>

<p align="center">
Python application for collecting and processing financial market data from<br>
<b>NBP API</b> (currency exchange rates) and <b>GPW market data</b> using <code>yfinance</code>.
</p>

<p align="center">
<img src="https://img.shields.io/badge/Python-3.14-blue" />
<img src="https://img.shields.io/badge/Docker-enabled-blue" />
<img src="https://img.shields.io/badge/httpx-async-green" />
</p>

---

<h2>🚀 Features</h2>

<ul>
  <li>Fetch current and historical exchange rates from NBP API</li>
  <li>Download GPW stock market data using <code>yfinance</code></li>
  <li>Fast HTTP communication using <code>httpx</code></li>
  <li>Containerized environment with Docker</li>
  <li>Simple data normalization and processing</li>
  <li>Export data to CSV / JSON</li>
  <li>Error handling for unavailable API responses</li>
  <li>Modular and extendable project structure</li>
</ul>

---

<h2>🛠 Technologies</h2>

<ul>
  <li>Python 3.14</li>
  <li>httpx</li>
  <li>pandas</li>
  <li>yfinance</li>
  <li>Docker</li>
  <li>datetime</li>
  <li>CSV / JSON processing</li>
</ul>

---

<h2>📊 Example Data Sources</h2>

<h3>NBP API</h3>

<ul>
  <li>EUR/PLN</li>
  <li>USD/PLN</li>
  <li>GBP/PLN</li>
</ul>

<h3>GPW / yfinance</h3>

<ul>
  <li>CDR.WA</li>
  <li>PKN.WA</li>
  <li>KGH.WA</li>
</ul>

---

<h2>⚙️ Installation</h2>

<p>Clone repository:</p>

<pre>
git clone https://github.com/adam-91/FinancialData.git
cd FinancialData
</pre>

<p>Build Docker container:</p>

<pre>
docker build -t FinancialData .
</pre>

<p>Run application:</p>

<pre>
docker run FinancialData
</pre>

---

<h2>▶️ Local Development</h2>

<p>Install dependencies:</p>

<pre>
pip install -r app/requirements.txt
</pre>

<p>Run locally:</p>

<pre>
python main.py
</pre>

---

<h2>🎯 Project Goals</h2>

<ul>
  <li>Improve Python backend development skills</li>
  <li>Practice working with REST APIs and financial data</li>
  <li>Learn containerization with Docker</li>
  <li>Build data engineering and automation portfolio projects</li>
</ul>

---

<h2>🔮 Future Improvements</h2>

<ul>
  <li>Database integration (PostgreSQL / SQLite)</li>
  <li>REST API layer with FastAPI</li>
  <li>Scheduled background jobs</li>
  <li>Data visualization dashboard</li>
  <li>Unit and integration tests</li>
  <li>CI/CD pipeline integration</li>
</ul>

---

<h2>⚠️ Disclaimer</h2>

<p>
This project is intended for educational and portfolio purposes only and should not be treated as financial advice.
</p>
