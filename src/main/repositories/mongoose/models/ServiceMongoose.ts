import mongoose, { Schema } from 'mongoose';

const serviceSchema = new Schema(
  {
    name: { type: String, required: true },
    activePricings: [{ type: String }],
    archivedPricings: [{ type: String }]
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

serviceSchema.virtual('pricings', {
  ref: 'Pricing',
  localField: '_id',
  foreignField: '_serviceId',
});

// Middleware to ensure activePricings has at least one value
serviceSchema.pre('save', function (next) {
  if (!this.activePricings || this.activePricings.length === 0) {
    return next(new Error('activePricings must have at least one value.'));
  }
  next();
});

// Adding unique index for [name, owner, version]
serviceSchema.index({ name: 1 }, { unique: true });

const serviceModel = mongoose.model('Service', serviceSchema, 'services');

export default serviceModel;
