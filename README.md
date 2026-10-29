# 🍲 ShareBite | Surplus Food Rescue Platform

> **Rescue Fresh Food. Zero Waste. 100% Free or Pocket-Friendly.**

ShareBite is a clean, simple, and high-speed web application designed to connect **hostel messes, college canteens, bakeries, and restaurants** with **students and local citizens** to eliminate food waste.

---

## 🌟 Key Features

### 👨‍🍳 For Food Providers (Hostel Messes, Canteens, Restaurants)
- **Post in under 30 seconds**: No complex setup or long text fields.
- **⚡ 1-Click Quick Presets**: One tap autofill for *"Mess Thali"*, *"Biryani/Rice"*, *"Breakfast Combo"*, *"Bakery Box"*, and *"Curry & Roti"*.
- **Flexible Pricing**:
  - 🟢 **100% FREE (₹0)**: Recommended for fast donation before night closes.
  - 🏷️ **Low / Discounted Price**: Set pocket-friendly rates (e.g. ₹20, ₹35, ₹50) with original price comparison.
- **Smart Pickup Controls**: Select pickup window (next 30m, 45m, 1 hour, tonight) and specify if buyers should bring their own lunchbox/tiffin.
- **Instant Photo Picker**: 6 high-res culinary presets ready with zero upload friction.
- **Listing Management**: View real-time claimed portions, mark listings as completed, or delete when done.

### 🍽️ For Food Receivers (Students & Community)
- **Instant Live Feed**: Live availability counter with countdown badges showing remaining pickup time.
- **Smart Filter Chips**:
  - All Available
  - 🎁 100% Free Food
  - 🏷️ Under ₹50 (Low Price)
  - 🥦 Pure Veg
  - 🍗 Non-Veg
  - 🏫 Hostel Messes
  - 🍽️ Restaurants & Bakeries
- **Live Search & Sort**: Search by food item, mess block, or restaurant name; sort by urgent expiring first or lowest price.
- **1-Click Claim / Buy**: Select portions, enter name & phone number, and claim immediately.
- **🎫 Digital Pickup Pass / QR Token**:
  - Unique token code (e.g., `#SB-8924`)
  - Live QR code for counter verification
  - Direct 1-tap **"Call Provider"** phone link
  - Direct 1-tap **"Get Directions"** Google Maps route
  - Countdown timer for pickup deadline

---

## 🚀 How to Run Locally

### Option 1: Using the running local server
The application is currently running at:
```
http://localhost:8080
```
Simply open `http://localhost:8080` in your browser.

### Option 2: Open directly
Open `index.html` directly in any web browser (Chrome, Safari, Firefox, Edge).

### Option 3: Python local server
```bash
python3 -m http.server 8080
```

---

## 🛠️ Technology Stack
- **Frontend**: Clean HTML5 & Semantic Web Standards
- **Styling**: Tailwind CSS (CDN) + Custom Modern Micro-interactions
- **Icons**: Font Awesome 6.4
- **QR Code**: QRCode.js
- **Animations**: Canvas Confetti celebration effects
- **Storage**: Persistent client-side `localStorage` with sample data and reset option

---

## 📁 File Structure
```
├── index.html       # Single-page application interface
├── css/
│   └── styles.css   # Custom animations, badge glows & pass design
├── js/
│   ├── data.js      # Realistic demo surplus food listings & presets
│   └── app.js       # Core logic, filtering, modals, state & QR generation
└── README.md        # Documentation
```

