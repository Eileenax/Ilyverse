const mongoose = require("mongoose"); // Importamos Mongoose para interactuar con la base de datos MongoDB

// Definimos la estructura (esquema) que tendrán los documentos de usuario en la base de datos
const userSchema = new mongoose.Schema({
    username: String, // Nombre de usuario en la plataforma
    email: String,    // Correo electrónico único del usuario

    // Guardamos la contraseña procesada (hash/encriptada), NUNCA en texto plano
    passwordHash: String,

    // Estado de verificación de la cuenta (por ejemplo, confirmación por email)
    verified: {
        type: Boolean,
        default: false // Todo usuario nuevo inicia sin verificar por defecto
    },

    // Definición de roles y permisos del usuario en la aplicación
    role: {
        type: String,
        enum: ["user", "admin"], // Restringe el campo para aceptar únicamente estos dos valores
        default: "user"          // Asigna el rol "user" por defecto a cada registro nuevo
    }
});

// Configuración de la transformación a JSON cuando se envían respuestas al cliente/frontend
userSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        // Asignamos una propiedad 'id' limpia en formato String convirtiendo el ObjectId nativo
        returnedObject.id = returnedObject._id.toString();

        // Limpiamos la respuesta eliminando campos internos y sensibles
        delete returnedObject._id;          // Eliminamos la propiedad _id nativa
        delete returnedObject.__v;          // Eliminamos la versión interna del documento de Mongoose
        delete returnedObject.passwordHash; // NUNCA exponemos el hash de la contraseña al frontend
    }
});

// Creamos el modelo 'User' basado en la estructura definida en userSchema
const User = mongoose.model("User", userSchema);

// Exportamos el modelo para usarlo en los controladores de autenticación y rutas
module.exports = User;