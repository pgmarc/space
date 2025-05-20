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
    
    availableFor: [{ type: String }], // Lista de nombres de planes
    dependsOn: [{ type: String }],     // Lista de nombres de otros addons
    excludes: [{ type: String }],      // Lista de nombres de addons excluidos
    
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
  { _id: false } // Opcional, depende de si quieres que cada AddOn embebido tenga _id o no
);

export default addOnSchema;