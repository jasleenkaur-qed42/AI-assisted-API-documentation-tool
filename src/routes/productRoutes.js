const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Map endpoints to controller actions
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.post('/bulk-restock', productController.bulkRestock); 
router.delete('/:id', productController.deleteProduct);

module.exports = router;
