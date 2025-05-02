import express from 'express';

import PricingController from '../controllers/ServiceController';
import * as PricingValidator from '../controllers/validation/PricingValidation';
import { isLoggedIn } from '../middlewares/AuthMiddleware';
import { handlePricingUpload } from '../middlewares/FileHandlerMiddleware';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';

const loadFileRoutes = function (app: express.Application) {
  const pricingController = new PricingController();
  const upload = handlePricingUpload(['yaml'], './public/static/pricings/uploaded');

  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/services')
    .get(pricingController.index)
    // .post(isLoggedIn, upload, pricingController.create);
};

export default loadFileRoutes;
