const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const form = document.querySelector("#form"); 
const errorText = document.querySelector("#error-text"); 

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // evita que la página se recargue automáticamente al enviar el formulario.
try {
    const user = {
      // crea un objeto limpio con los datos que el usuario escribió en la pantalla.
    email: emailInput.value, 
    password: passwordInput.value
    };

    const response = await axios.post("/api/login", user); // usa la librería axios para enviar los datos del objeto 'user' de forma asíncrona al servidor mediante un método post, y espera a que el servidor responda.

    // guarda en la memoria del navegador los datos del usuario y el token devueltos por el servidor para mantener la sesión activa en el resto de la página.
    localStorage.setItem("user", JSON.stringify(response.data));

    window.location.pathname = `/home`; // si el servidor responde que todo está bien, esta línea redirecciona automáticamente al usuario a la página principal.

} catch (error) {
    // si el servidor devuelve un error (por ejemplo, correo no verificado o contraseña incorrecta), el código salta directamente a este bloque de seguridad.
    console.log(error); 
    errorText.innerHTML = error.response?.data?.error || "Ocurrió un error inesperado."; // usa la librería axios para buscar dentro del fallo (.response), abrir los datos que envió el servidor (.data) y sacar el texto del error (.error) para ponerlo en la pantalla.
}
});