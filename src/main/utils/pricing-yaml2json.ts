import { AddOn, Feature, Plan, Pricing, UsageLimit } from "pricing4ts";

export interface ExpectedPricingType {
  version: string;
  currency: string;
  createdAt: Date;
  features: {
    [key: string]: Feature
  };
  usageLimits?: {
    [key: string]: UsageLimit
  };
  plans?: {
    [key: string]: Plan
  };
  addOns?: {
    [key: string]: AddOn
  };
}

export function parsePricingToSpacePricingObject(pricing: Pricing): ExpectedPricingType {
  const json: ExpectedPricingType = {} as ExpectedPricingType;

  json.version = pricing.version;
  json.currency = pricing.currency;
  json.createdAt = pricing.createdAt;
  json.features = pricing.features;
  json.usageLimits = pricing.usageLimits;
  json.plans = pricing.plans;
  json.addOns = pricing.addOns;

  return json;
}