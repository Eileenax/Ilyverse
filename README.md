# 🌌 ilyverse

¡Bienvenido al repositorio oficial de **ilyverse**! Una plataforma web Full Stack diseñada para integrar un sistema robusto de autenticación, gestión de usuarios, espacios de comunidad y una tienda virtual interactiva con un catálogo dinámico.

---

## 🚀 Secciones y Vistas del Proyecto

La aplicación está organizada bajo una arquitectura cliente-servidor limpia, sirviendo diferentes vistas estáticas optimizadas para cada sección del ecosistema:

* **Home (`/`):** Página de bienvenida y punto de entrada principal a la plataforma.
* **Autenticación (`/signup`, `/login`, `/verify`):** Módulo completo de registro de usuarios, inicio de sesión seguro y verificación de cuentas mediante tokens.
* **Tienda Virtual (`/store`):** Escaparate interactivo donde los usuarios pueden explorar el catálogo de productos organizados por categorías (Ropa, Gaming, Accesorios, Tazas) y gestionar sus compras.
* **Comunidad (`/community`):** Espacio interactivo de comunidad dentro de la plataforma.

---

## 🛠️ Tecnologías Utilizadas

* **Entorno y Servidor:** Node.js, Express
* **Base de Datos:** MongoDB, Mongoose
* **Seguridad y Autenticación:** JSON Web Tokens (JWT), Bcryptjs para el cifrado de credenciales
* **Gestión de Archivos Multimedia:** Multer (configurado para procesar y almacenar imágenes de forma segura conservando sus extensiones originales en la carpeta `public/uploads`)
* **Frontend:** HTML5, CSS3, JavaScript Vanilla estructurado por vistas modulares.

---

## 📦 API REST y CRUD de Productos (`/api/products`)

El sistema incluye una API RESTful completa para la administración del catálogo de la tienda. Las operaciones de escritura y modificación están protegidas mediante middlewares de autenticación y verificación de roles de administrador.

A continuación se detallan los endpoints disponibles para consumir y probar en herramientas de desarrollo como Insomnia o Postman:

### 1. Listar Productos

* **Método:** `GET`
* **Ruta:** `/api/products`
* **Acceso:** Público
* **Descripción:** Devuelve un arreglo JSON con todos los productos registrados en la base de datos y sus respectivas rutas de imagen.

### 2. Buscar Producto por ID

* **Método:** `GET`
* **Ruta:** `/api/products/:id`
* **Acceso:** Público
* **Descripción:** Obtiene los detalles específicos de un producto utilizando su identificador único de MongoDB.

### 3. Crear Producto

* **Método:** `POST`
* **Ruta:** `/api/products`
* **Acceso:** Protegido (Requiere cabecera `Authorization: Bearer <token>` de Administrador)
* **Body (`multipart/form-data`):**
* `name` (Texto): Nombre del artículo.
* `price` (Número): Valor del producto.
* `category` (Texto): Categoría correspondiente.
* `description` (Texto): Breve descripción.
* `image` (Archivo): Imagen del producto (procesada automáticamente por Multer).



### 4. Actualizar Producto

* **Método:** `PUT`
* **Ruta:** `/api/products/:id`
* **Acceso:** Protegido (Requiere Token de Administrador)
* **Body (`multipart/form-data`):** Permite modificar los datos del producto y actualizar opcionalmente el archivo de imagen.

### 5. Eliminar Producto

* **Método:** `DELETE`
* **Ruta:** `/api/products/:id`
* **Acceso:** Protegido (Requiere Token de Administrador)
* **Descripción:** Borra permanentemente el registro del producto de la base de datos.

---

## ⚙️ Guía de Instalación y Ejecución Local

1. Clona este repositorio en tu equipo:
```bash
git clone <url-del-repositorio>

```


2. Instala todas las dependencias necesarias:
```bash
npm install

```


3. Crea un archivo `.env` en la raíz del proyecto y configura tus variables de entorno (puerto del servidor, URI de conexión a MongoDB y claves secretas para los JWT).
4. Inicia el servidor en modo de desarrollo:
```bash
npm run dev

```
