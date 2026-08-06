// Exporto la función renderNavbar para poder reutilizarla e importarla en cualquier vista de mi aplicación
export function renderNavbar(page = '') {
  // Capturo el contenedor HTML donde se va a inyectar la barra de navegación usando document.getElementById
  const container = document.getElementById('navbar-container');

  // Si el contenedor no existe en la página actual, detengo la ejecución de la función para evitar errores en consola
  if (!container) return;

  // Intento recuperar los datos del usuario guardados en el localStorage y los convierto de JSON a un objeto JavaScript
  const user = JSON.parse(localStorage.getItem('user')) || null;

  // Obtengo el token de sesión almacenado en el localStorage
  const token = localStorage.getItem('token');

  // Verifico si el usuario ha iniciado sesión convirtiendo a booleano la existencia del token o de los datos del usuario
  const isLoggedIn = !!(token || user);

  // Defino el nombre a mostrar: priorizo username, si no existe busco nombre, y si no hay ninguno uso 'Usuario' por defecto
  const username = user?.username || user?.nombre || 'Usuario';

  // Defino el avatar del personaje: tomo avatar, luego characterSprite o un emoji por defecto si no están definidos
  const characterAvatar = user?.avatar || user?.characterSprite || '👾';

  // Verifico qué página está activa para aplicar los efectos de iluminación al enlace correspondiente
  const isStoreActive = page === 'store';
  const isCommunityActive = page === 'community';

  // Inyecto el marcado HTML de la barra de navegación dinámicamente con estilos alineados a la vista principal
  container.innerHTML = `
    <nav class="w-full bg-black/40 border-b border-white/10 backdrop-blur-md px-4 sm:px-8 py-3.5 relative z-50">
      <div class="max-w-7xl mx-auto flex justify-between items-center gap-4">
        
        <!-- Logo principal del sitio web apuntando a la raíz (/) del sitio -->
        <a href="/" class="font-pixel-logo text-sm sm:text-base text-white tracking-widest hover:text-ily-purple-300 transition-colors shrink-0">
          ily<span class="text-ily-purple-300">verse</span>
        </a>

        ${isLoggedIn ? `
          <!-- Si el usuario TIENE sesión activa, muestro los enlaces principales con tipografía pixelada oficial y sus íconos -->
          <div class="flex items-center gap-6 sm:gap-10 font-pixel-logo text-[10px] sm:text-xs">
            <a href="/store" class="flex items-center gap-2 uppercase tracking-wider transition-all ${
              isStoreActive 
                ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' 
                : 'text-gray-300 hover:text-white'
            }">
              <span>🛒</span> TIENDA
            </a>
            
            <a href="/community" class="flex items-center gap-2 uppercase tracking-wider transition-all ${
              isCommunityActive 
                ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' 
                : 'text-gray-300 hover:text-white'
            }">
              <span>🌐</span> COMUNIDAD
            </a>
          </div>

          <!-- Contenedor relativo para posicionar de forma absoluta el menú desplegable del usuario -->
          <div class="relative">
            <!-- Botón principal del perfil de usuario estilizado como píldora cyberpunk -->
            <button id="user-menu-btn" class="flex items-center gap-2 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/50 text-white font-pixel-logo text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)] cursor-pointer">
              <span class="text-xs sm:text-sm">${characterAvatar}</span>
              <span class="text-white font-pixel-logo text-[9px] sm:text-[10px] uppercase max-w-[65px] sm:max-w-[100px] truncate">${username}</span>
              <span class="text-[8px] text-purple-300">▼</span>
            </button>

            <!-- Menú Desplegable con las opciones del usuario -->
            <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-40 bg-ily-dark/95 border border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-md">
              <div class="px-3 py-1.5 border-b border-white/10 text-[9px] text-gray-400 uppercase font-pixel-base truncate">
                ${username}
              </div>
              <button id="nav-logout-btn" class="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors uppercase font-pixel-base text-[10px] flex items-center gap-1.5 cursor-pointer">
                🚪 Salir
              </button>
            </div>
          </div>
        ` : `
          <!-- Si el usuario NO tiene sesión activa, muestro las opciones de login y registro -->
          <div class="flex items-center gap-3 sm:gap-5 font-pixel-logo text-[10px] sm:text-xs">
            <a href="/login" class="text-gray-300 hover:text-white transition-colors uppercase">Login</a>
            <a href="/signup" class="px-3 py-1.5 bg-ily-purple-500/80 hover:bg-ily-purple-300 text-white rounded-lg transition-colors uppercase font-bold text-[9px] sm:text-[10px] shadow-md">Registro</a>
          </div>
        `}

      </div>
    </nav>
  `;

  // Capturo las referencias de los botones y menús del DOM
  const menuBtn = document.getElementById('user-menu-btn');
  const dropdown = document.getElementById('user-dropdown');
  const logoutBtn = document.getElementById('nav-logout-btn');

  // Añado evento para abrir/cerrar menú desplegable al hacer clic en el avatar
  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    // Cierro el menú desplegable si se hace clic fuera de él
    document.addEventListener('click', () => {
      dropdown.classList.add('hidden');
    });
  }

  // Añado evento para cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    });
  }
}