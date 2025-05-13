import RepositoryBase from '../RepositoryBase';
import ContractMongoose from './models/ContractMongoose';
import { LeanContract } from '../../types/models/Contract';
import { toPlainObject } from '../../utils/mongoose';

export type ServiceQueryFilters = {
  name?: string;
  page?: number;
  offset?: number;
  limit?: number;
  order?: 'asc' | 'desc';
}

class ContractRepository extends RepositoryBase {
  async findAll(queryFilters?: ServiceQueryFilters) {
    const { name, page = 1, offset = 0, limit = 20, order = 'asc' } = queryFilters || {};
    
    const services = await ContractMongoose.find({
      ...(name ? { name: { $regex: name, $options: 'i' } } : {}),
    })
      .skip(offset == 0 ? (page - 1) * limit : offset)
      .limit(limit)
      .sort({ name: order === 'asc' ? 1 : -1 });
    
    return services.map((service) => toPlainObject<LeanContract>(service.toJSON()));
  }
}

export default ContractRepository;
