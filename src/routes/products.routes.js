const { Router } = require('express');
const multer = require('multer');
const { verifyToken, verifyAdmin } = require('../middlewares/admin.js');
const productController = require('../controllers/products.js');

const router = Router();

// Configuración directa de multer para guardar las imágenes
const upload = multer({ dest: 'public/uploads/' });

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', verifyToken, verifyAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, verifyAdmin, productController.deleteProduct);

module.exports = router;