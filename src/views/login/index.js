import { renderNavbar } from "/components/navbar.js";
// aquí importo la función para renderizar la barra de navegación desde su archivo correspondiente
import { renderFooter } from "/components/footer.js";
// aquí importo la función para renderizar el pie de página desde su archivo correspondiente
import { displayNotification } from "/components/notification.js";
// aquí importo la función para mostrar notificaciones personalizadas en la interfaz de usuario

renderNavbar("login");
// aquí ejecuto la función de la barra de navegación indicando que estamos en la sección de inicio de sesión
renderFooter();
// aquí ejecuto la función para mostrar el pie de página en la interfaz

const form = document.getElementById("login-form");
// aquí selecciono el formulario de inicio de sesión desde el documento html mediante su id
const emailInput = document.getElementById("email-input");
// aquí selecciono el campo de entrada del correo electrónico mediante su id
const passwordInput = document.getElementById("password-input");
// aquí selecciono el campo de entrada de la contraseña mediante su id
const submitBtn = document.getElementById("form-btn");
// aquí selecciono el botón de envío del formulario mediante su id

form.addEventListener("submit", async (e) => {
// aquí escucho el evento submit del formulario y declaro una función asíncrona para manejar el proceso de inicio de sesión
  e.preventDefault();
  // aquí detengo el comportamiento predeterminado del formulario para evitar que la página se recargue automáticamente

  if (!emailInput.value || !passwordInput.value) {
  // aquí evalúo si el campo de correo o el campo de contraseña se encuentran vacíos
    displayNotification(true, "Por favor completa todos los campos.");
    // aquí muestro una notificación de alerta indicando que es obligatorio completar todos los campos
    return;
    // aquí detengo la ejecución de la función para evitar continuar si faltan datos
  }
  // aquí cierro la condición de validación de campos vacíos

  submitBtn.disabled = true;
  // aquí desactivo el botón de envío para evitar clics múltiples mientras se procesa la petición
  submitBtn.innerText = "Ingresando...";
  // aquí cambio el texto del botón para informar al usuario que el sistema está procesando el acceso

  try {
  // aquí abro un bloque try para intentar enviar las credenciales y manejar posibles respuestas del servidor
    const { data } = await axios.post("/api/users/login", {
    // aquí realizo una petición post asíncrona con axios a la ruta de inicio de sesión y extraigo la propiedad data
      email: emailInput.value.trim(),
      // aquí envío el correo electrónico removiendo los espacios sobrantes al inicio y al final
      password: passwordInput.value,
      // aquí envío la contraseña ingresada por el usuario
    });
    // aquí cierro el objeto de datos enviado en la petición post

    localStorage.setItem("token", data.token);
    // aquí guardo el token de autenticación devuelto por el servidor en el almacenamiento local del navegador
    const userData = data.user ? data.user : data;
    // aquí asigno los datos del usuario evaluando si la respuesta contiene un objeto user o si usa la data completa
    localStorage.setItem("user", JSON.stringify(userData));
    // aquí guardo los datos del usuario convirtiéndolos a texto plano en el almacenamiento local del navegador

    displayNotification(false, "¡Bienvenido de nuevo!");
    // aquí muestro una notificación de éxito indicando que el acceso fue correcto

    setTimeout(() => {
    // aquí programo un temporizador para retrasar la redirección y permitir visualizar la notificación
      window.location.pathname = "/";
      // aquí cambio la ruta de navegación actual para redirigir al usuario hacia la página principal
    }, 1200);
    // aquí cierro el temporizador configurando un retraso de mil doscientos milisegundos
  } catch (error) {
  // aquí abro el bloque catch para capturar cualquier error o fallo ocurrido durante el proceso de inicio de sesión
    submitBtn.disabled = false;
    // aquí vuelvo a habilitar el botón de envío para permitir nuevos intentos de acceso
    submitBtn.innerText = "Iniciar Sesión";
    // aquí restauro el texto original del botón de envío
    
    const errorMsg = error.response?.data?.error || "Credenciales incorrectas.";
    // aquí extraigo el mensaje de error específico enviado por el servidor o asigno un texto predeterminado
    displayNotification(true, errorMsg);
    // aquí muestro una notificación de error con el mensaje correspondiente en la interfaz
  }
  // aquí cierro el bloque try catch de manejo de errores
});
// aquí cierro el evento de escucha del formulario y la función principal