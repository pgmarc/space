import { createTestUser, deleteTestUser } from './users/userTestUtils';
import { Server } from 'http';
import request from 'supertest';
import { baseUrl } from './testApp';

// Usuario administrador para pruebas
let testAdminUser: any = null;

/**
 * Obtiene un usuario administrador para usar en las pruebas.
 * Crea uno nuevo si no existe.
 */
export const getTestAdminUser = async (): Promise<any> => {
  if (!testAdminUser) {
    testAdminUser = await createTestUser('ADMIN');
  }
  return testAdminUser;
};

/**
 * Obtiene la API Key de un usuario administrador para usar en las pruebas.
 */
export const getTestAdminApiKey = async (): Promise<string> => {
  const admin = await getTestAdminUser();
  return admin.apiKey;
};

/**
 * Añade el header de API Key a una petición de supertest.
 * Útil para incluir en todas las peticiones de prueba.
 */
export const withApiKey = async (request: request.Test): Promise<request.Test> => {
  const apiKey = await getTestAdminApiKey();
  return request.set('x-api-key', apiKey);
};

/**
 * Realiza una petición GET con la API Key de administrador.
 */
export const authenticatedGet = async (app: Server, path: string): Promise<request.Response> => {
  const apiKey = await getTestAdminApiKey();
  return request(app)
    .get(path)
    .set('x-api-key', apiKey);
};

/**
 * Realiza una petición POST con la API Key de administrador.
 */
export const authenticatedPost = async (app: Server, path: string, body?: any): Promise<request.Response> => {
  const apiKey = await getTestAdminApiKey();
  const req = request(app)
    .post(path)
    .set('x-api-key', apiKey);
  
  if (body) {
    return req.send(body);
  }
  return req;
};

/**
 * Limpia los recursos de autenticación después de las pruebas.
 */
export const cleanupAuthResources = async (): Promise<void> => {
  if (testAdminUser?.username) {
    await deleteTestUser(testAdminUser.username);
    testAdminUser = null;
  }
};
