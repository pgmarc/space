import RepositoryBase from '../RepositoryBase';
import ContractMongoose from './models/ContractMongoose';
import { ContractQueryFilters, ContractToCreate, LeanContract } from '../../types/models/Contract';
import { toPlainObject } from '../../utils/mongoose';

class ContractRepository extends RepositoryBase {
  async findAll(queryFilters?: ContractQueryFilters) {
    const {
      username,
      firstName,
      lastName,
      email,
      page = 1,
      offset = 0,
      limit = 20,
      sort,
      order = 'asc',
    } = queryFilters || {};

    // TODO: arreglar esta query, porque no está considerando correctamente los filtros de username, firstName, etc
    const contracts = await ContractMongoose.find({
      ...(username ? { username: { $regex: new RegExp(username, 'i') } } : {}),
      ...(firstName ? { firstName: { $regex: new RegExp(firstName, 'i') } } : {}),
      ...(lastName ? { lastName: { $regex: new RegExp(lastName, 'i') } } : {}),
      ...(email ? { email: { $regex: new RegExp(email, 'i') } } : {}),
    })
      .skip(offset == 0 ? (page - 1) * limit : offset)
      .limit(limit)
      .sort({ [sort ?? 'username']: order === 'asc' ? 1 : -1 });

    return contracts.map(contract => toPlainObject<LeanContract>(contract.toJSON()));
  }

  async findByUserId(userId: string): Promise<LeanContract | null> {
    const contract = await ContractMongoose.findOne({ 'userContact.userId': userId });
    return contract ? toPlainObject<LeanContract>(contract.toJSON()) : null;
  }

  async create(contractData: ContractToCreate): Promise<LeanContract> {
    const contract = new ContractMongoose(contractData);
    await contract.save();
    return toPlainObject<LeanContract>(contract.toJSON());
  }

  async update(userId: string, contractData: Partial<ContractToCreate>): Promise<LeanContract | null> {
    const contract = await ContractMongoose.findOneAndUpdate(
      { 'userContact.userId': userId },
      { $set: contractData },
      { new: true }
    );
    return contract ? toPlainObject<LeanContract>(contract.toJSON()) : null;
  }

  async prune(): Promise<number> {
    const result = await ContractMongoose.deleteMany({});
    if (result.deletedCount === 0) {
      throw new Error('No contracts found to delete');
    }
    return result.deletedCount;
  }

  async destroy(userId: string): Promise<void> {
    const result = await ContractMongoose.deleteOne({ 'userContact.userId': userId });
    if (result.deletedCount === 0) {
      throw new Error(`Contract with userId ${userId} not found`);
    }
  }
}

export default ContractRepository;
