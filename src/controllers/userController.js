const db = require('../config/db');

// 1. GET all users
exports.getAllUsers = (req, res) => {
    try {
        const users = db.prepare('SELECT * FROM users').all();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GET single user by ID
exports.getUserById = (req, res) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. POST create user
exports.createUser = (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

        const info = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
        res.status(201).json({ 
            message: 'User created permanently!', 
            user: { id: info.lastInsertRowid, name, email } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. PATCH update user
exports.updateUser = (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.params.id;

        // Verify user exists
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update fields (fall back to existing values if not provided in body)
        const finalName = name || user.name;
        const finalEmail = email || user.email;

        db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(finalName, finalEmail, userId);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. DELETE user
exports.deleteUser = (req, res) => {
    try {
        const info = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        if (info.changes === 0) return res.status(404).json({ message: 'User not found' });
        
        res.status(200).json({ message: `User with ID ${req.params.id} deleted` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
