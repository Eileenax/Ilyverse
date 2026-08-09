const express = require("express");
// aquí importo el framework express para poder crear y gestionar el servidor web de mi aplicación
const path = require("path");
// aquí importo el módulo nativo path para unir y manejar rutas de carpetas de forma segura en el sistema operativo
const cors = require("cors");
// aquí importo el paquete cors para permitir la comunicación y el intercambio de datos entre el frontend y el backend
const usersRouter = require("./src/controllers/users");
// aquí importo el enrutador de usuarios encargado de gestionar las peticiones de registro y autenticación
const productsRouter = require("./src/routes/products.routes");
// aquí importo el enrutador de productos para enlazar y habilitar todas las rutas relacionadas con la tienda
const app = express();
// aquí inicializo la aplicación de express para arrancar la configuración de mi servidor web

app.use(express.json());
// aquí activo un middleware para que el servidor pueda entender y procesar datos entrantes en formato json
app.use(cors());
// aquí activo el middleware de cors para habilitar los permisos de acceso cruzado entre diferentes dominios

app.use("/api/users", usersRouter);
// aquí configuro la ruta base para las peticiones de usuarios vinculando su respectivo enrutador
app.use("/api/products", productsRouter);
// aquí configuro la ruta base para la tienda vinculando el enrutador de productos

app.use("/", express.static(path.join(__dirname, "src", "views", "home")));
// aquí configuro la ruta raíz para servir los archivos estáticos de la vista principal o home
app.use("/multimedia", express.static(path.join(__dirname, "multimedia")));
// aquí configuro una ruta para servir de forma pública todos los archivos multimedia guardados en el servidor
app.use(
  "/login",
  express.static(path.join(__dirname, "src", "views", "login")),
);
// aquí configuro la ruta de inicio de sesión para servir los archivos estáticos de su respectiva vista
app.use(
  "/signup",
  express.static(path.join(__dirname, "src", "views", "signup")),
);
// aquí configuro la ruta de registro para servir los archivos estáticos de su respectiva vista
app.use(
  "/verify",
  express.static(path.join(__dirname, "src", "views", "verify")),
);
// aquí configuro la ruta de verificación para servir los archivos estáticos correspondientes

app.use(
  "/store",
  express.static(path.join(__dirname, "src", "views", "store")),
);
// aquí configuro la ruta de la tienda para servir los archivos estáticos necesarios para su interfaz

app.get("/store", (req, res) => {
// aquí declaro una ruta get explícita para responder directamente con el archivo html principal de la tienda
  res.sendFile(path.join(__dirname, "src", "views", "store", "index.html"));
  // aquí ordeno enviar el archivo index html de la tienda como respuesta a la petición del navegador
});
// aquí cierro la función de la ruta get explícita de la tienda

app.use(
  "/community",
  express.static(path.join(__dirname, "src", "views", "community")),
);
// aquí configuro la ruta de la comunidad para servir los archivos estáticos de su respectiva vista

app.get("/community", (req, res) => {
// aquí declaro una ruta get explícita para responder directamente con el archivo html principal de la comunidad
  res.sendFile(path.join(__dirname, "src", "views", "community", "index.html"));
  // aquí ordeno enviar el archivo index html de la comunidad como respuesta a la petición del navegador
});
// aquí cierro la función de la ruta get explícita de la comunidad

app.use(
  "/components",
  express.static(path.join(__dirname, "src", "views", "components")),
);
// aquí configuro una ruta para servir de forma estática los componentes reutilizables como la barra de navegación o el pie de página
app.use("/uploads", express.static("public/uploads"));
// aquí configuro una carpeta pública para servir las imágenes y archivos subidos al servidor

module.exports = app;
// aquí exporto la configuración completa de la aplicación de express para poder levantarla e iniciarla desde el archivo principal index js