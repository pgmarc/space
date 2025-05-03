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
}

export default PricingRepository;
