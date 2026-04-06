/**
 * Plattinger.no - Visar virkespriser från api/priser.json
 * Enkel och pålitlig - inga extra funktioner
 */

// Hämta och visa priser när sidan laddats
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('api/priser.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    renderAllPrices(data);
  } catch (error) {
    console.error('Kunde inte ladda priser:', error);
    showError();
  }
});

// Visa felmeddelande
function showError() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const content = document.getElementById('content');
  
  if (loading) loading.classList.add('hidden');
  if (error) error.classList.remove('hidden');
  if (content) content.classList.remove('hidden');
}

// Rendera alla priser
function renderAllPrices(data) {
  // Uppdatera timestamps
  const lastUpdated = document.getElementById('last-updated');
  const nextUpdate = document.getElementById('next-update');
  
  if (lastUpdated && data.generated_at) {
    lastUpdated.textContent = formatDate(data.generated_at);
  }
  
  if (nextUpdate && data.next_update) {
    const next = data.next_update.split('T')[1]?.replace(':', '.') || '06.00';
    nextUpdate.textContent = 'Nästa: ' + next;
  }

  // Rendera varje dimension
  const dimensions = {
    '28x120': 'Terrassebord 28x120 mm',
    '21x95': 'Terrassebord 21x95 mm',
    '48x148': 'Konstruksjonsvirke 48x148 mm',
    '48x198': 'Konstruksjonsvirke 48x198 mm'
  };

  let cheapestPrice = Infinity;
  let cheapestStore = '';
  let cheapestDim = '';
  let allStores = new Set();
  let updatedToday = 0;
  let totalPrices = 0;

  for (const [dim, prices] of Object.entries(data.dimensions || {})) {
    const container = document.getElementById(`prices-${dim}`);
    if (!container) continue;

    const validPrices = (prices || []).filter(p => p && p.pris_kr_m > 0);
    totalPrices += validPrices.length;

    if (validPrices.length === 0) {
      container.innerHTML = '<p class="no-prices">Inga priser</p>';
      continue;
    }

    // Sortera efter pris (lägst först)
    validPrices.sort((a, b) => a.pris_kr_m - b.pris_kr_m);

    container.innerHTML = validPrices.map((price, idx) => {
      // Tracka billigaste
      if (price.pris_kr_m < cheapestPrice) {
        cheapestPrice = price.pris_kr_m;
        cheapestStore = price.butikk || price.butik || 'Okänd';
        cheapestDim = dim;
      }

      // Tracka butiker
      allStores.add(price.butikk || price.butik || 'Okänd');

      // Tracka uppdaterade
      if (price.status === 'green') updatedToday++;

      return createPriceCard(price, idx === 0);
    }).join('');
  }

  // Uppdatera sammanfattning
  updateSummary(cheapestPrice, cheapestStore, cheapestDim, allStores.size, updatedToday, totalPrices);
}

// Skapa priskort
function createPriceCard(price, isFirst) {
  const butik = price.butikk || price.butik || 'Saknas';
  const pris = formatPrice(price.pris_kr_m);
  const status = price.status === 'green' ? '✅ Uppdaterad idag' : '⚠️ Äldre data';
  const isBest = isFirst ? 'best-price' : '';
  
  const changeHtml = price.changed_since_last && price.change_percent !== 0
    ? `<div class="change">${price.change > 0 ? '↑' : '↓'} ${Math.abs(price.change_percent).toFixed(1)}%</div>`
    : '';

  const linkHtml = price.kilde_url
    ? `<a href="${price.kilde_url}" target="_blank" rel="noopener" class="product-link">Se produkt →</a>`
    : '';

  return `
    <div class="card ${isBest}">
      <div class="store-icon ${price.store_color || 'bg-gray-600'}">${(price.store_icon || '?')[0]}</div>
      <div class="store-name">${butik}</div>
      <div class="store-location">Asker</div>
      <div class="price">${pris}</div>
      ${changeHtml}
      <div class="status">${status}</div>
      ${linkHtml}
    </div>
  `;
}

// Uppdatera sammanfattning
function updateSummary(cheapestPrice, cheapestStore, cheapestDim, storeCount, updatedToday, totalPrices) {
  const cheapestEl = document.getElementById('cheapest-price');
  const storesEl = document.getElementById('store-count');
  const updatedEl = document.getElementById('updated-today');

  if (cheapestEl) {
    cheapestEl.textContent = cheapestPrice < Infinity
      ? `${cheapestStore} ${cheapestDim}: ${formatPrice(cheapestPrice)}`
      : 'Inga priser';
  }

  if (storesEl) {
    storesEl.textContent = `${storeCount} butiker`;
  }

  if (updatedEl) {
    updatedEl.textContent = `${updatedToday} av ${totalPrices} priser`;
  }
}

// Formatera pris
function formatPrice(price) {
  if (!price || isNaN(price)) return '- kr/m';
  return price.toFixed(2).replace('.', ',') + ' kr/m';
}

// Formatera datum
function formatDate(dateString) {
  if (!dateString) return 'Okänt';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Okänt';
  }
}
