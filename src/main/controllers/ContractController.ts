import container from '../config/container';
import ContractService from '../services/ContractService';

class ContractController {
  private readonly contractService: ContractService;

  constructor() {
    this.contractService = container.resolve('contractService');
    this.index = this.index.bind(this);
  }

  async index(req: any, res: any) {
    try {
      const queryParams = this._transformIndexQueryParams(req.query);

      const services = await this.contractService.index(queryParams);
      res.json(services);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  _transformIndexQueryParams(
    indexQueryParams: Record<string, string | number>
  ): any {
    const transformedData: any = {
      name: indexQueryParams.name as string,
      page: parseInt(indexQueryParams['page'] as string) || 1,
      offset: parseInt(indexQueryParams['offset'] as string) || 0,
      limit: parseInt(indexQueryParams['limit'] as string) || 20,
      order: (indexQueryParams.order as 'asc' | 'desc') || 'asc',
    };

    const optionalFields = ['name', 'page', 'offset', 'limit', 'order'] as const;

    optionalFields.forEach(field => {
      if (['name', 'order'].includes(field)) {
        if (!transformedData[field]) {
          delete transformedData[field];
        }
      } else if (this._containsNaN(transformedData[field]!)) {
        delete transformedData[field];
      }
    });

    return transformedData;
  }

  _containsNaN(attr: any): boolean {
    return Object.values(attr).every(value => Number.isNaN(value));
  }
}

export default ContractController;
