export const displayNotification = (isError, message) => {
  // aquí exporto una función flecha reutilizable llamada displaynotification que recibe un booleano de error y un texto de mensaje
  let container = document.getElementById("notification-container");
  // aquí busco en el documento si ya existe un contenedor principal para agrupar todas las notificaciones flotantes

  if (!container) {
    // aquí evalúo si el contenedor todavía no ha sido creado en el dom para inicializarlo por primera vez
    container = document.createElement("div");
    // aquí instancio un nuevo elemento div en memoria que servirá como contenedor general de las alertas
    container.id = "notification-container";
    // aquí le asigno su identificador único al contenedor principal de notificaciones
    container.className =
      "fixed top-24 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4";
    // aquí le aplico las clases de tailwind para posicionarlo fijo en la esquina superior derecha con diseño flexible
    document.body.appendChild(container);
    // aquí inserto el contenedor recién creado al final del cuerpo del documento para que sea visible en pantalla
  }

  const toast = document.createElement("div");
  // aquí instancio un nuevo elemento div que representará la tarjeta individual de notificación o toast
  const bgClass = isError
    ? "bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
    : "bg-ily-dark/90 border-ily-purple-300 text-ily-purple-100 shadow-[0_0_15px_rgba(199,125,255,0.6)]";
  // aquí defino dinámicamente los estilos de color y sombras según si la notificación es un error o un mensaje normal

  toast.className = `p-4 rounded-lg border backdrop-blur-md text-xs font-pixel-base transition-all duration-300 transform translate-x-10 opacity-0 ${bgClass}`;
  // aquí asigno la estructura de clases base y efectos de transición a la tarjeta combinándola con la clase de color seleccionada
  toast.innerText = message;
  // aquí inyecto el texto de la notificación dentro de la tarjeta usando el parámetro recibido

  container.appendChild(toast);
  // aquí agrego la tarjeta de notificación recién creada dentro del contenedor general flotante

  setTimeout(() => {
    // aquí programo un temporizador de breve retraso para activar la animación de entrada
    toast.classList.remove("translate-x-10", "opacity-0");
    // aquí remuevo las clases de desplazamiento y opacidad cero para hacer que la tarjeta aparezca suavemente flotando en pantalla
  }, 10);

  setTimeout(() => {
    // aquí programo un temporizador principal para controlar el tiempo que la notificación permanece visible para el usuario
    toast.classList.add("translate-x-10", "opacity-0");
    // aquí añado nuevamente las clases de desplazamiento y opacidad cero para iniciar el efecto de desvanecimiento de salida
    setTimeout(() => toast.remove(), 300);
    // aquí programo un pequeño retraso final para eliminar por completo el elemento del dom una vez terminada la animación
  }, 4000);
};