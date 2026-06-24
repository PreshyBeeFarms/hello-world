// js/cart.js

// Get current user
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Add item to cart
async function addToCart(productId, productName, price) {
    const user = await getCurrentUser();
    
    if (!user) {
        showToast('Please login to add items to your cart!');
        window.location.href = '/login.html';
        return;
    }

    // Check if item already in cart
    const { data: existing, error: checkError } = await supabase
        .from('shopping_cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

    if (checkError) {
        showToast('Error checking cart: ' + checkError.message);
        return;
    }

    if (existing) {
        // Update quantity
        const { error: updateError } = await supabase
            .from('shopping_cart')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id);

        if (updateError) {
            showToast('Error updating cart: ' + updateError.message);
        } else {
            showToast(`Added another ${productName} to your cart!`);
        }
    } else {
        // Insert new item
        const { error: insertError } = await supabase
            .from('shopping_cart')
            .insert([
                {
                    user_id: user.id,
                    product_id: productId,
                    quantity: 1
                }
            ]);

        if (insertError) {
            showToast('Error adding to cart: ' + insertError.message);
        } else {
            showToast(`${productName} added to cart!`);
        }
    }
}

// Get cart items
async function getCartItems() {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
            *,
            products (
                id,
                name,
                price,
                unit,
                image_url
            )
        `)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching cart:', error);
        return [];
    }
    return data || [];
}

// Get cart count
async function getCartCount() {
    const items = await getCartItems();
    return items.reduce((total, item) => total + item.quantity, 0);
}

// Update cart item quantity
async function updateCartItemQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        return removeCartItem(cartId);
    }

    const { error } = await supabase
        .from('shopping_cart')
        .update({ quantity: newQuantity })
        .eq('id', cartId);

    if (error) {
        showToast('Error updating cart: ' + error.message);
        return false;
    }
    return true;
}

// Remove item from cart
async function removeCartItem(cartId) {
    const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', cartId);

    if (error) {
        showToast('Error removing item: ' + error.message);
        return false;
    }
    return true;
}

// Clear entire cart (after checkout)
async function clearCart() {
    const user = await getCurrentUser();
    if (!user) return false;

    const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        console.error('Error clearing cart:', error);
        return false;
    }
    return true;
}
