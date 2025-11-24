let productCost = 0;
let productCount = 0;
let comissionPercentage = 0.13;
let MONEY_SYMBOL = '$';
let DOLLAR_CURRENCY = 'Dólares (USD)';
let PESO_CURRENCY = 'Pesos Uruguayos (UYU)';
let DOLLAR_SYMBOL = 'USD ';
let PESO_SYMBOL = 'UYU ';
let PERCENTAGE_SYMBOL = '%';
let MSG = 'FUNCIONALIDAD NO IMPLEMENTADA';

// === FUNCIONES DE MODALES ===

// Modal
function showModal({ icon, iconClass, title, message, buttons }) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  modalOverlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-icon ${iconClass}">
        <i class="bi bi-${icon}"></i>
      </div>
      <h2 class="modal-title">${title}</h2>
      <p class="modal-message">${message}</p>
      <div class="modal-actions" id="modalActions"></div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const actionsContainer = modalOverlay.querySelector('#modalActions');
  buttons.forEach((btn) => {
    const button = document.createElement('button');
    button.className = `modal-btn ${btn.className}`;
    button.textContent = btn.text;
    button.addEventListener('click', () => {
      closeModal(modalOverlay);
      if (btn.onClick) btn.onClick();
    });
    actionsContainer.appendChild(button);
  });

  setTimeout(() => modalOverlay.classList.add('show'), 10);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal(modalOverlay);
      if (buttons.find((b) => b.isCancel)) {
        const cancelBtn = buttons.find((b) => b.isCancel);
        if (cancelBtn.onClick) cancelBtn.onClick();
      }
    }
  });

  return modalOverlay;
}

function closeModal(modalElement) {
  modalElement.classList.remove('show');
  setTimeout(() => modalElement.remove(), 300);
}

function updateTotalCosts() {
  let unitProductCostHTML = document.getElementById('productCostText');
  let comissionCostHTML = document.getElementById('comissionText');
  let totalCostHTML = document.getElementById('totalCostText');

  let unitCostToShow = MONEY_SYMBOL + productCost;
  let comissionToShow = Math.round(comissionPercentage * 100) + PERCENTAGE_SYMBOL;
  let totalCostToShow =
    MONEY_SYMBOL +
    (Math.round(productCost * comissionPercentage * 100) / 100 + parseInt(productCost));

  unitProductCostHTML.innerHTML = unitCostToShow;
  comissionCostHTML.innerHTML = comissionToShow;
  totalCostHTML.innerHTML = totalCostToShow;
}

document.addEventListener('DOMContentLoaded', function (e) {
  document.getElementById('productCountInput').addEventListener('change', function () {
    productCount = this.value;
    updateTotalCosts();
  });

  document.getElementById('productCostInput').addEventListener('change', function () {
    productCost = this.value;
    updateTotalCosts();
  });

  document.getElementById('goldradio').addEventListener('change', function () {
    comissionPercentage = 0.13;
    updateTotalCosts();
  });

  document.getElementById('premiumradio').addEventListener('change', function () {
    comissionPercentage = 0.07;
    updateTotalCosts();
  });

  document.getElementById('standardradio').addEventListener('change', function () {
    comissionPercentage = 0.03;
    updateTotalCosts();
  });

  document.getElementById('productCurrency').addEventListener('change', function () {
    if (this.value == DOLLAR_CURRENCY) {
      MONEY_SYMBOL = DOLLAR_SYMBOL;
    } else if (this.value == PESO_CURRENCY) {
      MONEY_SYMBOL = PESO_SYMBOL;
    }

    updateTotalCosts();
  });

  let dzoptions = {
    url: '/',
    autoQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: '<i class="bi bi-trash"></i>',
  };
  let myDropzone = new Dropzone('div#file-upload', dzoptions);

  let sellForm = document.getElementById('sell-info');

  sellForm.addEventListener('submit', function (e) {
    e.preventDefault();
    e.preventDefault();

    let productNameInput = document.getElementById('productName');
    let productCategory = document.getElementById('productCategory');
    let productCost = document.getElementById('productCostInput');
    let infoMissing = false;

    productNameInput.classList.remove('is-invalid');
    productCategory.classList.remove('is-invalid');
    productCost.classList.remove('is-invalid');

    if (productNameInput.value === '') {
      productNameInput.classList.add('is-invalid');
      infoMissing = true;
    }

    if (productCategory.value === '') {
      productCategory.classList.add('is-invalid');
      infoMissing = true;
    }

    if (productCost.value <= 0) {
      productCost.classList.add('is-invalid');
      infoMissing = true;
    }

    if (!infoMissing) {
      showModal({
        icon: 'info-circle-fill',
        iconClass: 'info',
        title: 'Información',
        message: MSG,
        buttons: [
          {
            text: 'Aceptar',
            className: 'primary',
          },
        ],
      });
    }
  });
});
