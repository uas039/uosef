// Global Variables
let currentUser = null;
let places = [];
let users = [];
let orders = [];
let ads = [];
let offers = [];
let map = null;
let selectedLocation = null;

// Sample Data
const samplePlaces = [
    {
        id: 1,
        name: "مطعم الأصالة",
        category: "مطاعم",
        city: "طرابلس",
        location: "شارع الجمهورية",
        coordinates: { lat: 32.8872, lng: 13.1913 },
        description: "مطعم ليبي تقليدي يقدم أشهى الأطباق",
        phone: "021-1234567"
    },
    {
        id: 2,
        name: "سوق الخضار المركزي",
        category: "أسواق خضار",
        city: "بنغازي",
        location: "وسط المدينة",
        coordinates: { lat: 32.1181, lng: 20.0680 },
        description: "أفضل الخضروات الطازجة يومياً",
        phone: "061-7654321"
    },
    {
        id: 3,
        name: "سوبر ماركت النجمة",
        category: "أسواق غذائية",
        city: "مصراتة",
        location: "شارع طرابلس",
        coordinates: { lat: 32.3745, lng: 15.0919 },
        description: "جميع احتياجاتك الغذائية في مكان واحد",
        phone: "051-9876543"
    }
];

const sampleUsers = [
    {
        id: 1,
        name: "أحمد محمد",
        email: "admin@riyah.ly",
        password: "admin123",
        role: "admin",
        city: "طرابلس",
        phone: "091-1234567"
    },
    {
        id: 2,
        name: "فاطمة علي",
        email: "fatima@example.com",
        password: "user123",
        role: "customer",
        city: "بنغازي",
        phone: "092-7654321"
    },
    {
        id: 3,
        name: "محمد الدليفري",
        email: "delivery@riyah.ly",
        password: "delivery123",
        role: "delivery",
        city: "طرابلس",
        phone: "091-9876543"
    }
];

// بيانات طلبات تجريبية
const sampleOrders = [
    {
        id: 1,
        customerId: 2,
        customerName: "فاطمة علي",
        type: "custom",
        description: "طلب بيتزا مارجريتا كبيرة مع مشروبات غازية",
        status: "confirmed",
        createdAt: "2024-01-15T10:30:00.000Z",
        location: "بنغازي - الصابري",
        deliveryDriver: {
            name: "محمد الدليفري",
            phone: "091-9876543"
        }
    },
    {
        id: 2,
        customerId: 2,
        customerName: "فاطمة علي",
        type: "custom",
        description: "طلب خضروات طازجة من السوق المركزي",
        status: "pending",
        createdAt: "2024-01-16T14:20:00.000Z",
        location: "بنغازي - وسط المدينة",
        deliveryDriver: null
    }
];

const sampleOffers = [
    {
        id: 1,
        title: "خصم 20% على جميع الوجبات",
        description: "عرض خاص لفترة محدودة في مطعم الأصالة",
        placeId: 1,
        validUntil: "2024-12-31",
        discount: 20
    },
    {
        id: 2,
        title: "توصيل مجاني للطلبات فوق 50 دينار",
        description: "خدمة التوصيل المجاني من سوبر ماركت النجمة",
        placeId: 3,
        validUntil: "2024-12-25",
        discount: 0
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    displayResults(places);
    updateNavigation();
});

// Data Management
function loadData() {
    places = JSON.parse(localStorage.getItem('riyah_places')) || samplePlaces;
    users = JSON.parse(localStorage.getItem('riyah_users')) || sampleUsers;
    orders = JSON.parse(localStorage.getItem('riyah_orders')) || [];
    ads = JSON.parse(localStorage.getItem('riyah_ads')) || [];
    offers = JSON.parse(localStorage.getItem('riyah_offers')) || sampleOffers;
    currentUser = JSON.parse(localStorage.getItem('riyah_current_user'));
}

function saveData() {
    localStorage.setItem('riyah_places', JSON.stringify(places));
    localStorage.setItem('riyah_users', JSON.stringify(users));
    localStorage.setItem('riyah_orders', JSON.stringify(orders));
    localStorage.setItem('riyah_ads', JSON.stringify(ads));
    localStorage.setItem('riyah_offers', JSON.stringify(offers));
    localStorage.setItem('riyah_current_user', JSON.stringify(currentUser));
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Load section-specific data
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'special-offers':
            loadSpecialOffers();
            break;
        case 'my-orders':
            loadMyOrders();
            break;
    }
}

function updateNavigation() {
    const adminLinks = document.querySelectorAll('.admin-only');
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'system_admin')) {
        adminLinks.forEach(link => link.style.display = 'inline-block');
    } else {
        adminLinks.forEach(link => link.style.display = 'none');
    }
    
    // Update login/logout button
    const loginLink = document.querySelector('.nav-link[onclick="showSection(\'login\')"]');
    if (currentUser) {
        loginLink.textContent = 'تسجيل الخروج';
        loginLink.onclick = logout;
    } else {
        loginLink.textContent = 'تسجيل الدخول';
        loginLink.onclick = () => showSection('login');
    }
}

// Authentication
function showAuthTab(tab) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tab + 'Form').classList.add('active');
    event.target.classList.add('active');
}

function login(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        saveData();
        updateNavigation();
        showSection('home');
        showNotification('تم تسجيل الدخول بنجاح', 'success');
    } else {
        showNotification('بيانات الدخول غير صحيحة', 'error');
    }
}

function register(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const newUser = {
        id: users.length + 1,
        name: form.querySelector('input[placeholder="الاسم الكامل"]').value,
        email: form.querySelector('input[type="email"]').value,
        password: form.querySelector('input[type="password"]').value,
        phone: form.querySelector('input[type="tel"]').value,
        city: form.querySelector('select').value,
        role: 'customer',
        location: selectedLocation
    };
    
    // Check if email already exists
    if (users.find(u => u.email === newUser.email)) {
        showNotification('البريد الإلكتروني مستخدم بالفعل', 'error');
        return;
    }
    
    users.push(newUser);
    currentUser = newUser;
    saveData();
    updateNavigation();
    showSection('home');
    showNotification('تم إنشاء الحساب بنجاح', 'success');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('riyah_current_user');
    updateNavigation();
    showSection('home');
    showNotification('تم تسجيل الخروج بنجاح', 'success');
}

// Filtering and Search
function filterByCity() {
    applyFilters();
}

function filterByCategory() {
    applyFilters();
}

function applyFilters() {
    const cityFilter = document.getElementById('cityFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredPlaces = places;
    
    if (cityFilter) {
        filteredPlaces = filteredPlaces.filter(place => place.city === cityFilter);
    }
    
    if (categoryFilter) {
        filteredPlaces = filteredPlaces.filter(place => place.category === categoryFilter);
    }
    
    displayResults(filteredPlaces);
}

function displayResults(results) {
    const container = document.getElementById('resultsContainer');
    
    if (results.length === 0) {
        container.innerHTML = '<p class="no-results">لا توجد نتائج مطابقة للبحث</p>';
        return;
    }
    
    container.innerHTML = results.map(place => `
        <div class="result-card fade-in">
            <h4>${place.name}</h4>
            <span class="category">${place.category}</span>
            <div class="location"><i class="fas fa-map-marker-alt"></i> ${place.location}, ${place.city}</div>
            <p>${place.description}</p>
            <div class="actions">
                <button class="btn btn-primary btn-small" onclick="viewPlace(${place.id})">عرض التفاصيل</button>
                <button class="btn btn-secondary btn-small" onclick="orderFromPlace(${place.id})">طلب</button>
            </div>
        </div>
    `).join('');
}

// Custom Orders
function submitCustomOrder() {
    const orderText = document.getElementById('customOrder').value.trim();
    
    if (!orderText) {
        showNotification('يرجى كتابة طلبك', 'error');
        return;
    }
    
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول أولاً', 'error');
        showSection('login');
        return;
    }
    
    const newOrder = {
        id: orders.length + 1,
        customerId: currentUser.id,
        customerName: currentUser.name,
        type: 'custom',
        description: orderText,
        status: 'pending',
        createdAt: new Date().toISOString(),
        location: currentUser.location,
        deliveryDriver: null
    };
    
    orders.push(newOrder);
    saveData();
    
    document.getElementById('customOrder').value = '';
    showNotification('تم إرسال طلبك بنجاح', 'success');
    
    // انتقال إلى صفحة طلباتي
    showSection('my-orders');
    loadMyOrders();
}

function orderFromPlace(placeId) {
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول أولاً', 'error');
        showSection('login');
        return;
    }
    
    const place = places.find(p => p.id === placeId);
    const orderDescription = prompt(`اكتب طلبك من ${place.name}:`);
    
    if (!orderDescription) return;
    
    const newOrder = {
        id: orders.length + 1,
        customerId: currentUser.id,
        customerName: currentUser.name,
        placeId: placeId,
        placeName: place.name,
        type: 'place',
        description: orderDescription,
        status: 'pending',
        createdAt: new Date().toISOString(),
        location: currentUser.location
    };
    
    orders.push(newOrder);
    saveData();
    
    showNotification('تم إرسال طلبك بنجاح', 'success');
}

// Dashboard Functions
function showDashboardTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').style.display = 'block';
    
    // Load data based on tab
    switch(tabName) {
        case 'places':
            loadPlaces();
            break;
        case 'users':
            loadUsers();
            break;
        case 'offers':
            loadOffers();
            break;
        case 'orders':
            loadAdminOrders();
            break;
        case 'delivery':
            loadDeliveryManagement();
            break;
        case 'stats':
            loadStatistics();
            break;
    }
}

function loadDashboard() {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'system_admin')) {
        showNotification('غير مصرح لك بالوصول لهذه الصفحة', 'error');
        showSection('home');
        return;
    }
    loadPlacesList();
}

function loadPlacesList() {
    const container = document.getElementById('placesList');
    container.innerHTML = places.map(place => `
        <div class="list-item">
            <h4>${place.name}</h4>
            <p><strong>التصنيف:</strong> ${place.category}</p>
            <p><strong>المدينة:</strong> ${place.city}</p>
            <p><strong>الموقع:</strong> ${place.location}</p>
            <p><strong>الهاتف:</strong> ${place.phone}</p>
            <div class="actions">
                <button class="btn btn-secondary btn-small" onclick="editPlace(${place.id})">تعديل</button>
                <button class="btn btn-primary btn-small" onclick="deletePlace(${place.id})">حذف</button>
            </div>
        </div>
    `).join('');
}

function loadUsersList() {
    const container = document.getElementById('usersList');
    container.innerHTML = users.map(user => `
        <div class="list-item">
            <h4>${user.name}</h4>
            <p><strong>البريد:</strong> ${user.email}</p>
            <p><strong>الدور:</strong> ${user.role}</p>
            <p><strong>المدينة:</strong> ${user.city}</p>
            <p><strong>الهاتف:</strong> ${user.phone}</p>
            <div class="actions">
                <button class="btn btn-secondary btn-small" onclick="changeUserRole(${user.id})">تغيير الدور</button>
                <button class="btn btn-primary btn-small" onclick="deleteUser(${user.id})">حذف</button>
            </div>
        </div>
    `).join('');
}

function loadOrders() {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'system_admin')) {
        showNotification('غير مصرح لك بالوصول لهذه الصفحة', 'error');
        showSection('home');
        return;
    }
    
    const container = document.getElementById('ordersList');
    container.innerHTML = orders.map(order => `
        <div class="list-item">
            <h4>طلب #${order.id}</h4>
            <p><strong>العميل:</strong> ${order.customerName}</p>
            <p><strong>النوع:</strong> ${order.type === 'custom' ? 'طلب خاص' : order.placeName}</p>
            <p><strong>الوصف:</strong> ${order.description}</p>
            <p><strong>الحالة:</strong> <span class="status ${order.status}">${getStatusText(order.status)}</span></p>
            <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-LY')}</p>
            <div class="actions">
                <button class="btn btn-secondary btn-small" onclick="updateOrderStatus(${order.id}, 'confirmed')">تأكيد</button>
                <button class="btn btn-primary btn-small" onclick="updateOrderStatus(${order.id}, 'cancelled')">إلغاء</button>
            </div>
        </div>
    `).join('');
}

function loadSpecialOffers() {
    const container = document.getElementById('specialOffersList');
    container.innerHTML = offers.map(offer => {
        const place = places.find(p => p.id === offer.placeId);
        return `
            <div class="offer-card">
                <span class="offer-badge">عرض خاص</span>
                <h4>${offer.title}</h4>
                <p>${offer.description}</p>
                <p><strong>المكان:</strong> ${place ? place.name : 'غير محدد'}</p>
                <p><strong>صالح حتى:</strong> ${new Date(offer.validUntil).toLocaleDateString('ar-LY')}</p>
                ${offer.discount > 0 ? `<p class="currency">خصم ${offer.discount}%</p>` : ''}
            </div>
        `;
    }).join('');
}

// Helper Functions
function getStatusText(status) {
    const statusMap = {
        'pending': 'في الانتظار',
        'confirmed': 'مؤكد',
        'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveData();
        loadOrders();
        showNotification('تم تحديث حالة الطلب', 'success');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#27ae60';
            break;
        case 'error':
            notification.style.backgroundColor = '#e74c3c';
            break;
        default:
            notification.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Location and Maps
function pickLocation() {
    document.getElementById('locationModal').style.display = 'block';
    setTimeout(initMap, 100);
}

function initMap() {
    if (!map) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 32.8872, lng: 13.1913 }, // Tripoli coordinates
            zoom: 10
        });
        
        map.addListener('click', function(event) {
            selectedLocation = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            };
            
            // Clear previous markers
            if (window.currentMarker) {
                window.currentMarker.setMap(null);
            }
            
            // Add new marker
            window.currentMarker = new google.maps.Marker({
                position: selectedLocation,
                map: map,
                title: 'الموقع المحدد'
            });
        });
    }
}

function confirmLocation() {
    if (selectedLocation) {
        document.getElementById('locationDisplay').innerHTML = `
            <i class="fas fa-map-marker-alt"></i> 
            تم تحديد الموقع: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}
        `;
        closeModal('locationModal');
    } else {
        showNotification('يرجى اختيار موقع على الخريطة', 'error');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Additional Dashboard Functions
function showAddPlaceForm() {
    const form = prompt('اسم المكان:');
    if (form) {
        // This would typically open a proper form modal
        showNotification('سيتم إضافة نموذج إضافة الأماكن قريباً', 'info');
    }
}

function editPlace(placeId) {
    const place = places.find(p => p.id === placeId);
    const newName = prompt('اسم المكان الجديد:', place.name);
    if (newName && newName !== place.name) {
        place.name = newName;
        saveData();
        loadPlacesList();
        showNotification('تم تحديث المكان بنجاح', 'success');
    }
}

function deletePlace(placeId) {
    if (confirm('هل أنت متأكد من حذف هذا المكان؟')) {
        places = places.filter(p => p.id !== placeId);
        saveData();
        loadPlacesList();
        displayResults(places);
        showNotification('تم حذف المكان بنجاح', 'success');
    }
}

function changeUserRole(userId) {
    const user = users.find(u => u.id === userId);
    const newRole = prompt('الدور الجديد (customer/admin):', user.role);
    if (newRole && ['customer', 'admin'].includes(newRole)) {
        user.role = newRole;
        saveData();
        loadUsersList();
        showNotification('تم تحديث دور المستخدم', 'success');
    }
}

function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        users = users.filter(u => u.id !== userId);
        saveData();
        loadUsersList();
        showNotification('تم حذف المستخدم بنجاح', 'success');
    }
}

function viewPlace(placeId) {
    const place = places.find(p => p.id === placeId);
    alert(`تفاصيل ${place.name}:\n\nالتصنيف: ${place.category}\nالمدينة: ${place.city}\nالموقع: ${place.location}\nالهاتف: ${place.phone}\nالوصف: ${place.description}`);
}

// وظائف إدارة صفحة طلباتي
function loadMyOrders() {
    if (!currentUser) return;
    
    const userOrders = orders.filter(order => order.customerId === currentUser.id);
    const myOrdersList = document.getElementById('myOrdersList');
    
    if (userOrders.length === 0) {
        myOrdersList.innerHTML = '<p class="no-orders">لا توجد طلبات حتى الآن</p>';
        return;
    }
    
    myOrdersList.innerHTML = userOrders.map(order => {
        const statusClass = order.status === 'pending' ? 'pending' : 
                           order.status === 'confirmed' ? 'confirmed' : 
                           order.status === 'delivered' ? 'delivered' : 'cancelled';
        
        const deliveryInfo = order.deliveryDriver ? 
            `<div class="delivery-info">
                <h4>معلومات الدليفري:</h4>
                <p><strong>الاسم:</strong> ${order.deliveryDriver.name}</p>
                <p><strong>الهاتف:</strong> ${order.deliveryDriver.phone}</p>
            </div>` : '';
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-status ${statusClass}">${getStatusText(order.status)}</span>
                </div>
                <div class="order-details">
                    <p><strong>الطلب:</strong> ${order.description}</p>
                    <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                    ${order.placeName ? `<p><strong>المكان:</strong> ${order.placeName}</p>` : ''}
                    ${deliveryInfo}
                </div>
            </div>
        `;
    }).join('');
}

function filterMyOrders(status) {
    if (!currentUser) return;
    
    // تحديث أزرار التصفية
    document.querySelectorAll('.orders-filter .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const userOrders = orders.filter(order => {
        if (order.customerId !== currentUser.id) return false;
        if (status === 'all') return true;
        return order.status === status;
    });
    
    const myOrdersList = document.getElementById('myOrdersList');
    
    if (userOrders.length === 0) {
        myOrdersList.innerHTML = '<p class="no-orders">لا توجد طلبات في هذه الفئة</p>';
        return;
    }
    
    myOrdersList.innerHTML = userOrders.map(order => {
        const statusClass = order.status === 'pending' ? 'pending' : 
                           order.status === 'confirmed' ? 'confirmed' : 
                           order.status === 'delivered' ? 'delivered' : 'cancelled';
        
        const deliveryInfo = order.deliveryDriver ? 
            `<div class="delivery-info">
                <h4>معلومات الدليفري:</h4>
                <p><strong>الاسم:</strong> ${order.deliveryDriver.name}</p>
                <p><strong>الهاتف:</strong> ${order.deliveryDriver.phone}</p>
            </div>` : '';
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-status ${statusClass}">${getStatusText(order.status)}</span>
                </div>
                <div class="order-details">
                    <p><strong>الطلب:</strong> ${order.description}</p>
                    <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                    ${order.placeName ? `<p><strong>المكان:</strong> ${order.placeName}</p>` : ''}
                    ${deliveryInfo}
                </div>
            </div>
        `;
    }).join('');
}

// إدارة الطلبات للأدمن
function loadAdminOrders() {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">لا توجد طلبات حالياً</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => {
        const statusClass = order.status === 'pending' ? 'pending' : 
                           order.status === 'confirmed' ? 'confirmed' : 
                           order.status === 'delivered' ? 'delivered' : 'cancelled';
        
        const customer = users.find(u => u.id === order.customerId);
        const customerName = customer ? customer.name : 'غير معروف';
        
        return `
            <div class="admin-order-card">
                <div class="admin-order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-status ${statusClass}">${getStatusText(order.status)}</span>
                </div>
                <div class="admin-order-details">
                    <p><strong>العميل:</strong> ${customerName}</p>
                    <p><strong>الطلب:</strong> ${order.description}</p>
                    <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                    <p><strong>الموقع:</strong> ${order.location || 'غير محدد'}</p>
                    ${order.deliveryDriver ? `<p><strong>الدليفري:</strong> ${order.deliveryDriver.name}</p>` : ''}
                </div>
                <div class="admin-order-actions">
                    ${order.status === 'pending' ? `<button class="btn btn-success" onclick="assignDelivery(${order.id})">تعيين دليفري</button>` : ''}
                    ${order.status === 'confirmed' ? `<button class="btn btn-primary" onclick="markAsDelivered(${order.id})">تم التسليم</button>` : ''}
                    <button class="btn btn-danger" onclick="cancelOrder(${order.id})">إلغاء الطلب</button>
                </div>
            </div>
        `;
    }).join('');
}

// إدارة الدليفري
function loadDeliveryManagement() {
    const deliveryList = document.getElementById('deliveryList');
    const deliveryUsers = users.filter(user => user.role === 'delivery');
    
    if (deliveryUsers.length === 0) {
        deliveryList.innerHTML = '<p class="no-orders">لا يوجد دليفري مسجل</p>';
        return;
    }
    
    deliveryList.innerHTML = deliveryUsers.map(delivery => {
        const deliveryOrders = orders.filter(order => 
            order.deliveryDriver && order.deliveryDriver.name === delivery.name
        );
        const completedOrders = deliveryOrders.filter(order => order.status === 'delivered').length;
        const activeOrders = deliveryOrders.filter(order => order.status === 'confirmed').length;
        
        return `
            <div class="delivery-card">
                <h4>${delivery.name}</h4>
                <p><strong>البريد الإلكتروني:</strong> ${delivery.email}</p>
                <p><strong>الهاتف:</strong> ${delivery.phone}</p>
                <p><strong>المدينة:</strong> ${delivery.city}</p>
                <div class="delivery-stats">
                    <div class="delivery-stat">
                        <span class="number">${completedOrders}</span>
                        <span class="label">طلبات مكتملة</span>
                    </div>
                    <div class="delivery-stat">
                        <span class="number">${activeOrders}</span>
                        <span class="label">طلبات نشطة</span>
                    </div>
                    <div class="delivery-stat">
                        <span class="number">${deliveryOrders.length}</span>
                        <span class="label">إجمالي الطلبات</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// تحميل الإحصائيات
function loadStatistics() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // حساب الزيارات (محاكاة)
    const dailyVisits = Math.floor(Math.random() * 100) + 50;
    const monthlyVisits = Math.floor(Math.random() * 2000) + 1000;
    const yearlyVisits = Math.floor(Math.random() * 20000) + 10000;
    
    // حساب الطلبات
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
    }).length;
    
    const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;
    
    const yearlyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === currentYear;
    }).length;
    
    // تحديث العناصر
    document.getElementById('dailyVisits').textContent = dailyVisits;
    document.getElementById('monthlyVisits').textContent = monthlyVisits;
    document.getElementById('yearlyVisits').textContent = yearlyVisits;
    document.getElementById('dailyOrders').textContent = todayOrders;
    document.getElementById('monthlyOrders').textContent = monthlyOrders;
    document.getElementById('yearlyOrders').textContent = yearlyOrders;
}

// تعيين دليفري للطلب
function assignDelivery(orderId) {
    const deliveryUsers = users.filter(user => user.role === 'delivery');
    
    if (deliveryUsers.length === 0) {
        showNotification('لا يوجد دليفري متاح', 'error');
        return;
    }
    
    // اختيار دليفري عشوائي (يمكن تحسينه لاحقاً)
    const randomDelivery = deliveryUsers[Math.floor(Math.random() * deliveryUsers.length)];
    
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'confirmed';
        orders[orderIndex].deliveryDriver = {
            name: randomDelivery.name,
            phone: randomDelivery.phone
        };
        saveData();
        loadAdminOrders();
        showNotification('تم تعيين الدليفري بنجاح', 'success');
    }
}

// تحديد الطلب كمسلم
function markAsDelivered(orderId) {
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'delivered';
        saveData();
        loadAdminOrders();
        showNotification('تم تحديث حالة الطلب إلى مسلم', 'success');
    }
}

// إلغاء الطلب
function cancelOrder(orderId) {
    if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
        const orderIndex = orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'cancelled';
            saveData();
            loadAdminOrders();
            showNotification('تم إلغاء الطلب', 'info');
        }
    }
}

// إضافة دليفري جديد
function showAddDeliveryForm() {
    const name = prompt('اسم الدليفري:');
    const email = prompt('البريد الإلكتروني:');
    const phone = prompt('رقم الهاتف:');
    const password = prompt('كلمة المرور:');
    const city = prompt('المدينة:');
    
    if (name && email && phone && password && city) {
        const newDelivery = {
            id: users.length + 1,
            name: name,
            email: email,
            password: password,
            role: 'delivery',
            city: city,
            phone: phone
        };
        
        users.push(newDelivery);
        saveData();
        loadDeliveryManagement();
        showNotification('تم إضافة الدليفري بنجاح', 'success');
    }
}

// Initialize sample data on first load
if (!localStorage.getItem('riyah_places')) {
    places = [...samplePlaces];
    users = [...sampleUsers];
    orders = [...sampleOrders];
    offers = [...sampleOffers];
    saveData();
}

// System Admin Functions
function checkSystemAdminAccess() {
    // Check if current user is system admin
    const isSystemAdmin = currentUser && (currentUser.role === 'system_admin' || currentUser.email === 'admin@riyah.ly');
    
    // Show/hide system admin elements
    const systemAdminElements = document.querySelectorAll('.system-admin-only');
    systemAdminElements.forEach(element => {
        element.style.display = isSystemAdmin ? 'block' : 'none';
    });
    
    return isSystemAdmin;
}

// Freeze Control Functions
let isFrozen = false;
let currentPosition = 'center';

function toggleFreeze() {
    isFrozen = !isFrozen;
    const freezeBtn = document.getElementById('freezeToggle');
    const freezeStatus = document.getElementById('freezeStatus');
    const customOrderBox = document.querySelector('.custom-order');
    const notificationsBox = document.querySelector('.notifications-section');
    
    if (isFrozen) {
        freezeBtn.innerHTML = '<i class="fas fa-play"></i> إلغاء التجميد';
        freezeBtn.classList.add('frozen');
        freezeStatus.textContent = 'الحالة: مجمد';
        
        // Disable order box
        if (customOrderBox) {
            customOrderBox.style.pointerEvents = 'none';
            customOrderBox.style.opacity = '0.5';
        }
        
        // Disable notifications
        if (notificationsBox) {
            notificationsBox.style.pointerEvents = 'none';
            notificationsBox.style.opacity = '0.5';
        }
        
        showNotification('تم تجميد الطلبات والدردشة', 'warning');
    } else {
        freezeBtn.innerHTML = '<i class="fas fa-pause"></i> تجميد الطلبات والدردشة';
        freezeBtn.classList.remove('frozen');
        freezeStatus.textContent = 'الحالة: نشط';
        
        // Enable order box
        if (customOrderBox) {
            customOrderBox.style.pointerEvents = 'auto';
            customOrderBox.style.opacity = '1';
        }
        
        // Enable notifications
        if (notificationsBox) {
            notificationsBox.style.pointerEvents = 'auto';
            notificationsBox.style.opacity = '1';
        }
        
        showNotification('تم إلغاء تجميد الطلبات والدردشة', 'success');
    }
    
    // Save freeze state
    localStorage.setItem('freeze_state', JSON.stringify({ isFrozen, currentPosition }));
}

function moveBoxLeft() {
    const customOrderBox = document.querySelector('.custom-order');
    const notificationsBox = document.querySelector('.notifications-section');
    
    if (customOrderBox && notificationsBox) {
        customOrderBox.style.transform = 'translateX(-20px)';
        notificationsBox.style.transform = 'translateX(-20px)';
        currentPosition = 'left';
        
        showNotification('تم تحريك الصناديق إلى اليسار', 'info');
        localStorage.setItem('freeze_state', JSON.stringify({ isFrozen, currentPosition }));
    }
}

function moveBoxRight() {
    const customOrderBox = document.querySelector('.custom-order');
    const notificationsBox = document.querySelector('.notifications-section');
    
    if (customOrderBox && notificationsBox) {
        customOrderBox.style.transform = 'translateX(20px)';
        notificationsBox.style.transform = 'translateX(20px)';
        currentPosition = 'right';
        
        showNotification('تم تحريك الصناديق إلى اليمين', 'info');
        localStorage.setItem('freeze_state', JSON.stringify({ isFrozen, currentPosition }));
    }
}

// Load freeze state on page load
function loadFreezeState() {
    const savedState = localStorage.getItem('freeze_state');
    if (savedState) {
        const state = JSON.parse(savedState);
        isFrozen = state.isFrozen;
        currentPosition = state.currentPosition;
        
        if (isFrozen) {
            toggleFreeze();
        }
        
        if (currentPosition === 'left') {
            moveBoxLeft();
        } else if (currentPosition === 'right') {
            moveBoxRight();
        }
    }
}

// Enhanced login function to check system admin access
const originalLogin = login;
function login(event) {
    const result = originalLogin(event);
    setTimeout(() => {
        checkSystemAdminAccess();
        loadFreezeState();
    }, 100);
    return result;
}

// Enhanced page load to check system admin access
const originalLoadData = loadData;
function loadData() {
    originalLoadData();
    setTimeout(() => {
        checkSystemAdminAccess();
        loadFreezeState();
    }, 100);
}

// Database Integration Functions
function initializeDatabase() {
    // Load database script if not already loaded
    if (typeof db === 'undefined') {
        const script = document.createElement('script');
        script.src = 'database.js';
        script.onload = function() {
            console.log('Database initialized successfully');
            syncWithDatabase();
        };
        document.head.appendChild(script);
    } else {
        syncWithDatabase();
    }
}

function syncWithDatabase() {
    if (typeof db !== 'undefined') {
        // Sync existing data with database
        places.forEach(place => {
            if (!db.getPlaceById || !db.getPlaceById(place.id)) {
                // Add place to database if it doesn't exist
                if (db.addPlace) {
                    db.addPlace(place);
                }
            }
        });
        
        users.forEach(user => {
            if (!db.getUserById || !db.getUserById(user.id)) {
                // Add user to database if it doesn't exist
                if (db.addUser) {
                    db.addUser(user);
                }
            }
        });
        
        orders.forEach(order => {
            if (!db.getOrderById || !db.getOrderById(order.id)) {
                // Add order to database if it doesn't exist
                if (db.addOrder) {
                    db.addOrder(order);
                }
            }
        });
        
        console.log('Data synchronized with database');
    }
}

// Initialize database on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeDatabase, 500);
});