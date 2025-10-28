// Utils
const readLS = (k, fb = null) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? fb;
  } catch {
    return fb;
  }
};
const writeLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Estado
let cart = readLS("cart", []);

// Elementos
const listEl = document.getElementById("cartList");
const emptyEl = document.getElementById("emptyState");
const badgeEl = document.getElementById("cartBadge");
const subTotalEl = document.getElementById("subTotal");
const discountEl = document.getElementById("discount");
const grandTotalEl = document.getElementById("grandTotal");
const shippingRadios = () => [
  ...document.querySelectorAll('input[name="ship"]'),
];

// Helpers
const EXCHANGE_RATE = 40; // 1 USD = 40 UYU

const money = (n, cur = "USD") =>
  `${cur} ${Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

// Convierte cualquier precio a USD
const toUSD = (amount, currency) => {
  if (currency === "UYU") {
    return amount / EXCHANGE_RATE;
  }
  return amount; // Si ya está en USD
};

function updateBadge() {
  const totalItems = cart.reduce((acc, it) => acc + (it.count ?? 1), 0);
  if (badgeEl) badgeEl.textContent = totalItems;
}

function computeTotals() {
  // Convertir todo a USD antes de sumar
  const sub = cart.reduce((acc, it) => {
    const priceInUSD = toUSD(it.cost, it.currency || "USD");
    return acc + priceInUSD * (it.count ?? 1);
  }, 0);

  const disc = 0;
  const shipPct = Number(
    shippingRadios().find((r) => r.checked)?.value || 0.15
  );
  const ship = sub * shipPct;
  const grand = sub - disc + ship;

  subTotalEl.textContent = money(sub);
  discountEl.textContent = money(disc);
  grandTotalEl.textContent = money(grand);
}

function renderEmpty() {
  listEl.innerHTML = "";
  emptyEl.classList.remove("hidden");
  computeTotals();
  updateBadge();
}

function renderItem(it, idx) {
  const row = document.createElement("div");
  row.className = "cart-item";
  row.innerHTML = `
    <div class="prod">
      <img src="${it.image}" alt="${it.name}">
      <div>
        <h4>${it.name}</h4>
        <small>Cat. ${it.category || "-"}</small>
      </div>
    </div>

    <div class="qty">
      <button class="btn-minus" aria-label="Restar" disabled>–</button>
      <input class="qty-input" type="number" min="1" value="1" disabled>
      <button class="btn-plus" aria-label="Sumar" disabled>+</button>
    </div>

    <div class="price">
      <span>${money(it.cost, it.currency || "USD")}</span>
      <button class="btn btn-sm remove" title="Eliminar producto">
        <i class="fa fa-trash"></i>
      </button>
    </div>
  `;

  // Evento eliminar
  const remove = row.querySelector(".remove");

  remove.addEventListener("click", () => {
    cart.splice(idx, 1);
    writeLS("cart", cart);
    render();
  });

  return row;
}

function render() {
  cart = readLS("cart", []);
  if (!cart || cart.length === 0) return renderEmpty();

  emptyEl.classList.add("hidden");
  listEl.innerHTML = "";
  cart.forEach((it, idx) => listEl.appendChild(renderItem(it, idx)));

  updateBadge();
  computeTotals();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  render();

  // Recalcular totales al cambiar envío o al “aplicar” cupón
  shippingRadios().forEach((r) => r.addEventListener("change", computeTotals));
  document
    .getElementById("applyCoupon")
    ?.addEventListener("click", computeTotals);

  document.getElementById("payBtn")?.addEventListener("click", () => {
    if (!cart.length) return alert("Tu carrito está vacío.");
    alert("Continuar al pago.");
  });
});
