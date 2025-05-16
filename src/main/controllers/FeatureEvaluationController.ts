import container from '../config/container.js';
import { removeOptionalFieldsOfQueryParams } from '../utils/controllerUtils.js';
import FeatureEvaluationService from '../services/FeatureEvaluationService';
import { FeatureIndexQueryParams } from '../types/models/FeatureEvaluation.js';

class FeatureEvaluationController {
  private readonly featureEvaluationService: FeatureEvaluationService;

  constructor() {
    this.featureEvaluationService = container.resolve('featureEvaluationService');
    this.index = this.index.bind(this);
    this.eval = this.eval.bind(this);
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

  async eval(req: any, res: any) {
    try {
      const userId = req.params.userId;
      const featureEvaluation = await this.featureEvaluationService.eval(userId);
      res.json(featureEvaluation);
    } catch (err: any) {
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404).send({ error: err.message });
      }else {
        res.status(500).send({ error: err.message });
      }
    }
  }

  _transformIndexQueryParams(
    indexQueryParams: Record<string, string | number>
  ): FeatureIndexQueryParams {
    const transformedData: FeatureIndexQueryParams = {
      featureName: indexQueryParams['featureName'] as string,
      serviceName: indexQueryParams['serviceName'] as string,
      pricingVersion: indexQueryParams['pricingVersion'] as string,
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
