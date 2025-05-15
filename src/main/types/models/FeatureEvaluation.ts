import { LeanPricingFeature } from "./Pricing";

export interface LeanFeature {
  info: LeanPricingFeature;
  service: string;
  pricingVersion: string;
}

export interface FeatureIndexQueryParams {
  page?: number;
  offset?: number;
  limit?: number;
  sort?: "featureName" | "serviceName";
  order?: "asc" | "desc";
  show?: "active" | "archived" | "all";
}