const mongoose = require('mongoose');
// aquí importo el módulo mongoose para modelar y conectar los datos con la base de datos de mongodb

// Definimos el modelo directamente aquí para evitar errores de rutas
const productSchema = new mongoose.Schema({
// aquí defino un nuevo esquema de datos para los productos especificando su estructura
  name: { type: String, required: true },
  // aquí configuro el campo nombre como un texto obligatorio
  price: { type: Number, required: true },
  // aquí configuro el campo precio como un número obligatorio
  category: { type: String, default: 'ITEM' },
  // aquí configuro el campo categoría como un texto con un valor predeterminado de item
  description: { type: String },
  // aquí configuro el campo descripción como un texto opcional
  image: { type: String }
  // aquí configuro el campo imagen como una ruta de texto opcional
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
// aquí compilo o recupero el modelo de producto usando mongoose para prevenir sobreescrituras en caliente
//basicamente si ya existe un modelo llamado Product, lo reutiliza; de lo contrario, crea uno nuevo con el esquema definido
exports.getProducts = async (req, res) => {
// aquí exporto una función asíncrona para obtener y listar todos los productos guardados con soporte para filtrar por categoría
  try {
  // aquí abro un bloque try para manejar posibles errores en la consulta general
    const { category } = req.query;
    // aquí extraigo el parámetro category de la url si es que el cliente lo envió

    let filtro = {};
    // aquí inicializo un objeto de filtro vacío para la consulta a la base de datos

    if (category) {
    // aquí verifico si se especificó una categoría en la petición http
      filtro.category = category;
      // aquí asigno la categoría al objeto de filtro para buscar solo los coincidentes
    }

    const products = await Product.find(filtro);
    // aquí consulto la base de datos buscando todos los productos o filtrando por categoría según corresponda
    res.json(products);
    // aquí devuelvo la lista resultante de productos en formato json
  } catch (error) {
  // aquí capturo cualquier fallo ocurrido al intentar buscar los productos
    res.status(500).json({ error: "Error al obtener los productos" });
    // aquí devuelvo una respuesta de error interno con estado 500
  }
};

exports.getProductById = async (req, res) => {
// aquí exporto una función asíncrona para buscar un producto específico mediante su identificador único
  try {
  // aquí abro un bloque try para manejar errores en la búsqueda por id
    const product = await Product.findById(req.params.id);
    // aquí busco el producto en la base de datos utilizando el parámetro id recibido en la url
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    // aquí devuelvo un estado 404 si el producto no existe en la base de datos
    res.json(product);
    // aquí envío el producto encontrado en formato json
  } catch (error) {
  // aquí capturo cualquier error durante la búsqueda del producto individual
    res.status(500).json({ error: "Error al buscar el producto" });
    // aquí respondo con un estado 500 por error interno del servidor
  }
};

exports.createProduct = async (req, res) => {
// aquí exporto una función asíncrona para registrar y crear un nuevo producto en el sistema
  try {
  // aquí abro un bloque try para manejar el proceso de creación y subida de archivos
    const { name, price, category, description } = req.body;
    // aquí extraigo los campos de texto del cuerpo de la petición http

    let imagePath = '';
    // aquí inicializo una variable vacía para almacenar la ruta de la imagen
    if (req.file) {
    // aquí verifico si el usuario adjuntó un archivo de imagen en la petición
      imagePath = `/uploads/${req.file.filename}`;
      // aquí construyo la ruta de acceso al archivo guardado por multer
      //Esta instrucción utiliza una plantilla de texto para generar la ruta relativa del archivo multimedia.
      //toma el nombre único que Multer le asignó a la imagen al subirla y lo concatena con la carpeta /uploads/. Esa ruta resultante es la que guardamos en MongoDB para que la aplicación pueda mostrar la imagen de forma dinámica en la tienda 
    }

    const newProduct = new Product({
    // aquí instancio un nuevo objeto de tipo Product con los datos extraídos
      name,
      // aquí asigno el nombre del producto
      price,
      // aquí asigno el precio del producto
      category,
      // aquí asigno la categoría del producto
      description,
      // aquí asigno la descripción del producto
      image: imagePath
      // aquí asigno la ruta final de la imagen procesada
    });

    const savedProduct = await newProduct.save();
    // aquí guardo el nuevo producto de manera permanente en la base de datos
    res.status(201).json(savedProduct);
    // aquí respondo con un código 201 de creado exitosamente enviando el objeto guardado
  } catch (error) {
  // aquí capturo cualquier error imprevisto durante el guardado del producto
    console.error(error);
    // aquí imprimo el error detallado en la consola del servidor
    res.status(500).json({ error: error.message });
    // aquí devuelvo una respuesta de error con estado 500 y el mensaje del fallo
  }
};

exports.updateProduct = async (req, res) => {
// aquí exporto una función asíncrona para actualizar los datos de un producto existente
  try {
  // aquí abro un bloque try para manejar errores durante la actualización
    const { name, price, category, description } = req.body;
    // aquí extraigo los campos actualizados desde el cuerpo de la petición
    const updateData = { name, price, category, description };
    // aquí agrupo los datos básicos en un objeto de actualización

    if (req.file) {
    // aquí compruebo si se envió una nueva imagen para actualizar en la petición
      updateData.image = `/uploads/${req.file.filename}`;
      // aquí actualizo la ruta de la imagen dentro del objeto de modificación si el archivo existe
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    // aquí busco el producto por id y lo actualizo devolviendo el documento ya modificado
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    // aquí devuelvo un estado 404 si el producto a actualizar no existe
    res.json(updated);
    // aquí envío el producto actualizado en formato json
  } catch (error) {
  // aquí capturo cualquier error surgido durante el proceso de actualización
    res.status(500).json({ error: "Error al actualizar el producto" });
    // aquí devuelvo un estado 500 de error en el servidor
  }
};

exports.deleteProduct = async (req, res) => {
// aquí exporto una función asíncrona para eliminar un producto específico de la base de datos
  try {
  // aquí abro un bloque try para controlar la operación de borrado
    const { id } = req.params;
    // aquí extraigo el identificador del producto desde los parámetros de la ruta
    const deleted = await Product.findByIdAndDelete(id);
    // aquí busco y elimino el producto de la base de datos utilizando su identificador
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
    // aquí devuelvo un estado 404 si el producto no se encuentra para ser eliminado
    res.json({ message: "Producto eliminado correctamente" });
    // aquí envío un mensaje de éxito confirmando la eliminación del producto
  } catch (error) {
  // aquí capturo cualquier fallo ocurrido al intentar eliminar el producto
    res.status(500).json({ error: "Error al eliminar el producto" });
    // aquí devuelvo una respuesta con estado 500 indicando un error interno
  }
};