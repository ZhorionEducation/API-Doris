const express = require('express');
const router = express.Router();
const controller = require('../controllers/productCategoryController');

router.get('/product-categories', controller.getAllProductCategories);
router.get('/product-categories/:id', controller.getProductCategoryById);
router.post('/product-categories', controller.registerProductCategory);
router.put('/product-categories/:id', controller.updateProductCategory);
router.delete('/product-categories/:id', controller.deactivateProductCategory);

module.exports = router;