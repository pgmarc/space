import express from 'express';

import ContractController from '../controllers/ContractController';
import { isLoggedIn } from '../middlewares/AuthMiddleware';
// import { handlePricingUpload } from '../middlewares/FileHandlerMiddleware';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';

const loadFileRoutes = function (app: express.Application) {
  const contractController = new ContractController();
  // const upload = handlePricingUpload(['pricing'], './public/static/pricings/uploaded');

  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/contracts')
    .get(contractController.index);
};

export default loadFileRoutes;
