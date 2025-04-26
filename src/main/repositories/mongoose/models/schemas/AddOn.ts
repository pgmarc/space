import { Schema } from "mongoose";

const subscriptionConstraintSchema = new Schema(
  {
    minQuantity: { type: Number, default: 1 },
    maxQuantity: { type: Number, default: Infinity },
    quantityStep: { type: Number, default: 1 },
  },
  { _id: false }
);

const addOnSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String }, // Opcional
    private: { type: Boolean, default: false },
    price: { type: Number, required: true },
    
    availableFor: [{ type: String }], // Lista de nombres de planes
    dependsOn: [{ type: String }],     // Lista de nombres de otros addons
    excludes: [{ type: String }],      // Lista de nombres de addons excluidos
    
    features: {
      type: Map,
      of: Schema.Types.Mixed, // boolean, number or string
    },           // Array de cambios de features
    usageLimits: {
      type: Map,
      of: Schema.Types.Mixed, // boolean or number
    },
    usageLimitsExtensions: {
      type: Map,
      of: Number
    },
    subscriptionConstraint: {
      type: subscriptionConstraintSchema,
    },
  },
  { _id: false } // Opcional, depende de si quieres que cada AddOn embebido tenga _id o no
);

export default addOnSchema;