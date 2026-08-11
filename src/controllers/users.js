const usersRouter = require("express").Router();
// aquí importo el método Router de express para crear un nuevo enrutador modular
const User = require("../models/user.js");
// aquí importo el modelo de usuario de mongoose para interactuar con la colección de usuarios en la base de datos
const bcrypt = require("bcryptjs");
// aquí importo la librería bcryptjs para encriptar y comparar contraseñas de forma segura
const jwt = require("jsonwebtoken");
// aquí importo jsonwebtoken para generar y verificar tokens de autenticación
const axios = require("axios");
// aquí importo axios para realizar peticiones http a servicios externos como hunter.io y emailjs

usersRouter.post("/", async (req, res) => {
// aquí defino una ruta post en la raíz para manejar el registro de nuevos usuarios de forma asíncrona
  try {
  // aquí abro un bloque try para capturar cualquier error durante el proceso de registro
    const { username, email, password } = req.body;
    // aquí extraigo el nombre de usuario, el correo y la contraseña desde el cuerpo de la petición http

    if (!username || !email || !password) {
    // aquí compruebo si falta alguno de los campos obligatorios para el registro
      return res
      // aquí indico que voy a retornar una respuesta de error si faltan datos
        .status(400)
        // aquí configuro el código de estado http en 400 por solicitud incorrecta
        .json({ error: "Todos los campos son obligatorios." });
        // aquí envío un objeto json con el mensaje indicando que todos los campos son obligatorios
    }

    const existingUser = await User.findOne({
    // aquí busco en la base de datos si ya existe un usuario registrado con el mismo correo o nombre de usuario
    //existingUser es una variable que almacena el resultado de la búsqueda en la base de datos. Si encuentra un usuario con el mismo correo o nombre de usuario, existingUser contendrá ese documento; si no encuentra ninguno, será null.
      $or: [{ email: email.toLowerCase() }, { username }],
      // aquí utilizo un operador lógico o para buscar coincidencia en minúsculas del correo o en el nombre de usuario
      //$or es un operador lógico de MongoDB que permite combinar múltiples condiciones de búsqueda. En este caso, se utiliza para verificar si existe un usuario con el mismo correo electrónico (convertido a minúsculas) o con el mismo nombre de usuario. Si cualquiera de estas condiciones se cumple, la consulta devolverá ese usuario existente.
    });

    if (existingUser) {
    // aquí evalúo si la consulta encontró un usuario previamente registrado
      if (existingUser.email === email.toLowerCase()) {
      // aquí compruebo si la coincidencia exacta corresponde al correo electrónico
      //toLowerCase() es un método de JavaScript que convierte una cadena de texto a minúsculas. En este caso, se utiliza para asegurar que la comparación del correo electrónico sea insensible a mayúsculas y minúsculas, evitando que se registren correos duplicados con diferente capitalización.
        return res
        // aquí preparo la respuesta de error si el correo ya está registrado
          .status(400)
          // aquí asigno el estado http 400
          .json({ error: "El correo electrónico ya está registrado." });
          // aquí envío el mensaje json de correo duplicado
      }
      return res
      // aquí preparo la respuesta alternativa si el nombre de usuario ya está ocupado
        .status(400)
        // aquí asigno el estado http 400
        .json({ error: "El nombre de usuario ya está en uso." });
        // aquí envío el mensaje json de nombre de usuario en uso
    }

    if (process.env.HUNTER_API_KEY) {
    // aquí verifico si tengo configurada una llave de API para el servicio externo hunter.io
      try {
      // aquí abro un bloque try interno para la validación externa del correo
        const hunterUrl = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`;
        // aquí construyo la url de consulta para verificar el correo usando la api de hunter.io
        const hunterResponse = await axios.get(hunterUrl);
        // aquí realizo una petición get a la api de hunter.io para comprobar la validez del correo
        const result = hunterResponse.data?.data?.result;
        // aquí extraigo el resultado de la verificación devuelto por el servicio externo

        if (result === "undeliverable") {
        // aquí evalúo si el servicio determina que el correo no se puede entregar o no existe
          return res.status(400).json({
          // aquí devuelvo un estado 400 si el correo no pasa la validación de entrega
            error:
            // aquí especifico la clave del mensaje de error
              "Esta dirección de correo electrónico no existe o no se puede entregar.",
              // aquí indico el texto explicando que el correo no existe o no se puede entregar
          });
        }
      } catch (hunterError) {
      // aquí capturo cualquier fallo de conexión o error al consultar la api de hunter.io
        console.error(
        // aquí imprimo un registro de error en la consola del servidor
          "Hunter.io error (omitiendo verificación):",
          // aquí muestro una etiqueta aclaratoria de que se omite la verificación por fallo externo
          hunterError.message,
          // aquí imprimo el mensaje detallado del error de hunter.io
        );
      }
    }

    const saltRounds = 10;
    // aquí defino el número de rondas de sal para el algoritmo de encriptación de contraseñas
    const passwordHash = await bcrypt.hash(password, saltRounds);
    // aquí cifro la contraseña del usuario de manera segura usando bcrypt

    const newUser = new User({
    // aquí instancio un nuevo objeto de tipo User con los datos proporcionados
      username,
      // aquí asigno el nombre de usuario
      email: email.toLowerCase(),
      // aquí asigno el correo convertido en minúsculas
      passwordHash,
      // aquí asigno la contraseña ya encriptada
      verified: false,
      // aquí establezco el estado de verificación inicial como falso
    });

    const savedUser = await newUser.save();
    // aquí guardo el nuevo usuario en la base de datos de MongoDB
    const userId = savedUser._id.toString();
    // aquí extraigo el identificador único del usuario guardado y lo convierto a cadena de texto

    const token = jwt.sign(
    // aquí genero un token de seguridad con jsonwebtoken
      { id: savedUser._id, role: savedUser.role || "user" },
      // aquí incluyo el identificador y el rol de savedUser para evitar el error 500
      process.env.ACCESS_TOKEN_SECRET || "secreto_temporal",
      // aquí firmo el token usando la clave secreta del entorno o una por defecto
      //"secreto_temporal" es una cadena de texto que se utiliza como clave secreta para firmar y verificar tokens JWT. En un entorno de producción, esta clave debería ser una cadena larga y segura almacenada en variables de entorno, pero aquí se proporciona un valor por defecto para desarrollo o pruebas locales.
      { expiresIn: "1d" }
      // aquí configuro una expiración de un día para el token de registro
    );

    // aquí construimos el enlace de verificación para enviarlo por correo
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify.html?id=${userId}&token=${token}`;
    //frontendUrl es una variable de entorno que contiene la URL base del frontend de la aplicación. Si no está definida, se utiliza "http://localhost:5173" como valor por defecto para entornos de desarrollo local. Esta URL se combina con la ruta "/verify.html" y los parámetros de consulta "id" y "token" para crear un enlace completo que el usuario puede usar para verificar su cuenta.

    // aquí enviamos el correo electrónico utilizando la API de EmailJS desde el backend
    if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY) {
      try {
        await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
          service_id: process.env.EMAILJS_SERVICE_ID, // aquí utilizo la variable de entorno para el ID del servicio de EmailJS
          template_id: process.env.EMAILJS_TEMPLATE_ID, // aquí utilizo la variable de entorno para el ID de la plantilla de EmailJS
          user_id: process.env.EMAILJS_PUBLIC_KEY, // aquí utilizo la variable de entorno para la clave pública de EmailJS
          accessToken: process.env.EMAILJS_PRIVATE_KEY, // aquí utilizo la variable de entorno para la clave privada de EmailJS
          template_params: { // aquí paso los parámetros que se usarán en la plantilla de correo electrónico
            to_email: savedUser.email, // aquí asigno el correo electrónico del usuario guardado para enviarle el mensaje
            to_name: savedUser.username, // aquí asigno el nombre de usuario del usuario guardado para personalizar el mensaje
            verification_url: verificationUrl, // aquí incluyo el enlace de verificación generado para que el usuario pueda verificar su cuenta
          },
        });
      } catch (emailError) {
        console.error("Error al enviar correo con EmailJS:", emailError.response?.data || emailError.message);
      }
    }

    return res.status(201).json({
    // aquí respondo con un código http 201 de recurso creado exitosamente
      message: "Usuario creado exitosamente. Por favor, revisa tu correo para verificar tu cuenta.",
      // aquí envío un mensaje confirmando el éxito del registro
      user: {
      // aquí estructuro un objeto con los datos públicos del usuario
        id: userId,
        // aquí incluyo el identificador del usuario
        username: savedUser.username,
        // aquí incluyo el nombre de usuario guardado
        email: savedUser.email,
        // aquí incluyo el correo electrónico del usuario
        role: savedUser.role || "user",
        // aquí incluyo el rol del usuario asignando "user" por defecto si no existe
      },
      token,
      // aquí adjunto el token generado en la respuesta
    });
  } catch (error) {
  // aquí abro el bloque catch general para capturar cualquier error inesperado en el servidor
    console.error("Backend Error Global:", error);
    // aquí imprimo el error global en la consola del servidor
    if (error.code === 11000) {
    // aquí compruebo si el error corresponde a una clave duplicada en la base de datos de MongoDB
      return res.status(400).json({
      // aquí devuelvo un estado 400 por datos duplicados
        error: "El nombre de usuario o el correo ya están registrados.",
        // aquí envío un mensaje indicando que el usuario o correo ya existen
      });
    }
    return res
    // aquí preparo la respuesta de error genérico del servidor
      .status(500)
      // aquí asigno el código de estado 500 de error interno
      .json({ error: "Ocurrió un error inesperado en el servidor." });
      // aquí envío el mensaje json de error inesperado
  }
});

usersRouter.post("/login", async (req, res) => {
// aquí defino una ruta post para el inicio de sesión de usuarios de forma asíncrona
  try {
  // aquí abro un bloque try para manejar posibles errores en el proceso de login
    const { email, password } = req.body;
    // aquí extraigo el correo y la contraseña enviados desde el cuerpo de la petición

    if (!email || !password) {
    // aquí verifico si falta alguno de los campos necesarios para iniciar sesión
      return res
      // aquí preparo la respuesta de error por campos faltantes
        .status(400)
        // aquí asigno el estado http 400
        .json({ error: "El correo y la contraseña son obligatorios." });
        // aquí envío el mensaje indicando que ambos datos son obligatorios
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // aquí busco al usuario en la base de datos utilizando su correo electrónico en minúsculas

    const passwordCorrect =
    // aquí declaro una constante para almacenar el resultado de la validación de la contraseña
      user === null
      // aquí evalúo si el usuario no fue encontrado en la base de datos
        ? false
        // aquí asigno falso si el usuario es nulo
        : await bcrypt.compare(password, user.passwordHash);
        // aquí comparo la contraseña ingresada con el hash almacenado usando bcrypt si el usuario existe

    if (!(user && passwordCorrect)) {
    // aquí evalúo si el usuario no existe o la contraseña es incorrecta
      return res
      // aquí preparo la respuesta de error de autenticación
        .status(401)
        // aquí configuro el código de estado 401 de no autorizado
        .json({ error: "Usuario o contraseña incorrectos." });
        // aquí envío un mensaje informando que los datos son incorrectos
    }

    if (!user.verified) {
    // aquí compruebo si el usuario aún no ha verificado su cuenta de correo electrónico
      return res.status(403).json({
      // aquí devuelvo un estado 403 de prohibido si la cuenta no está verificada
        error:
        // aquí indico la clave del error de verificación pendiente
          "Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico.",
          // aquí envío el mensaje pidiendo que revise su correo para verificar la cuenta
      });
    }

    const userForToken = {
    // aquí construyo un objeto con los datos esenciales del usuario para incluir en el token
      username: user.username,
      // aquí incluyo el nombre de usuario
      id: user._id,
      // aquí incluyo el identificador único del usuario
      role: user.role || "user",
      // aquí incluyo el rol del usuario asignando un valor predeterminado si no existe
    };

    const token = jwt.sign(
    // aquí firmo un nuevo token de sesión con jsonwebtoken
      userForToken,
      // aquí paso el objeto con la información del usuario
      process.env.ACCESS_TOKEN_SECRET || "secreto_temporal",
      // aquí utilizo la clave secreta del entorno o una clave temporal de respaldo
      { expiresIn: "7d" },
      // aquí configuro una duración de siete días para el token de sesión
    );

    return res.status(200).send({
    // aquí envío una respuesta exitosa con código 200 conteniendo los datos de sesión
      token,
      // aquí incluyo el token jwt generado
      username: user.username,
      // aquí incluyo el nombre de usuario
      email: user.email,
      // aquí incluyo el correo electrónico del usuario
      role: user.role || "user",
      // aquí incluyo el rol del usuario
      id: user._id,
      // aquí incluyo el id único del usuario
    });
  } catch (error) {
  // aquí abro el bloque catch para capturar errores imprevistos durante el login
    console.error("Error en login:", error);
    // aquí imprimo el error de inicio de sesión en la consola del servidor
    return res
    // aquí preparo la respuesta de error genérico del servidor
      .status(500)
      // aquí configuro el código de estado 500
      .json({ error: "Ocurrió un error inesperado al iniciar sesión." });
      // aquí envío el mensaje json de error interno
  }
});

usersRouter.patch("/:id/:token", async (req, res) => {
// aquí defino una ruta patch para verificar cuentas mediante un identificador y un token de correo de forma asíncrona
  try {
  // aquí abro un bloque try para manejar el proceso de verificación de correo
    const { token, id } = req.params;
    // aquí extraigo el token y el id de los parámetros de la url

    const verifiedToken = jwt.verify(
    // aquí valido la autenticidad y la firma del token recibido en la url
      token,
      // aquí paso el token a verificar
      process.env.ACCESS_TOKEN_SECRET || "secreto_temporal",
      // aquí utilizo la clave secreta del entorno o una temporal
    );

    const user = await User.findById(verifiedToken.id || id);
    // aquí busco al usuario en la base de datos usando el id decodificado del token o el id provisto en los parámetros

    if (!user) {
    // aquí compruebo si el usuario no existe en la base de datos
      return res
      // aquí preparo la respuesta si el usuario no es encontrado
        .status(404)
        // aquí asigno el estado http 404 de no encontrado
        .json({ error: "El usuario asociado con este enlace ya no existe." });
        // aquí envío el mensaje indicando que el usuario ya no existe
    }

    if (user.verified) {
    // aquí evalúo si la cuenta del usuario ya se encontraba verificada previamente
      return res
      // aquí preparo la respuesta para cuentas ya verificadas
        .status(400)
        // aquí asigno el estado http 400
        .json({ error: "Esta cuenta ya ha sido verificada previamente." });
        // aquí envío un mensaje indicando que la cuenta ya estaba verificada
    }

    user.verified = true;
    // aquí cambio la propiedad verified del usuario a verdadero
    await user.save();
    // aquí guardo los cambios del usuario actualizado en la base de datos

    return res.status(200).json({ message: "Cuenta verificada con éxito." });
    // aquí devuelvo una respuesta exitosa con estado 200 confirmando que la cuenta fue verificada
  } catch (error) {
  // aquí abro el bloque catch para capturar errores durante la verificación del token
    console.error("Error al verificar el token:", error.message);
    // aquí imprimo el mensaje de error de verificación en la consola

    if (error.name === "TokenExpiredError") {
    // aquí verifico si el error específico se debe a que el token ha expirado
      return res.status(400).json({
      // aquí devuelvo un estado 400 por expiración del enlace
        error:
        // aquí indico la clave del error de expiración
          "El enlace de verificación ha expirado. Por favor, solicita uno nuevo.",
          // aquí envío el mensaje explicando que el enlace expiró y debe solicitarse otro
      });
    }

    return res.status(400).json({
    // aquí devuelvo una respuesta de error genérica para el enlace de verificación
      error: "El enlace de verificación es inválido o está corrupto.",
      // aquí envío el mensaje indicando que el enlace es inválido o corrupto
    });
  }
});

module.exports = usersRouter;
// aquí exporto el enrutador configurado para poder utilizarlo en la aplicación principal del servidor