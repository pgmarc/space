import { LeanFeature } from '../../types/models/FeatureEvaluation';
import RepositoryBase from '../RepositoryBase';
import ServiceMongoose from './models/ServiceMongoose';

class FeatureRepository extends RepositoryBase {
  async findAll(queryFilters?: any): Promise<LeanFeature[]> {
    const {page = 1, offset = 0, limit = 20, sort = 'serviceName', order = 'asc', show = 'active' } = queryFilters || {};
    
    

    return []
  }
}

export default FeatureRepository;
