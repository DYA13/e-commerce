const mongoose = require('mongoose')

// consider min vlaidation on price and such?
const SingleOrderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: {
    type: Number,
    required: true,
    min: 0 // Minimum price value should be greater than or equal to 0
  },
  amount: {
    type: Number,
    required: true,
    min: 1 // Minimum amount value should be greater than or equal to 1
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  }
})

const OrderSchema = mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    orderItems: [SingleOrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
      default: 'pending'
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    clientSecret: {
      type: String,
      required: true
    },
    paymentIntentId: {
      type: String
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', OrderSchema)
