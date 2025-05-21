// filepath: /Users/alex/Desktop/Doctorado/space-api/src/test/utils/users/userTestUtils.ts
import request from 'supertest';
import { baseUrl } from '../testApp';
import { Server } from 'http';
import UserMongoose from '../../../main/repositories/mongoose/models/UserMongoose';
import { Role, USER_ROLES } from '../../../main/types/models/User';

// Crear un usuario de prueba directamente en la base de datos
export const createTestUser = async (role: Role = USER_ROLES[USER_ROLES.length - 1]): Promise<any> => {
  const userData = {
    username: `test_user_${Date.now()}`,
    password: 'password123',
    role
  };

  // Crear usuario directamente en la base de datos
  const user = new UserMongoose(userData);
  await user.save();
  
  return user.toObject();
};

// Generar una nueva API Key para un usuario
export const regenerateApiKey = async (app: Server, userId: string, apiKey: string): Promise<string> => {
  const response = await request(app)
    .post(`${baseUrl}/users/${userId}/api-key`)
    .set('x-api-key', apiKey);
  
  return response.body.apiKey;
};

// Cambiar el rol de un usuario
export const changeUserRole = async (app: Server, userId: string, newRole: Role, apiKey: string): Promise<any> => {
  const response = await request(app)
    .put(`${baseUrl}/users/${userId}/role`)
    .set('x-api-key', apiKey)
    .send({ role: newRole });
  
  return response.body;
};

// Eliminar un usuario de prueba directamente de la base de datos
export const deleteTestUser = async (userId: string): Promise<void> => {
  await UserMongoose.deleteOne({ username: userId });
};
