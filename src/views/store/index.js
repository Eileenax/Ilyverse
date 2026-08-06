// Importo el módulo de la barra de navegación compartida
import { renderNavbar } from "../components/navbar.js";

// Renderizo la barra especificando que la página activa es "store"
renderNavbar("store");

// Obtengo el token e información del usuario
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user")) || {};
const isAdmin = user.role === "admin";

// Variables globales de estado
let productsList = [];
let editingProductId = null;

// Referencias a los nodos del DOM
const adminActionsContainer = document.getElementById("admin-actions");
const productsGrid = document.getElementById("products-grid");
const productModal = document.getElementById("product-modal");
const productForm = document.getElementById("product-form");
const modalTitle = document.getElementById("modal-title");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const cartCountElement = document.getElementById("cart-count");

// Actualizo el contador de ítems del carrito
updateCartCount();

// Renderizo acciones de administración si aplica
if (isAdmin && adminActionsContainer) {
  adminActionsContainer.innerHTML = `
    <button id="btn-create-product" class="px-4 py-1.5 bg-ily-purple/30 hover:bg-ily-purple border border-ily-purple text-white rounded-full text-[10px] font-pixel-logo transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer">
      + Agregar Nuevo Producto
    </button>
  `;

  document.getElementById("btn-create-product")?.addEventListener("click", openCreateModal);
}

// Consulto los productos al servidor
async function fetchProducts() {
  try {
    const response = await fetch("/api/products");

    if (!response.ok) throw new Error("Error en la conexión con la base de datos");

    productsList = await response.json();
    displayProducts(productsList);
  } catch (error) {
    console.error("Error:", error);

    if (productsGrid) {
      productsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-red-400 font-pixel-base text-lg flex items-center justify-center gap-2">
            <span>⚠️</span> No se pudieron cargar los productos de la base de datos.
          </p>
        </div>
      `;
    }
  }
}

// Renderizo las tarjetas dentro del marco transparente
function displayProducts(products) {
  if (!productsGrid) return;

  if (products.length === 0) {
    productsGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-400 font-pixel-base text-xl">👾 No hay ítems en la tienda todavía.</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = products.map((product) => {
    const category = product.category || "ITEM";
    
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

          <h3 class="font-pixel-base text-base text-white font-bold mb-1 tracking-wide truncate">${product.name}</h3>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
          
          <span class="font-pixel-base text-xl font-bold text-ily-green tracking-tight">
            $${product.price}
          </span>

          <div>
            ${isAdmin ? `
              <div class="flex gap-1">
                <button 
                  onclick="openEditModal('${product._id || product.id}')" 
                  class="p-1.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 rounded-lg text-xs transition-colors"
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  onclick="deleteProduct('${product._id || product.id}')" 
                  class="p-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-300 rounded-lg text-xs transition-colors"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            ` : `
              <button 
                onclick="addToCart('${product._id || product.id}')" 
                class="p-2 bg-ily-purple hover:bg-purple-600 text-white rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center cursor-pointer text-xs"
                title="Agregar al Carrito"
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

// Abrir modal en modo creación
function openCreateModal() {
  editingProductId = null;
  if (modalTitle) modalTitle.innerText = "➕ NUEVO PRODUCTO";
  if (productForm) productForm.reset();
  productModal?.classList.remove("hidden");
}

// Abrir modal en modo edición
window.openEditModal = function(id) {
  const product = productsList.find(p => (p._id || p.id) === id);
  if (!product) return;

  editingProductId = id;
  if (modalTitle) modalTitle.innerText = "✏️ EDITAR PRODUCTO";

  document.getElementById("prod-name").value = product.name || "";
  document.getElementById("prod-price").value = product.price || "";
  document.getElementById("prod-category").value = product.category || "";
  document.getElementById("prod-image").value = product.image || "";
  document.getElementById("prod-description").value = product.description || "";

  productModal?.classList.remove("hidden");
};

// Cerrar modal
function closeModal() {
  productModal?.classList.add("hidden");
  if (productForm) productForm.reset();
  editingProductId = null;
}

if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

// Guardar o actualizar producto
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productData = {
      name: document.getElementById("prod-name").value.trim(),
      price: Number(document.getElementById("prod-price").value),
      category: document.getElementById("prod-category").value.trim().toUpperCase() || "MERCH",
      image: document.getElementById("prod-image").value.trim(),
      description: document.getElementById("prod-description").value.trim(),
    };

    const isEdit = !!editingProductId;
    const url = isEdit ? `/api/products/${editingProductId}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "No se pudo procesar la solicitud");
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}

// Eliminar producto (Admin)
window.deleteProduct = async function(id) {
  if (!confirm("¿Deseas eliminar permanentemente este producto del catálogo?")) return;

  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar");
    }

    fetchProducts();
  } catch (err) {
    alert("Error: " + err.message);
  }
};

// Agregar ítem al carrito de compras local
window.addToCart = function(id) {
  const product = productsList.find(p => (p._id || p.id) === id);
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name: product.name, price: product.price, image: product.image, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`🛒 "${product.name}" guardado en tu carrito.`);
};

// Actualizar indicador numérico en el carrito
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (cartCountElement) {
    cartCountElement.innerText = totalQuantity;
  }
}

// Ejecución inicial de carga de productos
fetchProducts();