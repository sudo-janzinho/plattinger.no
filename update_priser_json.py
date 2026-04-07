"""
UPPDATERA PRISER.JSON - BYGGS FRÅN GRUNDEN
===========================================
Läser ALLA priser från databasen och bygger ny JSON-struktur.
Ingen beroende på gammal JSON - alltid komplett!
"""

import sqlite3
import json
from datetime import datetime

DB_PATH = '../virkespriser/virke_priser.db'
JSON_PATH = 'api/priser.json'

# Butikkonfig - färger och ikoner
STORE_CONFIG = {
    'Bauhaus': {'color': 'bg-blue-600', 'icon': 'B'},
    'Byggmax': {'color': 'bg-orange-600', 'icon': 'B'},
    'Maxbo': {'color': 'bg-red-600', 'icon': 'M'},
    'Monter': {'color': 'bg-orange-600', 'icon': 'M'},
    'Obs BYGG': {'color': 'bg-pink-600', 'icon': 'O'}
}

# Hämta ALLA priser från databasen
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute("""
    SELECT butik, dimension, pris_kr_m, produkt, kvalitet_klass, impregnering, 
           kampanj, kilde_url, datum_funnet, uppdaterad, ort
    FROM virke_priser 
    ORDER BY dimension, butik
""")
rows = c.fetchall()
conn.close()

print(f"Läste {len(rows)} priser från databasen")

# Gruppera priser per dimension
dimensions = {}
for row in rows:
    (butik, dim, price, produkt, klass, imp, kampanj, url, datum, updated, ort) = row
    
    if dim not in dimensions:
        dimensions[dim] = []
    
    config = STORE_CONFIG.get(butik, {'color': 'bg-gray-600', 'icon': '?'})
    
    dimensions[dim].append({
        'butik': butik,
        'pris_kr_m': price,
        'produkt': produkt or '',
        'kvalitet_klass': klass or 'Kl.1',
        'impregnering': imp or 'CU',
        'kampanj': bool(kampanj),
        'kilde_url': url or '',
        'datum_funnet': datum or datetime.now().strftime('%Y-%m-%d'),
        'uppdaterad': updated or datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'green',
        'store_color': config['color'],
        'store_icon': config['icon'],
        'changed_since_last': False,
        'previous_price': price,
        'change': 0,
        'change_percent': 0.0
    })

# Bygg hela JSON-strukturen
now = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
data = {
    'generated_at': now,
    'next_update': datetime.now().strftime('%Y-%m-%dT06:00:00'),
    'dimensions': {}
}

# Lägg till dimensioner i rätt ordning
for dim in ['21x95', '28x120', '48x148', '48x198']:
    if dim in dimensions:
        # Sortera efter pris (lägst först)
        sorted_prices = sorted(dimensions[dim], key=lambda x: x['pris_kr_m'])
        data['dimensions'][dim] = sorted_prices

# Spara JSON
with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n[OK] Byggde priser.json från grunden")
print(f"Dimensioner: {list(data['dimensions'].keys())}")
for dim, prices in data['dimensions'].items():
    print(f"  {dim}: {len(prices)} priser")
print(f"Sparad till: {JSON_PATH}")
print(f"Timestamp: {now}")
