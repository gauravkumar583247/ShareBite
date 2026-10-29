/**
 * Simple ShareBite Application Logic
 */

let foodItems = [];
let claimedPickups = [];
let activeFilter = 'all';
let searchQuery = '';
let currentClaimFood = null;
let currentClaimCount = 1;
let currentPriceMode = 'free';
let uploadedPhotoDataUrl = null;

// Fallback food placeholder SVG if no photo is uploaded from PC
const DEFAULT_FOOD_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23f1f5f9'%3E%3Crect width='400' height='300' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48'%3E🍲%3C/text%3E%3C/svg%3E";

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderFeed();
  updateBadge();
});

function loadData() {
  const savedFoods = localStorage.getItem('sharebite_simple_foods');
  if (savedFoods) {
    try {
      foodItems = JSON.parse(savedFoods);
    } catch (e) {
      foodItems = [...DEFAULT_FOOD_ITEMS];
    }
  } else {
    foodItems = [...DEFAULT_FOOD_ITEMS];
    saveFoods();
  }

  const savedClaims = localStorage.getItem('sharebite_simple_claims');
  if (savedClaims) {
    try {
      claimedPickups = JSON.parse(savedClaims);
    } catch (e) {
      claimedPickups = [];
    }
  }
}

function saveFoods() {
  localStorage.setItem('sharebite_simple_foods', JSON.stringify(foodItems));
}

function saveClaims() {
  localStorage.setItem('sharebite_simple_claims', JSON.stringify(claimedPickups));
}

// Render Feed
function renderFeed() {
  const grid = document.getElementById('foodGrid');
  const empty = document.getElementById('emptyState');

  let list = foodItems.filter(item => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = item.title.toLowerCase().includes(q) || item.provider.toLowerCase().includes(q) || item.pickupLocation.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Filters
    if (activeFilter === 'free') return item.price === 0;
    if (activeFilter === 'low-price') return item.price > 0;
    if (activeFilter === 'veg') return item.category === 'veg';
    if (activeFilter === 'non-veg') return item.category === 'non-veg';

    return true;
  });

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  grid.innerHTML = list.map(item => {
    const isFree = item.price === 0;
    const isOut = item.quantity <= 0;
    const isVeg = item.category === 'veg';

    return `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
        <!-- Image & Price -->
        <div class="relative h-44 bg-slate-100">
          <img src="${item.image || DEFAULT_FOOD_SVG}" alt="" class="w-full h-full object-cover">
          <div class="absolute top-2.5 left-2.5">
            ${isFree ? `
              <span class="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">FREE</span>
            ` : `
              <span class="bg-orange-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">₹${item.price}</span>
            `}
          </div>
          <div class="absolute top-2.5 right-2.5">
            <span class="bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
              ${isOut ? 'Finished' : `${item.quantity} portions left`}
            </span>
          </div>
        </div>

        <!-- Details -->
        <div class="p-3.5 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-semibold truncate max-w-[170px]">${escapeHtml(item.provider)}</span>
              <span class="${isVeg ? 'text-emerald-700' : 'text-red-700'} font-bold">
                ${isVeg ? '● Veg' : '▲ Non-Veg'}
              </span>
            </div>

            <h3 class="font-bold text-slate-900 text-sm mt-1 leading-snug line-clamp-1">
              ${escapeHtml(item.title)}
            </h3>

            <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>📍</span>
              <span class="truncate">${escapeHtml(item.pickupLocation)}</span>
            </p>
          </div>

          <!-- Action -->
          <div class="pt-2 border-t border-slate-100">
            ${isOut ? `
              <button disabled class="w-full py-2 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs cursor-not-allowed">
                All Rescued
              </button>
            ` : `
              <button 
                onclick="openClaimModal('${item.id}')" 
                class="w-full py-2.5 rounded-xl font-bold text-xs text-white transition ${isFree ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}"
              >
                ${isFree ? 'Claim Free Food' : `Buy for ₹${item.price}`}
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Navigation Tabs
function switchTab(tab) {
  const feed = document.getElementById('viewFeed');
  const claims = document.getElementById('viewClaims');
  const navFeedBtn = document.getElementById('navFeedBtn');
  const navClaimsBtn = document.getElementById('navClaimsBtn');

  if (tab === 'feed') {
    feed.classList.remove('hidden');
    claims.classList.add('hidden');
    navFeedBtn.className = 'px-3 py-1.5 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50';
    navClaimsBtn.className = 'px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5';
    renderFeed();
  } else {
    feed.classList.add('hidden');
    claims.classList.remove('hidden');
    navFeedBtn.className = 'px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100';
    navClaimsBtn.className = 'px-3 py-1.5 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50 flex items-center gap-1.5';
    renderClaimedList();
  }
}

// Filters
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.className = 'filter-btn active-filter px-3 py-2 rounded-xl bg-emerald-600 text-white whitespace-nowrap';
    } else {
      btn.className = 'filter-btn px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 whitespace-nowrap';
    }
  });
  renderFeed();
}

function handleSearch(val) {
  searchQuery = val;
  renderFeed();
}

// ==========================================
// ADD FOOD & PC PHOTO UPLOAD
// ==========================================

function openAddFoodModal() {
  document.getElementById('addFoodModal').classList.remove('hidden');
}

function closeAddFoodModal() {
  document.getElementById('addFoodModal').classList.add('hidden');
}

// Handle Photo Upload directly from PC
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      uploadedPhotoDataUrl = event.target.result;
      document.getElementById('photoPreviewImg').src = uploadedPhotoDataUrl;
      document.getElementById('photoPreviewBox').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
}

function clearUploadedPhoto() {
  uploadedPhotoDataUrl = null;
  document.getElementById('formPhotoFile').value = '';
  document.getElementById('photoPreviewBox').classList.add('hidden');
}

// Price mode in Add Food
function selectPriceMode(mode) {
  currentPriceMode = mode;
  const btnFree = document.getElementById('btnPriceFree');
  const btnLow = document.getElementById('btnPriceLow');
  const wrap = document.getElementById('lowPriceInputWrap');

  if (mode === 'free') {
    btnFree.className = 'py-2 px-3 rounded-xl font-bold border-2 border-emerald-600 bg-emerald-50 text-emerald-800 text-center';
    btnLow.className = 'py-2 px-3 rounded-xl font-bold border border-slate-200 bg-white text-slate-700 text-center hover:bg-slate-50';
    wrap.classList.add('hidden');
  } else {
    btnLow.className = 'py-2 px-3 rounded-xl font-bold border-2 border-orange-600 bg-orange-50 text-orange-800 text-center';
    btnFree.className = 'py-2 px-3 rounded-xl font-bold border border-slate-200 bg-white text-slate-700 text-center hover:bg-slate-50';
    wrap.classList.remove('hidden');
  }
}

// Submit Add Food
function handleFoodFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('formTitle').value.trim();
  const provider = document.getElementById('formProvider').value.trim();
  const category = document.getElementById('formCategory').value;
  const quantity = parseInt(document.getElementById('formQuantity').value) || 1;
  const pickupLocation = document.getElementById('formLocation').value.trim();
  const contactPhone = document.getElementById('formPhone').value.trim();

  let price = 0;
  if (currentPriceMode === 'low') {
    price = parseInt(document.getElementById('formPriceValue').value) || 20;
  }

  const newItem = {
    id: 'food-' + Date.now(),
    title,
    provider,
    category,
    price,
    quantity,
    pickupLocation,
    contactPhone,
    image: uploadedPhotoDataUrl || DEFAULT_FOOD_SVG,
    createdAt: Date.now()
  };

  foodItems.unshift(newItem);
  saveFoods();

  // Reset & close
  document.getElementById('addFoodForm').reset();
  clearUploadedPhoto();
  selectPriceMode('free');
  closeAddFoodModal();

  renderFeed();
  showToast('Food added successfully!');
}

// ==========================================
// BUYER CLAIM
// ==========================================

function openClaimModal(foodId) {
  const item = foodItems.find(f => f.id === foodId);
  if (!item || item.quantity <= 0) return;

  currentClaimFood = item;
  currentClaimCount = 1;

  document.getElementById('claimImg').src = item.image || DEFAULT_FOOD_SVG;
  document.getElementById('claimTitle').textContent = item.title;
  document.getElementById('claimProvider').textContent = item.provider;
  document.getElementById('claimQtyText').textContent = currentClaimCount;

  updateClaimTotalDisplay();

  document.getElementById('claimModal').classList.remove('hidden');
}

function closeClaimModal() {
  document.getElementById('claimModal').classList.add('hidden');
  currentClaimFood = null;
}

function changeClaimQty(delta) {
  if (!currentClaimFood) return;
  const max = currentClaimFood.quantity;
  const next = currentClaimCount + delta;
  if (next >= 1 && next <= max) {
    currentClaimCount = next;
    document.getElementById('claimQtyText').textContent = currentClaimCount;
    updateClaimTotalDisplay();
  }
}

function updateClaimTotalDisplay() {
  if (!currentClaimFood) return;
  const total = currentClaimFood.price * currentClaimCount;
  const tag = document.getElementById('claimPriceTag');
  const cost = document.getElementById('claimTotalCost');

  if (total === 0) {
    tag.textContent = 'FREE';
    cost.textContent = 'FREE';
  } else {
    tag.textContent = `₹${currentClaimFood.price} / plate`;
    cost.textContent = `₹${total}`;
  }
}

function handleClaimSubmit(e) {
  e.preventDefault();
  if (!currentClaimFood) return;

  const buyerName = document.getElementById('claimBuyerName').value.trim();
  const buyerPhone = document.getElementById('claimBuyerPhone').value.trim();

  currentClaimFood.quantity -= currentClaimCount;
  saveFoods();

  const tokenCode = `SB-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalCost = currentClaimFood.price * currentClaimCount;

  const claim = {
    id: 'claim-' + Date.now(),
    tokenCode,
    foodTitle: currentClaimFood.title,
    provider: currentClaimFood.provider,
    pickupLocation: currentClaimFood.pickupLocation,
    contactPhone: currentClaimFood.contactPhone,
    portions: currentClaimCount,
    totalCost,
    buyerName,
    buyerPhone
  };

  claimedPickups.unshift(claim);
  saveClaims();

  closeClaimModal();
  renderFeed();
  updateBadge();

  // Show Token Modal
  openTokenModal(claim);
}

// Token Modal
function openTokenModal(claim) {
  document.getElementById('passCode').textContent = claim.tokenCode;
  document.getElementById('passTitle').textContent = claim.foodTitle;
  document.getElementById('passQty').textContent = `${claim.portions} plate(s)`;
  document.getElementById('passPrice').textContent = claim.totalCost === 0 ? 'FREE' : `₹${claim.totalCost}`;
  document.getElementById('passProvider').textContent = claim.provider;
  document.getElementById('passLoc').textContent = claim.pickupLocation;
  document.getElementById('passCallLink').href = `tel:${claim.contactPhone}`;

  // QR
  const qrBox = document.getElementById('passQr');
  qrBox.innerHTML = '';
  if (window.QRCode) {
    new QRCode(qrBox, {
      text: claim.tokenCode,
      width: 100,
      height: 100,
      colorDark: "#000000",
      colorLight: "#ffffff"
    });
  }

  document.getElementById('tokenModal').classList.remove('hidden');
}

function closeTokenModal() {
  document.getElementById('tokenModal').classList.add('hidden');
}

// Claimed List
function renderClaimedList() {
  const container = document.getElementById('claimedList');
  const empty = document.getElementById('claimedEmpty');

  if (claimedPickups.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  container.innerHTML = claimedPickups.map(c => {
    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 text-xs shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-mono font-black text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded-lg">${c.tokenCode}</span>
          <span class="font-bold text-emerald-700">${c.totalCost === 0 ? 'FREE' : `₹${c.totalCost}`}</span>
        </div>
        <div>
          <h4 class="font-bold text-slate-900 text-sm">${escapeHtml(c.foodTitle)}</h4>
          <p class="text-slate-500">${escapeHtml(c.provider)}</p>
        </div>
        <p class="text-slate-600">📍 ${escapeHtml(c.pickupLocation)}</p>
        <div class="flex gap-2 pt-1">
          <a href="tel:${c.contactPhone}" class="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-center font-bold text-slate-800">
            📞 Call (${c.contactPhone})
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function updateBadge() {
  const badge = document.getElementById('userClaimsBadge');
  if (claimedPickups.length > 0) {
    badge.textContent = claimedPickups.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
