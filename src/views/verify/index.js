import { renderNavbar } from "/components/navbar.js";
import { renderFooter } from "/components/footer.js";

// Renderizar componentes
renderNavbar("verify");
renderFooter();

// Elementos DOM
const verifyTitle = document.getElementById("verify-title");
const verifyText = document.getElementById("verify-text");
const actionBtn = document.getElementById("action-btn");

const verifyUser = async () => {
  // 1. Obtener ID y Token de los Query Parameters (?id=...&token=...)
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const token = urlParams.get("token");

  // 2. Validar que existan ambos valores
  if (!id || !token) {
    verifyTitle.innerText = "Enlace inválido";
    verifyTitle.className =
      "text-xl font-bold mb-4 font-pixel-logo text-red-400";
    verifyText.innerText =
      "El enlace de verificación es incorrecto o faltan parámetros.";
    actionBtn.classList.remove("hidden");
    return;
  }

  // 3. Petición PATCH al backend
  try {
    const response = await axios.patch(`/api/users/${id}/${token}`);

    verifyTitle.innerText = "¡Cuenta Verificada!";
    verifyTitle.className =
      "text-xl font-bold mb-4 font-pixel-logo text-ily-purple-100";
    verifyText.innerText =
      response.data.message ||
      "Tu correo ha sido confirmado exitosamente. Ya puedes iniciar sesión.";
    actionBtn.classList.remove("hidden");
  } catch (error) {
    console.error("Error al verificar la cuenta:", error);
    verifyTitle.innerText = "Error de Verificación";
    verifyTitle.className =
      "text-xl font-bold mb-4 font-pixel-logo text-red-400";
    verifyText.innerText =
      error.response?.data?.error ||
      "El enlace de verificación es inválido o ha expirado.";
    actionBtn.classList.remove("hidden");
  }
};

verifyUser();