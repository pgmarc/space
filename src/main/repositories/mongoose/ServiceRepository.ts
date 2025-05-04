import mongoose from 'mongoose';

import RepositoryBase from '../RepositoryBase';
import PricingMongoose from './models/PricingMongoose';
import ServiceMongoose from './models/ServiceMongoose';

export type ServiceQueryFilters = {
  name?: string;
  page?: number;
  offset?: number;
  limit?: number;
  order?: 'asc' | 'desc';
}

class ServiceRepository extends RepositoryBase {
  async findAll(queryFilters?: ServiceQueryFilters) {
    const { name, page = 1, offset = 0, limit = 20, order = 'asc' } = queryFilters || {};
    
    const services = await ServiceMongoose.find({
      ...(name ? { name: { $regex: name, $options: 'i' } } : {}),
    })
      .skip(offset == 0 ? (page - 1) * limit : offset)
      .limit(limit)
      .sort({ name: order === 'asc' ? 1 : -1 })
    
    return services.map((service) => service.toJSON());
  }

  async findByName(name: string): Promise<any> {
    const service = await ServiceMongoose.findOne({ name: { $regex: name, $options: 'i' }  });
    if (!service) {
      return null;
    }

    return service.toJSON();
  }

  async findPricingsByServiceId(serviceId: string, versionsToRetrieve: string[]) {
    console.log({ _serviceId: serviceId, version: { $in: versionsToRetrieve } })
    const pricings = await PricingMongoose.find({ _serviceId: serviceId, version: { $in: versionsToRetrieve } });
    if (!pricings || Array.isArray(pricings) && pricings.length === 0) {
      return null;
    }

    return pricings.map((p) => p.toJSON());
  }

  async create(data: any, ...args: any) {
    return await ServiceMongoose.insertOne(data);
  }

  async update(id: string, data: any, ...args: any) {
    const service = await ServiceMongoose.findOne({ _id: id });
    if (!service) {
      return null;
    }

    service.set(data);
    await service.save();

    return service.toJSON();
  }

  async destroy(id: string, ...args: any) {
    const result = await ServiceMongoose.deleteOne({ _id: id });
    if (!result) {
      return null;
    }
    if (result.deletedCount === 0) {
      return null;
    }
  
    if (result.deletedCount === 1) {
      await PricingMongoose.deleteMany({ _serviceId: new mongoose.Types.ObjectId(id) });
    }

    return true;
  }

  async prune() {
    const result = await ServiceMongoose.deleteMany({});

    if (result.deletedCount === 0) {
      return null;
    }

    return result.deletedCount;
  }
}

export default ServiceRepository;
