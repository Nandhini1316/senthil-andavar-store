// ------------------ PRODUCTS DATA ------------------
const products = [
  { id: 1, name: "Sugar", price: 30, unit: "kg", category: "grocery", emoji: "🍚" },
  { id: 2, name: "Rice", price: 60, unit: "kg", category: "grocery", emoji: "🌾" },
  { id: 3, name: "Dal", price: 70, unit: "kg", category: "grocery", emoji: "🫘" },
  { id: 4, name: "Oil", price: 140, unit: "litre", category: "grocery", emoji: "🛢️" },

  { id: 5, name: "Tomato", price: 40, unit: "kg", category: "vegetables", emoji: "🍅" },
  { id: 6, name: "Onion", price: 35, unit: "kg", category: "vegetables", emoji: "🧅" },
  { id: 7, name: "Potato", price: 30, unit: "kg", category: "vegetables", emoji: "🥔" },
  { id: 8, name: "Carrot", price: 45, unit: "kg", category: "vegetables", emoji: "🥕" },

  { id: 9, name: "Milk", price: 50, unit: "litre", category: "dairy", emoji: "🥛" },
  { id: 10, name: "Curd", price: 45, unit: "pack", category: "dairy", emoji: "🍼" },
  { id: 11, name: "Butter", price: 55, unit: "pack", category: "dairy", emoji: "🧈" },
  { id: 12, name: "Paneer", price: 90, unit: "pack", category: "dairy", emoji: "🧀" },

  { id: 13, name: "Apple", price: 120, unit: "kg", category: "fruits", emoji: "🍎" },
  { id: 14, name: "Banana", price: 50, unit: "dozen", category: "fruits", emoji: "🍌" },
  { id: 15, name: "Orange", price: 80, unit: "kg", category: "fruits", emoji: "🍊" },
  { id: 16, name: "Grapes", price: 90, unit: "kg", category: "fruits", emoji: "🍇" },

  { id: 17, name: "Biscuits", price: 20, unit: "pack", category: "snacks", emoji: "🍪" },
  { id: 18, name: "Chips", price: 30, unit: "pack", category: "snacks", emoji: "🍟" },
  { id: 19, name: "Noodles", price: 25, unit: "pack", category: "snacks", emoji: "🍜" },
  { id: 20, name: "Chocolate", price: 35, unit: "pack", category: "snacks", emoji: "🍫" }
];

// ------------------ GLOBAL STATE ------------------
let cart = [];
let orders = [];
let activeCategory = "all";

// ------------------ HELPERS ------------------
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

function formatCategory(cat) {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function generateOrderId() {
  return "SSA" + Date.now().toString().slice(-6);
}

// ------------------ SCROLL HELPERS ------------------
function scrollToProducts() {
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

function scrollToCart() {
  document.getElementById("cart").scrollIntoView({ behavior: "smooth" });
}

// ------------------ DARK MODE ------------------
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "1" : "0");
}

function loadDarkMode() {
  const d = localStorage.getItem("darkMode");
  if (d === "1") document.body.classList.add("dark");
}

// ------------------ LOCAL STORAGE (CART + ORDERS) ------------------
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem("cart");
  if (saved) cart = JSON.parse(saved);
}

function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

function loadOrders() {
  const saved = localStorage.getItem("orders");
  if (saved) orders = JSON.parse(saved);
}

// ------------------ PRODUCTS UI ------------------
function displayProducts(list) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = `<p class="mini">No products found.</p>`;
    return;
  }

  list.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = (index * 0.03) + "s";

    card.innerHTML = `
      <div class="product-top">
        <h3 class="product-name">${p.name}</h3>
        <span class="product-cat">${formatCategory(p.category)}</span>
      </div>

      <div class="product-img">${p.emoji}</div>

      <p class="product-price">₹${p.price} / ${p.unit}</p>

      <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;

    grid.appendChild(card);
  });
}

// ------------------ FILTERING ------------------
function setCategory(cat) {
  activeCategory = cat;

  // UI highlight
  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.cat === cat) btn.classList.add("active");
  });

  applyFilters();
}

function applyFilters() {
  const searchValue = document.getElementById("search").value.toLowerCase().trim();

  let filtered = products;

  // Category filter
  if (activeCategory !== "all") {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  // Search filter
  if (searchValue !== "") {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchValue)
    );
  }

  displayProducts(filtered);
}

// ------------------ CART LOGIC ------------------
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  updateCart();
  toast(`${product.name} added to cart`);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
  updateCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCart();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCart();
  toast("Cart cleared");
}

function updateCart() {
  const list = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const totalPrice = document.getElementById("total-price");
  const deliveryEl = document.getElementById("delivery");
  const finalTotalEl = document.getElementById("final-total");

  list.innerHTML = "";

  let total = 0;
  let totalItems = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    totalItems += item.qty;

    const li = document.createElement("li");
    li.className = "cart-item";

    li.innerHTML = `
      <div class="cart-left">
        <strong>${item.name}</strong>
        <span>₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</span>
      </div>

      <div class="qty">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span class="num">${item.qty}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>

      <button class="remove" onclick="removeItem(${item.id})">🗑️</button>
    `;

    list.appendChild(li);
  });

  // Delivery logic
  let delivery = 0;
  if (total > 0 && total < 300) delivery = 30;
  if (total >= 300) delivery = 0;

  const finalTotal = total + delivery;

  cartCount.textContent = totalItems;
  totalPrice.textContent = `Total: ₹${total}`;
  deliveryEl.textContent = delivery;
  finalTotalEl.textContent = finalTotal;

  updateWhatsAppLink();
}

// ------------------ WHATSAPP ORDER ------------------
function updateWhatsAppLink() {
  const link = document.getElementById("whatsapp-link");

  // Replace with store owner's number (India format)
  const storeNumber = "7904225523"; // change this

  if (cart.length === 0) {
    link.href = "#";
    return;
  }

  const custName = document.getElementById("cust-name")?.value || "";
  const custPhone = document.getElementById("cust-phone")?.value || "";
  const custAddress = document.getElementById("cust-address")?.value || "";

  const orderId = generateOrderId();

  let total = 0;
  cart.forEach(i => total += i.price * i.qty);

  let delivery = 0;
  if (total > 0 && total < 300) delivery = 30;

  const finalTotal = total + delivery;

  let msg = `🛒 *Senthil Andavar Store - New Order*\n\n`;
  msg += `🆔 Order ID: ${orderId}\n`;

  if (custName.trim()) msg += `👤 Name: ${custName}\n`;
  if (custPhone.trim()) msg += `📞 Phone: ${custPhone}\n`;
  if (custAddress.trim()) msg += `📍 Address: ${custAddress}\n`;

  msg += `\n📦 Items:\n`;

  cart.forEach(item => {
    msg += `• ${item.name} × ${item.qty} = ₹${item.price * item.qty}\n`;
  });

  msg += `\nSubtotal: ₹${total}`;
  msg += `\nDelivery: ₹${delivery}`;
  msg += `\nFinal Total: ₹${finalTotal}`;
  msg += `\n\nThank you 🙏`;

  link.href = `https://wa.me/${storeNumber}?text=${encodeURIComponent(msg)}`;
}

// ------------------ INVOICE ------------------
function renderInvoice(order) {
  const box = document.getElementById("invoice-box");

  let html = `
    <h3>Invoice</h3>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>Date:</strong> ${order.date}</p>
    <p><strong>Name:</strong> ${order.customer.name}</p>
    <p><strong>Phone:</strong> ${order.customer.phone}</p>
    <p><strong>Address:</strong> ${order.customer.address}</p>

    <hr class="line">

    <h4>Items</h4>
    <ul>
  `;

  order.items.forEach(i => {
    html += `<li>${i.name} × ${i.qty} = ₹${i.price * i.qty}</li>`;
  });

  html += `
    </ul>
    <hr class="line">
    <p><strong>Subtotal:</strong> ₹${order.total}</p>
    <p><strong>Delivery:</strong> ₹${order.delivery}</p>
    <p><strong>Final Total:</strong> ₹${order.finalTotal}</p>
  `;

  box.innerHTML = html;
}

// ------------------ ORDER HISTORY ------------------
function renderHistory() {
  const box = document.getElementById("history-box");

  if (orders.length === 0) {
    box.innerHTML = `<p class="mini">No orders yet.</p>`;
    return;
  }

  let html = "";

  orders.slice().reverse().forEach(o => {
    html += `
      <div style="padding:14px; border:1px solid var(--border); border-radius:16px; margin-bottom:12px; background:var(--card);">
        <p><strong>Order ID:</strong> ${o.orderId}</p>
        <p class="mini">Date: ${o.date}</p>
        <p class="mini">Customer: ${o.customer.name}</p>
        <p class="mini">Final Total: ₹${o.finalTotal}</p>
        <button class="primary" style="margin-top:10px;" onclick="renderInvoiceFromHistory('${o.orderId}')">View Invoice</button>
      </div>
    `;
  });

  html += `
    <button class="danger" onclick="clearHistory()">Clear Order History</button>
  `;

  box.innerHTML = html;
}

function renderInvoiceFromHistory(orderId) {
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;
  renderInvoice(order);
  document.getElementById("invoice").scrollIntoView({ behavior: "smooth" });
}

function clearHistory() {
  orders = [];
  saveOrders();
  renderHistory();
  toast("Order history cleared");
}

// ------------------ PLACE ORDER ------------------
function placeOrder() {
  if (cart.length === 0) {
    toast("Cart is empty");
    return;
  }

  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-address").value.trim();

  if (!name || !phone || !address) {
    toast("Please fill name, phone and address");
    return;
  }

  // totals
  let total = 0;
  cart.forEach(i => total += i.price * i.qty);

  let delivery = 0;
  if (total > 0 && total < 300) delivery = 30;

  const finalTotal = total + delivery;

  const order = {
    orderId: generateOrderId(),
    date: new Date().toLocaleString(),
    customer: { name, phone, address },
    items: JSON.parse(JSON.stringify(cart)),
    total,
    delivery,
    finalTotal
  };

  orders.push(order);
  saveOrders();

  renderInvoice(order);
  renderHistory();

  toast("Order placed! Invoice generated.");

  // clear cart after placing order
  cart = [];
  saveCart();
  updateCart();
}

// ------------------ INIT ------------------
document.addEventListener("DOMContentLoaded", () => {
  loadDarkMode();
  loadCart();
  loadOrders();

  displayProducts(products);
  updateCart();
  renderHistory();

  // Search input
  document.getElementById("search").addEventListener("input", applyFilters);

  // Customer inputs update WhatsApp live
  document.getElementById("cust-name").addEventListener("input", updateWhatsAppLink);
  document.getElementById("cust-phone").addEventListener("input", updateWhatsAppLink);
  document.getElementById("cust-address").addEventListener("input", updateWhatsAppLink);

  // Category buttons click (optional, since HTML already has onclick)
  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => setCategory(btn.dataset.cat));
  });
});
