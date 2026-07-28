const usersRouter = require("express").Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// registro del usuario y verificación de correo
usersRouter.post("/", async (req, res) => {
try {
    const { username, email, password } = req.body;

    //validar campos obligatorios
    if (!username || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // comprobar si el correo ya está registrado en MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
    return res.status(400).json({ error: "El correo electrónico ya está registrado." });
    }

    //  validar la existencia real del correo con Hunter.io
    try {
    const hunterUrl = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`;
    const hunterResponse = await axios.get(hunterUrl);
    const result = hunterResponse.data?.data?.result;

    if (result === "undeliverable") {
        return res.status(400).json({ 
        error: "Esta dirección de correo electrónico no existe o no se puede verificar." 
        });
    }
    } catch (hunterError) {
    console.error("Hunter.io error (omitiendo verificación):", hunterError.message);
      // si la API falla o se agotan los créditos, dejamos continuar el registro
    }

    // encriptar contraseña y guardar nuevo usuario
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
    username,
    email,
    passwordHash,
    verified: false
    });

    const savedUser = await newUser.save();

    // generar token de verificación (expira en 1 día)
    const token = jwt.sign(
    { id: savedUser.id }, 
    process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: "1d" }
    );

    // enviar la respuesta al frontend con los datos necesarios para EmailJS
    return res.status(201).json({
    message: "Usuario creado. Procediendo a enviar correo de verificación...",
    user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email
    },
    token
    });

} catch (error) {
    console.error("Backend Error Global:", error);
    if (error.code === 11000) {
    return res.status(400).json({ error: "El nombre de usuario o el correo electrónico ya están en uso." });
    }
    return res.status(500).json({ error: "Ocurrió un error inesperado en el servidor." });
}
});

// VERIFICACIÓN DEL TOKEN DE CORREO
usersRouter.patch("/:id/:token", async (req, res) => {
try {
    const { token, id } = req.params;

    // verificar si el token es válido
    const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // buscar al usuario
    const user = await User.findById(verifiedToken.id || id);

    if (!user) {
    return res.status(404).json({ error: "El usuario asociado con este enlace ya no existe." });
    }

    if (user.verified) {
    return res.status(400).json({ error: "Esta cuenta ya ha sido verificada previa a este momento." });
    }

    // actualizar estado a verificado
    user.verified = true;
    await user.save();

    return res.status(200).json({ message: "Cuenta verificada con éxito." });

} catch (error) {
    console.error("Error al verificar el token:", error.message);

    if (error.name === "TokenExpiredError") {
    return res.status(400).json({ 
        error: "El enlace de verificación ha expirado. Por favor, solicita un nuevo enlace desde el inicio de sesión." 
    });
    }

    return res.status(400).json({ error: "El enlace de verificación es inválido o corrupto." });
}
});

module.exports = usersRouter;