import { Request, Response, NextFunction, Router } from 'express';
import { authenticateApiKey, hasPermission } from './AuthMiddleware';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/users/authenticate'
];

/**
 * Middleware que aplica autenticación y verificación de permisos a todas las rutas
 * excepto las que se especifican como públicas
 */
export const apiKeyAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const baseUrl = process.env.BASE_URL_PATH || '/api';
  
  // Verificar si la ruta actual es pública (no requiere autenticación)
  const path = req.path.replace(baseUrl, '');
  const isPublicRoute = PUBLIC_ROUTES.some(route => path.startsWith(route));
  
  if (isPublicRoute) {
    return next();
  }
  
  // Aplicar autenticación y verificación de permisos
  authenticateApiKey(req, res, (err?: any) => {
    if (err) return next(err);
    hasPermission(req, res, next);
  });
};
