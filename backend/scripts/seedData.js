const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('MongoDB Connection Error:', err));

// Sample menu items
const sampleMenuItems = [
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan cheese',
    price: 12.99,
    category: 'Salad',
    image: 'https://via.placeholder.com/300x200?text=Caesar+Salad'
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon grilled to perfection, served with vegetables and rice',
    price: 24.99,
    category: 'Main Course',
    image: 'https://via.placeholder.com/300x200?text=Grilled+Salmon'
  },
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
    price: 16.99,
    category: 'Main Course',
    image: 'https://via.placeholder.com/300x200?text=Margherita+Pizza'
  },
  {
    name: 'Chicken Wings',
    description: 'Crispy chicken wings with your choice of sauce (Buffalo, BBQ, or Honey Mustard)',
    price: 14.99,
    category: 'Appetizer',
    image: 'https://via.placeholder.com/300x200?text=Chicken+Wings'
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    price: 8.99,
    category: 'Dessert',
    image: 'https://via.placeholder.com/300x200?text=Chocolate+Lava+Cake'
  },
  {
    name: 'Tomato Soup',
    description: 'Creamy tomato soup with fresh herbs and a side of bread',
    price: 7.99,
    category: 'Soup',
    image: 'https://via.placeholder.com/300x200?text=Tomato+Soup'
  },
  {
    name: 'Iced Tea',
    description: 'Refreshing iced tea with lemon',
    price: 3.99,
    category: 'Beverage',
    image: 'https://via.placeholder.com/300x200?text=Iced+Tea'
  },
  {
    name: 'Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    price: 15.99,
    category: 'Main Course',
    image: 'https://via.placeholder.com/300x200?text=Beef+Burger'
  }
];

// Seed function
const seedData = async () => {
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await MenuItem.deleteMany({});

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@restaurant.com' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists');
    }

    // Create test user
    const userExists = await User.findOne({ email: 'user@test.com' });
    if (!userExists) {
      const user = await User.create({
        name: 'Test User',
        email: 'user@test.com',
        password: 'user123',
        role: 'user'
      });
      console.log('Test user created:', user.email);
    } else {
      console.log('Test user already exists');
    }

    // Create menu items
    const menuItemsCount = await MenuItem.countDocuments();
    if (menuItemsCount === 0) {
      await MenuItem.insertMany(sampleMenuItems);
      console.log(`${sampleMenuItems.length} menu items created`);
    } else {
      console.log('Menu items already exist');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed function
seedData();
