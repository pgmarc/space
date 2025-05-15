import container from '../config/container.js';
import { removeOptionalFieldsOfQueryParams } from '../utils/controllerUtils.js';
import FeatureEvaluationService from '../services/FeatureEvaluationService';
import { FeatureIndexQueryParams } from '../types/models/FeatureEvaluation.js';

class FeatureEvaluationController {
  private readonly featureEvaluationService: FeatureEvaluationService;

  constructor() {
    this.featureEvaluationService = container.resolve('featureEvaluationService');
    this.index = this.index.bind(this);
  }

  async index(req: any, res: any) {
    try {
      const queryParams: FeatureIndexQueryParams = this._transformIndexQueryParams(req.query);

      const features = await this.featureEvaluationService.index(queryParams);
      res.json(features);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  _transformIndexQueryParams(
    indexQueryParams: Record<string, string | number>
  ): FeatureIndexQueryParams {
    const transformedData: FeatureIndexQueryParams = {
      page: parseInt(indexQueryParams['page'] as string) || 1,
      offset: parseInt(indexQueryParams['offset'] as string) || 0,
      limit: parseInt(indexQueryParams['limit'] as string) || 20,
      sort: indexQueryParams.sort as 'featureName' | 'serviceName',
      order: (indexQueryParams.order as 'asc' | 'desc') || 'asc',
      show: indexQueryParams.show as 'active' | 'archived' | 'all',
    };

    const optionalFields: string[] = Object.keys(transformedData);

    removeOptionalFieldsOfQueryParams(transformedData, optionalFields);

    return transformedData;
  }
}

export default FeatureEvaluationController;
