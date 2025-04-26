import mongoose from 'mongoose';

import RepositoryBase from '../RepositoryBase';
import PricingMongoose from './models/PricingMongoose';

class PricingRepository extends RepositoryBase {
  async findAll(...args: any) {
    // TODO: Implement method
    return [];
  }

  async findById(id: string, ...args: any[]): Promise<any> {
    const pricing = await PricingMongoose.findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!pricing) {
      return null;
    }

    return pricing.toJSON();
  }

  async create(data: any[], ...args: any) {
    return await PricingMongoose.insertMany(data);
  }

  async update(id: string, data: any, ...args: any) {
    const pricing = await PricingMongoose.findOne({ _id: id });
    if (!pricing) {
      return null;
    }

    pricing.set(data);
    await pricing.save();

    return pricing.toJSON();
  }

  async destroy(id: string, ...args: any) {
    const result = await PricingMongoose.deleteOne({ _id: id });
    return result?.deletedCount === 1;
  }
}

export default PricingRepository;
