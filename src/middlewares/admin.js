const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No se proporcionó un token." });
    }

    try {
        // Usamos la misma clave secreta que en el login
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "secreto_temporal");
        req.user = verified; 
        next();
    } catch (error) {
        return res.status(403).json({ error: "Token no válido o expirado." });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            error: "Acceso denegado. No tienes permisos de administrador."
        });
    }
};

module.exports = {
    verifyToken,
    verifyAdmin
};