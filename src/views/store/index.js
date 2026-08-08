// importo el módulo de la barra de navegación compartida
import { renderNavbar } from "../components/navbar.js";

// renderizo la barra indicando que la página activa es store
renderNavbar("store");

// obtengo el token y los datos del usuario almacenados
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user")) || {};
const isAdmin = user.role === "admin";

// declaro las variables para el manejo del estado local
let productsList = [];
let editingProductId = null;

// busco y guardo las referencias a los elementos del dom
const adminActionsContainer = document.getElementById("admin-actions");
const productsGrid = document.getElementById("products-grid");
const productModal = document.getElementById("product-modal");
const productForm = document.getElementById("product-form");
const modalTitle = document.getElementById("modal-title");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const cartCountElement = document.getElementById("cart-count");

// actualizo el contador del carrito al iniciar la vista
updateCartCount();

// muestro el botón para agregar productos si el usuario tiene rol de admin
if (isAdmin && adminActionsContainer) {
  adminActionsContainer.innerHTML = `
    <button id="btn-create-product" class="px-4 py-1.5 bg-ily-purple/30 hover:bg-ily-purple border border-ily-purple text-white rounded-full text-[10px] font-pixel-logo transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer">
      + Agregar Nuevo Producto
    </button>
  `;

  document.getElementById("btn-create-product")?.addEventListener("click", openCreateModal);
}

// consulto la lista de productos mediante la api del servidor
async function fetchProducts() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("error al conectar con la base de datos");

    productsList = await response.json();
    displayProducts(productsList);
  } catch (error) {
    console.error("error:", error);
    if (productsGrid) {
      productsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-red-400 font-pixel-base text-lg flex items-center justify-center gap-2">
            <span>⚠️</span> No se pudieron cargar los productos del catálogo.
          </p>
        </div>
      `;
    }
  }
}

// recorro el arreglo de productos para renderizar cada tarjeta en pantalla
function displayProducts(products) {
  if (!productsGrid) return;

  if (!Array.isArray(products) || products.length === 0) {
    productsGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-400 font-pixel-base text-xl">No hay ítems en la tienda todavía. ¡Agrega el primero!</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = products.map((product) => {
    const category = product.category || "ITEM";
    const productId = product._id || product.id;
    
    return `
      <div class="bg-ily-card/80 border border-purple-900/40 rounded-2xl p-3.5 flex flex-col justify-between hover:border-ily-purple/70 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all group relative backdrop-blur-sm">
        
        <span class="absolute top-3 right-3 bg-black/60 text-purple-300 text-[9px] font-pixel-base px-2 py-0.5 rounded-full uppercase border border-purple-500/30 z-10">
          ${category}
        </span>

        <div>
          <div class="w-full h-36 rounded-xl overflow-hidden mb-3 bg-black/40 border border-white/5 flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
            ${product.image ? `
              <img 
                src="${product.image}" 
                alt="${product.name}" 
                class="w-full h-full object-contain rounded-lg"
              />
            ` : `
              <div class="w-12 h-12 bg-ily-purple/20 rounded-xl border border-ily-purple/40 flex items-center justify-center text-ily-purple text-xl">
                📦
              </div>
            `}
          </div>

          <h3 class="font-pixel-base text-base text-white font-bold mb-1 tracking-wide truncate">${product.name || 'Sin nombre'}</h3>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
          
          <span class="font-pixel-base text-xl font-bold text-ily-purple-300 tracking-tight">
            $${product.price !== undefined ? product.price : '0'}
          </span>

          <div>
            ${isAdmin ? `
              <div class="flex gap-1">
                <button 
                  onclick="openEditModal('${productId}')" 
                  class="p-1.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 rounded-lg text-xs transition-colors cursor-pointer"
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  onclick="deleteProduct('${productId}')" 
                  class="p-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-300 rounded-lg text-xs transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            ` : `
              <button 
                onclick="addToCart('${productId}')" 
                class="p-2 bg-ily-purple hover:bg-purple-600 text-white rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center cursor-pointer text-xs"
                title="Agregar al carrito"
              >
                🛒
              </button>
            `}
          </div>

        </div>

      </div>
    `;
  }).join("");
}

// preparo y abro el modal para registrar un producto nuevo
function openCreateModal() {
  editingProductId = null;
  if (modalTitle) modalTitle.innerText = "➕ Nuevo producto";
  if (productForm) productForm.reset();
  productModal?.classList.remove("hidden");
}

// cargo los datos del producto seleccionado para editarlos en el modal
window.openEditModal = function(id) {
  const product = productsList.find(p => (p._id || p.id) === id);
  if (!product) return;

  editingProductId = id;
  if (modalTitle) modalTitle.innerText = "✏️ Editar producto";

  document.getElementById("prod-name").value = product.name || "";
  document.getElementById("prod-price").value = product.price || "";
  document.getElementById("prod-category").value = product.category || "";
  document.getElementById("prod-description").value = product.description || "";

  productModal?.classList.remove("hidden");
};

// cierro el modal de gestión de productos
function closeModal() {
  productModal?.classList.add("hidden");
  if (productForm) productForm.reset();
  editingProductId = null;
}

if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

// capturo el envío del formulario asegurando que coja bien los valores de tus inputs
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameVal = document.getElementById("prod-name")?.value.trim() || "";
    const priceVal = Number(document.getElementById("prod-price")?.value) || 0;
    const categoryVal = document.getElementById("prod-category")?.value || "ITEM";
    const descVal = document.getElementById("prod-description")?.value.trim() || "";

    const formData = new FormData();
    formData.append("name", nameVal);
    formData.append("price", priceVal);
    formData.append("category", categoryVal);
    formData.append("description", descVal);

    const fileInput = document.getElementById("prod-image-file");
    if (fileInput && fileInput.files[0]) {
      formData.append("image", fileInput.files[0]);
    }

    const isEdit = !!editingProductId;
    const url = isEdit ? `/api/products/${editingProductId}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "no se pudo completar la operación");
        } else {
          const textError = await response.text();
          console.error("respuesta html del servidor:", textError);
          throw new Error(`error en el servidor (${response.status}).`);
        }
      }

      closeModal();
      fetchProducts(); // Refresca la tienda y crea automáticamente la colección en MongoDB si no existía
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}

// solicito la eliminación de un producto usando su ID real
window.deleteProduct = async function(id) {
  if (!confirm("¿Deseas eliminar este producto de la tienda?")) return;

  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "error al eliminar");
      } else {
        throw new Error(`error en el servidor (${response.status}) al eliminar`);
      }
    }

    fetchProducts(); 
  } catch (err) {
    alert("Error: " + err.message);
  }
};

// guardo el producto seleccionado dentro del carrito en el almacenamiento local
window.addToCart = function(id) {
  const product = productsList.find(p => (p._id || p.id) === id);
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name: product.name, price: product.price, image: product.image, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`🛒 "${product.name}" agregado al carrito.`);
};

// calculo y actualizo el total de ítems mostrados en el icono del carrito
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (cartCountElement) {
    cartCountElement.innerText = totalQuantity;
  }
}

// inicio la carga de los productos al cargar el archivo
fetchProducts();