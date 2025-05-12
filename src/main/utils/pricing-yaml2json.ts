import { AddOn, Feature, Plan, Pricing, UsageLimit } from "pricing4ts";
import { validateLegalKeysInObject } from "../controllers/validation/ServiceValidation";

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
  
  validateLegalKeysInObject(pricing.features, "features");
  validateLegalKeysInObject(pricing.usageLimits || {}, "usageLimits");
  validateLegalKeysInObject(pricing.plans || {}, "plans");
  validateLegalKeysInObject(pricing.addOns || {}, "addOns");

  json.version = pricing.version;
  json.currency = pricing.currency;
  json.createdAt = pricing.createdAt;
  json.features = pricing.features;
  json.usageLimits = pricing.usageLimits;
  json.plans = pricing.plans;
  json.addOns = pricing.addOns;

  return json;
}