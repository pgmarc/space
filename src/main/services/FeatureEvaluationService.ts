import container from '../config/container';
import FeatureRepository from '../repositories/mongoose/FeatureEvaluationRepository';
import { FeatureIndexQueryParams, LeanFeature } from '../types/models/FeatureEvaluation';

class FeatureEvaluationService {
  private readonly featureEvaluationRepository: FeatureRepository;

  constructor() {
    this.featureEvaluationRepository = container.resolve('featureEvaluationRepository');
  }

  async index(queryParams: FeatureIndexQueryParams): Promise<LeanFeature[]> {
    
    
    
    
    const features = await this.featureEvaluationRepository.findAll(queryParams);
    return features;
  }
}

export default FeatureEvaluationService;
