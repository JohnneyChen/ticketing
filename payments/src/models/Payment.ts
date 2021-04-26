import mongoose from "mongoose";

interface PaymentAttrs {
  orderId: string;
  chargeId: string;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  chargeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  chargeId: {
    type: String,
    required: true,
  },
});

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  "Payment",
  paymentSchema
);

export { Payment };
