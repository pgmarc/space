export interface Pricing {
  id: string;
  version: string;
  currency: string;
  createdAt: string; // o Date si no haces `JSON.stringify`
  features: Record<string, Feature>;
  usageLimits?: Record<string, UsageLimit>;
  plans?: Record<string, Plan>;
  addOns?: Record<string, AddOn>;
}


// ----------------------------------------
// -------------- Main Types --------------
// ----------------------------------------

export interface Feature {
  name: string;
  description?: string;
  valueType: "BOOLEAN" | "TEXT" | "NUMERIC";
  defaultValue: any;
  value?: any;
  type: "INFORMATION" | "INTEGRATION" | "DOMAIN" | "AUTOMATION" | "MANAGEMENT" | "GUARANTEE" | "SUPPORT" | "PAYMENT";
  integrationType?: "API" | "EXTENSION" | "IDENTITY_PROVIDER" | "WEB_SAAS" | "MARKETPLACE" | "EXTERNAL_DEVICE";
  pricingUrls?: string[];
  automationType?: "BOT" | "FILTERING" | "TRACKING" | "TASK_AUTOMATION";
  paymentType?: "CARD" | "GATEWAY" | "INVOICE" | "ACH" | "WIRE_TRANSFER" | "OTHER";
  docUrl?: string;
  expression?: string;
  serverExpression?: string;
  render: "AUTO" | "ENABLED" | "DISABLED";
  tag?: string;
}

export interface UsageLimit {
  name: string;
  description?: string;
  valueType: "BOOLEAN" | "NUMERIC";
  defaultValue: any;
  value?: any;
  type: "RENEWABLE" | "NON_RENEWABLE";
  trackable?: boolean;
  period?: Period;
}

export interface Plan {
  name: string;
  description?: string;
  price: string | number;
  private?: boolean;
  features: Record<string, string | number | boolean>;
  usageLimits?: Record<string, string | number | boolean>;
}

export interface AddOn {
  name: string;
  description?: string;
  private?: boolean;
  price: string | number;
  availableFor?: string[];
  dependsOn?: string[];
  excludes?: string[];
  features?: Record<string, AddOnFeature>;
  usageLimits?: Record<string, AddOnUsageLimit>;
  usageLimitsExtensions?: Record<string, AddOnUsageLimitExtension>;
  subscriptionConstraint?: SubscriptionConstraint;
}


// ----------------------------------------
// ------------- Auxiliar Types -----------
// ----------------------------------------

export interface Period {
  value: number;
  unit: "SEC" | "MIN" | "HOUR" | "DAY" | "MONTH" | "YEAR";
}

export interface AddOnFeature {
  name: string;
  value: string | number | boolean;
}

export interface AddOnUsageLimit {
  name: string;
  value: string | number | boolean;
}

export interface AddOnUsageLimitExtension {
  name: string;
  value: number;
}

export interface SubscriptionConstraint {
  minQuantity?: number;
  maxQuantity?: number;
  quantityStep?: number;
}
