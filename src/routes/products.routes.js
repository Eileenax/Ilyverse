const { Router } = require('express');
// aquí importo el módulo Router desde express para poder definir las rutas de mi servidor
const multer = require('multer');
// aquí importo el módulo multer para gestionar la subida y almacenamiento de archivos multimedia como imágenes
const path = require('path');
// aquí importo el módulo nativo path para manejar y unir rutas de archivos y extensiones de forma segura
const { verifyToken, verifyAdmin } = require('../middlewares/admin.js');
// aquí importo mis middlewares de autenticación y verificación de rol de administrador para proteger las rutas privadas
const productController = require('../controllers/products.js');
// aquí importo el controlador de productos que contiene toda la lógica de negocio para las peticiones

const router = Router();
// aquí instancio un nuevo enrutador de express para registrar todas las rutas relacionadas con los productos

const storage = multer.diskStorage({
// aquí configuro el almacenamiento de disco para multer con el fin de controlar la carpeta destino y el nombre del archivo
  destination: (req, file, cb) => {
    // aquí definimos la función para indicar la carpeta donde se guardarán físicamente los archivos subidos
    cb(null, 'public/uploads/');
    // aquí pasamos la ruta de la carpeta pública de subidas asegurando que no haya errores iniciales
  },
  filename: (req, file, cb) => {
    // aquí definimos la función para personalizar el nombre con el que se guardará el archivo en el servidor
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // aquí genero un sufijo único combinando la marca de tiempo actual y un número aleatorio para evitar duplicados
    cb(null, uniqueSuffix + path.extname(file.originalname));
    // aquí guardo el archivo combinando el sufijo único con su extensión original extraída de forma segura
  }
});
// aquí cierro la configuración del almacenamiento de multer

const upload = multer({ storage: storage });
// aquí inicializo multer pasándole la configuración de almacenamiento personalizada para conservar las extensiones de las imágenes

router.get('/', productController.getProducts);
// aquí defino una ruta get pública para obtener y listar todos los productos disponibles en la base de datos
router.get('/:id', productController.getProductById);
// aquí defino una ruta get dinámica que recibe un identificador por parámetro para buscar un producto específico
router.post('/', verifyToken, verifyAdmin, upload.single('image'), productController.createProduct);
// aquí defino una ruta post protegida donde primero valido el token y el rol de admin, luego proceso una sola imagen con multer y finalmente ejecuto el controlador para crear el producto
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), productController.updateProduct);
// aquí defino una ruta put protegida por token y admin para actualizar un producto existente gestionando opcionalmente una nueva imagen con multer
router.delete('/:id', verifyToken, verifyAdmin, productController.deleteProduct);
// aquí defino una ruta delete protegida donde solo un administrador autenticado puede eliminar un producto por su id

module.exports = router;
// aquí exporto mi enrutador configurado para poder utilizarlo e integrarlo en el archivo principal del servidor