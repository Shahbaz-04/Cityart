const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  image: { type: String },
  size: { type: String },
  deliveryCharge: { type: Number, default: 0 },
  transport: {
    icon: String,
    name: String,
    contact: String,
    deliveryDays: String,
  },
});

const orderSchema = mongoose.Schema({
  items: [orderItemSchema],
  total: { type: Number, required: true },
  totalDelivery: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  deliveryStatus: { type: String, default: 'Not Started' },
  notes: { type: String },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
