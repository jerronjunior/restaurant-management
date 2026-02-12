require('dotenv').config();
const { admin, initFirebase, getDb } = require('../config/firebaseAdmin');

try {
  initFirebase();
  console.log('Firebase Admin Initialized');
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error.message);
  process.exit(1);
}

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
    const db = getDb();

    // Create admin user
    let adminUser;
    try {
      adminUser = await admin.auth().getUserByEmail('admin@restaurant.com');
    } catch (error) {
      adminUser = await admin.auth().createUser({
        email: 'admin@restaurant.com',
        password: 'admin123',
        displayName: 'Admin User'
      });
      console.log('Admin auth user created:', adminUser.email);
    }

    await db.collection('users').doc(adminUser.uid).set({
      name: 'Admin User',
      email: 'admin@restaurant.com',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Create test user
    let testUser;
    try {
      testUser = await admin.auth().getUserByEmail('user@test.com');
    } catch (error) {
      testUser = await admin.auth().createUser({
        email: 'user@test.com',
        password: 'user123',
        displayName: 'Test User'
      });
      console.log('Test auth user created:', testUser.email);
    }

    await db.collection('users').doc(testUser.uid).set({
      name: 'Test User',
      email: 'user@test.com',
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Create menu items
    const existingItems = await db.collection('menuItems').get();
    if (existingItems.empty) {
      const batch = db.batch();
      sampleMenuItems.forEach((item) => {
        const docRef = db.collection('menuItems').doc();
        batch.set(docRef, {
          ...item,
          available: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
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
