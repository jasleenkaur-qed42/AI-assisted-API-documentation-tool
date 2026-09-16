const express = require('express');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

// Registered Endpoints
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to my Express API!",
        endpoints: {
            users: "/api/users",
            products: "/api/products"
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
