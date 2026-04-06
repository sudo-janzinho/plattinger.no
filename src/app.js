// Dimension mapping
const DIMENSION_NAMES = {
  '21x95': 'Terrassebord 21x95 mm',
  '28x120': 'Terrassebord 28x120 mm',
  '48x148': 'Konstruksjonsvirke 48x148 mm',
  '48x198': 'Konstruksjonsvirke 48x198 mm'
};

// Format date
function formatDate(dateString) {
  if (!dateString) return 'Okänt';
  const date = new Date(dateString);
  return date.toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format price
function formatPrice(price) {
  return price.toFixed(2).replace('.', ',') + ' kr/m';
}

// Create price card
function createCard(price, isCheapest) {
  const statusIcon = price.status === 'green' ? '✅' : '⚠️';
  const statusText = price.status === 'green' ? 'Uppdaterad idag' : 'Äldre data';
  
  const changeIndicator = price.changed_since_last 
    ? `<span class="change">${price.change > 0 ? '↑' : '↓'} ${Math.abs(price.change_percent)}%</span>`
    : '';

  const butikName = price.butikk || price.butik || 'Saknas';

  return `
    <div class="card ${isCheapest ? 'best-price' : ''}">
      <div class="store-icon ${price.store_color}">${price.store_icon}</div>
      <div class="store-name">${butikkName}</div>
      <div class="store-location">Asker</div>
      <div class="price">${formatPrice(price.pris_kr_m)}</div>
      <div class="change-indicator">${changeIndicator}</div>
      <div class="status">${statusIcon} ${statusText}</div>
      ${price.kilde_url ? `<a href="${price.kilde_url}" target="_blank" class="product-link">Se produkt →</a>` : ''}
    </div>
  `;
}

// Render prices
function renderPrices(data) {
  const content = document.getElementById('content');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');

  loading.classList.add('hidden');
  content.classList.remove('hidden');

  document.getElementById('last-updated').textContent = formatDate(data.generated_at);
  const nextUpdate = data.next_update ? formatDate(data.next_update).split(', ')[1] : 'Okänt';
  document.getElementById('next-update').textContent = 'Nästa: ' + nextUpdate;

  let cheapestPrice = Infinity;
  let cheapestStore = '';
  let cheapestDimension = '';
  let totalStores = new Set();
  let updatedToday = 0;

  for (const [dimension, prices] of Object.entries(data.dimensions)) {
    const container = document.getElementById(`prices-${dimension}`);
    if (!container) continue;

    const validPrices = prices.filter(p => p.pris_kr_m && p.pris_kr_m > 0);

    if (validPrices.length === 0) {
      container.innerHTML = '<p class="no-prices">Inga priser tillgängliga</p>';
      continue;
    }

    container.innerHTML = validPrices.map((price, index) => {
      if (price.pris_kr_m < cheapestPrice) {
        cheapestPrice = price.pris_kr_m;
        cheapestStore = price.butikk || price.butik || 'Okänd';
        cheapestDimension = dimension;
      }

      totalStores.add(price.butikk || price.butik || 'Okänd');

      if (price.status === 'green') updatedToday++;

      return createCard(price, index === 0);
    }).join('');
  }

  const totalPrices = Object.values(data.dimensions).reduce((sum, p) => sum + (p?.length || 0), 0);
  document.getElementById('cheapest-price').textContent = cheapestPrice < Infinity
    ? `${cheapestStore} ${cheapestDimension}: ${formatPrice(cheapestPrice)}`
    : 'Inga priser';
  document.getElementById('store-count').textContent = `${totalStores.size} butiker`;
  document.getElementById('updated-today').textContent = `${updatedToday} av ${totalPrices} priser`;
}

// Show error
function showError() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('error').classList.remove('hidden');
}

// Load prices
async function loadPrices() {
  try {
    const response = await fetch('api/priser.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    renderPrices(data);
  } catch (error) {
    console.error('Fel vid hämtning av priser:', error);
    showError();
  }
}

// Load on page ready
document.addEventListener('DOMContentLoaded', loadPrices);
