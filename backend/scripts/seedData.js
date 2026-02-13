const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
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
  // Starters / Appetizers
  {
    name: 'Vegetable Spring Rolls',
    description: 'Crispy pastry rolls packed with seasoned vegetables.',
    price: 'LKR 650',
    category: 'Starters',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1544333346-646706988bb1?auto=format&fit=crop&w=500'
  },
  {
    name: 'Chicken Cutlets (3 pcs)',
    description: 'Sri Lankan style breaded chicken cutlets with mild spice.',
    price: 'LKR 550',
    category: 'Starters',
    dietType: 'Non-Veg',
    spicyLevel: 'Medium',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=500'
  },
  {
    name: 'Fish Fingers',
    description: 'Golden fried fish strips served with creamy dip.',
    price: 'LKR 750',
    category: 'Starters',
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=500'
  },
  {
    name: 'Chicken Wings (Spicy / BBQ)',
    description: 'Juicy wings tossed in spicy or smoky BBQ glaze.',
    price: 'LKR 1,100',
    category: 'Starters',
    dietType: 'Non-Veg',
    spicyLevel: 'Hot',
    tags: ['Non-Veg', 'Spicy', 'Best Seller'],
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=500'
  },
  {
    name: 'Garlic Bread',
    description: 'Toasted baguette slices with garlic herb butter.',
    price: 'LKR 600',
    category: 'Starters',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500'
  },

  // Main Courses
  {
    name: 'Chicken Curry',
    description: 'Comforting chicken curry with aromatic spices.',
    price: 'LKR 1,250',
    category: 'Main Courses',
    dietType: 'Non-Veg',
    spicyLevel: 'Medium',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500'
  },
  {
    name: 'Fish Ambul Thiyal',
    description: 'Traditional sour fish curry with roasted spices.',
    price: 'LKR 1,450',
    category: 'Main Courses',
    dietType: 'Non-Veg',
    spicyLevel: 'Medium',
    tags: ['Non-Veg', 'Best Seller'],
    image: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?auto=format&fit=crop&w=500'
  },
  {
    name: 'Vegetable Curry Mix',
    description: 'A hearty mix of seasonal vegetables in mild curry.',
    price: 'LKR 950',
    category: 'Main Courses',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500'
  },
  {
    name: 'Beef Curry',
    description: 'Slow-cooked beef curry with deep, rich spices.',
    price: 'LKR 1,650',
    category: 'Main Courses',
    dietType: 'Non-Veg',
    spicyLevel: 'Medium',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1589187151003-0dd30df2ecf1?auto=format&fit=crop&w=500'
  },
  {
    name: 'Grilled Chicken',
    description: 'Char-grilled chicken with herb butter and sides.',
    price: 'LKR 1,850',
    category: 'Main Courses',
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=500'
  },

  // Rice & Noodles
  {
    name: 'Chicken Fried Rice',
    description: 'Wok-tossed rice with chicken, egg, and vegetables.',
    price: 'LKR 1,250',
    category: 'Rice & Noodles',
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500'
  },
  {
    name: 'Vegetable Fried Rice',
    description: 'Vegetable fried rice with soy and garlic.',
    price: 'LKR 950',
    category: 'Rice & Noodles',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1512058560366-cd2427ff56f3?auto=format&fit=crop&w=500'
  },
  {
    name: 'Seafood Fried Rice',
    description: 'Seafood fried rice with prawns and fish.',
    price: 'LKR 1,550',
    category: 'Rice & Noodles',
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500'
  },
  {
    name: 'Chicken Kottu',
    description: 'Classic chopped roti stir-fry with chicken and spices.',
    price: 'LKR 1,200',
    category: 'Rice & Noodles',
    dietType: 'Non-Veg',
    spicyLevel: 'Medium',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?auto=format&fit=crop&w=500'
  },
  {
    name: 'Vegetable Noodles',
    description: 'Stir-fried noodles with fresh vegetables.',
    price: 'LKR 1,000',
    category: 'Rice & Noodles',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500'
  },

  // Burgers & Fast Food
  {
    name: 'Classic Chicken Burger',
    description: 'Crispy chicken burger with lettuce and signature sauce.',
    price: 'LKR 1,100',
    category: 'Burgers & Fast Food',
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500'
  },
  {
    name: 'Beef Burger',
    description: 'Juicy beef patty with cheese, pickles, and onions.',
    price: 'LKR 1,350',
    category: 'Burgers & Fast Food',
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1547584385-8cd817456c95?auto=format&fit=crop&w=500'
  },
  {
    name: 'Veggie Burger',
    description: 'Plant-based burger with fresh greens and sauce.',
    price: 'LKR 950',
    category: 'Burgers & Fast Food',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=500'
  },
  {
    name: 'Chicken Submarine',
    description: 'Loaded chicken sub with melted cheese and veggies.',
    price: 'LKR 1,400',
    category: 'Burgers & Fast Food',
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1553909489-cd47e090796a?auto=format&fit=crop&w=500'
  },
  {
    name: 'French Fries (Regular)',
    description: 'Golden fries with a light salt finish.',
    price: 'LKR 650',
    category: 'Burgers & Fast Food',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1505253213348-ce0d04b2b0ea?auto=format&fit=crop&w=500'
  },
  {
    name: 'French Fries (Cheese)',
    description: 'Crispy fries topped with creamy cheese sauce.',
    price: 'LKR 850',
    category: 'Burgers & Fast Food',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1516685018646-549d6d8fe348?auto=format&fit=crop&w=500'
  },
  {
    name: 'French Fries (Spicy)',
    description: 'Spiced fries with chili seasoning.',
    price: 'LKR 750',
    category: 'Burgers & Fast Food',
    dietType: 'Veg',
    spicyLevel: 'Hot',
    tags: ['Veg', 'Spicy'],
    image: 'https://images.unsplash.com/photo-1639744211487-38fce52a2c2a?auto=format&fit=crop&w=500'
  },

  // Pizza
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato, mozzarella, and basil.',
    price: 'LKR 1,600',
    category: 'Pizza',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?auto=format&fit=crop&w=500'
  },
  {
    name: 'Chicken Pepperoni Pizza',
    description: 'Spicy chicken pepperoni with melty cheese.',
    price: 'LKR 2,100',
    category: 'Pizza',
    dietType: 'Non-Veg',
    spicyLevel: 'Medium',
    tags: ['Non-Veg', 'Best Seller'],
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500'
  },
  {
    name: 'BBQ Chicken Pizza',
    description: 'BBQ chicken, onions, and a smoky glaze.',
    price: 'LKR 2,250',
    category: 'Pizza',
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1548365328-8b849e6f7c04?auto=format&fit=crop&w=500'
  },
  {
    name: 'Vegetable Supreme Pizza',
    description: 'Loaded with peppers, olives, and fresh vegetables.',
    price: 'LKR 1,850',
    category: 'Pizza',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=500'
  },
  {
    name: 'Seafood Pizza',
    description: 'Seafood medley with garlic butter and cheese.',
    price: 'LKR 2,500',
    category: 'Pizza',
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Non-Veg'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500'
  },

  // Desserts
  {
    name: 'Chocolate Brownie',
    description: 'Fudgy chocolate brownie with rich cocoa.',
    price: 'LKR 750',
    category: 'Desserts',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg', 'Best Seller'],
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500'
  },
  {
    name: 'Ice Cream (1 scoop)',
    description: 'One scoop of creamy vanilla ice cream.',
    price: 'LKR 450',
    category: 'Desserts',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1497051788611-2c64812349fa?auto=format&fit=crop&w=500'
  },
  {
    name: 'Fruit Salad with Ice Cream',
    description: 'Seasonal fruits topped with ice cream.',
    price: 'LKR 850',
    category: 'Desserts',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1458642849426-cfb724f15ef7?auto=format&fit=crop&w=500'
  },
  {
    name: 'Watalappan',
    description: 'Classic Sri Lankan coconut custard.',
    price: 'LKR 600',
    category: 'Desserts',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg', 'Best Seller'],
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=500'
  },
  {
    name: 'Cheesecake',
    description: 'Creamy cheesecake with a buttery base.',
    price: 'LKR 950',
    category: 'Desserts',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1524351199679-46cddf3027c0?auto=format&fit=crop&w=500'
  },

  // Beverages
  {
    name: 'Fresh Lime Juice',
    description: 'Refreshing lime juice served chilled.',
    price: 'LKR 400',
    category: 'Beverages',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500'
  },
  {
    name: 'Iced Coffee',
    description: 'Cold brew coffee with a smooth finish.',
    price: 'LKR 550',
    category: 'Beverages',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500'
  },
  {
    name: 'Milkshakes',
    description: 'Creamy milkshakes in classic flavors.',
    price: 'LKR 750',
    category: 'Beverages',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500'
  },
  {
    name: 'Soft Drinks',
    description: 'Chilled fizzy soft drinks.',
    price: 'LKR 350',
    category: 'Beverages',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1510851896000-498520af2236?auto=format&fit=crop&w=500'
  },
  {
    name: 'Mineral Water',
    description: 'Pure bottled mineral water.',
    price: 'LKR 250',
    category: 'Beverages',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    tags: ['Veg'],
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500'
  },

  // Chef's Specials
  {
    name: 'Signature Chicken Kottu',
    description: 'Loaded kottu with signature spice blend.',
    price: 'LKR 1,450',
    category: "Chef's Specials",
    dietType: 'Non-Veg',
    spicyLevel: 'Hot',
    tags: ['Chef Special', 'Non-Veg', 'Spicy'],
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500'
  },
  {
    name: 'Seafood Platter',
    description: 'A premium platter of grilled seafood.',
    price: 'LKR 3,200',
    category: "Chef's Specials",
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Chef Special', 'Non-Veg'],
    image: 'https://images.unsplash.com/photo-1551248429-42435c47466f?auto=format&fit=crop&w=500'
  },
  {
    name: 'Mixed Grill',
    description: 'Assorted grilled meats with sides.',
    price: 'LKR 3,500',
    category: "Chef's Specials",
    dietType: 'Non-Veg',
    spicyLevel: 'Medium',
    tags: ['Chef Special', 'Non-Veg'],
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=500'
  },
  {
    name: 'Family Rice & Curry Set (4 pax)',
    description: 'Family feast with rice, curries, and sambol.',
    price: 'LKR 4,500',
    category: "Chef's Specials",
    dietType: 'Non-Veg',
    spicyLevel: 'Mild',
    tags: ['Chef Special', 'Best Seller', 'Non-Veg'],
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500'
  }
];

const sampleCategories = [
  { name: 'Starters', order: 1 },
  { name: 'Main Courses', order: 2 },
  { name: 'Rice & Noodles', order: 3 },
  { name: 'Burgers & Fast Food', order: 4 },
  { name: 'Pizza', order: 5 },
  { name: 'Desserts', order: 6 },
  { name: 'Beverages', order: 7 },
  { name: "Chef's Specials", order: 8 }
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

    // Create categories
    const existingCategories = await db.collection('categories').get();
    if (existingCategories.empty) {
      const batch = db.batch();
      sampleCategories.forEach((category) => {
        const docRef = db.collection('categories').doc();
        batch.set(docRef, {
          ...category,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
      console.log(`${sampleCategories.length} categories created`);
    } else {
      console.log('Categories already exist');
    }

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
