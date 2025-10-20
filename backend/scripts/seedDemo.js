import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import User from '../models/User.js';
import MenuCategory from '../models/MenuCategory.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import bcrypt from 'bcrypt';
import Order from '../models/Order.js';
import { calculateOrderTotal, generateOrderNumber } from '../utils/helperUtils.js';

const run = async () => {
  try {
    await connectDB();

    // Create admin user if not exists
    const adminEmail = 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash('Password123!', saltRounds);
      admin = new User({ name: 'Admin', email: adminEmail, passwordHash, role: 'admin' });
      await admin.save();
      console.log(`Created admin user: ${adminEmail} / Password123!`);
    } else {
      console.log('Admin user already exists:', adminEmail);
    }

    // Create sample category
    let category = await MenuCategory.findOne({ name: 'Starters' });
    if (!category) {
      category = new MenuCategory({ name: 'Starters', displayOrder: 0 });
      await category.save();
      console.log('Created category: Starters');
    }

    // Create sample menu item
    let item = await MenuItem.findOne({ name: 'Garlic Bread' });
    if (!item) {
      item = new MenuItem({
        name: 'Garlic Bread',
        description: 'Toasted garlic bread with herbs',
        price: 3.99,
        categoryId: category._id,
        availability: true,
        tags: ['vegan']
      });
      await item.save();
      console.log('Created menu item: Garlic Bread');
    }

    // Create sample table
    let table = await Table.findOne({ number: 1 });
    if (!table) {
      table = new Table({ number: 1, qrSlug: `table-1-${Date.now()}` });
      await table.save();
      console.log('Created table #1');
    }

    // Create a demo order for the seeded item and table (if not exists)
    const existingOrder = await Order.findOne({ 'meta.demoSeed': true });
    if (!existingOrder) {
      const orderItems = [{ menuItemId: item._id, name: item.name, price: item.price, qty: 1 }];
      const totals = calculateOrderTotal(orderItems);
      const demoOrder = new Order({
        tableId: table._id,
        items: orderItems,
        totals,
        orderNumber: generateOrderNumber(),
        status: 'placed',
        payment: { method: 'card', provider: 'stripe', status: 'pending' },
        meta: { demoSeed: true }
      });
      await demoOrder.save();
      console.log('Created demo order:', demoOrder._id.toString());
    } else {
      console.log('Demo order already exists:', existingOrder._id.toString());
    }

    console.log('Demo seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

run();