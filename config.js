require("dotenv").config(); // cargamos las variables de entorno del archivo .env

const MONGO_URI = // seleccionamos la uri de la base de datos segun el entorno (test o prod)
  process.env.NODE_ENV === "test"
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI_PROD;

// definimos el puerto del servidor
const PORT = process.env.PORT || 3000;

// exportamos la configuracion para usarla en index.js
module.exports = {
  MONGO_URI,
  PORT,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
};
