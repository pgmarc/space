import UserMongoose from '../../../repositories/mongoose/models/UserMongoose';

/**
 * Crea un usuario administrador por defecto si no existe
 */
export const seedDefaultAdmin = async () => {
  try {
    // Comprobar si ya existe un admin
    const existingAdmin = await UserMongoose.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      console.log('Ya existe un usuario administrador, omitiendo inicialización');
      return;
    }

    const adminUsername = process.env.ADMIN_USER ?? 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'space4all';

    // Crear usuario administrador por defecto
    const admin = new UserMongoose({
      username: adminUsername,
      password: adminPassword, // Se encriptará automáticamente por el hook pre-save
      role: 'ADMIN'
    });

    // Guardar admin
    await admin.save();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Usuario administrador creado con éxito:');
      console.log(`Username: ${adminUsername}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`API Key: ${admin.apiKey}`);
    }
    
    return admin;
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
    throw error;
  }
};
