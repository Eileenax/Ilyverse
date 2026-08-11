const mongoose = require("mongoose"); // Importamos Mongoose para interactuar con la base de datos MongoDB

// Definimos la estructura (esquema) que tendrán los documentos de usuario en la base de datos
const userSchema = new mongoose.Schema({
    username: String, // Nombre de usuario en la plataforma
    email: String,    // Correo electrónico único del usuario

    // Guardamos la contraseña procesada (hash/encriptada), NUNCA en texto plano
    passwordHash: String,

    // Estado de verificación de la cuenta (por ejemplo, confirmación por email)
    verified: {
        type: Boolean, //boolean para indicar si el usuario ha verificado su cuenta
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
userSchema.set("toJSON", { //.set("toJSON", {...}) es un método de Mongoose que permite definir cómo se transformará un documento de la base de datos a un objeto JSON cuando se envíe como respuesta al cliente. Esto es útil para ocultar información sensible y formatear los datos antes de enviarlos.
    transform: (document, returnedObject) => {
        // Asignamos una propiedad 'id' limpia en formato String convirtiendo el ObjectId nativo
        returnedObject.id = returnedObject._id.toString();
        //returnedObject.id contendrá el valor del ObjectId convertido a cadena de texto, lo que facilita su uso en el frontend y evita exponer la estructura interna de MongoDB.
        //y objectId es un tipo de dato especial que MongoDB utiliza para identificar de manera única cada documento en una colección. Al convertirlo a string, se hace más legible y manejable para el frontend.

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