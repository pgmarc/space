import { Schema } from "mongoose";

const featureSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String},
    valueType: { type: String, enum: ["BOOLEAN", "TEXT", "NUMERIC"], required: true },
    defaultValue: { type: Schema.Types.Mixed, required: true },
    value: { type: Schema.Types.Mixed},
    type: { type: String, enum: ["INFORMATION", "INTEGRATION", "DOMAIN", "AUTOMATION", "MANAGEMENT", "GUARANTEE", "SUPPORT", "PAYMENT"], required: true },
    integrationType: { type: String, enum: ["API", "EXTENSION", "IDENTITY_PROVIDER", "WEB_SAAS", "MARKETPLACE", "EXTERNAL_DEVICE"]},
    pricingUrls: [{ type: String }],
    automationType: { type: String, enum: ["BOT", "FILTERING", "TRACKING", "TASK_AUTOMATION"]},
    paymentType: { type: String, enum: ["CARD", "GATEWAY", "INVOICE", "ACH", "WIRE_TRANSFER", "OTHER"]},
    docUrl: { type: String },
    expression: { type: String },
    serverExpression: { type: String },
    render: { type: String, enum: ["AUTO", "ENABLED", "DISABLED"], required: true, default: "AUTO" },
    tag: { type: String }
  },
  { _id: false } // To not create an _id field for each feature
);

export default featureSchema;