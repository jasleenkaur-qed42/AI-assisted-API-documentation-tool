const db = require('../config/db');

// 1. GET all products (Supports filtering by ?category= and searching by ?search=)
exports.getProducts = (req, res) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        // Dynamic query building for filtering
        if (category) {
            query += ' AND LOWER(category) = LOWER(?)';
            params.push(category);
        }

        // Dynamic query building for text searching
        if (search) {
            query += ' AND LOWER(name) LIKE LOWER(?)';
            params.push(`%${search}%`);
        }

        const products = db.prepare(query).all(...params);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GET a single product by ID
exports.getProductById = (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. POST - Create a new product
exports.createProduct = (req, res) => {
    try {
        const { name, category, price, stock } = req.body;

        if (!name || !category || price === undefined || stock === undefined) {
            return res.status(400).json({ message: 'All fields (name, category, price, stock) are required' });
        }

        const info = db.prepare(
            'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)'
        ).run(name, category, Number(price), Number(stock));

        res.status(201).json({
            message: 'Product added permanently!',
            product: { id: info.lastInsertRowid, name, category, price, stock }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. POST - Bulk restock items (Increases stock for ALL items)
exports.bulkRestock = (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid restock amount is required' });
        }

        // Updates all records in the table simultaneously
        const info = db.prepare('UPDATE products SET stock = stock + ?').run(Number(amount));

        res.status(200).json({ 
            message: `Successfully restocked all items!`, 
            rowsAffected: info.changes 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. DELETE - Remove product by ID
exports.deleteProduct = (req, res) => {
    try {
        const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);

        if (info.changes === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: `Product with ID ${req.params.id} deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. PATCH - Partially update an existing product
exports.updateProduct = (req, res) => {
    try {
        const productId = req.params.id;
        const { name, category, price, stock } = req.body;

        // 1. Verify if the product actually exists first
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 2. Build dynamic SQL columns based on what was provided in req.body
        const fieldsToUpdate = [];
        const queryParams = [];

        if (name !== undefined) {
            fieldsToUpdate.push('name = ?');
            queryParams.push(name);
        }
        if (category !== undefined) {
            fieldsToUpdate.push('category = ?');
            queryParams.push(category);
        }
        if (price !== undefined) {
            fieldsToUpdate.push('price = ?');
            queryParams.push(Number(price));
        }
        if (stock !== undefined) {
            fieldsToUpdate.push('stock = ?');
            queryParams.push(Number(stock));
        }

        // 3. If the body is completely empty, send a bad request error
        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }

        // 4. Combine the dynamic updates and add the ID parameter to the end
        const sqlQuery = `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        queryParams.push(productId);

        // 5. Execute the update query
        db.prepare(sqlQuery).run(...queryParams);

        // 6. Fetch and return the newly updated product record
        const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

