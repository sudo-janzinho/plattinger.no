# Plattinger.no - Jämför virkespriser i Norge

**Automatisk prissjämförelse för terrassebord och konstruksjonsvirke.**

---

## 📊 Vad är detta?

Plattinger.no hämtar automatiskt virkespriser från **5 stora byggevarekeder** i Norge och visar dem på ett ställe för enkel jämförelse.

**Butiker som jämförs:**
- 🟦 **Bauhaus**
- 🟧 **Byggmax**
- 🔴 **Maxbo**
- 🟧 **Monter**
- 🟪 **Obs BYGG**

---

## 🌐 Live sajt

**https://plattinger.no/**

Eller via GitHub Pages: **https://sudo-janzinho.github.io/plattinger.no/**

---

## 🔄 Automation

**Priser uppdateras automatiskt varje dag kl 06:00** (Europe/Stockholm) via ett cron-jobb som:

1. Hämtar nya priser från alla 5 butiker
2. Sparar till SQLite-databas (`virke_priser.db`)
3. Genererar ny `priser.json`
4. Git commit + push
5. GitHub Pages auto-deployar

**Resultat:** Färska priser varje morgon utan manuell inblandning!

---

## 📈 Dimensioner som jämförs

| Dimension | Användning |
|-----------|------------|
| **21x95 mm** | Terrassebord (Monter 22x95 inkluderas här) |
| **28x120 mm** | Terrassebord |
| **48x148 mm** | Konstruksjonsvirke |
| **48x198 mm** | Konstruksjonsvirke |

**Totalt:** 20 priser (5 butiker × 4 dimensioner)

---

## 🛠️ Teknik

### Frontend
- **HTML5** - Semantisk struktur
- **CSS3** - Responsiv design
- **JavaScript (ES6+)** - Hämtar och visar priser dynamiskt

### Backend / Automation
- **Python 3.8+** - Skript för prishämtning
- **SQLite** - Databas (`virke_priser.db`)
- **Playwright** - Web scraping för Maxbo/Byggmax
- **OpenClaw** - Cron-jobb och automation

### Hosting
- **GitHub Pages** - Gratis statisk hosting
- **Auto-deploy** vid git push

---

## 📁 Projektstruktur

```
plattinger.no/
├── src/
│   ├── index.html          # Huvudsida
│   ├── styles.css          # Design
│   ├── app.js              # Hämtar priser, visar kort
│   └── api/
│       └── priser.json     # Genereras dagligen från databas
├── update_priser_json.py   # Skript: DB → JSON
└── CNAME                   # Custom domain (plattinger.no)

virkespriser/
├── update_monter_from_db.py    # Hämta Monter priser
├── update_bauhaus_from_db.py   # Hämta Bauhaus priser
├── update_obsbygg_from_db.py   # Hämta Obs BYGG priser
├── update_maxbo_playwright.py  # Hämta Maxbo priser (Playwright)
├── update_byggmax_html.py      # Hämta Byggmax priser
├── virke_priser.db             # SQLite databas
└── KOR-MANUELL-UPPDATERING.bat # Manuell körning vid behov
```

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

# Installera Playwright (för Maxbo/Byggmax)
pip install playwright
playwright install
```

### Kör manuellt

```bash
# Hämta priser från alla butiker
cd virkespriser
python update_monter_from_db.py
python update_bauhaus_from_db.py
python update_obsbygg_from_db.py
python update_maxbo_playwright.py
python update_byggmax_html.py

# Uppdatera JSON
cd ../plattinger-no
python update_priser_json.py

# Pusha till GitHub
git add .
git commit -m "Daglig prisuppdatering"
git push
```

---

## 📊 Exempel på prisdata

```json
{
  "generated_at": "2026-04-06T11:30:48",
  "next_update": "2026-04-06T06:00:00",
  "dimensions": {
    "21x95": [
      {
        "butik": "Obs BYGG",
        "pris_kr_m": 14.95,
        "produkt": "Terrassebord impregnert",
        "status": "green",
        "kilde_url": "https://www.obsbygg.no/..."
      },
      {
        "butik": "Byggmax",
        "pris_kr_m": 18.75,
        ...
      }
    ]
  }
}
```

---

## 🎯 Funktioner

- ✅ **Automatisk uppdatering** - Dagligen kl 06:00
- ✅ **20 priser** - 5 butiker × 4 dimensioner
- ✅ **Lägsta pris markeras** - Grön bakgrund för bäst pris
- ✅ **Status-indikator** - Grön = uppdaterad idag
- ✅ **Prisförändringar** - Visa ↑/↓ % sedan senaste
- ✅ **Direktlänkar** - Klicka till butikens produktsida
- ✅ **Responsiv design** - Fungerar på mobil och desktop

---

## 📝 License

MIT License - använd fritt!

---

**Byggt med ❤️ av Anders (Jansson)**  
**Drivs av OpenClaw automation**  
**Asker, Norge - 2026**
