import mongoose from 'mongoose';

import RepositoryBase from '../RepositoryBase';
import PricingMongoose from './models/PricingMongoose';

class PricingRepository extends RepositoryBase {
  async findById(id: string): Promise<any> {
    const pricing = await PricingMongoose.findById(id);
    if (!pricing) {
      return null;
    }
    return pricing.toJSON();
  }

  async create(data: any): Promise<any> {
    const pricing = await PricingMongoose.create(data);
    if (!pricing) {
      return null;
    }
    return pricing.toObject();
  }

  async addServiceIdToPricing(pricingId: string, serviceId: string): Promise<any> {
    const pricing = await PricingMongoose.updateOne(
      { _id: pricingId },
      { $set: { _serviceId: serviceId } }
    );

    if (!pricing) {
      return null;
    }

    return true;
  }
}

export default PricingRepository;
