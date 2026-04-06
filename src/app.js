/**
 * Plattinger.no - Visar virkespriser från src/api/priser.json
 * Version: 2026-04-07-0033 - FIXAD SÖKVÄG
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('src/api/priser.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderPrices(data);
  } catch (err) {
    console.error('Fel:', err);
    document.getElementById('loading')?.classList.add('hidden');
    document.getElementById('error')?.classList.remove('hidden');
  }
});

function renderPrices(data) {
  document.getElementById('loading')?.classList.add('hidden');
  document.getElementById('content')?.classList.remove('hidden');
  
  if (data?.generated_at) {
    document.getElementById('last-updated').textContent = new Date(data.generated_at).toLocaleString('sv-SE');
  }
  
  const dims = {
    '28x120': 'Terrassebord 28x120 mm',
    '21x95': 'Terrassebord 21x95 mm', 
    '48x148': 'Konstruksjonsvirke 48x148 mm',
    '48x198': 'Konstruksjonsvirke 48x198 mm'
  };

  let cheapest = Infinity, cheapestStore = '', cheapestDim = '';
  let stores = new Set(), updated = 0, total = 0;

  for (const [dim, prices] of Object.entries(data.dimensions || {})) {
    const container = document.getElementById(`prices-${dim}`);
    if (!container) continue;

    const valid = (prices || []).filter(p => p?.pris_kr_m > 0);
    total += valid.length;
    valid.sort((a, b) => a.pris_kr_m - b.pris_kr_m);

    container.innerHTML = valid.map((p, i) => {
      if (p.pris_kr_m < cheapest) {
        cheapest = p.pris_kr_m;
        cheapestStore = p.butikk || p.butik || 'Okänd';
        cheapestDim = dim;
      }
      stores.add(p.butikk || p.butik || 'Okänd');
      if (p.status === 'green') updated++;
      
      return card(p, i === 0);
    }).join('');
  }

  document.getElementById('cheapest-price').textContent = cheapest < Infinity 
    ? `${cheapestStore} ${cheapestDim}: ${fmt(cheapest)}` : 'Inga priser';
  document.getElementById('store-count').textContent = `${stores.size} butiker`;
  document.getElementById('updated-today').textContent = `${updated} av ${total} priser`;
}

function card(p, best) {
  const butik = p.butikk || p.butik || 'Saknas';
  const status = p.status === 'green' ? '✅ Uppdaterad idag' : '⚠️ Äldre';
  const change = p.changed_since_last && p.change_percent 
    ? `<div>${p.change > 0 ? '↑' : '↓'} ${Math.abs(p.change_percent).toFixed(1)}%</div>` : '';
  const link = p.kilde_url ? `<a href="${p.kilde_url}" target="_blank">Se produkt →</a>` : '';
  
  return `<div class="card ${best ? 'best-price' : ''}">
    <div class="store-icon ${p.store_color || 'bg-gray-600'}">${(p.store_icon || '?')[0]}</div>
    <div class="store-name">${butik}</div>
    <div class="price">${fmt(p.pris_kr_m)}</div>
    ${change}<div class="status">${status}</div>${link}
  </div>`;
}

function fmt(price) {
  return price ? price.toFixed(2).replace('.', ',') + ' kr/m' : '- kr/m';
}
