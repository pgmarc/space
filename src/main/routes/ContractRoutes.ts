import express from 'express';

import ContractController from '../controllers/ContractController';
import * as ContractValidator from '../controllers/validation/ContractValidation';
import { isLoggedIn } from '../middlewares/AuthMiddleware';
// import { handlePricingUpload } from '../middlewares/FileHandlerMiddleware';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';

const loadFileRoutes = function (app: express.Application) {
  const contractController = new ContractController();
  // const upload = handlePricingUpload(['pricing'], './public/static/pricings/uploaded');

  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/contracts')
    .get(contractController.index)
    .post(ContractValidator.create, handleValidation, contractController.create)
    .delete(contractController.prune);

  app
    .route(baseUrl + '/contracts/:userId')
    .get(contractController.show)
    .put(ContractValidator.novate, handleValidation, contractController.novate)
    .delete(contractController.destroy);
  
    app
    .route(baseUrl + '/contracts/:userId/usageLevels')
    .put(ContractValidator.incrementUsageLevels, handleValidation, contractController.resetUsageLevels)

    app
    .route(baseUrl + '/contracts/:userId/userContact')
    .put(ContractValidator.novateUserContact, handleValidation, contractController.novateUserContact)

    app
    .route(baseUrl + '/contracts/:userId/billingPeriod')
    .put(ContractValidator.novateBillingPeriod, handleValidation, contractController.novateBillingPeriod)
};

export default loadFileRoutes;
