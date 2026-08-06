import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { verifyAdmin } from '../middlewares/isAdmin.js';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/products.controller.js';

const router = Router();

// CUALQUIERA (público o usuario común) puede ver los productos
router.get('/', getProducts);

// SOLO ADMIN puede Crear, Editar o Eliminar
router.post('/', verifyToken, verifyAdmin, createProduct);
router.put('/:id', verifyToken, verifyAdmin, updateProduct);
router.delete('/:id', verifyToken, verifyAdmin, deleteProduct);

export default router;