// js/backendless-client.js
const APP_ID = 'D40D4235-0F8F-43E0-92AC-93E04D6D3F9B';
const REST_API_KEY = 'F728B349-E69E-4BAB-AA95-D80616238BE9';
const BASE_URL = 'https://api.backendless.com';

async function callBackendless(endpoint, method = 'GET', data = null) {
    const url = `${BASE_URL}/${APP_ID}/${REST_API_KEY}/${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    return await response.json();
}

// Sign Up
async function signUp(name, email, password, phone, address, role) {
    const data = {
        name: name,
        email: email,
        password: password,
        phone: phone,
        address: address,
        role: role || 'both'
    };
    const result = await callBackendless('users/register', 'POST', data);
    if (result.code) {
        return { success: false, error: result.message };
    }
    return { success: true, user: result };
}

// Login
async function login(email, password) {
    const data = { login: email, password: password };
    const result = await callBackendless('users/login', 'POST', data);
    if (result.code) {
        return { success: false, error: result.message };
    }
    localStorage.setItem('user-token', result['user-token']);
    return { success: true, user: result };
}

// Get current user
async function getCurrentUser() {
    const token = localStorage.getItem('user-token');
    if (!token) return null;
    const result = await callBackendless('users/current', 'GET');
    if (result.code) {
        return null;
    }
    return result;
}

// Logout
async function logout() {
    localStorage.removeItem('user-token');
    return { success: true };
}

// Get all products
async function getProducts() {
    const result = await callBackendless('data/Products', 'GET');
    if (result.code) {
        return [];
    }
    return result || [];
}

// Add to cart
async function addToCart(email, productId, productName, price, unit) {
    const data = {
        user_email: email,
        product_id: productId,
        product_name: productName,
        price: price,
        quantity: 1,
        unit: unit
    };
    const result = await callBackendless('data/Cart', 'POST', data);
    if (result.code) {
        return { success: false, error: result.message };
    }
    return { success: true, item: result };
}

// Get cart items
async function getCartItems(email) {
    const result = await callBackendless(`data/Cart?where=user_email='${email}'`, 'GET');
    if (result.code) {
        return [];
    }
    return result || [];
}

// Remove item from cart
async function removeCartItem(itemId) {
    const result = await callBackendless(`data/Cart/${itemId}`, 'DELETE');
    if (result.code) {
        return { success: false, error: result.message };
    }
    return { success: true };
}

// Clear cart
async function clearCart(email) {
    const items = await getCartItems(email);
    for (let item of items) {
        await removeCartItem(item.objectId);
    }
    return { success: true };
}
