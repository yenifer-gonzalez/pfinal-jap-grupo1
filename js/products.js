document.addEventListener("DOMContentLoaded", function () {
  // Relleno de data para hacer la pèticion Web
  // URL fija para la categoría 101 de autos

  const url = PRODUCTS_URL + "101" + EXT_TYPE;

  getJSONData(url).then(function (resultObj) {
    if (resultObj.status === "ok") {
      const productos = resultObj.data.products;
      mostrarProductos(productos);
    }
  });
});

function mostrarProductos(productos) {
  let html = "";

  productos.forEach((producto) => {
    html += `
      <div>
        <h3>${producto.name}</h3>
        <p>${producto.description}</p>
        <p>Precio: ${producto.currency} ${producto.cost}</p>
        <p>Vendidos: ${producto.soldCount}</p>
        <img src="${producto.image}" alt="${producto.description}">
      </div>
    `;
  });

  document.getElementById("product-list-container").innerHTML = html;
}
