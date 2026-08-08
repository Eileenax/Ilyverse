const emailInput = document.querySelector("#email");
// aquí selecciono el elemento de entrada del correo electrónico desde el documento html usando su selector de id
const passwordInput = document.querySelector("#password");
// aquí selecciono el elemento de entrada de la contraseña desde el documento html usando su selector de id
const form = document.querySelector("#form"); 
// aquí selecciono el formulario principal del documento html mediante su selector de id
const errorText = document.querySelector("#error-text"); 
// aquí selecciono el elemento de texto en la interfaz donde mostraré los mensajes de error

form.addEventListener("submit", async (event) => {
// aquí escucho el evento submit del formulario y declaro una función asíncrona para manejar el envío de credenciales
  event.preventDefault(); 
  // aquí detengo el comportamiento por defecto del formulario para evitar que la página se recargue de forma automática
  try {
  // aquí abro un bloque try para intentar enviar los datos al servidor y manejar posibles errores de autenticación
    const user = {
    // aquí declaro un objeto literal llamado user para empaquetar las credenciales capturadas en pantalla
      email: emailInput.value, 
      // aquí asigno el valor del correo electrónico escrito por el usuario en el campo correspondiente
      password: passwordInput.value
      // aquí asigno el valor de la contraseña escrita por el usuario en el campo correspondiente
    };

    const response = await axios.post("/api/login", user); 
    // aquí realizo una petición post asíncrona utilizando axios para enviar el objeto user a la ruta de inicio de sesión del servidor y espero la respuesta

    localStorage.setItem("user", JSON.stringify(response.data));
    // aquí guardo los datos de sesión devueltos por el servidor convirtiéndolos en texto plano dentro del almacenamiento local del navegador para mantener la sesión activa

    window.location.pathname = `/home`; 
    // aquí cambio la ruta de navegación actual para redirigir al usuario hacia la página de inicio tras un acceso exitoso

  } catch (error) {
  // aquí abro el bloque catch para capturar cualquier fallo o respuesta de error que ocurra durante la petición
    console.log(error); 
    // aquí imprimo el objeto del error completo en la consola del navegador para facilitar su depuración técnica
    errorText.innerHTML = error.response?.data?.error || "Ocurrió un error inesperado."; 
    // aquí extraigo el mensaje de error específico enviado por el backend desde la respuesta de axios o muestro un texto genérico por defecto en la interfaz
  }
});