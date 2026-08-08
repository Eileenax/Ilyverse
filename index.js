const app = require("./app");
// aquí importo la aplicación de express ya configurada y lista para funcionar
const mongoose = require("mongoose");
// aquí importo la librería mongoose para poder modelar y conectar la base de datos mongodb
const { PORT, MONGO_URI } = require("./config");
// aquí extraigo el número del puerto y la dirección uri de la base de datos desde el archivo de configuración
const dns = require('dns');
// aquí importo el módulo nativo dns para solucionar un problema temporal de resolución de direcciones en windows
dns.setServers(['8.8.8.8', '8.8.4.4']);
// aquí configuro manualmente servidores dns públicos de respaldo para asegurar la conexión con mongodb atlas

mongoose
// aquí inicio el proceso de conexión con la base de datos usando mongoose
  .connect(MONGO_URI)
  // aquí ejecuto el método de conexión pasándole la uri secreta de la base de datos
  .then(() => {
  // aquí abro un bloque para ejecutar acciones una vez que la conexión se realice con éxito
    console.log("conectado a mongodb exitosamente");
    // aquí imprimo un mensaje de confirmación en la consola indicando que nos conectamos bien a la base de datos
    app.listen(PORT, () => {
    // aquí ordeno al servidor express empezar a escuchar las peticiones web en el puerto establecido
      console.log(`servidor corriendo en el puerto ${PORT}`);
      // aquí imprimo un mensaje de aviso en la consola indicando que el servidor ya arrancó y está activo
    });
    // aquí cierro la función de escucha del servidor
  })
  // aquí cierro el bloque de éxito de la promesa de conexión
  .catch((error) => {
  // aquí abro un bloque catch para capturar y manejar cualquier fallo si la conexión con la base de datos falla
    console.error("error al conectar con mongodb:", error);
    // aquí imprimo el error detallado en la consola para saber por qué falló la conexión con mongodb
  });
  // aquí cierro el bloque de captura de errores de la conexión