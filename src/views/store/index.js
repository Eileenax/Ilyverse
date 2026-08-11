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
let cart = JSON.parse(localStorage.getItem("cart")) || []; //cart es un arreglo que almacena los productos añadidos al carrito de compras, y se inicializa desde el almacenamiento local del navegador para mantener la persistencia entre sesiones

// Busca y almacena la referencia al contenedor DOM donde se mostrarán los botones de acciones de administración
const adminActionsContainer = document.getElementById("admin-actions"); //admin-actions es un contenedor que solo se muestra si el usuario es administrador, y dentro de él se inyectan dinámicamente los botones para crear o gestionar productos

// Busca y almacena la referencia al contenedor principal (grid) donde se pintarán las tarjetas de productos
const productsGrid = document.getElementById("products-grid"); //products-grid es el contenedor principal donde se renderizan las tarjetas de productos, y se selecciona mediante su id para poder manipularlo dinámicamente desde el script

// Busca y almacena la referencia al elemento modal utilizado para crear o editar un producto
const productModal = document.getElementById("product-modal"); //product-modal es el contenedor del modal que se utiliza para crear o editar productos, y se selecciona mediante su id para poder mostrarlo u ocultarlo según la acción del usuario

// Busca y almacena la referencia al formulario HTML para la gestión de datos de productos (Crear/Editar)
const productForm = document.getElementById("product-form");  //product-form es el formulario dentro del modal que captura los datos del producto a crear o editar, y se selecciona mediante su id para poder manejar su envío y validación desde el script

// Busca y almacena la referencia al título dinámico del modal (para alternar entre Crear y Editar)
const modalTitle = document.getElementById("modal-title"); //modal-title es el elemento de texto dentro del modal que indica si se está creando un nuevo producto o editando uno existente, y se selecciona mediante su id para actualizarlo dinámicamente según la acción del usuario

// Busca y almacena la referencia al botón para cancelar y cerrar el modal de productos
const cancelModalBtn = document.getElementById("cancel-modal-btn"); //cancel-modal-btn es el botón dentro del modal que permite al usuario cancelar la acción y cerrar el modal, y se selecciona mediante su id para agregarle un evento de cierre desde el script

// Busca y almacena la referencia al elemento del DOM que muestra el número total de ítems en el carrito
const cartCountElement = document.getElementById("cart-count"); //cart-count es el elemento visual que muestra la cantidad de productos añadidos al carrito, y se selecciona mediante su id para actualizarlo dinámicamente cada vez que se agregan o eliminan productos

// Actualiza visualmente el contador numérico del carrito en la interfaz al iniciar la vista
updateCartCount(); //updateCartCount es una función que se encarga de actualizar el número visible de productos en el carrito, y se llama al inicio para reflejar correctamente la cantidad de ítems almacenados en localStorage al cargar la página

// Actualiza los elementos visuales del carrito de compras (drawer) al cargar la página
updateCartUI(); //updateCartUI es una función que se encarga de renderizar el contenido del carrito de compras en la interfaz, mostrando los productos añadidos y sus cantidades, y se llama al inicio para reflejar el estado actual del carrito al cargar la vista

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
const firstFilterBtn = document.querySelector('.category-filter-btn'); //.category-filter-btn es la clase que identifica los botones de filtrado por categoría, y se selecciona el primero para poder acceder a su contenedor padre y reestructurar la disposición de los filtros en la interfaz

// Verifica que el botón y su contenedor padre existan antes de manipular el DOM
if (firstFilterBtn && firstFilterBtn.parentElement) { //firstFilterBtn.parentElement es el contenedor que agrupa todos los botones de filtrado por categoría, y se verifica su existencia para poder aplicar estilos y reordenar los filtros de manera segura
  //y firstFilterBtn es el primer botón de filtrado que se encuentra en el DOM, y se utiliza para localizar su contenedor padre y aplicar estilos de diseño flexibles a todos los botones de categoría
  // esto permite que los botones de filtrado se muestren de manera centrada y con un espaciado uniforme en la interfaz de la tienda
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
const productCategorySelect = document.getElementById("prod-category"); //prod-category es el elemento <select> dentro del formulario de creación/edición de productos, y se selecciona mediante su id para poder actualizar sus opciones dinámicamente según las categorías válidas de la tienda

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
if (!document.getElementById("image-preview-modal")) { //image-preview-modal es el contenedor del modal flotante que permite hacer zoom a las imágenes de los productos, y se verifica su existencia para evitar duplicar el modal en el DOM al cargar la vista
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
  document.body.insertAdjacentHTML('beforeend', imageModalHTML); //insertAdjacentHTML es un método que permite inyectar código HTML en el DOM sin reemplazar el contenido existente, y se utiliza aquí para añadir el modal de vista previa de imagen al final del body de la página
}
//beforeend es un parámetro que indica que el contenido HTML se insertará justo antes del cierre de la etiqueta body, asegurando que el modal esté disponible en toda la página sin interferir con otros elementos existentes
//imageModalHTML es una cadena de texto que contiene todo el código HTML del modal de vista previa de imagen, incluyendo su estructura, clases CSS y elementos internos como el botón de cierre, el título y la imagen ampliada

// Define una función global para abrir el modal de zoom de imagen pasando la URL de la imagen y el nombre del producto
window.openImageModal = function(imageUrl, imageName) { //openImageModal es una función que se expone globalmente para permitir que cualquier parte del código pueda abrir el modal de vista previa de imagen pasando la ruta de la imagen y el nombre del producto como parámetros
  // Si no se proporciona una URL de imagen válida, interrumpe la ejecución de la función
  if (!imageUrl) return; // aquí verifico que la URL de la imagen sea válida antes de intentar abrir el modal, para evitar errores en la interfaz
  
  // Obtiene la referencia al contenedor principal del modal de imagen
  const modal = document.getElementById("image-preview-modal"); //image-preview-modal es el contenedor del modal que se muestra al hacer zoom en la imagen de un producto, y se selecciona mediante su id para poder manipular su visibilidad y contenido desde la función
  
  // Obtiene la referencia a la etiqueta <img> donde se mostrará la imagen ampliada
  const img = document.getElementById("image-modal-src"); //image-modal-src es la etiqueta <img> dentro del modal que mostrará la imagen ampliada del producto, y se selecciona mediante su id para actualizar su atributo src con la URL de la imagen correspondiente
  
  // Obtiene la referencia al título del modal para mostrar el nombre del producto
  const title = document.getElementById("image-modal-title"); //image-modal-title es el elemento de texto dentro del modal que mostrará el nombre del producto asociado a la imagen, y se selecciona mediante su id para actualizar su contenido dinámicamente según el producto seleccionado
  
  // Asigna la ruta de la imagen al atributo src de la etiqueta img si esta existe
  if (img) img.src = imageUrl;
  
  // Asigna el nombre del producto como texto del título o un texto por defecto si viene vacío
  if (title) title.innerText = imageName || "Detalle del diseño"; // aquí asigno el nombre del producto al título del modal, o un texto por defecto si no se proporciona un nombre válido, para mantener la coherencia visual y la información contextual en la interfaz
  
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
    //localeCompare es un método que permite comparar cadenas de texto de manera sensible al idioma, y se utiliza aquí para ordenar los productos por nombre respetando acentos y caracteres especiales del español
    // Llama a la función que renderiza las tarjetas de productos en pantalla pasándole la lista actualizada
    displayProducts(productsList); //displayProducts es una función que se encarga de recorrer el arreglo de productos y generar dinámicamente las tarjetas visuales correspondientes en la interfaz, mostrando la información relevante de cada producto según la categoría seleccionada
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
  const normalizedFilter = normalizeCategory(currentCategory); //normalizeCategory es una función que toma la categoría seleccionada y la convierte a un formato estándar para poder comparar y filtrar los productos de manera consistente, evitando problemas con mayúsculas, minúsculas o variaciones de nombres
//currentCategory es la variable que almacena la categoría seleccionada actualmente por el usuario, y se utiliza para determinar qué productos mostrar en la grilla según su categoría correspondiente
  // Filtra los productos según la categoría seleccionada: si es "TODOS" muestra todos, de lo contrario filtra por coincidencia normalizada
  const filteredProducts = currentCategory === "TODOS" 
    ? products 
    : products.filter(p => normalizeCategory(p.category) === normalizedFilter); 
//basicamente, si la categoría seleccionada es "TODOS", se asigna todo el arreglo de productos a filteredProducts; si no, se filtra el arreglo original para incluir solo aquellos productos cuya categoría normalizada coincida con la categoría seleccionada por el usuario
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
  productsGrid.innerHTML = filteredProducts.map((product) => { //.map es un método de arreglos que permite transformar cada elemento del arreglo original en un nuevo valor, y se utiliza aquí para generar dinámicamente el código HTML de cada tarjeta de producto a partir de los datos obtenidos de la base de datos
    // Obtiene la categoría normalizada para mostrarla de manera uniforme en la etiqueta visual
    const categoryDisplay = normalizeCategory(product.category);
    //product.category es la propiedad del objeto producto que indica su categoría original, y se pasa a la función normalizeCategory para obtener una versión estandarizada que se mostrará en la interfaz de usuario
    //normalizeCategory es la función que se encarga de convertir diferentes variantes de nombres de categorías en una categoría estándar reconocida por la tienda, asegurando consistencia en la visualización y filtrado de productos
    //categoryDisplay es la variable que almacena la categoría normalizada que se mostrará en la tarjeta del producto, y se utiliza para etiquetar visualmente cada producto según su categoría correspondiente
    
    // Obtiene el identificador único del producto soportando tanto '_id' (MongoDB) como 'id' estándar
    const productId = product._id || product.id;
    //product._id es la propiedad que MongoDB asigna automáticamente a cada documento como su identificador único, mientras que product.id es una convención más genérica que podría usarse en otros contextos; esta línea asegura compatibilidad con ambos formatos
    //productId es la variable que almacena el identificador único del producto, y se utiliza para asociar acciones específicas como editar, eliminar o añadir al carrito de compras a ese producto en particular
    
    // Sanitiza el nombre del producto reemplazando comillas simples para evitar errores de sintaxis en atributos onclick
    const safeName = (product.name || '').replace(/'/g, "\\'"); //basicamente, esta línea toma el nombre del producto y reemplaza cualquier comilla simple con una versión escapada (\\') para que pueda ser pasado de manera segura como argumento en funciones JavaScript dentro de atributos HTML, evitando romper la sintaxis y posibles errores de ejecución
    //safename es la variable que contiene el nombre del producto con comillas simples escapadas, lo que previene problemas al pasar el nombre como argumento en funciones JavaScript dentro de atributos HTML, asegurando que la cadena se interprete correctamente sin romper la sintaxis
    
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
function openCreateModal() { //openCreateModal es una función que se encarga de preparar y mostrar el modal para crear un nuevo producto, limpiando cualquier estado previo de edición y reseteando los campos del formulario
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
window.openEditModal = function(id) { //openEditModal es una función global que se expone para permitir que cualquier parte del código pueda abrir el modal de edición de un producto pasando su ID único como argumento
  // Busca en la lista local el producto que coincida con el ID proporcionado
  const product = productsList.find(p => (p._id || p.id) === id);
  
  // Si no encuentra el producto, interrumpe la ejecución
  if (!product) return; // si no se encuentra un producto con el ID proporcionado, la función retorna inmediatamente para evitar errores al intentar acceder a propiedades de un objeto inexistente

  // Almacena el ID del producto que se está editando actualmente
  editingProductId = id; //editingProductId es una variable de estado que guarda el identificador del producto que se está editando, y se utiliza para determinar si la operación actual es una actualización (PUT) o una creación (POST) al enviar el formulario
  
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
function closeModal() { //closeModal es una función que se encarga de ocultar el modal de creación/edición de productos, limpiar los campos del formulario y resetear la variable de estado que indica si se está editando un producto
  productModal?.classList.add("hidden"); // productModal es la referencia al contenedor del modal, y se le añade la clase hidden para ocultarlo visualmente en la interfaz
  if (productForm) productForm.reset(); //si productForm es la referencia al formulario dentro del modal, se llama a su método reset() para limpiar todos los campos y dejarlos en su estado inicial
  editingProductId = null; //editingProductId se reinicia a null para indicar que no hay ningún producto actualmente en edición, lo que prepara el estado para una posible creación de un nuevo producto en la siguiente apertura del modal
}

// Asocia un evento de clic al botón de cancelar del modal para cerrarlo
if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal); //cancelModalBtn es la referencia al botón de cancelar dentro del modal, y se le añade un escuchador de eventos que llama a la función closeModal() para cerrar el modal cuando el usuario hace clic en él

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
    formData.append("name", nameVal); //nameval es el valor del campo de nombre del producto, y se añade al FormData para enviarlo al servidor
    formData.append("price", priceVal); //priceval es el valor numérico del campo de precio del producto, y se añade al FormData para enviarlo al servidor
    formData.append("category", categoryVal); //categoryval es el valor seleccionado del campo de categoría del producto, y se añade al FormData para enviarlo al servidor
    formData.append("description", descVal); //descval es el valor del campo de descripción del producto, y se añade al FormData para enviarlo al servidor

    // Obtiene la referencia al input de archivo de imagen y verifica si el usuario seleccionó una imagen nueva
    const fileInput = document.getElementById("prod-image-file");
    if (fileInput && fileInput.files[0]) { //dice que si el input de archivo existe y tiene al menos un archivo seleccionado, entonces procede a añadirlo al FormData para enviarlo al servidor
      formData.append("image", fileInput.files[0]); //append es un método de FormData que permite añadir un archivo al conjunto de datos a enviar, y aquí se añade el primer archivo seleccionado por el usuario bajo la clave "image"
    }

    // Determina si la operación actual es una edición evaluando si existe un editingProductId válido
    const isEdit = !!editingProductId; //isEdit es una variable booleana que indica si el formulario se está utilizando para editar un producto existente (true) o para crear uno nuevo (false), y se establece evaluando si editingProductId tiene un valor válido (no null ni undefined)
    
    // Define la URL del endpoint: si es edición usa la ruta con ID, si es creación usa la ruta general
    const url = isEdit ? `/api/products/${editingProductId}` : "/api/products";
    
    // Define el método HTTP correspondiente: PUT para actualizar, POST para crear nuevo registro
    const method = isEdit ? "PUT" : "POST";

    try {
      // Envía la petición HTTP asíncrona al servidor con el token de autorización en los headers
      const response = await fetch(url, { //url es la ruta del endpoint de la API que se construye dinámicamente según si se está editando un producto existente o creando uno nuevo, y se utiliza en la función fetch para enviar la solicitud al servidor
        method, //method es la variable que contiene el verbo HTTP a utilizar en la solicitud (POST para crear, PUT para actualizar), y se pasa como propiedad del objeto de configuración de fetch para indicar al servidor qué acción se desea realizar
        headers: { //headers es un objeto que contiene las cabeceras HTTP que se enviarán junto con la solicitud, y aquí se incluye la cabecera de autorización con el token de acceso del usuario
          "Authorization": `Bearer ${token}` //bearer token es un esquema de autenticación que permite enviar un token de acceso en la cabecera Authorization para validar que el usuario tiene permisos para realizar la operación solicitada en el servidor
        },
        body: formData //body es la propiedad del objeto de configuración de fetch que contiene los datos que se enviarán al servidor en el cuerpo de la solicitud, y aquí se pasa el FormData que incluye los campos del formulario y el archivo de imagen si fue seleccionado
      });
      //las cabeceras son importantes para que el servidor pueda autenticar al usuario y permitirle crear o actualizar productos según sus permisos, y el cuerpo de la solicitud contiene toda la información necesaria para que el servidor procese la creación o actualización del producto en la base de datos

      // Si la respuesta del servidor indica un fallo, evalúa el tipo de contenido para extraer el mensaje de error
      if (!response.ok) {
        const contentType = response.headers.get("content-type"); //contenttype es una variable que obtiene el valor de la cabecera "content-type" de la respuesta del servidor, lo que permite determinar si la respuesta es en formato JSON o texto plano, y se utiliza para manejar los errores de manera adecuada según el tipo de contenido recibido
        if (contentType && contentType.includes("application/json")) { //si la cabecera content-type indica que la respuesta es JSON, entonces se procede a parsear el cuerpo de la respuesta como JSON para extraer el mensaje de error específico
          const errorData = await response.json(); //errordata es un objeto que contiene la información del error devuelta por el servidor en formato JSON, y se obtiene llamando al método json() de la respuesta, lo que permite acceder a propiedades como errorData.error para mostrar un mensaje más detallado al usuario
          throw new Error(errorData.error || "no se pudo completar la operación");  //lanza un error con el mensaje específico devuelto por el servidor o un mensaje genérico si no se proporciona uno, lo que permite que el bloque catch capture este error y muestre una alerta al usuario indicando que la operación no se pudo completar
        } else {
          const textError = await response.text(); //textError es una variable que obtiene el cuerpo de la respuesta del servidor como texto plano, lo que permite capturar mensajes de error que no estén en formato JSON y mostrarlos en la consola para depuración, ayudando a identificar problemas en el servidor o en la solicitud realizada
          console.error("respuesta html del servidor:", textError);  //imprime en la consola el contenido de la respuesta del servidor cuando no es JSON, lo que ayuda a los desarrolladores a diagnosticar problemas en el backend o en la configuración del servidor, proporcionando información adicional sobre el error ocurrido
          throw new Error(`error en el servidor (${response.status}).`); //lanza un error con un mensaje genérico que incluye el código de estado HTTP devuelto por el servidor, lo que permite que el bloque catch capture este error y muestre una alerta al usuario indicando que hubo un problema en el servidor durante la operación solicitada
        }
      }

      // Si todo sale bien, cierra el modal y vuelve a consultar la lista actualizada de productos del servidor
      closeModal(); //closeModal es la función que se llama para ocultar el modal de creación/edición de productos y limpiar el formulario, asegurando que la interfaz vuelva a su estado normal después de una operación exitosa
      fetchProducts();  //fetchProducts es la función que se llama para realizar una nueva solicitud al servidor y obtener la lista actualizada de productos, lo que permite reflejar los cambios realizados (creación o edición) en la interfaz de usuario mostrando la información más reciente disponible
    } catch (err) { //err es la variable que captura cualquier excepción lanzada durante el proceso de envío del formulario, incluyendo errores de red, errores de parseo o errores específicos devueltos por el servidor, lo que permite manejar estos casos y proporcionar retroalimentación al usuario
      // Muestra una alerta emergente en caso de que ocurra algún error durante el proceso de guardado
      alert("Error: " + err.message);
    }
  });
}

// Solicita la eliminación de un producto (DELETE del CRUD) utilizando su ID único real
window.deleteProduct = async function(id) { //deleteProduct es una función global que se expone para permitir que cualquier parte del código pueda solicitar la eliminación de un producto pasando su ID único como argumento, y se encarga de manejar la confirmación del usuario, la solicitud al servidor y la actualización de la interfaz tras la eliminación
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
  const button = e.target.closest('.category-filter-btn'); //closest es un método que permite buscar el ancestro más cercano del elemento clickeado que coincida con el selector proporcionado, en este caso '.category-filter-btn', lo que permite identificar si el usuario hizo clic en un botón de filtro de categoría o en algún elemento dentro de él
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
  const product = productsList.find(p => (p._id || p.id) === id); //product es la variable que almacena el objeto del producto encontrado en la lista de productos, y se busca comparando el ID proporcionado con las propiedades _id o id de cada producto para asegurar compatibilidad con diferentes formatos de identificación
  if (!product) return;
  //p._id es la propiedad que MongoDB asigna automáticamente a cada documento como su identificador único, mientras que p.id es una convención más genérica que podría usarse en otros contextos; esta línea asegura compatibilidad con ambos formatos al buscar el producto por su ID
  // Si el producto no se encuentra, la función retorna inmediatamente para evitar errores al intentar acceder a propiedades de un objeto inexistente

  // Verifica si el ítem ya existe previamente dentro del arreglo del carrito
  const existingItem = cart.find(item => item.id === id); //existingItem es la variable que almacena el objeto del producto que ya está presente en el carrito, si es que existe, y se busca comparando el ID del producto con los IDs de los elementos actualmente en el carrito; si no se encuentra, existingItem será undefined
  if (existingItem) {
    // Si ya existe, incrementa su cantidad en 1 unidad
    existingItem.quantity += 1; //incrementa la propiedad quantity del objeto existingItem en 1, lo que refleja que el usuario ha añadido una unidad adicional del mismo producto al carrito
  } else {
    //.quantity es la propiedad que almacena la cantidad de unidades de un producto específico en el carrito, y se inicializa en 1 cuando se agrega por primera vez
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
  const cartDrawer = document.getElementById("cart-drawer"); //cartDrawer es la referencia al contenedor del panel lateral (drawer) del carrito de compras, y se obtiene mediante getElementById para poder manipular su visibilidad en la interfaz
  if (cartDrawer) {
    cartDrawer.classList.remove("hidden"); //quita la clase hidden del contenedor del drawer para mostrarlo en pantalla, permitiendo que el usuario vea inmediatamente los productos que ha añadido al carrito y pueda interactuar con ellos sin necesidad de navegar a otra sección de la página
  }
};

// Remueve un producto del carrito de compras basándose en su ID
window.removeFromCart = function(id) {
  // Filtra el carrito excluyendo el elemento que coincida con el ID proporcionado
  cart = cart.filter(item => item.id !== id); // aquí filtro el carrito de compras para conservar únicamente los productos cuyo identificador sea diferente al id que quiero eliminar, actualizando la lista resultante
  
  // Actualiza el almacenamiento local con el nuevo estado del carrito
  localStorage.setItem("cart", JSON.stringify(cart)); // aquí guardo el carrito actualizado en el almacenamiento local del navegador convirtiendo el arreglo a formato texto para que no se pierda al recargar la página
  
  // Actualiza el contador numérico y la interfaz gráfica del carrito
  updateCartCount();
  updateCartUI();
};

// Calcula y actualiza el número total de unidades acumuladas en el carrito para mostrarlo en el badge superior
function updateCartCount() {
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0); //cart.reduce es un método que recorre el arreglo cart y acumula la suma de la propiedad quantity de cada objeto, comenzando desde un valor inicial de 0, lo que permite calcular el total de unidades de productos en el carrito independientemente de cuántos tipos de productos haya
  //acc es el acumulador que guarda la suma parcial de las cantidades, y item.quantity es la cantidad de unidades del producto actual en la iteración; al final del reduce, totalQuantity contendrá el número total de unidades de todos los productos en el carrito
  //lo que quiere decir que si el carrito tiene 2 unidades de un producto A y 3 unidades de un producto B, totalQuantity será 5
  if (cartCountElement) {
    cartCountElement.innerText = totalQuantity; //cartCountElement es la referencia al elemento del DOM que muestra el número de unidades en el badge del carrito, y se actualiza su contenido de texto con el valor calculado de totalQuantity para reflejar visualmente al usuario cuántos productos ha añadido al carrito
  }
}

// Actualiza los elementos visuales y la lista de productos dentro del panel lateral (drawer) del carrito de compras
function updateCartUI() {
  const cartItemsContainer = document.getElementById("cart-items-container"); //cartItemsContainer es la referencia al contenedor dentro del drawer del carrito donde se renderizarán dinámicamente los ítems que el usuario ha añadido, y se obtiene mediante getElementById para poder manipular su contenido HTML según el estado actual del carrito
  const cartTotalAmount = document.getElementById("cart-total-amount"); //cartTotalAmount es la referencia al elemento del DOM que muestra el monto total acumulado de la compra en el drawer del carrito, y se obtiene mediante getElementById para poder actualizar su contenido de texto con el valor calculado del total de la compra

  if (!cartItemsContainer) return;

  // Si el carrito está sin elementos, muestra un mensaje indicando que está vacío y reinicia el total a cero
  if (cart.length === 0) { //si la longitud del arreglo cart es cero, significa que no hay productos añadidos al carrito, y se procede a mostrar un mensaje visual indicando que el carrito está vacío
    cartItemsContainer.innerHTML = `<p class="text-gray-400 text-center py-8 font-pixel-base text-lg">El carrito está vacío</p>`;
    if (cartTotalAmount) cartTotalAmount.innerText = "0.00";
    return;
  }

  // Limpia el contenedor de ítems e inicializa el acumulador de precio total
  cartItemsContainer.innerHTML = ''; 
  let total = 0; //total es una variable que se inicializa en cero y se utilizará para acumular el monto total de la compra sumando los subtotales de cada producto en el carrito, lo que permitirá mostrar al usuario el costo total de todos los productos añadidos al carrito

  // Itera sobre cada producto en el carrito para calcular subtotales y renderizar su estructura HTML
  cart.forEach(item => { //cart.forEach es un método que recorre cada objeto dentro del arreglo cart, representando cada producto añadido al carrito, y ejecuta la función proporcionada para calcular su subtotal y generar el bloque de código HTML correspondiente a su visualización en el drawer del carrito
    let subtotal = item.price * item.quantity; //subtotal es la variable que calcula el costo parcial de un producto específico en el carrito multiplicando su precio unitario (item.price) por la cantidad de unidades añadidas (item.quantity), lo que permite reflejar correctamente el costo de ese producto en particular dentro del total de la compra
    total += subtotal; //acumula el subtotal de cada producto en la variable total, sumando el costo parcial de cada ítem al monto total de la compra, lo que permite calcular el valor final que el usuario deberá pagar por todos los productos añadidos al carrito
//basicamente aqui, si el carrito tiene 2 unidades de un producto A a $10 cada una y 3 unidades de un producto B a $5 cada una, subtotal para A sería $20 y subtotal para B sería $15, y total al final del bucle sería $35
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
    cartTotalAmount.innerText = total.toFixed(2); // aquí actualizo el texto visible en la interfaz con el monto total de la compra, formateando el número a exactamente dos decimales para mostrarlo como un precio limpio
  }
}

// Obtiene referencias a los elementos del DOM encargados de abrir y cerrar el panel lateral (drawer) del carrito
const cartDrawerBtn = document.getElementById("cart-drawer-btn"); //cartDrawerBtn es la referencia al botón que el usuario presiona para abrir el drawer del carrito de compras, y se obtiene mediante getElementById para poder asociarle un evento de clic que muestre el panel lateral con los productos añadidos al carrito
const cartDrawer = document.getElementById("cart-drawer"); //cartDrawer es la referencia al contenedor del panel lateral (drawer) del carrito de compras, y se obtiene mediante getElementById para poder manipular su visibilidad en la interfaz, mostrando u ocultando el drawer según las acciones del usuario
const closeCartBtn = document.getElementById("close-cart-btn"); //closeCartBtn es la referencia al botón dentro del drawer del carrito que permite al usuario cerrarlo, y se obtiene mediante getElementById para poder asociarle un evento de clic que oculte el panel lateral cuando el usuario desee regresar a la vista principal de la tienda

// Agrega un escuchador para abrir el drawer del carrito y actualizar su interfaz al hacer clic en el botón superior
if (cartDrawerBtn && cartDrawer) { //cartDrawerBtn es la referencia al botón que abre el drawer del carrito, y cartDrawer es la referencia al contenedor del drawer; este bloque de código verifica que ambos elementos existan antes de asociarles un evento de clic para evitar errores en caso de que alguno no esté presente en el DOM
  cartDrawerBtn.addEventListener("click", () => {
    cartDrawer.classList.remove("hidden");
    updateCartUI();
  });
}

// Agrega un escuchador al botón de cerrar del drawer para ocultarlo
if (closeCartBtn && cartDrawer) { // aquí compruebo que tanto el botón de cerrar como el panel lateral del carrito existan en el documento para evitar errores de referencia nula
  closeCartBtn.addEventListener("click", () => { // aquí escucho el evento de clic sobre el botón de cerrar para ejecutar una acción cuando el usuario lo presione
    cartDrawer.classList.add("hidden"); // aquí añado la clase hidden al panel lateral del carrito para ocultarlo visualmente de la pantalla
  });
}

// Obtiene referencias a los elementos involucrados en el flujo de simulación de pago (checkout)
const checkoutBtn = document.getElementById("checkout-btn"); // aquí selecciono el botón de finalizar compra del DOM para capturar la acción del usuario
const checkoutModal = document.getElementById("checkout-modal");// aquí selecciono la ventana flotante o modal de pago para poder mostrarla u ocultarla según las acciones del usuario
const backToCartBtn = document.getElementById("back-to-cart-btn"); // aquí selecciono el botón para regresar al carrito y cerrar la ventana de pago
const confirmPurchaseBtn = document.getElementById("confirm-purchase-btn");// aquí selecciono el botón final para confirmar y procesar la compra de los productos

// Evento que valida el proceso de pago al hacer clic en proceder al checkout
if (checkoutBtn && checkoutModal) { // aquí verifico que tanto el botón de pagar como el modal de pago existan en el DOM antes de asignarles lógica para evitar errores de null
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
if (backToCartBtn && checkoutModal && cartDrawer) { //backToCartBtn es la referencia al botón dentro del modal de checkout que permite al usuario regresar al drawer del carrito, y se obtiene mediante getElementById para poder asociarle un evento de clic que oculte el modal de pago y muestre nuevamente el panel lateral del carrito
  backToCartBtn.addEventListener("click", () => { // aquí escucho el evento de clic en el botón de regresar al carrito para cancelar la vista de pago
    checkoutModal.classList.add("hidden"); // aquí añado la clase hidden al modal de pago para ocultar la ventana flotante de la pantalla
    cartDrawer.classList.remove("hidden"); // aquí remuevo la clase hidden del panel lateral del carrito para volver a mostrarlo al usuario
  });
}

// Simula la confirmación exitosa de la compra, vaciando el carrito y limpiando el almacenamiento local
if (confirmPurchaseBtn && checkoutModal) {// aquí verifico que el botón de confirmar compra y el modal existan en el DOM antes de añadirles funcionalidad
  confirmPurchaseBtn.addEventListener("click", () => {// aquí escucho el evento de clic en el botón de confirmar la compra para procesar el pedido del usuario
    alert("¡Compra exitosa! Gracias por tu pedido en IlyStore."); // aquí muestro una alerta visual emergente indicando que la transacción se completó con éxito
    cart = []; // aquí vacío por completo el arreglo del carrito en la memoria del programa dejándolo en cero elementos
    localStorage.removeItem("cart"); // aquí elimino el carrito guardado en el almacenamiento local del navegador para limpiar los datos almacenados
    updateCartCount(); // aquí actualizo el contador visual de productos para que refleje que el carrito está vacío
    updateCartUI(); // aquí actualizo la interfaz visual del carrito de compras para vaciar la lista de artículos mostrados
    checkoutModal.classList.add("hidden"); // aquí añado la clase hidden al modal de pago para cerrarlo y ocultarlo de la pantalla tras finalizar la compra
  });
}

// Ejecuta la función principal para iniciar la carga de los productos desde el servidor al cargar la vista
fetchProducts(); //fetchProducts es la función principal que se llama al final del script para iniciar el proceso de obtención de los productos desde el servidor, renderizarlos en la interfaz de usuario y establecer el estado inicial de la tienda, asegurando que los usuarios vean la lista actualizada de productos disponibles al cargar la página