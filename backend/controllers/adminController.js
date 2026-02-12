const { getDb, admin } = require('../config/firebaseAdmin');

const normalizeDateKey = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const normalizeMonthKey = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

const getTimestamp = (value) => {
  if (!value) {
    return null;
  }
  if (value.toDate) {
    return value.toDate();
  }
  return new Date(value);
};

const ensureNumber = (value) => (Number.isFinite(value) ? value : 0);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const db = getDb();

    const paymentsSnapshot = await db.collection('payments')
      .where('status', '==', 'Completed')
      .get();
    const payments = paymentsSnapshot.docs.map((doc) => doc.data());
    const totalRevenue = payments.reduce((sum, payment) => sum + ensureNumber(payment.amount), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPaymentsSnapshot = await db.collection('payments')
      .where('status', '==', 'Completed')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(tomorrow))
      .get();
    const todayPayments = todayPaymentsSnapshot.docs.map((doc) => doc.data());
    const dailyRevenue = todayPayments.reduce((sum, payment) => sum + ensureNumber(payment.amount), 0);

    const ordersSnapshot = await db.collection('orders').get();
    const todayOrdersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(tomorrow))
      .get();
    const reservationsSnapshot = await db.collection('reservations').get();
    const pendingOrdersSnapshot = await db.collection('orders')
      .where('orderStatus', '==', 'Pending')
      .get();
    const confirmedReservationsSnapshot = await db.collection('reservations')
      .where('status', '==', 'Confirmed')
      .get();

    const usersSnapshot = await db.collection('users').get();

    const orders = ordersSnapshot.docs.map((doc) => doc.data());
    const itemCounts = new Map();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const current = itemCounts.get(item.name) || 0;
        itemCounts.set(item.name, current + ensureNumber(item.quantity));
      });
    });

    let bestSellingItem = null;
    itemCounts.forEach((count, name) => {
      if (!bestSellingItem || count > bestSellingItem.quantity) {
        bestSellingItem = { name, quantity: count };
      }
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        dailyRevenue,
        totalOrders: ordersSnapshot.size,
        todayOrders: todayOrdersSnapshot.size,
        totalReservations: reservationsSnapshot.size,
        pendingOrders: pendingOrdersSnapshot.size,
        confirmedReservations: confirmedReservationsSnapshot.size,
        totalCustomers: usersSnapshot.size,
        bestSellingItem
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/reservations
// @desc    Get all reservations (Admin)
// @access  Private/Admin
exports.getAllReservations = async (req, res) => {
  try {
    const db = getDb();
    const reservationsSnapshot = await db.collection('reservations')
      .orderBy('createdAt', 'desc')
      .get();
    const reservations = reservationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const db = getDb();
    const ordersSnapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();
    const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/customers
// @desc    Get all customers with spend data
// @access  Private/Admin
exports.getCustomers = async (req, res) => {
  try {
    const db = getDb();
    const usersSnapshot = await db.collection('users').get();
    const ordersSnapshot = await db.collection('orders').get();
    const paymentsSnapshot = await db.collection('payments')
      .where('status', '==', 'Completed')
      .get();

    const orders = ordersSnapshot.docs.map((doc) => doc.data());
    const payments = paymentsSnapshot.docs.map((doc) => doc.data());

    const ordersByUser = new Map();
    orders.forEach((order) => {
      const current = ordersByUser.get(order.userId) || 0;
      ordersByUser.set(order.userId, current + 1);
    });

    const spendByUser = new Map();
    payments.forEach((payment) => {
      const current = spendByUser.get(payment.userId) || 0;
      spendByUser.set(payment.userId, current + ensureNumber(payment.amount));
    });

    const customers = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        blocked: !!data.blocked,
        totalOrders: ordersByUser.get(doc.id) || 0,
        totalSpending: spendByUser.get(doc.id) || 0
      };
    });

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/admin/customers/:id/block
// @desc    Block or unblock a customer
// @access  Private/Admin
exports.updateCustomerBlock = async (req, res) => {
  try {
    const { blocked } = req.body;
    const db = getDb();
    const docRef = db.collection('users').doc(req.params.id);

    await docRef.set({ blocked: !!blocked }, { merge: true });

    res.json({ success: true, data: { id: req.params.id, blocked: !!blocked } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/categories
// @desc    Get all categories
// @access  Private/Admin
exports.getCategories = async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('categories')
      .orderBy('order', 'asc')
      .get();
    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/admin/categories
// @desc    Create a category
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, order } = req.body;
    const db = getDb();

    const payload = {
      name,
      order: ensureNumber(order),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('categories').add(payload);

    res.status(201).json({ success: true, data: { id: docRef.id, ...payload } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/admin/categories/:id
// @desc    Update a category
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, order } = req.body;
    const db = getDb();
    const docRef = db.collection('categories').doc(req.params.id);

    const payload = {
      name,
      order: order === undefined ? undefined : ensureNumber(order),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    await docRef.set(payload, { merge: true });

    const doc = await docRef.get();
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/admin/categories/:id
// @desc    Delete a category
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('categories').doc(req.params.id).delete();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/offers
// @desc    Get all offers
// @access  Private/Admin
exports.getOffers = async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('offers')
      .orderBy('createdAt', 'desc')
      .get();
    const offers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/admin/offers
// @desc    Create an offer
// @access  Private/Admin
exports.createOffer = async (req, res) => {
  try {
    const { code, discountPercent, expiryDate, active } = req.body;
    const db = getDb();

    const payload = {
      code,
      discountPercent: ensureNumber(discountPercent),
      expiryDate: expiryDate
        ? admin.firestore.Timestamp.fromDate(new Date(expiryDate))
        : null,
      active: active !== false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('offers').add(payload);
    res.status(201).json({ success: true, data: { id: docRef.id, ...payload } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/admin/offers/:id
// @desc    Update an offer
// @access  Private/Admin
exports.updateOffer = async (req, res) => {
  try {
    const { code, discountPercent, expiryDate, active } = req.body;
    const db = getDb();
    const docRef = db.collection('offers').doc(req.params.id);

    const payload = {
      code,
      discountPercent: discountPercent === undefined ? undefined : ensureNumber(discountPercent),
      expiryDate: expiryDate
        ? admin.firestore.Timestamp.fromDate(new Date(expiryDate))
        : expiryDate === null
          ? null
          : undefined,
      active,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    await docRef.set(payload, { merge: true });
    const doc = await docRef.get();
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/admin/offers/:id
// @desc    Delete an offer
// @access  Private/Admin
exports.deleteOffer = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('offers').doc(req.params.id).delete();
    res.json({ success: true, message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/deliveries
// @desc    Get delivery assignments
// @access  Private/Admin
exports.getDeliveries = async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('deliveries')
      .orderBy('createdAt', 'desc')
      .get();
    const deliveries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/admin/deliveries
// @desc    Create delivery assignment
// @access  Private/Admin
exports.createDelivery = async (req, res) => {
  try {
    const { orderId, assignedTo, status } = req.body;
    const db = getDb();

    const payload = {
      orderId,
      assignedTo: assignedTo || null,
      status: status || 'Pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('deliveries').add(payload);
    res.status(201).json({ success: true, data: { id: docRef.id, ...payload } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/admin/deliveries/:id
// @desc    Update delivery assignment
// @access  Private/Admin
exports.updateDelivery = async (req, res) => {
  try {
    const { assignedTo, status } = req.body;
    const db = getDb();
    const docRef = db.collection('deliveries').doc(req.params.id);

    const payload = {
      assignedTo,
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    await docRef.set(payload, { merge: true });
    const doc = await docRef.get();
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/admin/deliveries/:id
// @desc    Delete delivery assignment
// @access  Private/Admin
exports.deleteDelivery = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('deliveries').doc(req.params.id).delete();
    res.json({ success: true, message: 'Delivery deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/settings
// @desc    Get restaurant settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('settings').doc('restaurant').get();

    res.json({ success: true, data: doc.exists ? doc.data() : {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/admin/settings
// @desc    Update restaurant settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const db = getDb();
    const payload = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('settings').doc('restaurant').set(payload, { merge: true });
    const doc = await db.collection('settings').doc('restaurant').get();
    res.json({ success: true, data: doc.data() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/reports
// @desc    Get sales and revenue reports
// @access  Private/Admin
exports.getSalesReports = async (req, res) => {
  try {
    const db = getDb();
    const paymentsSnapshot = await db.collection('payments')
      .where('status', '==', 'Completed')
      .get();
    const ordersSnapshot = await db.collection('orders').get();

    const payments = paymentsSnapshot.docs.map((doc) => doc.data());
    const orders = ordersSnapshot.docs.map((doc) => doc.data());

    const dailyTotals = new Map();
    const monthlyTotals = new Map();
    const itemTotals = new Map();
    const categoryTotals = new Map();

    payments.forEach((payment) => {
      const date = getTimestamp(payment.createdAt);
      if (!date) {
        return;
      }
      const dailyKey = normalizeDateKey(date);
      const monthlyKey = normalizeMonthKey(date);
      dailyTotals.set(dailyKey, (dailyTotals.get(dailyKey) || 0) + ensureNumber(payment.amount));
      monthlyTotals.set(monthlyKey, (monthlyTotals.get(monthlyKey) || 0) + ensureNumber(payment.amount));
    });

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const itemKey = item.name || 'Unknown Item';
        itemTotals.set(itemKey, (itemTotals.get(itemKey) || 0) + ensureNumber(item.quantity));

        const categoryKey = item.category || 'Uncategorized';
        categoryTotals.set(
          categoryKey,
          (categoryTotals.get(categoryKey) || 0) + ensureNumber(item.price) * ensureNumber(item.quantity)
        );
      });
    });

    const dailySales = Array.from(dailyTotals.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    const monthlySales = Array.from(monthlyTotals.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));

    const mostOrderedItems = Array.from(itemTotals.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const revenueByCategory = Array.from(categoryTotals.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      data: {
        dailySales,
        monthlySales,
        mostOrderedItems,
        revenueByCategory
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/orders/stream
// @desc    Stream real-time order updates (SSE)
// @access  Private/Admin
exports.streamOrders = async (req, res) => {
  try {
    const db = getDb();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const snapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    sendEvent({ type: 'init', orders });

    const unsubscribe = db.collection('orders')
      .orderBy('createdAt', 'desc')
      .onSnapshot((changeSnap) => {
        const changes = changeSnap.docChanges().map((change) => ({
          type: change.type,
          order: { id: change.doc.id, ...change.doc.data() }
        }));
        sendEvent({ type: 'changes', changes });
      }, (error) => {
        sendEvent({ type: 'error', message: error.message });
      });

    const keepAlive = setInterval(() => {
      res.write(':keep-alive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/menu/stream
// @desc    Stream real-time menu item updates (SSE)
// @access  Private/Admin
exports.streamMenuItems = async (req, res) => {
  try {
    const db = getDb();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const snapshot = await db.collection('menuItems')
      .orderBy('createdAt', 'desc')
      .get();
    const menuItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    sendEvent({ type: 'init', menuItems });

    const unsubscribe = db.collection('menuItems')
      .orderBy('createdAt', 'desc')
      .onSnapshot((changeSnap) => {
        const changes = changeSnap.docChanges().map((change) => ({
          type: change.type,
          item: { id: change.doc.id, ...change.doc.data() }
        }));
        sendEvent({ type: 'changes', changes });
      }, (error) => {
        sendEvent({ type: 'error', message: error.message });
      });

    const keepAlive = setInterval(() => {
      res.write(':keep-alive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/deliveries/stream
// @desc    Stream real-time delivery updates (SSE)
// @access  Private/Admin
exports.streamDeliveries = async (req, res) => {
  try {
    const db = getDb();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const snapshot = await db.collection('deliveries')
      .orderBy('createdAt', 'desc')
      .get();
    const deliveries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    sendEvent({ type: 'init', deliveries });

    const unsubscribe = db.collection('deliveries')
      .orderBy('createdAt', 'desc')
      .onSnapshot((changeSnap) => {
        const changes = changeSnap.docChanges().map((change) => ({
          type: change.type,
          delivery: { id: change.doc.id, ...change.doc.data() }
        }));
        sendEvent({ type: 'changes', changes });
      }, (error) => {
        sendEvent({ type: 'error', message: error.message });
      });

    const keepAlive = setInterval(() => {
      res.write(':keep-alive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/categories/stream
// @desc    Stream real-time category updates (SSE)
// @access  Private/Admin
exports.streamCategories = async (req, res) => {
  try {
    const db = getDb();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const snapshot = await db.collection('categories')
      .orderBy('order', 'asc')
      .get();
    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    sendEvent({ type: 'init', categories });

    const unsubscribe = db.collection('categories')
      .orderBy('order', 'asc')
      .onSnapshot((changeSnap) => {
        const changes = changeSnap.docChanges().map((change) => ({
          type: change.type,
          category: { id: change.doc.id, ...change.doc.data() }
        }));
        sendEvent({ type: 'changes', changes });
      }, (error) => {
        sendEvent({ type: 'error', message: error.message });
      });

    const keepAlive = setInterval(() => {
      res.write(':keep-alive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/offers/stream
// @desc    Stream real-time offer updates (SSE)
// @access  Private/Admin
exports.streamOffers = async (req, res) => {
  try {
    const db = getDb();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const snapshot = await db.collection('offers')
      .orderBy('createdAt', 'desc')
      .get();
    const offers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    sendEvent({ type: 'init', offers });

    const unsubscribe = db.collection('offers')
      .orderBy('createdAt', 'desc')
      .onSnapshot((changeSnap) => {
        const changes = changeSnap.docChanges().map((change) => ({
          type: change.type,
          offer: { id: change.doc.id, ...change.doc.data() }
        }));
        sendEvent({ type: 'changes', changes });
      }, (error) => {
        sendEvent({ type: 'error', message: error.message });
      });

    const keepAlive = setInterval(() => {
      res.write(':keep-alive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
