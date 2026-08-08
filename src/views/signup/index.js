import { renderNavbar } from "/components/navbar.js";
// aquí importo la función para mostrar la barra de navegación desde su archivo correspondiente
import { renderFooter } from "/components/footer.js";
// aquí importo la función para mostrar el pie de página desde su archivo correspondiente
import { displayNotification } from "/components/notification.js";
// aquí importo la función para mostrar alertas dinámicas en la interfaz del usuario

renderNavbar("signup");
// aquí ejecuto la función de la barra de navegación indicando que estoy en la página de registro
renderFooter();
// aquí ejecuto la función para que el pie de página aparezca dibujado en la interfaz

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
// aquí defino un patrón estricto para validar que el nombre de usuario tenga entre tres y dieciséis caracteres permitiendo letras números guiones y guiones bajos
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// aquí defino un patrón de comprobación para asegurarme de que el formato del correo electrónico ingresado sea estructuralmente correcto
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
// aquí defino un patrón de seguridad para exigir que la contraseña tenga mínimo ocho caracteres con al menos una mayúscula una minúscula y un número

const form = document.getElementById("signup-form");
// aquí selecciono el formulario de registro completo dentro del documento html usando su id
const usernameInput = document.getElementById("username-input");
// aquí selecciono la caja de texto donde el usuario escribe su nombre usando su id
const emailInput = document.getElementById("email-input");
// aquí selecciono la caja de texto donde el usuario escribe su correo electrónico usando su id
const passwordInput = document.getElementById("password-input");
// aquí selecciono la caja de texto donde el usuario escribe su contraseña usando su id
const passwordMatchInput = document.getElementById("match-password");
// aquí selecciono la caja de texto donde el usuario repite su contraseña para confirmarla usando su id
const submitFormBtn = document.getElementById("form-btn");
// aquí selecciono el botón principal que envía los datos del formulario al servidor usando su id

const usernameError = document.getElementById("username-error");
// aquí selecciono el espacio de texto oculto que mostrará un error si el nombre de usuario resulta inválido
const emailError = document.getElementById("email-error");
// aquí selecciono el espacio de texto oculto que mostrará un error si el correo resulta inválido
const passwordError = document.getElementById("password-error");
// aquí selecciono el espacio de texto oculto que mostrará un error si la contraseña resulta débil
const passwordMatchError = document.getElementById("match-password-error");
// aquí selecciono el espacio de texto oculto que mostrará un error si las contraseñas no logran coincidir

let usernameValidation = false;
// aquí creo una variable para rastrear si el nombre de usuario es válido empezando su estado en falso
let emailValidation = false;
// aquí creo una variable para rastrear si el correo es válido empezando su estado en falso
let passwordValidation = false;
// aquí creo una variable para rastrear si la contraseña es válida empezando su estado en falso
let passwordMatchValidation = false;
// aquí creo una variable para rastrear si ambas contraseñas escritas son idénticas empezando en falso

const setFieldState = (input, errorEl, isValid, errorMsg) => {
// aquí declaro una función reutilizable que cambia los colores de los bordes y muestra errores dependiendo de si el campo evaluado es válido
  if (input.value.trim() === "") {
  // aquí compruebo si el campo de texto analizado está completamente vacío
    input.className =
    // aquí le asigno las clases css originales al campo para que vuelva a su estado neutro sin bordes de alerta
      "w-full px-4 py-2.5 rounded-lg bg-ily-dark/60 border border-ily-purple-300/30 text-ily-purple-100 placeholder-[#a09abc]/50 focus:outline-none transition-all text-xs";
    if (errorEl) {
    // aquí verifico si existe un elemento de texto para errores asociado a este campo
      errorEl.innerText = "";
      // aquí limpio cualquier mensaje de error que estuviera escrito previamente
      errorEl.classList.add("hidden");
      // aquí oculto el mensaje de error de la pantalla añadiéndole la clase de ocultamiento
    }
    return;
    // aquí detengo la ejecución de la función porque el campo está vacío y no hay nada más que verificar
  }

  if (isValid) {
  // aquí evalúo si los datos escritos en el campo cumplen exitosamente con los patrones de validación
    input.className =
    // aquí le aplico un borde iluminado morado al campo para indicarle al usuario visualmente que todo está correcto
      "w-full px-4 py-2.5 rounded-lg bg-ily-dark/60 border-2 border-ily-purple-300 text-ily-purple-100 focus:outline-none transition-all text-xs shadow-[0_0_12px_rgba(199,125,255,0.6)]";
    if (errorEl) {
    // aquí compruebo de nuevo si hay un texto de error asociado
      errorEl.innerText = "";
      // aquí borro el mensaje de error por si se había activado uno antes
      errorEl.classList.add("hidden");
      // aquí oculto el texto de error porque el campo finalmente pasó la validación
    }
  } else {
  // aquí ejecuto este bloque si los datos escritos no cumplen con los requisitos y resultan ser inválidos
    input.className =
    // aquí le aplico un borde iluminado rojo al campo para alertar al usuario de que hay un error de formato
      "w-full px-4 py-2.5 rounded-lg bg-ily-dark/60 border-2 border-red-500 text-ily-purple-100 focus:outline-none transition-all text-xs shadow-[0_0_12px_rgba(239,68,68,0.6)]";
    if (errorEl) {
    // aquí verifico si le pasé el contenedor de error a la función
      errorEl.innerText = errorMsg;
      // aquí inyecto el mensaje de error personalizado directamente dentro de la etiqueta
      errorEl.classList.remove("hidden");
      // aquí retiro la clase de ocultamiento para que el usuario pueda leer el error en la interfaz
    }
  }
};

const checkFormStatus = () => {
// aquí defino una función para calcular dinámicamente si el botón de registro debe estar bloqueado o habilitado
  const isFormValid =
  // aquí creo una constante que almacena el resultado final de todas mis comprobaciones simultáneas
    usernameValidation &&
    // aquí exijo que la validación del usuario sea verdadera
    emailValidation &&
    // y exijo que la validación del correo sea verdadera
    passwordValidation &&
    // y exijo que la contraseña sea suficientemente segura
    passwordMatchValidation;
    // y exijo por último que ambas contraseñas coincidan perfectamente
  submitFormBtn.disabled = !isFormValid;
  // aquí bloqueo el botón de envío impidiendo su uso si alguna de las condiciones de arriba falló

  if (isFormValid) {
  // aquí compruebo si la validación total del formulario fue completamente exitosa
    submitFormBtn.classList.remove("opacity-50", "cursor-not-allowed");
    // aquí le quito al botón el aspecto medio transparente y el cursor bloqueado porque ya es interactivo
    submitFormBtn.classList.add(
    // aquí le inyecto clases de estilo para que brille y se anime sutilmente cuando el ratón pase por encima
      "hover:shadow-neon-btn-hover",
      "hover:-translate-y-0.5",
    );
  } else {
  // aquí entro si el formulario todavía conserva algún error sin corregir
    submitFormBtn.classList.add("opacity-50", "cursor-not-allowed");
    // aquí le devuelvo el aspecto transparente y el cursor de prohibido al botón para indicar que no funciona
    submitFormBtn.classList.remove(
    // aquí le retiro los efectos visuales de interacción para que no parezca clickeable por error
      "hover:shadow-neon-btn-hover",
      "hover:-translate-y-0.5",
    );
  }
};

usernameInput.addEventListener("input", () => {
// aquí pongo a escuchar el campo del nombre de usuario para que reaccione en tiempo real por cada letra tipeada
  usernameValidation = USERNAME_REGEX.test(usernameInput.value.trim());
  // aquí cruzo el texto tipeado contra mi patrón de seguridad y guardo si aprueba el examen
  setFieldState(
  // aquí invoco a la función encargada de pintar los bordes del campo según su resultado
    usernameInput,
    // le envío la referencia del campo de usuario
    usernameError,
    // le envío la referencia de dónde mostrar el error si hay fallo
    usernameValidation,
    // le envío el resultado booleano de la validación
    "Debe tener entre 3 y 16 caracteres (letras, números, _ o -).",
    // le defino el texto exacto que debe mostrar si las reglas se rompen
  );
  checkFormStatus();
  // aquí fuerzo una revisión global para saber si ya puedo encender el botón principal
});

emailInput.addEventListener("input", () => {
// aquí pongo a escuchar el campo del correo electrónico reaccionando ante cada cambio de texto
  emailValidation = EMAIL_REGEX.test(emailInput.value.trim());
  // aquí verifico si el formato del correo está bien construido y guardo la respuesta
  setFieldState(
  // aquí llamo a la función para colorear la caja de texto del correo en rojo o morado
    emailInput,
    // le entrego la variable de la caja del correo
    emailError,
    // le entrego el contenedor para inyectar su error
    emailValidation,
    // le paso el estado válido o inválido
    "Ingresa un correo válido (ej. usuario@email.com).",
    // le dejo el mensaje de advertencia preparado
  );
  checkFormStatus();
  // aquí actualizo el estado del botón general comprobando si ya se cumplen todas las metas
});

passwordInput.addEventListener("input", () => {
// aquí capto cada vez que se introduce una letra en el campo de la contraseña principal
  passwordValidation = PASSWORD_REGEX.test(passwordInput.value);
  // aquí evalúo si la clave logra satisfacer los requisitos de mayúsculas minúsculas y números
  setFieldState(
  // aquí mando a modificar la apariencia visual del campo de la contraseña
    passwordInput,
    // le indico el campo específico a alterar
    passwordError,
    // le marco dónde va el texto de ayuda del error
    passwordValidation,
    // le paso el aprobado o desaprobado de seguridad
    "Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número.",
    // le escribo los parámetros exactos exigidos para la contraseña
  );

  if (passwordMatchInput.value !== "") {
  // aquí reviso preventivamente si el usuario ya había escrito algo en el campo de confirmación abajo
    passwordMatchValidation = passwordMatchInput.value === passwordInput.value;
    // aquí comparo si la contraseña de arriba y la de abajo siguen siendo idénticas tras el cambio
    setFieldState(
    // aquí mando a repintar el campo de confirmación por si la primera contraseña cambió y desajustó todo
      passwordMatchInput,
      // paso el campo secundario
      passwordMatchError,
      // paso el texto de error de desajuste
      passwordMatchValidation,
      // le digo si se mantienen iguales o no
      "Las contraseñas no coinciden.",
      // le paso la alerta de discrepancia
    );
  }
  checkFormStatus();
  // aquí desencadeno la revisión final del formulario
});

passwordMatchInput.addEventListener("input", () => {
// aquí pongo a vigilar todo lo escrito dentro de la caja destinada a confirmar la clave
  passwordMatchValidation =
  // aquí calculo la validez de la segunda caja mediante dos pasos lógicos
    passwordMatchInput.value !== "" &&
    // primero garantizo que la caja no esté vacía
    passwordMatchInput.value === passwordInput.value;
    // luego garantizo que lo ingresado sea exactamente lo mismo que está en la primera caja
  setFieldState(
  // aquí le ordeno a mi interfaz refrescar los colores de la caja de confirmación
    passwordMatchInput,
    // indico el nodo html de la caja
    passwordMatchError,
    // indico el nodo html del error
    passwordMatchValidation,
    // le comparto el resultado de igualdad
    "Las contraseñas no coinciden.",
    // le dejo el texto preparado por si fallan
  );
  checkFormStatus();
  // aquí ejecuto la función habilitadora del botón una vez más
});

form.addEventListener("submit", async (e) => {
// aquí atrapo y escucho el evento asíncrono que ocurre al darle click al botón enviar del formulario
  e.preventDefault();
  // aquí interrumpo el recargo forzado de la página web para que no corte mis procesos internos

  if (
  // aquí establezco una última barrera de seguridad de respaldo por si el botón se habilitó a la fuerza
    !usernameValidation ||
    // si el usuario está malo
    !emailValidation ||
    // o el correo está malo
    !passwordValidation ||
    // o la clave está mala
    !passwordMatchValidation
    // o las dos claves chocan
  ) {
    displayNotification(true, "Corrige los campos en rojo antes de continuar.");
    // aquí llamo a la alerta roja en la pantalla para pedirle al usuario que arregle sus errores
    return;
    // aquí aborto inmediatamente la operación impidiendo que la petición viaje al servidor
  }

  submitFormBtn.disabled = true;
  // aquí desactivo el botón tras un click válido para evitar múltiples envíos accidentales
  submitFormBtn.innerText = "Registrando...";
  // aquí altero el texto del botón informando a la persona que su registro está en trámite

  try {
  // aquí inicio el bloque blindado para gestionar el envío de datos de forma segura capturando posibles caídas
    const newUser = {
    // aquí construyo el objeto formateado conteniendo los datos pulidos que viajarán a la base de datos
      username: usernameInput.value.trim(),
      // introduzco el nombre de usuario removiendo espacios extra a sus costados
      email: emailInput.value.trim(),
      // introduzco el correo electrónico removiendo espacios residuales
      password: passwordInput.value,
      // introduzco la contraseña tal cual fue digitada
    };

    const response = await axios.post("/api/users", newUser);
    // aquí disparo una petición de tipo post con axios esperando a que el backend procese y guarde al nuevo usuario

    try {
    // aquí abro un segundo bloque seguro dedicado única y exclusivamente a manejar el envío de correos
      if (window.emailjs) {
      // aquí confirmo que la librería de emailjs logró cargarse de forma correcta en el navegador web
        const templateParams = {
        // aquí moldeo los parámetros dinámicos que inyectaré dentro de la plantilla de mi correo
          to_name: newUser.username,
          // coloco el nombre registrado del destinatario
          to_email: newUser.email,
          // coloco la dirección a la cual disparar el correo
          verification_link: `${window.location.origin}/verify?id=${response.data.user.id}&token=${response.data.token}`,
          // aquí fabrico un enlace de validación incluyendo las credenciales secretas que me retornó la base de datos
        };

        await emailjs.send(
        // aquí ordeno a emailjs despachar el correo esperando pacientemente su respuesta de éxito
          "service_xlshix9",
          // agrego mi identificador de servicio
          "template_3krzla8",
          // agrego el código de mi plantilla visual
          templateParams,
          // suministro los datos y enlaces procesados previamente
          "pQwc4TTouuCqPH2cc",
          // agrego mi llave pública para autenticar la petición
        );

        console.log("Correo enviado con éxito vía EmailJS.");
        // aquí registro un mensaje invisible en la consola afirmando que el correo llegó al destino
      } else {
      // ejecuto este lado si el motor de correos falló al cargar
        console.warn("El SDK de EmailJS no se detectó en window.emailjs.");
        // aquí lanzo una advertencia en la consola para saber que el correo no pudo siquiera intentarse
      }
    } catch (emailErr) {
    // aquí capturo de forma aislada los errores que se produzcan durante la emisión del correo
      console.error("Error al enviar el correo con EmailJS:", emailErr);
      // aquí registro el fallo particular en la consola salvando la página de colapsar frente al usuario
    }

    displayNotification(
    // aquí invoco a la tarjeta de notificación principal
      false,
      // le inyecto un falso indicando que es una alerta de éxito verde
      "¡Registro exitoso! Revisa tu correo de verificación.",
      // redacto el texto de celebración para tranquilizar al usuario
    );

    form.reset();
    // aquí ordeno al formulario que vacíe todas sus cajas de texto restableciendo su estado virgen
    [usernameInput, emailInput, passwordInput, passwordMatchInput].forEach(
    // aquí agrupo todas las cajas en un vector para barrerlas mediante un ciclo
      (inp) => {
      // tomo la caja en turno durante el ciclo
        inp.className =
        // y reseteo todas sus clases quitando los colores verde neón y devolviendo el borde gris genérico
          "w-full px-4 py-2.5 rounded-lg bg-ily-dark/60 border border-ily-purple-300/30 text-ily-purple-100 placeholder-[#a09abc]/50 focus:outline-none transition-all text-xs";
      },
    );
    [usernameError, emailError, passwordError, passwordMatchError].forEach(
    // aquí englobo los letreros de errores en otro vector para procesarlos en lote
      (err) => err?.classList.add("hidden"),
      // y garantizo que se oculten inyectándoles la clase hidden a cada uno
    );

    setTimeout(() => {
    // aquí instalo un contador regresivo que suspende momentáneamente el código
      window.location.pathname = "/login";
      // aquí obligo a la pestaña del navegador a viajar hacia la pantalla de inicio de sesión
    }, 3000);
    // aquí establezco la demora en tres mil milisegundos permitiendo leer bien el éxito
  } catch (error) {
  // aquí atrapo cualquier catástrofe que arroje la base de datos o el proceso principal de registro
    console.error("Error al registrar:", error);
    // aquí imprimo la traza del error duro en consola para facilitar el diagnóstico a los desarrolladores
    const errorMsg =
    // aquí intento rescatar el mensaje del error que despachó mi backend
      error.response?.data?.error || "Error al registrar el usuario.";
      // y asigno un mensaje default de emergencia si el backend no mandó nada legible
    displayNotification(true, errorMsg);
    // aquí obligo a la notificación roja a salir con el texto del desastre
    submitFormBtn.disabled = false;
    // aquí vuelvo a reanimar el botón de envío perdonando el fallo para que pueda volver a intentar
    submitFormBtn.innerText = "Registrarme";
    // y finalmente restauro el título normal del botón al borrar la palabra registrando
  }
});