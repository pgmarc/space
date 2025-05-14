export interface UsageLevel {
  resetTimeStamp?: Date; // o Date si no es serializado
  consumed: number;
}

export interface ContractHistoryEntry {
  startDate: Date;
  endDate: Date;
  contractedServices: Record<string, string>;
  subscriptionPlans: Record<string, string>;
  subscriptionAddOns: Record<string, Record<string, number>>;
}

export interface LeanContract {
  userContact: {
    userId: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  billingPeriod: {
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    renewalDays: number;
  };
  usageLevels: Record<string, UsageLevel>;
  contractedServices: Record<string, string>;
  subscriptionPlans: Record<string, string>;
  subscriptionAddOns: Record<string, Record<string, number>>;
  history: ContractHistoryEntry[];
}

export interface ContractQueryFilters {
  userId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  page?: number;
  offset?: number;
  limit?: number;
  sort?: 
    | 'firstName'
    | 'lastName'
    | 'username'
    | 'email'
  order?: 'asc' | 'desc';
}

export interface ContractToCreate {
  userContact: {
    userId: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  billingPeriod?: {
    autoRenew?: boolean;
    renewalDays?: number;
  };
  contractedServices: Record<string, string>; // service name → pricing path
  subscriptionPlans: Record<string, string>; // service name → plan name
  subscriptionAddOns: Record<string, Record<string, number>>; // service name → { addOn: count }
}

export interface Subscription extends Pick<ContractToCreate, 'contractedServices' | 'subscriptionPlans' | 'subscriptionAddOns'> {}
