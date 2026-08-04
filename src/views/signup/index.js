import { renderNavbar } from "/components/navbar.js";
import { renderFooter } from "/components/footer.js";
import { displayNotification } from "/components/notification.js";

// Renderizar componentes
renderNavbar("signup");
renderFooter();

// EXPRESIONES REGULARES (REGEX)
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// SELECTORES DOM
const form = document.getElementById("signup-form");
const usernameInput = document.getElementById("username-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const passwordMatchInput = document.getElementById("match-password");
const submitFormBtn = document.getElementById("form-btn");

// ELEMENTOS DE MENSAJE DE ERROR
const usernameError = document.getElementById("username-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const passwordMatchError = document.getElementById("match-password-error");

// ESTADOS DE VALIDACIÓN
let usernameValidation = false;
let emailValidation = false;
let passwordValidation = false;
let passwordMatchValidation = false;

// FUNCIÓN PARA APLICAR BORDES Y TEXTO DE ERROR
const setFieldState = (input, errorEl, isValid, errorMsg) => {
  // Si el campo está vacío, estilo neutro por defecto
  if (input.value.trim() === "") {
    input.className =
      "w-full px-4 py-2.5 rounded-lg bg-ily-dark/60 border border-ily-purple-300/30 text-ily-purple-100 placeholder-[#a09abc]/50 focus:outline-none transition-all text-xs";
    if (errorEl) {
      errorEl.innerText = "";
      errorEl.classList.add("hidden");
    }
    return;
  }

  if (isValid) {
    // VÁLIDO: Borde Morado Neón con resplandor
    input.className =
      "w-full px-4 py-2.5 rounded-lg bg-ily-dark/60 border-2 border-ily-purple-300 text-ily-purple-100 focus:outline-none transition-all text-xs shadow-[0_0_12px_rgba(199,125,255,0.6)]";
    if (errorEl) {
      errorEl.innerText = "";
      errorEl.classList.add("hidden");
    }
  } else {
    // INVÁLIDO: Borde Rojo con resplandor
    input.className =
      "w-full px-4 py-2.5 rounded-lg bg-ily-dark/60 border-2 border-red-500 text-ily-purple-100 focus:outline-none transition-all text-xs shadow-[0_0_12px_rgba(239,68,68,0.6)]";
    if (errorEl) {
      errorEl.innerText = errorMsg;
      errorEl.classList.remove("hidden");
    }
  }
};

// HABILITAR / DESHABILITAR BOTÓN SUBMIT
const checkFormStatus = () => {
  const isFormValid =
    usernameValidation &&
    emailValidation &&
    passwordValidation &&
    passwordMatchValidation;
  submitFormBtn.disabled = !isFormValid;

  if (isFormValid) {
    submitFormBtn.classList.remove("opacity-50", "cursor-not-allowed");
    submitFormBtn.classList.add(
      "hover:shadow-neon-btn-hover",
      "hover:-translate-y-0.5",
    );
  } else {
    submitFormBtn.classList.add("opacity-50", "cursor-not-allowed");
    submitFormBtn.classList.remove(
      "hover:shadow-neon-btn-hover",
      "hover:-translate-y-0.5",
    );
  }
};

// EVENT LISTENERS EN TIEMPO REAL
usernameInput.addEventListener("input", () => {
  usernameValidation = USERNAME_REGEX.test(usernameInput.value.trim());
  setFieldState(
    usernameInput,
    usernameError,
    usernameValidation,
    "Debe tener entre 3 y 16 caracteres (letras, números, _ o -).",
  );
  checkFormStatus();
});

emailInput.addEventListener("input", () => {
  emailValidation = EMAIL_REGEX.test(emailInput.value.trim());
  setFieldState(
    emailInput,
    emailError,
    emailValidation,
    "Ingresa un correo válido (ej. usuario@email.com).",
  );
  checkFormStatus();
});

passwordInput.addEventListener("input", () => {
  passwordValidation = PASSWORD_REGEX.test(passwordInput.value);
  setFieldState(
    passwordInput,
    passwordError,
    passwordValidation,
    "Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número.",
  );

  if (passwordMatchInput.value !== "") {
    passwordMatchValidation = passwordMatchInput.value === passwordInput.value;
    setFieldState(
      passwordMatchInput,
      passwordMatchError,
      passwordMatchValidation,
      "Las contraseñas no coinciden.",
    );
  }
  checkFormStatus();
});

passwordMatchInput.addEventListener("input", () => {
  passwordMatchValidation =
    passwordMatchInput.value !== "" &&
    passwordMatchInput.value === passwordInput.value;
  setFieldState(
    passwordMatchInput,
    passwordMatchError,
    passwordMatchValidation,
    "Las contraseñas no coinciden.",
  );
  checkFormStatus();
});

// SUBMIT Y ENVÍO A API + EMAILJS
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (
    !usernameValidation ||
    !emailValidation ||
    !passwordValidation ||
    !passwordMatchValidation
  ) {
    displayNotification(true, "Corrige los campos en rojo antes de continuar.");
    return;
  }

  submitFormBtn.disabled = true;
  submitFormBtn.innerText = "Registrando...";

  try {
    const newUser = {
      username: usernameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
    };

    // 1. Petición al Backend
    const response = await axios.post("/api/users", newUser);

    // 2. Envío con EmailJS (aislado para evitar interrupciones en la base de datos)
    try {
      if (window.emailjs) {
        emailjs.init("pQwc4TTouuCqPH2cc");
        const templateParams = {
          to_name: newUser.username,
          to_email: newUser.email,
          user_email: newUser.email,
          verification_link: `${window.location.origin}/verify?id=${response.data.user ? response.data.user.id : ""}&token=${response.data.token || ""}`,
        };
        await emailjs.send(
          "service_xlshix9",
          "template_3krzla8",
          templateParams,
        );
      }
    } catch (emailErr) {
      console.warn(
        "El usuario se creó en DB, pero falló el envío del correo EmailJS:",
        emailErr,
      );
    }

    displayNotification(
      false,
      "¡Registro exitoso! Revisa tu correo de verificación.",
    );

    // Limpiar campos
    form.reset();
    [usernameInput, emailInput, passwordInput, passwordMatchInput].forEach(
      (inp) => {
        inp.className =
          "w-full px-4 py-2.5 rounded-lg bg-ily-dark/60 border border-ily-purple-300/30 text-ily-purple-100 placeholder-[#a09abc]/50 focus:outline-none transition-all text-xs";
      },
    );
    [usernameError, emailError, passwordError, passwordMatchError].forEach(
      (err) => err?.classList.add("hidden"),
    );

    setTimeout(() => {
      window.location.pathname = "/login";
    }, 3000);
  } catch (error) {
    console.error("Error al registrar:", error);
    const errorMsg =
      error.response?.data?.error || "Error al registrar el usuario.";
    displayNotification(true, errorMsg);
    submitFormBtn.disabled = false;
    submitFormBtn.innerText = "Registrarme";
  }
});
