import { renderNavbar } from "/components/navbar.js";
import { renderFooter } from "/components/footer.js";
import { displayNotification } from "/components/notification.js";

renderNavbar("login");
renderFooter();

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const submitBtn = document.getElementById("form-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!emailInput.value || !passwordInput.value) {
    displayNotification(true, "Por favor completa todos los campos.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Ingresando...";

  try {
    const { data } = await axios.post("/api/login", {
      email: emailInput.value.trim(),
      password: passwordInput.value,
    });

    displayNotification(false, "¡Bienvenido de nuevo!");

    setTimeout(() => {
      window.location.pathname = "/";
    }, 1500);
  } catch (error) {
    const errorMsg = error.response?.data?.error || "Credenciales incorrectas.";
    displayNotification(true, errorMsg);
    submitBtn.disabled = false;
    submitBtn.innerText = "Ingresar";
  }
});
