import { renderNavbar } from "/components/navbar.js";
import { renderFooter } from "/components/footer.js";

renderNavbar("verify");
renderFooter();

const verifyTitle = document.getElementById("verify-title");
const verifyText = document.getElementById("verify-text");
const actionBtn = document.getElementById("action-btn");

const verifyUser = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const token = urlParams.get("token");

  if (!id || !token) {
    verifyTitle.innerText = "Enlace inválido";
    verifyTitle.className =
      "text-xl font-bold mb-4 font-pixel-logo text-red-400";
    verifyText.innerText =
      "El enlace de verificación es incorrecto o faltan parámetros.";
    actionBtn.classList.remove("hidden");
    return;
  }

  try {
    const { data } = await axios.get(`/api/users/verify/${id}/${token}`);
    verifyTitle.innerText = "¡Cuenta Verificada!";
    verifyText.innerText =
      data.message || "Tu cuenta ha sido activada correctamente.";
    actionBtn.innerText = "Iniciar Sesión";
    actionBtn.classList.remove("hidden");
  } catch (error) {
    verifyTitle.innerText = "Error de Verificación";
    verifyTitle.className =
      "text-xl font-bold mb-4 font-pixel-logo text-red-400";
    verifyText.innerText =
      error.response?.data?.error || "El token ha expirado o no es válido.";
    actionBtn.classList.remove("hidden");
  }
};

verifyUser();
