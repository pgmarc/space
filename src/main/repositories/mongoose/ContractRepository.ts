import RepositoryBase from '../RepositoryBase';
import ContractMongoose from './models/ContractMongoose';
import { ContractQueryFilters, LeanContract } from '../../types/models/Contract';
import { toPlainObject } from '../../utils/mongoose';

class ContractRepository extends RepositoryBase {
  async findAll(queryFilters?: ContractQueryFilters) {
    const {
      userId,
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

    const contracts = await ContractMongoose.find({
      ...(userId ? { userId: userId } : {}),
      ...(username ? { username: username } : {}),
      ...(firstName ? { firstName: firstName } : {}),
      ...(lastName ? { lastName: lastName } : {}),
      ...(email ? { email: email } : {}),
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
}

export default ContractRepository;
