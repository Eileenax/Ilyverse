const mongoose = require('mongoose');

// Definimos el modelo directamente aquí para evitar errores de rutas
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'ITEM' },
  description: { type: String },
  image: { type: String }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el producto" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newProduct = new Product({
      name,
      price,
      category,
      description,
      image: imagePath
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const updateData = { name, price, category, description };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};