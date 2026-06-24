<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Cart - PreshyBee Farms</title>
    <link rel="stylesheet" href="css/style.css" />
    <style>
        .cart-container {
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .cart-table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .cart-table th {
            background: #1a3a1a;
            color: #fff;
            padding: 14px;
            text-align: left;
        }
        .cart-table td {
            padding: 14px;
            border-bottom: 1px solid #eee;
            vertical-align: middle;
        }
        .cart-table tr:last-child td {
            border-bottom: none;
        }
        .quantity-btn {
            background: #f0f0f0;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            font-size: 18px;
            cursor: pointer;
            font-weight: 700;
        }
        .quantity-btn:hover {
            background: #ddd;
        }
        .remove-btn {
            background: #e74c3c;
            color: #fff;
            border: none;
            padding: 6px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
        }
        .remove-btn:hover {
            background: #c0392b;
        }
        .cart-total {
            text-align: right;
            font-size: 24px;
            font-weight: 700;
            padding: 20px 0;
        }
        .checkout-btn {
            background: #2d7d2d;
            color: #fff;
            border: none;
            padding: 14px 40px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s;
        }
        .checkout-btn:hover {
            background: #1e5e1e;
        }
        .checkout-btn:disabled {
            background: #aaa;
            cursor: not-allowed;
        }
        .empty-cart {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        .empty-cart .emoji {
            font-size: 64px;
        }
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 40px;
            background: #1a3a1a;
            color: #fff;
        }
        .navbar a {
            color: #fff;
            text-decoration: none;
            margin-left: 20px;
        }
        .navbar .logo {
            font-size: 24px;
            font-weight: 700;
        }
        .cart-count {
            background: #e74c3c;
            color: #fff;
            border-radius: 50%;
            padding: 2px 10px;
            font-size: 14px;
            margin-left: 6px;
        }
        #toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2d7d2d;
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 999;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <a href="/" class="logo">🐝 PreshyBee Farms</a>
        <div>
            <a href="/products.html">Shop</a>
            <a href="/donate/">Donate</a>
            <a href="/cart.html">Cart <span id="cartCount" class="cart-count">0</span></a>
            <a href="/login.html">Login</a>
        </div>
    </nav>

    <div class="cart-container">
        <h1>Your Cart</h1>
        <div id="cartContent">
            <p style="text-align:center;padding:40px;">Loading your cart...</p>
        </div>
    </div>

    <div id="toast"></div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
    <script src="js/supabase-client.js"></script>
    <script src="js/cart.js"></script>
    <script>
        async function loadCart() {
            const container = document.getElementById('cartContent');
            const items = await getCartItems();

            if (!items || items.length === 0) {
                container.innerHTML = `
                    <div class="empty-cart">
                        <div class="emoji">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Start shopping at <a href="/products.html" style="color:#2d7d2d;">our farm shop</a>!</p>
                    </div>
                `;
                return;
            }

            let html = `
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            let grandTotal = 0;

            items.forEach(item => {
                const product = item.products;
                const price = product ? Number(product.price) : 0;
                const subtotal = price * item.quantity;
                grandTotal += subtotal;
                const productName = product ? product.name : 'Unknown';
                const unit = product ? product.unit : '';

                html += `
                    <tr>
                        <td><strong>${productName}</strong> <span style="color:#888;font-size:14px;">(${unit})</span></td>
                        <td>₦${price.toLocaleString()}</td>
                        <td>
                            <button class="quantity-btn" onclick="updateQty('${item.id}', ${item.quantity - 1})">−</button>
                            <span style="margin:0 12px;font-weight:700;">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQty('${item.id}', ${item.quantity + 1})">+</button>
                        </td>
                        <td>₦${subtotal.toLocaleString()}</td>
                        <td><button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button></td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
                <div class="cart-total">
                    Total: ₦${grandTotal.toLocaleString()}
                </div>
                <div style="text-align:right;">
                    <button class="checkout-btn" id="checkoutBtn">Proceed to Checkout</button>
                </div>
            `;

            container.innerHTML = html;
            updateCartCount();
        }

        // Update quantity
        window.updateQty = async function(cartId, newQty) {
            if (newQty < 1) {
                await removeItem(cartId);
                return;
            }
            const success = await updateCartItemQuantity(cartId, newQty);
            if (success) loadCart();
        };

        // Remove item
        window.removeItem = async function(cartId) {
            const success = await removeCartItem(cartId);
            if (success) {
                showToast('Item removed from cart');
                loadCart();
            }
        };

        // Checkout (placeholder)
        document.addEventListener('click', function(e) {
            if (e.target.id === 'checkoutBtn') {
                showToast('Checkout coming soon! 🚀');
            }
        });

        // Toast
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 3000);
        }

        async function updateCartCount() {
            const count = await getCartCount();
            document.getElementById('cartCount').textContent = count;
        }

        // Load cart on page load
        loadCart();
    </script>
</body>
</html>
