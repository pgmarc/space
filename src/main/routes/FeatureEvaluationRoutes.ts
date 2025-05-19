import express from 'express';

import FeatureEvaluationController from '../controllers/FeatureEvaluationController';

const loadFileRoutes = function (app: express.Application) {
  const featureEvaluationController = new FeatureEvaluationController();

  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/features')
    .get(featureEvaluationController.index)

  app
    .route(baseUrl + '/features/:userId')
    .post(featureEvaluationController.eval)

  app
    .route(baseUrl + '/features/:userId/pricing-token')
    .post(featureEvaluationController.generatePricingToken)
};

export default loadFileRoutes;
