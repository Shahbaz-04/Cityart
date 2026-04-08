const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');

router.post('/', async (req, res) => {
  try {
    const { items, total, totalDelivery, grandTotal, notes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must include at least one item.' });
    }

    const order = new Order({
      items,
      total,
      totalDelivery,
      grandTotal,
      notes: notes || '',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
