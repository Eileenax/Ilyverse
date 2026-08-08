import { renderNavbar } from "/components/navbar.js";
// aquí importo la función para renderizar la barra de navegación desde su archivo correspondiente
import { renderFooter } from "/components/footer.js";
// aquí importo la función para renderizar el pie de página desde su archivo correspondiente

renderNavbar("home");
// aquí ejecuto la función de la barra de navegación indicando que estamos en la sección de inicio
renderFooter();
// aquí ejecuto la función para mostrar el pie de página en la interfaz

const publicHome = document.getElementById("public-home");
// aquí selecciono el contenedor de la vista pública desde el documento html mediante su id
const privateHome = document.getElementById("private-home");
// aquí selecciono el contenedor de la vista privada para usuarios autenticados mediante su id
const userNameSpan = document.getElementById("user-name");
// aquí selecciono el elemento de texto donde mostraré el nombre del usuario logueado mediante su id
const logoutBtn = document.getElementById("logout-btn");
// aquí selecciono el botón para cerrar sesión en la interfaz mediante su id

const token = localStorage.getItem("token");
// aquí recupero el token de autenticación guardado en el almacenamiento local del navegador
const userRaw = localStorage.getItem("user");
// aquí recupero los datos del usuario en formato de texto desde el almacenamiento local del navegador

if (token && userRaw) {
// aquí evalúo si tanto el token como los datos del usuario existen para determinar si hay una sesión activa
  try {
  // aquí abro un bloque try para intentar procesar y mostrar la información de la sesión de forma segura
    const user = JSON.parse(userRaw);
    // aquí convierto los datos del usuario de texto plano a un objeto de javascript utilizable
    
    if (publicHome) publicHome.classList.add("hidden");
    // aquí oculto la vista pública añadiéndole la clase css de ocultamiento si el elemento existe
    if (privateHome) privateHome.classList.remove("hidden");
    // aquí muestro la vista privada eliminando la clase css de ocultamiento si el elemento existe

    if (userNameSpan) {
    // aquí compruebo si el elemento para mostrar el nombre del usuario existe en el documento
      userNameSpan.textContent = user.username || user.nombre || user.email || "Usuario";
      // aquí inserto el nombre de usuario, nombre alternativo, correo o un texto por defecto dentro del elemento seleccionado
    }
  } catch (error) {
  // aquí capturo cualquier fallo si los datos del usuario almacenados están corruptos o mal formateados
    localStorage.removeItem("token");
    // aquí borro el token corrupto del almacenamiento local del navegador para limpiar la sesión
    localStorage.removeItem("user");
    // aquí borro los datos corruptos del usuario del almacenamiento local del navegador
  }
}

if (logoutBtn) {
// aquí verifico si el botón de cerrar sesión existe en la interfaz actual
  logoutBtn.addEventListener("click", () => {
  // aquí escucho el evento click sobre el botón de cerrar sesión para ejecutar una acción
    localStorage.removeItem("token");
	// aquí elimino el token de autenticación del almacenamiento local al cerrar sesión
    localStorage.removeItem("user");
	// aquí elimino los datos del usuario del almacenamiento local al cerrar sesión
    window.location.reload();
	// aquí recargo la página actual para restablecer el estado inicial y volver a la vista pública
  });
}