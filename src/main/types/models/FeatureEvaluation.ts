import { LeanPricingFeature } from "./Pricing";

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
  sort?: "featureName" | "serviceName";
  order?: "asc" | "desc";
  show?: "active" | "archived" | "all";
}