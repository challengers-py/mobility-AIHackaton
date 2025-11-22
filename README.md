# 🚆 Customer Happiness Index – Hackathon MVP

## 📝 Descripción

Proyecto para analizar la satisfacción de usuarios del sistema de transporte (Metro CDMX) mediante datos públicos y sintéticos, generando insights accionables para decisiones de producto y servicio.

## 📌 Objetivo

Construir un MVP de 24 horas que permita:

- Recolectar datos (emails sintéticos, tweets, Google Reviews, etc.)
- Analizarlos mediante sentimiento, temas y tendencias
- Visualizarlos en un dashboard simple
- Generar recomendaciones accionables basadas en insights reales

## 🧩 Roles del Equipo

### 👥 1. Data Collection

- Scraping (BeautifulSoup, snscrape)
- Limpieza y normalización
- **Entrega:** `dataset_final.csv`

### 👥 2. Data Analysis/API

- Sentiment analysis
- Topic modeling
- Issues emergentes
- **Entrega:** JSONs en `analysis/output/`

### 👥 3. Frontend (Dashboard)

- HTML + CSS + JavaScript
- Gráficas interactivas (Plotly o Chart.js)
- Llamadas a la API con `fetch()`
