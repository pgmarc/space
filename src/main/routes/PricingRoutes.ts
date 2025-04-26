import express from 'express';

import PricingController from '../controllers/PricingController';
import * as PricingValidator from '../controllers/validation/PricingValidation';
import { isLoggedIn } from '../middlewares/AuthMiddleware';
import { handlePricingUpload } from '../middlewares/FileHandlerMiddleware';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';

const loadFileRoutes = function (app: express.Application) {
  const pricingController = new PricingController();
  const upload = handlePricingUpload(['yaml'], './public/static/pricings/uploaded');

  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/pricings')
    .get(pricingController.index)
    .post(isLoggedIn, upload, pricingController.create);

  app.route(baseUrl + '/pricings/:pricingId/configuration-space')
    .get(pricingController.getConfigurationSpace);

  app
    .route(baseUrl + '/pricings/:owner/:pricingName')
    .get(pricingController.show)
    .put(isLoggedIn, PricingValidator.update, handleValidation, pricingController.update)
    .delete(isLoggedIn, pricingController.destroyByNameAndOwner);
  
  app
    .route(baseUrl + '/pricings/:owner/:pricingName/:pricingVersion')
    .delete(isLoggedIn, pricingController.destroyVersionByNameAndOwner);

  app
    .route(baseUrl + '/me/pricings')
    .get(isLoggedIn, pricingController.indexByUserWithoutCollection)
    .put(isLoggedIn, pricingController.addPricingToCollection);
};

export default loadFileRoutes;
