import { PaymentType } from 'pricing4ts';
import { LeanPricingFeature } from './Pricing';

export interface LeanFeature {
  info: LeanPricingFeature;
  service: string;
  pricingVersion: string;
}

export interface FeatureIndexQueryParams {
  featureName?: string;
  serviceName?: string;
  pricingVersion?: string;
  page?: number;
  offset?: number;
  limit?: number;
  sort?: 'featureName' | 'serviceName';
  order?: 'asc' | 'desc';
  show?: 'active' | 'archived' | 'all';
}

export type SimpleFeatureEvaluation = Record<string, boolean>;

export type DetailedFeatureEvaluation = Record<
  string,
  {
    used: Record<string, number> | null;
    limit: Record<string, number> | null;
    eval: boolean;
  }
>;

export type PricingContext = Record<
  'features' | 'usageLimits',
  Record<string, string | boolean | number | PaymentType[]>
>;

export type SubscriptionContext = Record<string, number>

export type EvaluationContext = Record<string, string>