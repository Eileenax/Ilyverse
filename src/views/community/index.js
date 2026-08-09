import { renderNavbar } from '../../components/navbar.js';
// aquí importo la barra de navegación para mantener la estructura visual en la vista de comunidad

document.addEventListener("DOMContentLoaded", () => {
// aquí ejecuto la lógica principal cuando el documento html termina de cargarse en el navegador
  renderNavbar('community');
  // aquí renderizo la barra indicando que la página activa es 'community'

  const usersList = JSON.parse(localStorage.getItem("community_users")) || [
  // aquí recupero la lista de usuarios con las configuraciones de sus avatares guardadas desde el creador
    { 
      username: "Ily", 
      avatar: { hair: "short", eyes: "default", clothing: "shirt", accessory: "crown" } 
    },
    { 
      username: "Danny2k", 
      avatar: { hair: "mohawk", eyes: "anime", clothing: "hoodie", accessory: "headphones" } 
    },
    { 
      username: "CyberNail", 
      avatar: { hair: "pixie", eyes: "wink", clothing: "jacket", accessory: "glasses" } 
    }
  ];

  const appContainer = document.getElementById("app");
  // aquí selecciono el contenedor principal donde se dibujará todo el contenido

  if (appContainer) {
  // aquí compruebo si el contenedor existe antes de inyectar el código html
    appContainer.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
        <!-- Encabezado de la comunidad -->
        <div class="w-full text-center mb-10">
          <h1 class="text-3xl md:text-4xl font-pixel-logo text-ily-purple-300 tracking-wider mb-2">
            COMUNIDAD ILYVERSE
          </h1>
          <p class="text-xs md:text-sm font-pixel-logo text-ily-purple-100/70">
            Explora los avatares creados por todos los ilysitos que forman parte de este portal pixelado.
          </p>
        </div>

        <!-- Grid de la Comunidad -->
        <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          ${usersList.map(user => `
            <div class="bg-ily-dark/80 border border-ily-purple-300/30 rounded-2xl p-5 flex flex-col items-center text-center shadow-xl backdrop-blur-md hover:border-ily-purple-300 transition-all group">
              <!-- Contenedor del Avatar por capas PNG -->
              <div class="relative w-24 h-24 rounded-2xl bg-ily-purple-300/10 border-2 border-ily-purple-300/50 flex items-center justify-center overflow-hidden shadow-inner mb-4 group-hover:scale-105 transition-transform">
                <!-- Aquí se superponen las imágenes PNG según la configuración guardada del avatar -->
                <img src="/assets/avatar/base.png" class="absolute inset-0 w-full h-full object-contain" alt="Base">
                <img src="/assets/avatar/hair_${user.avatar?.hair || 'default'}.png" class="absolute inset-0 w-full h-full object-contain" alt="Hair">
                <img src="/assets/avatar/eyes_${user.avatar?.eyes || 'default'}.png" class="absolute inset-0 w-full h-full object-contain" alt="Eyes">
                <img src="/assets/avatar/clothing_${user.avatar?.clothing || 'default'}.png" class="absolute inset-0 w-full h-full object-contain" alt="Clothing">
                ${user.avatar?.accessory ? `<img src="/assets/avatar/accessory_${user.avatar.accessory}.png" class="absolute inset-0 w-full h-full object-contain" alt="Accessory">` : ''}
              </div>
              
              <!-- Nombre de usuario -->
              <h3 class="text-sm font-bold font-pixel-logo text-ily-purple-100 truncate w-full">
                ${user.username}
              </h3>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    // aquí inyecto el grid dinámico con las capas de imágenes superpuestas para cada usuario
  }
});