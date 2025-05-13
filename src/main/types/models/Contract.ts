export interface ConsumptionLevel {
  resetTimeStamp: string; // o Date si no es serializado
  consumed: number;
}

export interface ContractedService {
  path: string;
}

export interface ContractHistoryEntry {
  startDate: string;
  endDate: string;
  contractedServices: Record<string, ContractedService>;
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
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    renewalDays: number;
  };
  usageLevels: Record<string, ConsumptionLevel>;
  contractedServices: Record<string, ContractedService>;
  subscriptionPlans: Record<string, string>;
  subscriptionAddOns: Record<string, Record<string, number>>;
  history: ContractHistoryEntry[];
}