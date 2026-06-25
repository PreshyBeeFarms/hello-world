// js/auth.js

// Sign Up
async function signUp(email, password, fullName, phone, address, role) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone: phone,
                address: address,
                role: role
            }
        }
    });
    
    if (error) {
        console.error('Sign up error:', error.message);
        return { success: false, error: error.message };
    }
    
    // Create profile entry
    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    full_name: fullName,
                    phone: phone,
                    address: address,
                    role: role
                }
            ]);
        
        if (profileError) {
            console.error('Profile creation error:', profileError.message);
            return { success: false, error: profileError.message };
        }
    }
    
    return { success: true, user: data.user };
}

// Login
async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
    }
    
    return { success: true, user: data.user };
}

// Logout
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout error:', error.message);
        return { success: false, error: error.message };
    }
    return { success: true };
}

// Check if user is logged in
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Update user profile
async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
    
    if (error) {
        console.error('Update error:', error.message);
        return { success: false, error: error.message };
    }
    return { success: true };
}
