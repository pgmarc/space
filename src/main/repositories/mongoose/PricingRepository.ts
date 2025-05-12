import RepositoryBase from '../RepositoryBase';
import PricingMongoose from './models/PricingMongoose';
import { Pricing } from '../../../types/models/Pricing';
import { toPlainObject } from '../../utils/mongoose';

class PricingRepository extends RepositoryBase {
  async findById(id: string): Promise<any> {
    const pricing = await PricingMongoose.findById(id);
    if (!pricing) {
      return null;
    }
    return pricing.toJSON();
  }

  async create(data: any): Promise<Pricing | null> {
    const pricing = await PricingMongoose.create(data);
    if (!pricing) {
      return null;
    }
    return toPlainObject<Pricing>(pricing.toObject());
  }

  async addServiceNameToPricing(pricingId: string, serviceName: string): Promise<any> {
    const pricing = await PricingMongoose.updateOne(
      { _id: pricingId },
      { $set: { _serviceName: serviceName } }
    );

    if (!pricing) {
      return null;
    }

    return true;
  }
}

export default PricingRepository;
