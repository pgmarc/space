import container from '../config/container';
import { LeanContract } from '../types/models/Contract';
import ContractRepository from '../repositories/mongoose/ContractRepository';
import { validateContractQueryFilters } from './validation/ContractServiceValidation';

class ContractService {
  private readonly contractRepository: ContractRepository;

  constructor() {
    this.contractRepository = container.resolve('contractRepository');
  }

  async index(queryParams: any) {

    const errors = validateContractQueryFilters(queryParams);

    if (errors.length > 0) {
      throw new Error("Errors where found during validation of query params: " + errors.join(' | '));
    }

    const contracts: LeanContract[] = await this.contractRepository.findAll(queryParams);
    return contracts;
  }

  async show(userId: string): Promise<LeanContract> {
    const contract = await this.contractRepository.findByUserId(userId);
    if (!contract) {
      throw new Error(`Contract with userId ${userId} not found`);
    }
    return contract;
  }
}

export default ContractService;
