export const renderNavbar = (activePage) => {
// aquí exporto la función renderNavbar que recibe la página actual para construir la barra de navegación de forma dinámica
  const token = localStorage.getItem("token");
  // aquí recupero el token de autenticación desde el almacenamiento local del navegador para verificar si la sesión está activa
  const userRaw = localStorage.getItem("user");
  // aquí recupero los datos serializados del usuario desde el almacenamiento local

  const publicPages = ["home", "login", "signup", "verify"];
  // aquí defino una lista con las páginas públicas permitidas para que cualquier usuario pueda visitarlas sin iniciar sesión

  if (!token && !publicPages.includes(activePage)) { //activePage es un parámetro que indica la página actual y se compara con la lista de páginas públicas para determinar si el usuario tiene acceso
  // aquí compruebo si el usuario no tiene token y está intentando acceder a una ruta privada que requiere estar autenticado
    window.location.replace("/");
  // aquí compruebo si el usuario no tiene token y está intentando acceder a una ruta privada que requiere estar autenticado
    window.location.replace("/");
    // aquí reemplazo la entrada actual en el historial del navegador con la página principal para evitar que la flecha atrás vuelva a la tienda
    return;
    // aquí detengo la ejecución de la función para evitar que se renderice la barra en una ruta no permitida
  }

  let navContainer = document.getElementById("navbar") || document.querySelector("nav") || document.querySelector("header");
  // aquí busco el contenedor de la barra de navegación en el documento html usando múltiples selectores posibles

  if (!navContainer) {
  // aquí compruebo si el contenedor no existe en la vista actual para crearlo de manera automática al inicio del cuerpo
    navContainer = document.createElement("header");
    // aquí creo una nueva etiqueta header en memoria para albergar la barra de navegación
    navContainer.id = "navbar";
    // aquí le asigno el identificador navbar al elemento creado para mantener la consistencia
    document.body.prepend(navContainer);
    // aquí inserto el contenedor recién creado al inicio del cuerpo del documento para asegurar su visibilidad
  }

  let displayName = "ILY";
  // aquí inicializo una variable con un nombre por defecto para mostrar en caso de que los datos fallen
  if (token && userRaw) {
  // aquí verifico si tanto el token como los datos del usuario existen en el almacenamiento local
    try {
    // aquí abro un bloque try para intentar analizar y convertir los datos del usuario desde formato json
      const user = JSON.parse(userRaw);
      // aquí convierto la cadena de texto del usuario en un objeto manipulable de javascript
      displayName = user.username || user.nombre || user.email || "ILY";
      // aquí extraigo el nombre de usuario disponible priorizando el nombre de usuario, nombre real o correo
    } catch (error) {
    // aquí capturo cualquier error en el análisis de los datos del usuario
      displayName = "ILY";
      // aquí asigno el nombre por defecto si ocurre un fallo al leer el almacenamiento
    }
  }

  const userMenuHtml = token && userRaw ? `
    <div class="relative">
      <button id="user-menu-btn" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ily-dark/80 border border-ily-purple-300/40 text-ily-purple-100 text-xs font-pixel-logo hover:border-ily-purple-300 transition-all">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        ${displayName}
        <span class="text-[10px]">▼</span>
      </button>
      <div id="user-dropdown" class="absolute right-0 mt-2 w-52 bg-ily-dark/95 border border-ily-purple-300/40 rounded-xl p-2 shadow-xl backdrop-blur-md hidden z-50">
        <div class="px-3 py-1.5 text-[10px] text-ily-purple-300/60 uppercase font-pixel-logo">cuenta activa</div>
        <div class="px-3 py-1.5 text-xs text-ily-purple-100 font-bold font-pixel-logo truncate">${displayName}</div>
        <div class="border-t border-ily-purple-300/20 my-1"></div>
        <button id="nav-logout-btn" class="w-full text-left px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-pixel-logo transition-all flex items-center gap-2">
          <span>🚪</span> cerrar sesión
        </button>
      </div>
    </div>
  ` : `
    <div class="flex items-center gap-3">
      <a href="/login" class="px-3 py-1.5 rounded-lg bg-ily-purple-300/20 text-ily-purple-100 hover:bg-ily-purple-300/30 text-xs font-pixel-logo transition-all">
        iniciar sesión
      </a>
      <a href="/signup" class="px-3 py-1.5 rounded-lg bg-ily-purple-300 text-ily-dark hover:bg-ily-purple-200 text-xs font-pixel-logo font-bold transition-all">
        registrarse
      </a>
    </div>
  `;
  // aquí genero condicionalmente el código html del menú de usuario con el botón de cerrar sesión o los botones de acceso según el estado de autenticación

  const navHtml = `
    <nav class="w-full bg-ily-dark/95 border-b border-ily-purple-300/20 backdrop-blur-md sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center">
        <a href="/" class="text-lg font-pixel-logo text-ily-purple-100 tracking-wider flex items-center gap-0 hover:text-ily-purple-300 transition-all">
        <span class="text-ily-purple-300">I</span>lyverse
          </a>
        </div>
        <div class="hidden md:flex items-center gap-8 text-xs font-pixel-logo">
          <a href="/store" class="${activePage === 'store' ? 'text-ily-purple-300 font-bold' : 'text-ily-purple-100 hover:text-ily-purple-300'} transition-all flex items-center gap-1.5 uppercase tracking-wider">
            🛒 TIENDA
          </a>
          <a href="/community" class="${activePage === 'community' ? 'text-ily-purple-300 font-bold' : 'text-ily-purple-100 hover:text-ily-purple-300'} transition-all flex items-center gap-1.5 uppercase tracking-wider">
            🌐 COMUNIDAD
          </a>
        </div>
        <div>
          ${userMenuHtml}
        </div>
      </div>
    </nav>
  `;
  // aquí estructuro todo el código html de la barra de navegación incluyendo el fondo sólido, los enlaces centrales en mayúsculas y el menú dinámico

  navContainer.innerHTML = navHtml;
  // aquí inyecto todo el contenido html generado dentro del contenedor de la barra de navegación

  const userMenuBtn = document.getElementById("user-menu-btn");
  // aquí selecciono el botón principal del menú de usuario para controlar su despliegue
  const userDropdown = document.getElementById("user-dropdown");
  // hier selecciono el contenedor desplegable del menú de usuario

  if (userMenuBtn && userDropdown) { //userMenuBtn y userDropdown son elementos que solo existen si el usuario está autenticado, por lo que verifico su existencia antes de agregar eventos
  // aquí compruebo si ambos elementos existen en la vista actual antes de agregarles eventos
  // aquí escucho el evento click en el botón del menú para alternar su visibilidad
    userMenuBtn.addEventListener("click", (e) => {
    // aquí escucho el evento click en el botón del menú para alternar su visibilidad
      e.stopPropagation();
      // aquí detengo la propagación del evento para evitar que se cierre inmediatamente al hacer clic
      userDropdown.classList.toggle("hidden");
      // aquí alterno la clase hidden para mostrar u ocultar el menú desplegable
    });

    document.addEventListener("click", () => {
    // aquí escucho los clics en cualquier parte del documento para cerrar el menú desplegable automáticamente
      userDropdown.classList.add("hidden");
      // aquí oculto el menú desplegable añadiéndole la clase hidden
    });
  }

  const navLogoutBtn = document.getElementById("nav-logout-btn");
  // aquí selecciono el botón de cerrar sesión dentro del menú desplegable
  if (navLogoutBtn) {
  // aquí verifico si el botón de cerrar sesión existe en la vista actual
    navLogoutBtn.addEventListener("click", () => {
    // aquí escucho el evento click en el botón de cerrar sesión
      localStorage.removeItem("token");
      // aquí borro el token de autenticación del almacenamiento local del navegador
      localStorage.removeItem("user");
      // aquí borro los datos del usuario del almacenamiento local del navegador
      window.location.replace("/");
      // aquí reemplazo la URL actual en el historial con el home para que la flecha de atrás no pueda regresar a la tienda protegida
    });
  }
};