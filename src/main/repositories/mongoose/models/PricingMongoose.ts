import mongoose, { Schema } from 'mongoose';
import Feature from './schemas/Feature';
import UsageLimit from './schemas/UsageLimit';
import Plan from './schemas/Plan';
import AddOn from './schemas/AddOn';

const pricingSchema = new Schema(
  {
    _serviceId: { type: String, required: true },
    version: { type: String, required: true },
    curreny: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    features: { type: Map, of: Feature, required: true },
    usageLimits: { type: Map, of: UsageLimit },
    plans: { type: Map, of: Plan },
    addOns: { type: Map, of: AddOn }
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, resultObject, options) {
        delete resultObject._id;
        delete resultObject.__v;
        return resultObject;
      },
    },
  }
);

pricingSchema.virtual('service', {
  ref: 'Service',
  localField: '_serviceId',
  foreignField: '_id',
  justOne: true,
});

// Adding unique index for [name, owner, version]
pricingSchema.index({ _serviceId: 1, version: 1 }, { unique: true });

const pricingModel = mongoose.model('Pricing', pricingSchema, 'pricings');

export default pricingModel;
