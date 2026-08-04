const usersRouter = require("express").Router();
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// REGISTRO DE USUARIO Y GENERACIÓN DE TOKEN
usersRouter.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validar campos obligatorios
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    // 2. Comprobar si el correo o el nombre de usuario ya existen en MongoDB
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado." });
      }
      return res
        .status(400)
        .json({ error: "El nombre de usuario ya está en uso." });
    }

    // 3. Validar la existencia real del correo con Hunter.io (Si la API Key está configurada)
    if (process.env.HUNTER_API_KEY) {
      try {
        const hunterUrl = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`;
        const hunterResponse = await axios.get(hunterUrl);
        const result = hunterResponse.data?.data?.result;

        if (result === "undeliverable") {
          return res.status(400).json({
            error:
              "Esta dirección de correo electrónico no existe o no se puede entregar.",
          });
        }
      } catch (hunterError) {
        console.error(
          "Hunter.io error (omitiendo verificación):",
          hunterError.message,
        );
      }
    }

    // 4. Encriptar contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 5. Crear y guardar nuevo usuario
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      passwordHash,
      verified: false,
    });

    const savedUser = await newUser.save();
    const userId = savedUser._id.toString();

    // 6. Generar token de verificación (expira en 1 día)
    const token = jwt.sign(
      { id: userId },
      process.env.ACCESS_TOKEN_SECRET || "secreto_temporal",
      { expiresIn: "1d" },
    );

    // 7. Respuesta exitosa para el Frontend
    return res.status(201).json({
      message: "Usuario creado exitosamente.",
      user: {
        id: userId,
        username: savedUser.username,
        email: savedUser.email,
      },
      token,
    });
  } catch (error) {
    console.error("Backend Error Global:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: "El nombre de usuario o el correo ya están registrados.",
      });
    }
    return res
      .status(500)
      .json({ error: "Ocurrió un error inesperado en el servidor." });
  }
});

// INICIO DE SESIÓN (LOGIN)
usersRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar que vengan los datos
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "El correo y la contraseña son obligatorios." });
    }

    // 2. Buscar al usuario en la base de datos
    const user = await User.findOne({ email: email.toLowerCase() });

    // 3. Comprobar si el usuario existe y verificar la contraseña
    const passwordCorrect =
      user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos." });
    }

    // 4. Verificar si la cuenta ya confirmó el correo electrónico
    if (!user.verified) {
      return res.status(403).json({
        error:
          "Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico.",
      });
    }

    // 5. Generar token de sesión JWT
    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(
      userForToken,
      process.env.ACCESS_TOKEN_SECRET || "secreto_temporal",
      { expiresIn: "7d" },
    );

    // 6. Responder con datos de usuario y token
    return res.status(200).send({
      token,
      username: user.username,
      email: user.email,
      id: user._id,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res
      .status(500)
      .json({ error: "Ocurrió un error inesperado al iniciar sesión." });
  }
});

// VERIFICACIÓN DEL TOKEN DE CORREO
usersRouter.patch("/:id/:token", async (req, res) => {
  try {
    const { token, id } = req.params;

    // Verificar firma del token
    const verifiedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "secreto_temporal",
    );

    // Buscar al usuario
    const user = await User.findById(verifiedToken.id || id);

    if (!user) {
      return res
        .status(404)
        .json({ error: "El usuario asociado con este enlace ya no existe." });
    }

    if (user.verified) {
      return res
        .status(400)
        .json({ error: "Esta cuenta ya ha sido verificada previamente." });
    }

    // Actualizar estado de verificación
    user.verified = true;
    await user.save();

    return res.status(200).json({ message: "Cuenta verificada con éxito." });
  } catch (error) {
    console.error("Error al verificar el token:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        error:
          "El enlace de verificación ha expirado. Por favor, solicita uno nuevo.",
      });
    }

    return res.status(400).json({
      error: "El enlace de verificación es inválido o está corrupto.",
    });
  }
});

module.exports = usersRouter;