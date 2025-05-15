import { LeanFeature } from '../../types/models/FeatureEvaluation';
import RepositoryBase from '../RepositoryBase';
import ServiceMongoose from './models/ServiceMongoose';

class FeatureRepository extends RepositoryBase {
  async findAll(queryFilters?: any): Promise<LeanFeature[]> {
    return []
  }
}

export default FeatureRepository;
