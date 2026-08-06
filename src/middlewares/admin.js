export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Es admin, puede continuar
  } else {
    return res.status(403).json({ 
      error: "Acceso denegado. No tienes permisos de administrador." 
    });
  }
};