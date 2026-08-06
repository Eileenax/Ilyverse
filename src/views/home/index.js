import { renderNavbar } from "/components/navbar.js";
import { renderFooter } from "/components/footer.js";

renderNavbar("home");
renderFooter();

const publicHome = document.getElementById("public-home");
const privateHome = document.getElementById("private-home");
const userNameSpan = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");

const token = localStorage.getItem("token");
const userRaw = localStorage.getItem("user");

if (token && userRaw) {
  try {
    const user = JSON.parse(userRaw);
    
    // Ocultar vista pública y mostrar la privada
    if (publicHome) publicHome.classList.add("hidden");
    if (privateHome) privateHome.classList.remove("hidden");

    // Insertar el nombre del usuario
    if (userNameSpan) {
      userNameSpan.textContent = user.username || user.nombre || user.email || "Usuario";
    }
  } catch (error) {
    // Si los datos están corruptos, limpiar sesión
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

// Evento de Cerrar Sesión desde el Landing
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  });
}