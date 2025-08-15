// قاعدة البيانات المحلية للموقع
class Database {
    constructor() {
        this.users = this.loadData('users') || [];
        this.delivery = this.loadData('delivery') || [];
        this.orders = this.loadData('orders') || [];
        this.offers = this.loadData('offers') || [];
        this.prices = this.loadData('prices') || [];
        this.notifications = this.loadData('notifications') || [];
        this.statistics = this.loadData('statistics') || {
            totalOrders: 0,
            totalUsers: 0,
            totalDelivery: 0,
            totalRevenue: 0
        };
    }

    // حفظ البيانات في التخزين المحلي
    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // تحميل البيانات من التخزين المحلي
    loadData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // إدارة المستخدمين
    addUser(user) {
        user.id = Date.now().toString();
        user.createdAt = new Date().toISOString();
        this.users.push(user);
        this.saveData('users', this.users);
        this.updateStatistics();
        return user;
    }

    getUsers() {
        return this.users;
    }

    getUserById(id) {
        return this.users.find(user => user.id === id);
    }

    updateUser(id, updatedData) {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedData };
            this.saveData('users', this.users);
            return this.users[index];
        }
        return null;
    }

    deleteUser(id) {
        this.users = this.users.filter(user => user.id !== id);
        this.saveData('users', this.users);
        this.updateStatistics();
    }

    // إدارة الديليفري
    addDelivery(delivery) {
        delivery.id = Date.now().toString();
        delivery.createdAt = new Date().toISOString();
        delivery.status = 'available'; // available, busy, offline
        delivery.totalOrders = 0;
        delivery.earnings = 0;
        this.delivery.push(delivery);
        this.saveData('delivery', this.delivery);
        this.updateStatistics();
        return delivery;
    }

    getDelivery() {
        return this.delivery;
    }

    getDeliveryById(id) {
        return this.delivery.find(d => d.id === id);
    }

    updateDelivery(id, updatedData) {
        const index = this.delivery.findIndex(d => d.id === id);
        if (index !== -1) {
            this.delivery[index] = { ...this.delivery[index], ...updatedData };
            this.saveData('delivery', this.delivery);
            return this.delivery[index];
        }
        return null;
    }

    deleteDelivery(id) {
        this.delivery = this.delivery.filter(d => d.id !== id);
        this.saveData('delivery', this.delivery);
        this.updateStatistics();
    }

    // إدارة الطلبات
    addOrder(order) {
        order.id = Date.now().toString();
        order.createdAt = new Date().toISOString();
        order.status = 'pending'; // pending, accepted, in_progress, delivered, cancelled
        order.deliveryId = null;
        this.orders.push(order);
        this.saveData('orders', this.orders);
        this.updateStatistics();
        return order;
    }

    getOrders() {
        return this.orders;
    }

    getOrderById(id) {
        return this.orders.find(order => order.id === id);
    }

    getOrdersByUserId(userId) {
        return this.orders.filter(order => order.userId === userId);
    }

    getOrdersByDeliveryId(deliveryId) {
        return this.orders.filter(order => order.deliveryId === deliveryId);
    }

    getPendingOrders() {
        return this.orders.filter(order => order.status === 'pending');
    }

    updateOrder(id, updatedData) {
        const index = this.orders.findIndex(order => order.id === id);
        if (index !== -1) {
            this.orders[index] = { ...this.orders[index], ...updatedData };
            this.saveData('orders', this.orders);
            
            // تحديث إحصائيات الديليفري
            if (updatedData.deliveryId) {
                const delivery = this.getDeliveryById(updatedData.deliveryId);
                if (delivery) {
                    if (updatedData.status === 'delivered') {
                        delivery.totalOrders += 1;
                        delivery.earnings += this.orders[index].total || 0;
                        this.updateDelivery(delivery.id, delivery);
                    }
                }
            }
            
            this.updateStatistics();
            return this.orders[index];
        }
        return null;
    }

    acceptOrder(orderId, deliveryId) {
        const order = this.getOrderById(orderId);
        const delivery = this.getDeliveryById(deliveryId);
        
        if (order && delivery && order.status === 'pending') {
            order.status = 'accepted';
            order.deliveryId = deliveryId;
            order.acceptedAt = new Date().toISOString();
            
            delivery.status = 'busy';
            
            this.updateOrder(orderId, order);
            this.updateDelivery(deliveryId, delivery);
            
            return true;
        }
        return false;
    }

    deleteOrder(id) {
        this.orders = this.orders.filter(order => order.id !== id);
        this.saveData('orders', this.orders);
        this.updateStatistics();
    }

    // إدارة العروض
    addOffer(offer) {
        offer.id = Date.now().toString();
        offer.createdAt = new Date().toISOString();
        this.offers.push(offer);
        this.saveData('offers', this.offers);
        return offer;
    }

    getOffers() {
        return this.offers;
    }

    updateOffer(id, updatedData) {
        const index = this.offers.findIndex(offer => offer.id === id);
        if (index !== -1) {
            this.offers[index] = { ...this.offers[index], ...updatedData };
            this.saveData('offers', this.offers);
            return this.offers[index];
        }
        return null;
    }

    deleteOffer(id) {
        this.offers = this.offers.filter(offer => offer.id !== id);
        this.saveData('offers', this.offers);
    }

    // إدارة الأسعار
    updatePrices(prices) {
        this.prices = prices;
        this.saveData('prices', this.prices);
    }

    getPrices() {
        return this.prices;
    }

    // إدارة الإشعارات
    addNotification(notification) {
        notification.id = Date.now().toString();
        notification.createdAt = new Date().toISOString();
        notification.read = false;
        this.notifications.push(notification);
        this.saveData('notifications', this.notifications);
        return notification;
    }

    getNotifications() {
        return this.notifications;
    }

    markNotificationAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveData('notifications', this.notifications);
        }
    }

    // تحديث الإحصائيات
    updateStatistics() {
        this.statistics = {
            totalOrders: this.orders.length,
            totalUsers: this.users.length,
            totalDelivery: this.delivery.length,
            totalRevenue: this.orders
                .filter(order => order.status === 'delivered')
                .reduce((sum, order) => sum + (order.total || 0), 0),
            pendingOrders: this.orders.filter(order => order.status === 'pending').length,
            completedOrders: this.orders.filter(order => order.status === 'delivered').length,
            activeDelivery: this.delivery.filter(d => d.status === 'busy').length
        };
        this.saveData('statistics', this.statistics);
    }

    getStatistics() {
        return this.statistics;
    }

    // تهيئة البيانات الافتراضية
    initializeDefaultData() {
        // إضافة مستخدمين افتراضيين
        if (this.users.length === 0) {
            this.addUser({
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '01234567890',
                address: 'القاهرة، مصر',
                type: 'customer'
            });
            
            this.addUser({
                name: 'فاطمة علي',
                email: 'fatima@example.com',
                phone: '01234567891',
                address: 'الإسكندرية، مصر',
                type: 'customer'
            });
        }

        // إضافة ديليفري افتراضي
        if (this.delivery.length === 0) {
            this.addDelivery({
                name: 'محمد أحمد',
                phone: '01234567892',
                vehicle: 'دراجة نارية',
                licenseNumber: 'ABC123',
                area: 'القاهرة'
            });
            
            this.addDelivery({
                name: 'علي حسن',
                phone: '01234567893',
                vehicle: 'سيارة',
                licenseNumber: 'XYZ789',
                area: 'الجيزة'
            });
        }

        // إضافة طلبات افتراضية
        if (this.orders.length === 0) {
            this.addOrder({
                userId: this.users[0]?.id,
                userPhone: this.users[0]?.phone,
                items: [
                    { name: 'بيتزا مارجريتا', quantity: 2, price: 50 },
                    { name: 'كوكا كولا', quantity: 2, price: 10 }
                ],
                total: 120,
                address: 'شارع التحرير، القاهرة',
                notes: 'الطابق الثالث'
            });
        }

        // إضافة عروض افتراضية
        if (this.offers.length === 0) {
            this.addOffer({
                title: 'عرض الافتتاح',
                description: 'خصم 20% على جميع الطلبات',
                discount: 20,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                active: true
            });
        }
    }
}

// إنشاء مثيل واحد من قاعدة البيانات
const db = new Database();

// تهيئة البيانات الافتراضية
db.initializeDefaultData();

// تصدير قاعدة البيانات للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = db;
} else {
    window.db = db;
}