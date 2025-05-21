import container from '../config/container';
import UserRepository from '../repositories/mongoose/UserRepository';
import { LeanUser, Role, USER_ROLES } from '../types/models/User';
import { hashPassword } from '../utils/users/helpers';

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = container.resolve('userRepository');
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async findByApiKey(apiKey: string) {
    const user = await this.userRepository.findByApiKey(apiKey);
    if (!user) {
      throw new Error('Invalid API Key');
    }
    return user;
  }

  async create(userData: any, creatorData: LeanUser) {
    
    const existingUser = await this.userRepository.findByUsername(userData.username);
    if (existingUser) {
      throw new Error('There is already a user with the username that you are trying to set');
    }
    
    // Stablish a default role if not provided
    if (!userData.role) {
      userData.role = USER_ROLES[USER_ROLES.length - 1];
    }

    if (creatorData.role !== 'ADMIN' && userData.role === 'ADMIN') {
      throw new Error('Not enough permissions: Only admins can create other admins.');
    }

    return this.userRepository.create(userData);
  }

  async update(username: string, userData: any) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    if (userData.username){
      const existingUser = await this.userRepository.findByUsername(userData.username);
      if (existingUser) {
        throw new Error('There is already a user with the username that you are trying to set');
      }
    }

    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }

    return await this.userRepository.update(username, userData);
  }

  async regenerateApiKey(username: string): Promise<string> {
    const newApiKey = await this.userRepository.regenerateApiKey(username);
    if (!newApiKey) {
      throw new Error('API Key could not be regenerated');
    }
    return newApiKey;
  }

  async changeRole(username: string, role: Role) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    return this.userRepository.changeRole(username, role);
  }

  async authenticate(username: string, password: string): Promise<string> {
    // Find user by username
    const userApiKey = await this.userRepository.authenticate(username, password);
    if (!userApiKey) {
      throw new Error('Invalid credentials');
    }

    return userApiKey;
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async destroy(username: string) {
    const result = await this.userRepository.destroy(username);
    if (!result) {
      throw new Error('User not found');
    }
    return true;
  }
}

export default UserService;
