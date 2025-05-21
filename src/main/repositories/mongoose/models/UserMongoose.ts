// filepath: /Users/alex/Desktop/Doctorado/space-api/src/main/repositories/mongoose/models/UserMongoose.ts
import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';
import { generateApiKey, hashPassword } from '../../../utils/users/helpers';
import { Role, USER_ROLES } from '../../../types/models/User';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    minlength: 5,
    required: true,
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true // Only adds to the index if the field is present
  },
  role: {
    type: String,
    required: true,
    enum: USER_ROLES,
    default: USER_ROLES[USER_ROLES.length - 1]
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, resultObject, options) {
      delete resultObject._id;
      delete resultObject.__v;
      delete resultObject.password;
      return resultObject;
    }
  }
});

// Verify password method
userSchema.methods.verifyPassword = async function(password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre('save', async function(next) {
  const user = this;
  
  // Si la contraseña no ha cambiado, seguimos
  if (!user.isModified('password')) return next();

  try {
    user.password = await hashPassword(user.password);
    
    // Si no tiene API Key, la generamos
    if (!user.apiKey) {
      user.apiKey = generateApiKey();
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

export interface UserDocument extends Document {
  username: string;
  password: string;
  apiKey: string;
  role: Role;
  verifyPassword: (password: string) => Promise<boolean>;
}

const userModel = mongoose.model<UserDocument>('User', userSchema, 'users');

export default userModel;
