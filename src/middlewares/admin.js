const jwt = require('jsonwebtoken');
// aquí importo el módulo jsonwebtoken para gestionar la verificación de los tokens de acceso

const verifyToken = (req, res, next) => {
// aquí declaro una función middleware llamada verifytoken que recibe las peticiones, respuestas y la función next
    const authHeader = req.headers['authorization'];
    // aquí extraigo la cabecera de autorización de la petición http entrante
    const token = authHeader && authHeader.split(' ')[1];
    // aquí extraigo únicamente el código del token separándolo de la palabra bearer usando un operador lógico

    if (!token) {
    // aquí evalúo si el token no viene presente en la petición
        return res.status(401).json({ error: "Acceso denegado. No se proporcionó un token." });
        // aquí detengo la ejecución y devuelvo un código de estado 401 indicando que falta el token de acceso
    }

    try {
    // aquí abro un bloque try para intentar verificar el token de manera segura
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "secreto_temporal");
        // aquí valido el token usando la clave secreta de las variables de entorno o un respaldo por defecto
        req.user = verified; 
        // aquí adjunto la información decodificada del usuario dentro del objeto req para tenerla disponible en la siguiente ruta
        next();
        // aquí invoco la función next para dejar continuar el flujo hacia el controlador o ruta protegida
    } catch (error) {
    // aquí capturo cualquier error que ocurra si el token es falso o ya ha expirado
        return res.status(403).json({ error: "Token no válido o expirado." });
        // aquí devuelvo una respuesta con código 403 informando que la validación del token falló
    }
};

const verifyAdmin = (req, res, next) => {
// aquí declaro un segundo middleware llamado verifyadmin para validar si el usuario posee privilegios administrativos
    if (req.user && req.user.role === 'admin') {
    // aquí compruebo si el objeto de usuario existe y si su rol es estrictamente de administrador
        next();
        // aquí permito que continúe la ejecución llamando a next si el usuario es administrador
    } else {
    // aquí manejo el flujo alternativo cuando el usuario no cumple con el requisito de administrador
        return res.status(403).json({
        // aquí devuelvo un estado 403 bloqueando el acceso por falta de permisos
            error: "Acceso denegado. No tienes permisos de administrador."
            // aquí envío un mensaje de error explicando que no se poseen privilegios de admin
        });
    }
};

module.exports = {
// aquí abro el objeto para empaquetar y exportar mis funciones middleware
    verifyToken,
    // aquí exporto la función verifytoken para usarla en la protección de rutas generales
    verifyAdmin
    // aquí exporto la función verifyadmin para proteger rutas exclusivas de administración
};