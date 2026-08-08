// Importa la función encargada de renderizar la barra de navegación compartida entre vistas
import { renderNavbar } from "../components/navbar.js";

// Ejecuta la función de la barra de navegación pasando "store" para identificar la página activa actual
renderNavbar("store");

// Obtiene el token de autenticación del almacenamiento local del navegador para verificar sesiones activas
const token = localStorage.getItem("token");

// Obtiene los datos del usuario actual desde localStorage; si no existen, inicializa un objeto vacío
const user = JSON.parse(localStorage.getItem("user")) || {};

// Determina si el usuario logueado tiene el rol de administrador comparando su propiedad role
const isAdmin = user.role === "admin";

// Inicializa un arreglo vacío para almacenar la lista de productos obtenida desde la base de datos
let productsList = [];

// Variable de estado que guarda el ID del producto que se está editando actualmente (null si se crea uno nuevo)
let editingProductId = null;

// Variable de estado para controlar la categoría de productos seleccionada actualmente; inicia en "TODOS"
let currentCategory = "TODOS";

// Recupera el carrito de compras guardado en localStorage o inicializa un arreglo vacío si no hay registros previos
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Busca y almacena la referencia al contenedor DOM donde se mostrarán los botones de acciones de administración
const adminActionsContainer = document.getElementById("admin-actions");

// Busca y almacena la referencia al contenedor principal (grid) donde se pintarán las tarjetas de productos
const productsGrid = document.getElementById("products-grid");

// Busca y almacena la referencia al elemento modal utilizado para crear o editar un producto
const productModal = document.getElementById("product-modal");

// Busca y almacena la referencia al formulario HTML para la gestión de datos de productos (Crear/Editar)
const productForm = document.getElementById("product-form");

// Busca y almacena la referencia al título dinámico del modal (para alternar entre Crear y Editar)
const modalTitle = document.getElementById("modal-title");

// Busca y almacena la referencia al botón para cancelar y cerrar el modal de productos
const cancelModalBtn = document.getElementById("cancel-modal-btn");

// Busca y almacena la referencia al elemento del DOM que muestra el número total de ítems en el carrito
const cartCountElement = document.getElementById("cart-count");

// Actualiza visualmente el contador numérico del carrito en la interfaz al iniciar la vista
updateCartCount();

// Actualiza los elementos visuales del carrito de compras (drawer) al cargar la página
updateCartUI();

// Condicional que verifica si el usuario es administrador y si el contenedor de administración existe en el DOM
if (isAdmin && adminActionsContainer) {
  // Inyecta el botón HTML para abrir el modal de creación de un nuevo producto con estilos personalizados
  adminActionsContainer.innerHTML = `
    <button id="btn-create-product" class="px-4 py-1.5 bg-ily-purple/30 hover:bg-ily-purple border border-ily-purple text-white rounded-full text-[10px] font-pixel-logo transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer">
      + Agregar Nuevo Producto
    </button>
  `;

  // Selecciona el botón recién inyectado y le añade un escuchador de eventos para abrir el modal de creación al hacer clic
  document.getElementById("btn-create-product")?.addEventListener("click", openCreateModal);
}

// Busca el primer botón de filtro de categoría para localizar su contenedor padre en el DOM
const firstFilterBtn = document.querySelector('.category-filter-btn');

// Verifica que el botón y su contenedor padre existan antes de manipular el DOM
if (firstFilterBtn && firstFilterBtn.parentElement) {
  // Almacena la referencia al contenedor de los botones de filtro de categorías
  const filterContainer = firstFilterBtn.parentElement;
  
  // Asigna clases CSS de Tailwind para estructurar el diseño flexible y centrado de los filtros
  filterContainer.className = "flex flex-wrap justify-center gap-2 mb-8 px-4";
  
  // Inyecta dinámicamente los botones de filtrado por categoría (TODOS, ROPA, TAZAS, ACCESORIOS, GAMING)
  filterContainer.innerHTML = `
    <button class="category-filter-btn px-4 py-1.5 bg-ily-purple text-white rounded-full text-xs font-pixel-base transition-all shadow-[0_0_10px_rgba(168,85,247,0.5)] cursor-pointer" data-category="TODOS">TODOS</button>
    <button class="category-filter-btn px-4 py-1.5 bg-purple-950/60 text-gray-300 border border-white/10 rounded-full text-xs font-pixel-base transition-all hover:border-ily-purple/50 cursor-pointer" data-category="ROPA">ROPA</button>
    <button class="category-filter-btn px-4 py-1.5 bg-purple-950/60 text-gray-300 border border-white/10 rounded-full text-xs font-pixel-base transition-all hover:border-ily-purple/50 cursor-pointer" data-category="TAZAS">TAZAS</button>
    <button class="category-filter-btn px-4 py-1.5 bg-purple-950/60 text-gray-300 border border-white/10 rounded-full text-xs font-pixel-base transition-all hover:border-ily-purple/50 cursor-pointer" data-category="ACCESORIOS">ACCESORIOS</button>
    <button class="category-filter-btn px-4 py-1.5 bg-purple-950/60 text-gray-300 border border-white/10 rounded-full text-xs font-pixel-base transition-all hover:border-ily-purple/50 cursor-pointer" data-category="GAMING">GAMING</button>
  `;
}

// Obtiene la referencia al elemento selector desplegable (<select>) de categorías dentro del formulario modal
const productCategorySelect = document.getElementById("prod-category");

// Verifica que el elemento selector exista para actualizar sus opciones internas de forma dinámica
if (productCategorySelect) {
  // Inyecta las opciones válidas del selector para mantener consistencia con las categorías de la tienda
  productCategorySelect.innerHTML = `
    <option value="" disabled selected>SELECCIONA</option>
    <option value="ROPA">ROPA</option>
    <option value="TAZAS">TAZAS</option>
    <option value="ACCESORIOS">ACCESORIOS</option>
    <option value="GAMING">GAMING</option>
  `;
}

// Comprueba si el modal de vista previa de imagen ya fue creado en el DOM; si no, procede a inyectarlo
if (!document.getElementById("image-preview-modal")) {
  // Define la estructura HTML del modal flotante para hacer zoom a las imágenes de los productos
  const imageModalHTML = `
    <div id="image-preview-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md hidden p-4">
      <div class="relative max-w-2xl w-full bg-ily-card/95 border border-ily-purple/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex flex-col items-center">
        <button id="close-image-modal" class="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold bg-purple-950/80 border border-white/10 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">✕</button>
        <h3 id="image-modal-title" class="font-pixel-base text-lg text-white mb-3 text-center tracking-wide"></h3>
        <div class="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-black/60 border border-white/10 p-2">
          <img id="image-modal-src" src="" alt="Vista previa" class="max-h-[65vh] object-contain rounded-lg">
        </div>
      </div>
    </div>
  `;
  // Inserta el código HTML del modal al final del elemento body del documento
  document.body.insertAdjacentHTML('beforeend', imageModalHTML);
}

// Define una función global para abrir el modal de zoom de imagen pasando la URL de la imagen y el nombre del producto
window.openImageModal = function(imageUrl, imageName) {
  // Si no se proporciona una URL de imagen válida, interrumpe la ejecución de la función
  if (!imageUrl) return;
  
  // Obtiene la referencia al contenedor principal del modal de imagen
  const modal = document.getElementById("image-preview-modal");
  
  // Obtiene la referencia a la etiqueta <img> donde se mostrará la imagen ampliada
  const img = document.getElementById("image-modal-src");
  
  // Obtiene la referencia al título del modal para mostrar el nombre del producto
  const title = document.getElementById("image-modal-title");
  
  // Asigna la ruta de la imagen al atributo src de la etiqueta img si esta existe
  if (img) img.src = imageUrl;
  
  // Asigna el nombre del producto como texto del título o un texto por defecto si viene vacío
  if (title) title.innerText = imageName || "Detalle del diseño";
  
  // Remueve la clase "hidden" del modal para hacerlo visible en la interfaz
  if (modal) modal.classList.remove("hidden");
};

// Agrega un escuchador de eventos al botón de cerrar del modal de imagen para ocultarlo al hacer clic
document.getElementById("close-image-modal")?.addEventListener("click", () => {
  document.getElementById("image-preview-modal")?.classList.add("hidden");
});

// Agrega un escuchador al fondo oscuro del modal de imagen para cerrarlo si el usuario hace clic fuera de la caja central
document.getElementById("image-preview-modal")?.addEventListener("click", (e) => {
  if (e.target.id === "image-preview-modal") {
    e.target.classList.add("hidden");
  }
});

// Función auxiliar para normalizar y agrupar diferentes variantes de texto de categorías en categorías estándar de la tienda
function normalizeCategory(cat) {
  // Convierte el texto recibido a mayúsculas y elimina espacios sobrantes; si es nulo, retorna cadena vacía
  const c = (cat || "").trim().toUpperCase();
  
  // Agrupa múltiples nombres o variaciones de ropa en la categoría estándar "ROPA"
  if (c === "CAMISA" || c === "CAMISAS" || c === "HOODIE" || c === "HOODIES" || c === "ROPA") return "ROPA";
  
  // Agrupa variaciones de tazas en la categoría "TAZAS"
  if (c === "TAZA" || c === "TAZAS") return "TAZAS";
  
  // Agrupa forros de teléfono y accesorios bajo la categoría "ACCESORIOS"
  if (c === "FORRO" || c === "FORROS" || c === "FORRO DE TELÉFONO" || c === "ACCESORIOS") return "ACCESORIOS";
  
  // Agrupa mouse pads y controles bajo la categoría "GAMING"
  if (c === "MOUSE PAD" || c === "MOUSE PADS" || c === "GAMING" || c === "CONTROL / ACCESORIO") return "GAMING";
  
  // Retorna la categoría normalizada o "ITEM" por defecto si no coincide con ninguna regla anterior
  return c || "ITEM";
}

// Función asíncrona para consultar (READ del CRUD) la lista completa de productos desde la API del servidor backend
async function fetchProducts() {
  try {
    // Realiza una solicitud HTTP GET al endpoint público de productos (/api/products)
    const response = await fetch("/api/products");
    
    // Si la respuesta no es exitosa (código HTTP fuera de rango 200-299), lanza un error controlado
    if (!response.ok) throw new Error("error al conectar con la base de datos");

    // Parsea la respuesta obtenida a formato JSON para procesar los datos de los productos
    const data = await response.json();
    
    // Ordena alfabéticamente el arreglo de productos por nombre usando sensibilidad base para idioma español
    productsList = data.sort((a, b) => (a.name || "").localeCompare(b.name || "", 'es', { sensitivity: 'base' }));
    
    // Llama a la función que renderiza las tarjetas de productos en pantalla pasándole la lista actualizada
    displayProducts(productsList);
  } catch (error) {
    // Captura cualquier error de red o de parseo y lo imprime en la consola para depuración
    console.error("error:", error);
    
    // Si ocurre un error, muestra un mensaje de advertencia visual amigable dentro de la grilla de productos
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

// Recorre el arreglo de productos para renderizar dinámicamente cada tarjeta visual en la interfaz de la tienda
function displayProducts(products) {
  // Si el contenedor de la grilla de productos no existe en el DOM, detiene la ejecución
  if (!productsGrid) return;

  // Normaliza el filtro de categoría activo actual
  const normalizedFilter = normalizeCategory(currentCategory);

  // Filtra los productos según la categoría seleccionada: si es "TODOS" muestra todos, de lo contrario filtra por coincidencia normalizada
  const filteredProducts = currentCategory === "TODOS" 
    ? products 
    : products.filter(p => normalizeCategory(p.category) === normalizedFilter);

  // Valida si el resultado filtrado no es un arreglo o está vacío para mostrar un mensaje indicando que no hay ítems
  if (!Array.isArray(filteredProducts) || filteredProducts.length === 0) {
    productsGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-400 font-pixel-base text-xl">No hay ítems en esta categoría todavía.</p>
      </div>
    `;
    return;
  }

  // Mapea cada producto filtrado convirtiéndolo en un bloque de código HTML correspondiente a su tarjeta visual
  productsGrid.innerHTML = filteredProducts.map((product) => {
    // Obtiene la categoría normalizada para mostrarla de manera uniforme en la etiqueta visual
    const categoryDisplay = normalizeCategory(product.category);
    
    // Obtiene el identificador único del producto soportando tanto '_id' (MongoDB) como 'id' estándar
    const productId = product._id || product.id;
    
    // Sanitiza el nombre del producto reemplazando comillas simples para evitar errores de sintaxis en atributos onclick
    const safeName = (product.name || '').replace(/'/g, "\\'");
    
    return `
      <div class="bg-ily-card/80 border border-purple-900/40 rounded-2xl p-4 flex flex-col justify-between hover:border-ily-purple/70 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all group relative backdrop-blur-sm">
        
        <!-- Etiqueta visual flotante que muestra la categoría agrupada del producto -->
        <span class="absolute top-3 right-3 bg-purple-950/90 text-ily-purple-300 text-xs font-pixel-logo px-3 py-1 rounded-full uppercase border border-ily-purple/50 shadow-[0_0_8px_rgba(168,85,247,0.3)] z-10">
          ${categoryDisplay}
        </span>

        <div>
          <!-- Contenedor de la imagen del producto con evento para abrir el modal de zoom -->
          <div 
            class="w-full h-48 rounded-xl overflow-hidden mb-3 bg-black/40 border border-white/5 flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform cursor-pointer relative"
            title="Haz clic para ver el diseño en grande"
            onclick="openImageModal('${product.image || ''}', '${safeName}')"
          >
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
            <div class="absolute inset-0 bg-ily-purple/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="bg-black/70 text-ily-purple-300 text-xs font-pixel-logo px-2.5 py-1 rounded-full border border-ily-purple/50 shadow">🔍 Ver Zoom</span>
            </div>
          </div>

          <!-- Muestra el nombre principal del producto truncado si es muy largo -->
          <h3 class="font-pixel-base text-lg text-white font-bold mb-1 tracking-wide truncate">${product.name || 'Sin nombre'}</h3>
          
          <!-- Muestra la descripción del producto limitada a dos líneas -->
          <p class="text-gray-300 text-sm font-pixel-base line-clamp-2 mb-3 min-h-[40px]">${product.description || ''}</p>
        </div>

        <div class="flex flex-col gap-3 pt-3 border-t border-white/10 mt-2">
          
          <div class="flex items-center justify-between">
            <!-- Muestra el precio formateado del producto -->
            <span class="font-pixel-base text-2xl font-bold text-ily-purple-300 tracking-tight">
              $${product.price !== undefined ? product.price : '0'}
            </span>
          </div>

          <div class="flex flex-col gap-2">
            <!-- Renderiza condicionalmente los botones de administración (Editar y Eliminar) si el usuario tiene rol de admin -->
            ${isAdmin ? `
              <div class="flex gap-2 w-full">
                <!-- Botón de Editar que invoca a openEditModal pasando el ID del producto -->
                <button 
                  onclick="openEditModal('${productId}')" 
                  class="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-pixel-base transition-colors cursor-pointer font-bold uppercase"
                >
                  ✏️ Editar
                </button>
                <!-- Botón de Eliminar que invoca a deleteProduct pasando el ID del producto -->
                <button 
                  onclick="deleteProduct('${productId}')" 
                  class="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-300 rounded-xl text-xs font-pixel-base transition-colors cursor-pointer font-bold uppercase"
                >
                  🗑️ Eliminar
                </button>
              </div>
            ` : ''}

            <!-- Botón para añadir el producto al carrito de compras utilizando su ID -->
            <button 
              onclick="addToCart('${productId}')" 
              class="w-full py-2.5 bg-ily-purple hover:bg-purple-600 text-white font-pixel-base rounded-xl shadow-[0_0_12px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer text-base uppercase font-bold tracking-wide"
              title="Agregar al carrito"
            >
              🛒 Añadir al Carrito
            </button>
          </div>

        </div>

      </div>
    `;
  }).join("");
}

// Prepara y abre el modal en modo de Creación de un nuevo producto (CREATE del CRUD)
function openCreateModal() {
  // Limpia la variable de edición para indicar que se creará un registro nuevo
  editingProductId = null;
  
  // Cambia el título del modal para reflejar la acción de creación
  if (modalTitle) modalTitle.innerText = "➕ Nuevo producto";
  
  // Resetea los campos del formulario para dejarlos en blanco
  if (productForm) productForm.reset();
  
  // Remueve la clase hidden del modal para mostrarlo en pantalla
  productModal?.classList.remove("hidden");
}

// Carga los datos del producto seleccionado dentro del formulario para proceder a su edición (UPDATE del CRUD)
window.openEditModal = function(id) {
  // Busca en la lista local el producto que coincida con el ID proporcionado
  const product = productsList.find(p => (p._id || p.id) === id);
  
  // Si no encuentra el producto, interrumpe la ejecución
  if (!product) return;

  // Almacena el ID del producto que se está editando actualmente
  editingProductId = id;
  
  // Actualiza el texto del título del modal para indicar edición
  if (modalTitle) modalTitle.innerText = "✏️ Editar producto";

  // Rellena cada campo del formulario con la información actual del producto encontrado
  document.getElementById("prod-name").value = product.name || "";
  document.getElementById("prod-price").value = product.price || "";
  document.getElementById("prod-category").value = normalizeCategory(product.category) || "";
  document.getElementById("prod-description").value = product.description || "";

  // Muestra el modal quitándole la clase hidden
  productModal?.classList.remove("hidden");
};

// Cierra el modal de gestión de productos y limpia el formulario y el estado de edición
function closeModal() {
  productModal?.classList.add("hidden");
  if (productForm) productForm.reset();
  editingProductId = null;
}

// Asocia un evento de clic al botón de cancelar del modal para cerrarlo
if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

// Captura el evento de envío (submit) del formulario de productos para realizar la petición POST (Crear) o PUT (Actualizar)
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    // Previene el comportamiento por defecto de recarga de la página del formulario
    e.preventDefault();

    // Extrae y limpia los valores ingresados en los campos del formulario
    const nameVal = document.getElementById("prod-name")?.value.trim() || "";
    const priceVal = Number(document.getElementById("prod-price")?.value) || 0;
    const categoryVal = document.getElementById("prod-category")?.value || "ITEM";
    const descVal = document.getElementById("prod-description")?.value.trim() || "";

    // Crea un objeto FormData para empaquetar los campos de texto y el archivo de imagen de manera estructurada
    const formData = new FormData();
    formData.append("name", nameVal);
    formData.append("price", priceVal);
    formData.append("category", categoryVal);
    formData.append("description", descVal);

    // Obtiene la referencia al input de archivo de imagen y verifica si el usuario seleccionó una imagen nueva
    const fileInput = document.getElementById("prod-image-file");
    if (fileInput && fileInput.files[0]) {
      formData.append("image", fileInput.files[0]);
    }

    // Determina si la operación actual es una edición evaluando si existe un editingProductId válido
    const isEdit = !!editingProductId;
    
    // Define la URL del endpoint: si es edición usa la ruta con ID, si es creación usa la ruta general
    const url = isEdit ? `/api/products/${editingProductId}` : "/api/products";
    
    // Define el método HTTP correspondiente: PUT para actualizar, POST para crear nuevo registro
    const method = isEdit ? "PUT" : "POST";

    try {
      // Envía la petición HTTP asíncrona al servidor con el token de autorización en los headers
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      // Si la respuesta del servidor indica un fallo, evalúa el tipo de contenido para extraer el mensaje de error
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

      // Si todo sale bien, cierra el modal y vuelve a consultar la lista actualizada de productos del servidor
      closeModal();
      fetchProducts(); 
    } catch (err) {
      // Muestra una alerta emergente en caso de que ocurra algún error durante el proceso de guardado
      alert("Error: " + err.message);
    }
  });
}

// Solicita la eliminación de un producto (DELETE del CRUD) utilizando su ID único real
window.deleteProduct = async function(id) {
  // Muestra una ventana de confirmación antes de proceder a eliminar el registro
  if (!confirm("¿Deseas eliminar este producto de la tienda?")) return;

  try {
    // Envía una solicitud HTTP DELETE al endpoint específico del producto con el token de autorización
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    // Valida si la respuesta del servidor es correcta; si não, procesa el error correspondiente
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "error al eliminar");
      } else {
        throw new Error(`error en el servidor (${response.status}) al eliminar`);
      }
    }

    // Vuelve a cargar y renderizar la lista de productos actualizada tras la eliminación exitosa
    fetchProducts(); 
  } catch (err) {
    // Muestra una alerta si ocurre un fallo al eliminar el producto
    alert("Error: " + err.message);
  }
};

// Implementa la delegación de eventos en el documento para manejar los filtros por categoría seleccionados por el usuario
document.addEventListener('click', (e) => {
  // Busca si el elemento clickeado corresponde a un botón con la clase de filtro de categoría
  const button = e.target.closest('.category-filter-btn');
  if (!button) return;

  // Remueve las clases activas de estilo de todos los botones de categoría para dejarlos inactivos visualmente
  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    btn.classList.remove('bg-ily-purple', 'text-white', 'shadow-[0_0_10px_rgba(168,85,247,0.5)]');
    btn.classList.add('bg-purple-950/60', 'text-gray-300', 'border', 'border-white/10');
  });
  
  // Aplica los estilos visuales activos (morado brillante) únicamente al botón que fue presionado
  button.classList.remove('bg-purple-950/60', 'text-gray-300', 'border', 'border-white/10');
  button.classList.add('bg-ily-purple', 'text-white', 'shadow-[0_0_10px_rgba(168,85,247,0.5)]');

  // Actualiza la variable de estado currentCategory con el valor del atributo data-category del botón presionado
  currentCategory = button.getAttribute('data-category') || 'TODOS';
  
  // Vuelve a renderizar la grilla de productos aplicando el nuevo filtro seleccionado
  displayProducts(productsList);
});

// Lógica de gestión del carrito de compras: añade un producto seleccionado por su ID al carrito local
window.addToCart = function(id) {
  // Busca el producto dentro de la lista de productos cargados
  const product = productsList.find(p => (p._id || p.id) === id);
  if (!product) return;

  // Verifica si el ítem ya existe previamente dentro del arreglo del carrito
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    // Si ya existe, incrementa su cantidad en 1 unidad
    existingItem.quantity += 1;
  } else {
    // Si no existe, lo agrega como un nuevo objeto con cantidad inicial de 1 unidad
    cart.push({ 
      id, 
      name: product.name, 
      price: product.price, 
      image: product.image, 
      quantity: 1 
    });
  }

  // Guarda el estado actualizado del carrito en el localStorage del navegador
  localStorage.setItem("cart", JSON.stringify(cart));
  
  // Actualiza el contador numérico visual del carrito
  updateCartCount();
  
  // Actualiza la interfaz gráfica del drawer del carrito
  updateCartUI();

  // Selecciona el contenedor lateral (drawer) del carrito y lo muestra en pantalla
  const cartDrawer = document.getElementById("cart-drawer");
  if (cartDrawer) {
    cartDrawer.classList.remove("hidden");
  }
};

// Remueve un producto del carrito de compras basándose en su ID
window.removeFromCart = function(id) {
  // Filtra el carrito excluyendo el elemento que coincida con el ID proporcionado
  cart = cart.filter(item => item.id !== id);
  
  // Actualiza el almacenamiento local con el nuevo estado del carrito
  localStorage.setItem("cart", JSON.stringify(cart));
  
  // Actualiza el contador numérico y la interfaz gráfica del carrito
  updateCartCount();
  updateCartUI();
};

// Calcula y actualiza el número total de unidades acumuladas en el carrito para mostrarlo en el badge superior
function updateCartCount() {
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (cartCountElement) {
    cartCountElement.innerText = totalQuantity;
  }
}

// Actualiza los elementos visuales y la lista de productos dentro del panel lateral (drawer) del carrito de compras
function updateCartUI() {
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalAmount = document.getElementById("cart-total-amount");

  if (!cartItemsContainer) return;

  // Si el carrito está sin elementos, muestra un mensaje indicando que está vacío y reinicia el total a cero
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="text-gray-400 text-center py-8 font-pixel-base text-lg">El carrito está vacío</p>`;
    if (cartTotalAmount) cartTotalAmount.innerText = "0.00";
    return;
  }

  // Limpia el contenedor de ítems e inicializa el acumulador de precio total
  cartItemsContainer.innerHTML = '';
  let total = 0;

  // Itera sobre cada producto en el carrito para calcular subtotales y renderizar su estructura HTML
  cart.forEach(item => {
    let subtotal = item.price * item.quantity;
    total += subtotal;

    cartItemsContainer.innerHTML += `
      <div class="flex justify-between items-center py-3 border-b border-white/10 font-pixel-base">
        <div class="flex items-center gap-3">
          ${item.image ? `<img src="${item.image}" class="w-12 h-12 object-cover rounded-lg border border-white/10">` : ''}
          <div>
            <h4 class="font-bold text-base text-white">${item.name}</h4>
            <span class="text-sm text-gray-400">Cant: ${item.quantity} x $${Number(item.price).toFixed(2)}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-bold text-ily-purple-300 text-lg">$${subtotal.toFixed(2)}</span>
          <button onclick="removeFromCart('${item.id}')" class="text-red-400 hover:text-red-300 text-lg p-1 cursor-pointer">❌</button>
        </div>
      </div>
    `;
  });

  // Muestra el monto total acumulado de la compra formateado a dos decimales
  if (cartTotalAmount) {
    cartTotalAmount.innerText = total.toFixed(2);
  }
}

// Obtiene referencias a los elementos del DOM encargados de abrir y cerrar el panel lateral (drawer) del carrito
const cartDrawerBtn = document.getElementById("cart-drawer-btn");
const cartDrawer = document.getElementById("cart-drawer");
const closeCartBtn = document.getElementById("close-cart-btn");

// Agrega un escuchador para abrir el drawer del carrito y actualizar su interfaz al hacer clic en el botón superior
if (cartDrawerBtn && cartDrawer) {
  cartDrawerBtn.addEventListener("click", () => {
    cartDrawer.classList.remove("hidden");
    updateCartUI();
  });
}

// Agrega un escuchador al botón de cerrar del drawer para ocultarlo
if (closeCartBtn && cartDrawer) {
  closeCartBtn.addEventListener("click", () => {
    cartDrawer.classList.add("hidden");
  });
}

// Obtiene referencias a los elementos involucrados en el flujo de simulación de pago (checkout)
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutModal = document.getElementById("checkout-modal");
const backToCartBtn = document.getElementById("back-to-cart-btn");
const confirmPurchaseBtn = document.getElementById("confirm-purchase-btn");

// Evento que valida el proceso de pago al hacer clic en proceder al checkout
if (checkoutBtn && checkoutModal) {
  checkoutBtn.addEventListener("click", () => {
    // Si el carrito está vacío, muestra una alerta y detiene el proceso
    if (cart.length === 0) {
      alert("El carrito está vacío, añade productos primero.");
      return;
    }
    // Oculta el drawer del carrito y muestra el modal de pago
    if (cartDrawer) cartDrawer.classList.add("hidden");
    checkoutModal.classList.remove("hidden");
  });
}

// Botón para regresar desde el modal de checkout nuevamente hacia el drawer del carrito
if (backToCartBtn && checkoutModal && cartDrawer) {
  backToCartBtn.addEventListener("click", () => {
    checkoutModal.classList.add("hidden");
    cartDrawer.classList.remove("hidden");
  });
}

// Simula la confirmación exitosa de la compra, vaciando el carrito y limpiando el almacenamiento local
if (confirmPurchaseBtn && checkoutModal) {
  confirmPurchaseBtn.addEventListener("click", () => {
    alert("¡Compra exitosa! Gracias por tu pedido en IlyStore.");
    cart = [];
    localStorage.removeItem("cart");
    updateCartCount();
    updateCartUI();
    checkoutModal.classList.add("hidden");
  });
}

// Ejecuta la función principal para iniciar la carga de los productos desde el servidor al cargar la vista
fetchProducts();