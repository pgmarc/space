import container from '../config/container';
import ContractService from '../services/ContractService';
import { ContractQueryFilters } from '../types/models/Contract';
import { removeOptionalFieldsOfQueryParams } from '../utils/controllerUtils';

class ContractController {
  private readonly contractService: ContractService;

  constructor() {
    this.contractService = container.resolve('contractService');
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
  }

  async index(req: any, res: any) {
    try {
      const queryParams = this._transformIndexQueryParams(req.query);

      const contracts = await this.contractService.index(queryParams);
      res.json(contracts);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async show(req: any, res: any) {
    try {
      const userId = req.params.userId;
      const contract = await this.contractService.show(userId);
      res.json(contract);
    } catch (err: any) {
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404).send({ error: err.message });
      }else{
        res.status(500).send({ error: err.message });
      }
    }
  }

  _transformIndexQueryParams(
    indexQueryParams: Record<string, string | number>
  ): ContractQueryFilters {
    const transformedData: ContractQueryFilters = {
      userId: indexQueryParams.userId as string,
      username: indexQueryParams.username as string,
      firstName: indexQueryParams.firstName as string,
      lastName: indexQueryParams.lastName as string,
      email: indexQueryParams.email as string,
      page: parseInt(indexQueryParams['page'] as string) || 1,
      offset: parseInt(indexQueryParams['offset'] as string) || 0,
      limit: parseInt(indexQueryParams['limit'] as string) || 20,
      sort: indexQueryParams.sort as
        | 'firstName'
        | 'lastName'
        | 'username'
        | 'email',
      order: (indexQueryParams.order as 'asc' | 'desc') || 'asc',
    };

    const optionalFields: string[] = Object.keys(transformedData);

    removeOptionalFieldsOfQueryParams(transformedData, optionalFields);

    return transformedData;
  }
}

export default ContractController;
