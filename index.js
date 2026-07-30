const app = require("./app"); // importamos la app configurada de express
const mongoose = require("mongoose"); // importamos mongoose para conectarnos a mongodb
const { PORT, MONGO_URI } = require("./config"); // importamos el puerto y la uri desde config
const dns = require('dns'); //solucuon temporal para el error de dns en windows al conectarse a mongodb atlas en la laptop de danny
dns.setServers(['8.8.8.8', '8.8.4.4']);

// conectamos con la base de datos de mongodb atlas
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("conectado a mongodb exitosamente");
    // levantamos el servidor una vez conectada la base de datos
    app.listen(PORT, () => {
      console.log(`servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("error al conectar con mongodb:", error);
  });
