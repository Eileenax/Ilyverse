const express = require("express"); // express para crear y gestionar el servidor web
const path = require("path"); //  path para unir rutas de carpetas de forma segura
const cors = require("cors"); //  cors para permitir la comunicacion entre frontend y backend

const app = express(); // inicializamos la aplicacion de expres

app.use(express.json()); // middleware para que el servidor entienda datos en formato json
app.use(cors()); // middleware para habilitar los permisos de cors

// servimos las vistas estaticas (html, css, js) en sus respectivas rutas
app.use("/", express.static(path.join(__dirname, "src", "views", "home")));
app.use('/multimedia', express.static(path.join(__dirname, 'multimedia')));
app.use(
  "/login",
  express.static(path.join(__dirname, "src", "views", "login")),
);
app.use(
  "/signup",
  express.static(path.join(__dirname, "src", "views", "signup")),
);
app.use(
  "/verify",
  express.static(path.join(__dirname, "src", "views", "verify")),
);
app.use(
  "/components",
  express.static(path.join(__dirname, "src", "views", "components")),
);

// exportamos la app para levantarla en index.js
module.exports = app;
