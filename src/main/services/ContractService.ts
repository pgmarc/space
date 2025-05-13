import container from '../config/container';
import { LeanContract } from '../types/models/Contract';
import ContractRepository from '../repositories/mongoose/ContractRepository';

class ContractService {
  private readonly contractRepository: ContractRepository;

  constructor() {
    this.contractRepository = container.resolve('contractRepository');
  }

  async index(queryParams: any) {
    const contracts: LeanContract[] = await this.contractRepository.findAll(queryParams);
    return contracts;
  }
}

export default ContractService;
