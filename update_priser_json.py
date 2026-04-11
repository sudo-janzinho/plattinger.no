"""
UPPDATERA PRISER.JSON - BYGGS FRÅN GRUNDEN
===========================================
Läser ALLA priser från databaser (Asker + Oslo) och bygger ny JSON-struktur.
Stöder flera kommuner via kommune-fältet.
Ingen beroende på gammal JSON - alltid komplett!

Usage: python update_priser_json.py [kommune]
       python update_priser_json.py Asker   (default)
       python update_priser_json.py Oslo
       python update_priser_json.py all     (alla kommuner)
"""

import sqlite3
import json
import sys
import os
from datetime import datetime

# Determine which kommune(s) to update
KOMMUNE_ARG = sys.argv[1].lower() if len(sys.argv) > 1 else 'asker'

# Database paths
VIRKESPRIser_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'virkespriser')

DB_PATHS = {
    'asker': {
        'db': os.path.join(VIRKESPRIser_DIR, 'virke_priser.db'),
        'col_butik': 'butik',  # Asker db uses Swedish column name
        'kommune': 'Asker',
    },
    'oslo': {
        'db': os.path.join(VIRKESPRIser_DIR, 'oslo', 'virke_priser_oslo.db'),
        'col_butik': 'butikk',  # Other dbs use Norwegian column name
        'kommune': 'Oslo',
    },
}

# Butikkonfig - färger och ikoner
STORE_CONFIG = {
    'Bauhaus': {'color': 'bg-blue-600', 'icon': 'B'},
    'Byggmax': {'color': 'bg-orange-600', 'icon': 'B'},
    'Maxbo': {'color': 'bg-red-600', 'icon': 'M'},
    'Monter': {'color': 'bg-orange-600', 'icon': 'M'},
    'Obs BYGG': {'color': 'bg-pink-600', 'icon': 'O'}
}

def build_json_for_kommune(kommune_key):
    """Build prices JSON for a single kommune"""
    config = DB_PATHS[kommune_key]
    db_path = config['db']
    col_butik = config['col_butik']
    kommune = config['kommune']
    
    if not os.path.exists(db_path):
        print(f"[WARN] Databasen finns inte: {db_path}")
        return None
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute(f"""
        SELECT {col_butik}, dimension, pris_kr_m, produkt, kvalitet_klass, impregnering, 
               kampanj, kilde_url, datum_funnet, uppdaterad, ort, kommune
        FROM virke_priser 
        WHERE pris_kr_m > 0
        ORDER BY dimension, {col_butik}
    """)
    rows = c.fetchall()
    conn.close()
    
    print(f"  {kommune}: Läste {len(rows)} priser från databasen")
    
    dimensions = {}
    for row in rows:
        (butik, dim, price, produkt, klass, imp, kampanj, url, datum, updated, ort, kmn) = row
        
        if dim not in dimensions:
            dimensions[dim] = []
        
        store_config = STORE_CONFIG.get(butik, {'color': 'bg-gray-600', 'icon': '?'})
        
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
            'store_color': store_config['color'],
            'store_icon': store_config['icon'],
            'kommune': kmn or kommune,
            'changed_since_last': False,
            'previous_price': price,
            'change': 0,
            'change_percent': 0.0
        })
    
    return dimensions

def main():
    now = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
    
    # Determine which kommuner to process
    if KOMMUNE_ARG == 'all':
        kommune_keys = list(DB_PATHS.keys())
    else:
        kommune_keys = [KOMMUNE_ARG] if KOMMUNE_ARG in DB_PATHS else ['asker']
    
    print(f"Bygger priser.json för: {[DB_PATHS[k]['kommune'] for k in kommune_keys]}")
    
    # Collect all prices
    all_dimensions = {}
    for key in kommune_keys:
        result = build_json_for_kommune(key)
        if result:
            for dim, prices in result.items():
                if dim not in all_dimensions:
                    all_dimensions[dim] = []
                all_dimensions[dim].extend(prices)
    
    # Build JSON structure
    data = {
        'generated_at': now,
        'next_update': datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
        'updated_per_kommune': {},
        'dimensions': {}
    }
    
    # Calculate last update per kommune
    for key in kommune_keys:
        config = DB_PATHS[key]
        db_path = config['db']
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute(f"SELECT MAX(uppdaterad) FROM virke_priser")
            result = c.fetchone()[0]
            conn.close()
            data['updated_per_kommune'][config['kommune']] = result or now
        else:
            data['updated_per_kommune'][config['kommune']] = now
    
    for dim in ['21x95', '28x120', '48x148', '48x198']:
        if dim in all_dimensions:
            sorted_prices = sorted(all_dimensions[dim], key=lambda x: x['pris_kr_m'])
            data['dimensions'][dim] = sorted_prices
    
    # Save JSON
    json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api', 'priser.json')
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n[OK] Byggde priser.json från grunden")
    print(f"Kommuner: {[DB_PATHS[k]['kommune'] for k in kommune_keys]}")
    print(f"Dimensioner: {list(data['dimensions'].keys())}")
    for dim, prices in data['dimensions'].items():
        kommune_count = {}
        for p in prices:
            k = p.get('kommune', 'Okänd')
            kommune_count[k] = kommune_count.get(k, 0) + 1
        print(f"  {dim}: {len(prices)} priser ({kommune_count})")
    print(f"Sparad till: {json_path}")
    print(f"updated_per_kommune: {data.get('updated_per_kommune', 'Saknas')}")
    print(f"Timestamp: {now}")

if __name__ == '__main__':
    main()