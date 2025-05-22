import { Schema } from "mongoose";

const subscriptionConstraintSchema = new Schema(
  {
    minQuantity: { type: Number, default: 1 },
    maxQuantity: { type: Number, default: Infinity },
    quantityStep: { type: Number, default: 1 },
  },
  { _id: false }
);

const addOnUsageLimitsSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }, // boolean or number
  }
);

const addOnUsagelimitsExtensionsSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: Number, required: true }, // number
  }
);

const addOnSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String }, // Opcional
    private: { type: Boolean, default: false },
    price: { type: Schema.Types.Mixed, required: true }, // number or string
    
    availableFor: [{ type: String }], // List of plan names
    dependsOn: [{ type: String }],     // List of names of addons that this addon depends on
    excludes: [{ type: String }],      // List of names of addons that this addon excludes
    
    features: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    usageLimits: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    usageLimitsExtensions: {
      type: Map,
      of: Schema.Types.Number,
    },
    subscriptionConstraints: {
      type: subscriptionConstraintSchema,
    },
  },
  { _id: false } // To not create an _id field for each addOn
);

export default addOnSchema;