# Plattinger.no - Jämför virkespriser

**En automatisk priss jämförelsetjänst för terrassebord och konstruksjonsvirke i Norge.**

---

## 📊 Vad är detta?

Plattinger.no hämtar automatiskt virkespriser från 5 stora byggevarekeder i Norge:

- **Bauhaus**
- **Byggmax**
- **Maxbo**
- **Monter**
- **Obs BYGG**

Priser uppdateras **dagligen kl 06:00** via automatiserte skript.

---

## 🌐 Live sajt

**https://plattinger.no/**

Eller GitHub Pages: **https://sudo-janzinho.github.io/plattinger.no/**

---

## 🛠️ Teknik

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Python-skript som kör dagligen via cron
- **Databas:** SQLite (`virke_priser.db`)
- **Hosting:** GitHub Pages (gratis)
- **Automation:** OpenClaw cron-jobbs

---

## 📁 Struktur

```
plattinger.no/
├── index.html          # Huvudsida
├── styles.css          # Design
├── app.js              # Frontend logic
├── api/
│   └── priser.json     # Priser (genereras dagligen)
└── CNAME               # Custom domain (plattinger.no)
```

---

## 🔄 Automation

Ett cron-jobb körs varje dag kl 06:00:

1. Hämtar nya priser från alla 5 butiker
2. Uppdaterar SQLite-databas
3. Genererar ny `priser.json`
4. Git commit + push
5. GitHub Pages auto-deployar

**Resultat:** Färska priser varje morgon!

---

## 📈 Funktioner

- ✅ Jämför priser för 4 dimensioner (21x95, 28x120, 48x148, 48x198)
- ✅ Visa lägsta pris per dimension
- ✅ Färgkodade status (grön = uppdaterad idag)
- ✅ Prisförändringar visas (↑/↓ %)
- ✅ Länkar direkt till butikernas produktsidor

---

## 🚀 Kom igång

### Förutsättningar
- Python 3.8+
- Git
- GitHub-konto

### Installation

```bash
# Klona repot
git clone https://github.com/sudo-janzinho/plattinger.no.git
cd plattinger.no

# Installera beroenden (för skripten)
pip install playwright
playwright install
```

### Kör manuellt

```bash
# Hämta priser från alla butiker
python update_monter_from_db.py
python update_bauhaus_from_db.py
python update_obsbygg_from_db.py
python update_maxbo_playwright.py
python update_byggmax_html.py

# Uppdatera JSON
python update_priser_json.py

# Pusha till GitHub
git add .
git commit -m "Daglig prisuppdatering"
git push
```

---

## 📝 License

MIT License - använd fritt!

---

**Byggt med ❤️ av Anders (Jansson)**  
**Drivs av OpenClaw automation**
