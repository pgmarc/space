import mongoose from 'mongoose';

import RepositoryBase from '../RepositoryBase';
import PricingMongoose from './models/PricingMongoose';
import ServiceMongoose from './models/ServiceMongoose';
import { Service } from '../../../types/models/Service';
import { toPlainObject } from '../../utils/mongoose';

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

  async findByName(name: string): Promise<Service | null> {
    const service = await ServiceMongoose.findOne({ name: { $regex: name, $options: 'i' }  });
    if (!service) {
      return null;
    }

    return toPlainObject<Service>(service.toJSON());
  }

  async findPricingsByServiceName(serviceName: string, versionsToRetrieve: string[]) {
    const pricings = await PricingMongoose.find({ _serviceName: { $regex: serviceName, $options: 'i' }, version: { $in: versionsToRetrieve } });
    if (!pricings || Array.isArray(pricings) && pricings.length === 0) {
      return null;
    }

    return pricings.map((p) => p.toJSON());
  }

  async create(data: any, ...args: any) {
    
    const service = await ServiceMongoose.insertOne(data)
    
    return toPlainObject<Service>(service.toJSON());
  }

  async update(name: string, data: any, ...args: any) {
    const service = await ServiceMongoose.findOne({ name: { $regex: name, $options: 'i' } });
    if (!service) {
      return null;
    }

    service.set(data);
    await service.save();

    return toPlainObject<Service>(service.toJSON());
  }

  async destroy(name: string, ...args: any) {
    const result = await ServiceMongoose.deleteOne({ name: { $regex: name, $options: 'i' } });
    
    if (!result) {
      return null;
    }
    if (result.deletedCount === 0) {
      return null;
    }
  
    if (result.deletedCount === 1) {
      await PricingMongoose.deleteMany({ _serviceName: name });
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
