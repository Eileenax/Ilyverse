import { renderNavbar } from "/components/navbar.js";
// aquí importo la función para renderizar la barra de navegación desde su archivo correspondiente
import { renderFooter } from "/components/footer.js";
// aquí importo la función para renderizar el pie de página desde su archivo correspondiente

renderNavbar("verify");
// aquí ejecuto la función de la barra de navegación indicando que estamos en la sección de verificación
renderFooter();
// aquí ejecuto la función para mostrar el pie de página en la interfaz

const verifyTitle = document.getElementById("verify-title");
// aquí selecciono el elemento de título de verificación desde el documento html mediante su id
const verifyText = document.getElementById("verify-text");
// aquí selecciono el elemento de texto informativo de verificación mediante su id
const actionBtn = document.getElementById("action-btn");
// aquí selecciono el botón de acción de la interfaz mediante su id

const verifyUser = async () => {
// aquí declaro una función asíncrona llamada verifyUser para manejar todo el proceso de validación del correo
  const urlParams = new URLSearchParams(window.location.search);
  // aquí leo los parámetros de consulta enviados en la url actual del navegador web
  const id = urlParams.get("id");
  // aquí extraigo el valor del parámetro id que identifica al usuario desde la url
  const token = urlParams.get("token");
  // aquí extraigo el valor del token de seguridad desde la url

  if (!id || !token) {
  // aquí evalúo si falta alguno de los dos datos obligatorios en la url actual
    verifyTitle.innerText = "Enlace inválido";
    // aquí cambio el texto del título para avisar que el enlace no es correcto
    verifyTitle.className =
    // aquí asigno las clases de estilo al título aplicando un color rojo de advertencia
      "text-xl font-bold mb-4 font-pixel-logo text-red-400";
    verifyText.innerText =
    // aquí asigno un texto explicativo indicando que faltan parámetros necesarios en el enlace
      "El enlace de verificación es incorrecto o faltan parámetros.";
    actionBtn.classList.remove("hidden");
    // aquí muestro el botón de acción eliminando la clase de ocultamiento
    return;
    // aquí detengo la ejecución de la función para evitar continuar si faltan datos en la url
  }

  try {
  // aquí abro un bloque try para intentar enviar la petición de verificación al servidor de forma segura
    const response = await axios.patch(`/api/users/${id}/${token}`);
    // aquí realizo una petición patch asíncrona con axios enviando el id y el token para verificar la cuenta

    verifyTitle.innerText = "¡Cuenta Verificada!";
    // aquí cambio el texto del título para celebrar que la cuenta fue verificada con éxito
    verifyTitle.className =
    // aquí actualizo las clases de estilo del título con los colores corporativos y morados de la interfaz
      "text-xl font-bold mb-4 font-pixel-logo text-ily-purple-100";
    verifyText.innerText =
    // aquí muestro el mensaje de éxito devuelto por el servidor o un texto predeterminado de confirmación
      response.data.message ||
      "Tu correo ha sido confirmado exitosamente. Ya puedes iniciar sesión.";
    actionBtn.classList.remove("hidden");
    // aquí hago visible el botón de acción para que el usuario pueda avanzar a otra pantalla
  } catch (error) {
  // aquí abro el bloque catch para capturar cualquier error o fallo ocurrido durante la verificación
    console.error("Error al verificar la cuenta:", error);
    // aquí imprimo el error detallado en la consola del navegador para facilitar la depuración técnica
    verifyTitle.innerText = "Error de Verificación";
    // aquí configuro el título de la interfaz para informar que ocurrió un error al verificar
    verifyTitle.className =
    // aquí aplico clases de estilo con color rojo para resaltar el error visualmente
      "text-xl font-bold mb-4 font-pixel-logo text-red-400";
    verifyText.innerText =
    // aquí muestro el mensaje de error específico enviado por el servidor o un texto genérico de enlace expirado
      error.response?.data?.error ||
      "El enlace de verificación es inválido o ha expirado.";
    actionBtn.classList.remove("hidden");
    // aquí muestro el botón de acción para permitirle al usuario interactuar a pesar del fallo
  }
};

verifyUser();
// aquí ejecuto inmediatamente la función de verificación apenas se carga la página web