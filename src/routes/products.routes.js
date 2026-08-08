const { Router } = require('express');
// aquí importo el módulo Router desde express para poder definir las rutas de mi servidor
const multer = require('multer');
// aquí importo el módulo multer para gestionar la subida y almacenamiento de archivos multimedia como imágenes
const { verifyToken, verifyAdmin } = require('../middlewares/admin.js');
// aquí importo mis middlewares de autenticación y verificación de rol de administrador para proteger las rutas privadas
const productController = require('../controllers/products.js');
// aquí importo el controlador de productos que contiene toda la lógica de negocio para las peticiones

const router = Router();
// aquí instancio un nuevo enrutador de express para registrar todas las rutas relacionadas con los productos

const upload = multer({ dest: 'public/uploads/' });
// aquí inicializo multer asignándole la carpeta pública de subidas para procesar y guardar los archivos de imagen

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