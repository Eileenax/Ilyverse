require("dotenv").config();
// aquí cargo y configuro las variables de entorno protegidas desde el archivo .env para que la aplicación pueda leerlas de forma segura

const MONGO_URI = 
// aquí inicio una constante para seleccionar la dirección de la base de datos según el entorno de trabajo
  process.env.NODE_ENV === "test"
  // aquí compruebo si el entorno de ejecución actual corresponde al modo de pruebas
    ? process.env.MONGO_URI_TEST
    // si el entorno es de pruebas, selecciono y asigno la uri de la base de datos de test
    : process.env.MONGO_URI_PROD;
    // si el entorno no es de pruebas, selecciono y asigno la uri de la base de datos de producción

const PORT = process.env.PORT || 3000;
// aquí defino el puerto numérico donde operará el servidor tomando el valor del entorno o asignando el puerto tres mil por defecto

module.exports = {
// aquí exporto un objeto con las configuraciones esenciales para reutilizarlas en otros archivos del proyecto como index.js
  MONGO_URI,
  // aquí incluyo la ruta de conexión a la base de datos que fue seleccionada dinámicamente arriba
  PORT,
  // aquí incluyo el número del puerto en el que escuchará peticiones el servidor web
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  // aquí incluyo la clave secreta indispensable para cifrar y verificar los tokens de autenticación de los usuarios
};