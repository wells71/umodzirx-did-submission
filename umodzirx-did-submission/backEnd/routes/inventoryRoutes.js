const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const { authenticateToken, checkRole } = require('../utils/auth');

// Apply authentication middleware to all inventory routes
router.use(authenticateToken);

// API Routes for Inventory Management

/**
 * INVENTORY MANAGEMENT
 */

// Get inventory dashboard statistics
router.get('/stats', checkRole(['admin', 'pharmacist']), InventoryController.getInventoryStats);

// Get all inventory items
router.get('/', checkRole(['admin', 'pharmacist', 'doctor']), InventoryController.getAllInventory);

// Get specific inventory item by ID
router.get('/:id', checkRole(['admin', 'pharmacist', 'doctor']), InventoryController.getInventoryById);

// Create new inventory item
router.post('/', checkRole(['admin', 'pharmacist']), InventoryController.createInventoryItem);

// Update inventory item
router.put('/:id', checkRole(['admin', 'pharmacist']), InventoryController.updateInventoryItem);

// Get transaction history for an inventory item
router.get('/:id/transactions', checkRole(['admin', 'pharmacist']), InventoryController.getTransactionHistory);

// Record inventory transaction (stock in/out)
router.post('/transaction', checkRole(['admin', 'pharmacist']), InventoryController.recordTransaction);

/**
 * SUPPLIER MANAGEMENT
 */

// Get all suppliers
router.get('/suppliers', checkRole(['admin', 'pharmacist']), InventoryController.getAllSuppliers);

// Get specific supplier by ID
router.get('/suppliers/:id', checkRole(['admin', 'pharmacist']), InventoryController.getSupplierById);

// Create new supplier
router.post('/suppliers', checkRole(['admin']), InventoryController.createSupplier);

// Update supplier
router.put('/suppliers/:id', checkRole(['admin', 'pharmacist']), InventoryController.updateSupplier);

// Delete supplier
router.delete('/suppliers/:id', checkRole(['admin']), InventoryController.deleteSupplier);

module.exports = router;