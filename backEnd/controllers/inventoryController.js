const { Inventory, InventoryTransaction, Supplier } = require('../models/Inventory');
const { Op } = require('sequelize');

class InventoryController {
  /**
   * Get all inventory items with optional filtering
   */
  static async getAllInventory(req, res) {
    try {
      const { 
        search, 
        category, 
        lowStock, 
        supplierIds,
        sort = 'medicationName',
        order = 'ASC',
        page = 1,
        limit = 20
      } = req.query;

      // Build filters
      const filters = {};
      
      if (search) {
        filters[Op.or] = {
          medicationName: { [Op.like]: `%${search}%` },
          genericName: { [Op.like]: `%${search}%` }
        };
      }
      
      if (category) {
        filters.category = category;
      }
      
      if (lowStock === 'true') {
        filters.currentStock = {
          [Op.lte]: sequelize.col('minThreshold')
        };
      }
      
      if (supplierIds) {
        const ids = supplierIds.split(',').map(id => parseInt(id));
        filters.supplierId = {
          [Op.in]: ids
        };
      }

      // Calculate pagination
      const offset = (page - 1) * limit;
      
      const inventory = await Inventory.findAndCountAll({
        where: filters,
        include: [
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'name']
          }
        ],
        order: [[sort, order]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        success: true,
        data: {
          items: inventory.rows,
          totalCount: inventory.count,
          page: parseInt(page),
          pageSize: parseInt(limit),
          totalPages: Math.ceil(inventory.count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch inventory',
        details: error.message
      });
    }
  }

  /**
   * Get a specific inventory item by ID
   */
  static async getInventoryById(req, res) {
    try {
      const { id } = req.params;
      
      const inventoryItem = await Inventory.findByPk(id, {
        include: [
          {
            model: Supplier,
            as: 'supplier'
          },
          {
            model: InventoryTransaction,
            as: 'transactions',
            limit: 10,
            order: [['createdAt', 'DESC']]
          }
        ]
      });
      
      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: inventoryItem
      });
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch inventory item',
        details: error.message
      });
    }
  }

  /**
   * Create a new inventory item
   */
  static async createInventoryItem(req, res) {
    try {
      const {
        medicationName,
        genericName,
        category,
        currentStock,
        unit,
        minThreshold,
        reorderLevel,
        batchNumber,
        expiryDate,
        price,
        location,
        supplierId,
        notes
      } = req.body;
      
      // Validate required fields
      if (!medicationName) {
        return res.status(400).json({
          success: false,
          error: 'Medication name is required'
        });
      }
      
      // Check if medication already exists
      const existing = await Inventory.findOne({
        where: {
          medicationName: {
            [Op.iLike]: medicationName
          }
        }
      });
      
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'A medication with this name already exists'
        });
      }
      
      // Create new inventory item
      const newItem = await Inventory.create({
        medicationName,
        genericName,
        category,
        currentStock: currentStock || 0,
        unit: unit || 'tablets',
        minThreshold: minThreshold || 20,
        reorderLevel: reorderLevel || 50,
        batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        price,
        location,
        supplierId,
        notes,
        createdBy: req.user.id,
        lastUpdated: new Date()
      });
      
      // If initial stock is provided, create a transaction
      if (currentStock && currentStock > 0) {
        await InventoryTransaction.create({
          inventoryId: newItem.id,
          transactionType: 'stock_in',
          quantity: currentStock,
          batchNumber,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          supplierId,
          notes: 'Initial stock',
          performedBy: req.user.id
        });
      }
      
      return res.status(201).json({
        success: true,
        data: newItem
      });
    } catch (error) {
      console.error('Error creating inventory item:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create inventory item',
        details: error.message
      });
    }
  }

  /**
   * Update an existing inventory item
   */
  static async updateInventoryItem(req, res) {
    try {
      const { id } = req.params;
      const {
        medicationName,
        genericName,
        category,
        unit,
        minThreshold,
        reorderLevel,
        batchNumber,
        expiryDate,
        price,
        location,
        supplierId,
        notes
      } = req.body;
      
      const inventoryItem = await Inventory.findByPk(id);
      
      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found'
        });
      }
      
      // Check if medication name is being changed and if it conflicts
      if (medicationName && medicationName !== inventoryItem.medicationName) {
        const existing = await Inventory.findOne({
          where: {
            medicationName: {
              [Op.iLike]: medicationName
            },
            id: {
              [Op.ne]: id
            }
          }
        });
        
        if (existing) {
          return res.status(409).json({
            success: false,
            error: 'A medication with this name already exists'
          });
        }
      }
      
      // Update the item
      await inventoryItem.update({
        medicationName: medicationName || inventoryItem.medicationName,
        genericName: genericName !== undefined ? genericName : inventoryItem.genericName,
        category: category !== undefined ? category : inventoryItem.category,
        unit: unit || inventoryItem.unit,
        minThreshold: minThreshold !== undefined ? minThreshold : inventoryItem.minThreshold,
        reorderLevel: reorderLevel !== undefined ? reorderLevel : inventoryItem.reorderLevel,
        batchNumber: batchNumber !== undefined ? batchNumber : inventoryItem.batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : inventoryItem.expiryDate,
        price: price !== undefined ? price : inventoryItem.price,
        location: location !== undefined ? location : inventoryItem.location,
        supplierId: supplierId !== undefined ? supplierId : inventoryItem.supplierId,
        notes: notes !== undefined ? notes : inventoryItem.notes,
        lastUpdated: new Date()
      });
      
      return res.status(200).json({
        success: true,
        data: inventoryItem
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update inventory item',
        details: error.message
      });
    }
  }

  /**
   * Record a stock transaction (add/remove inventory)
   */
  static async recordTransaction(req, res) {
    try {
      const {
        inventoryId,
        transactionType,
        quantity,
        batchNumber,
        expiryDate,
        referenceNumber,
        patientId,
        supplierId,
        notes
      } = req.body;
      
      // Validate required fields
      if (!inventoryId || !transactionType || !quantity) {
        return res.status(400).json({
          success: false,
          error: 'Inventory ID, transaction type, and quantity are required'
        });
      }
      
      // Validate transaction type
      const validTypes = ['stock_in', 'dispensed', 'adjustment', 'expired', 'return'];
      if (!validTypes.includes(transactionType)) {
        return res.status(400).json({
          success: false,
          error: `Transaction type must be one of: ${validTypes.join(', ')}`
        });
      }
      
      // Find the inventory item
      const inventoryItem = await Inventory.findByPk(inventoryId);
      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found'
        });
      }
      
      // Calculate new stock level
      let newStock = inventoryItem.currentStock;
      if (['stock_in', 'return'].includes(transactionType)) {
        newStock += parseInt(quantity);
      } else if (['dispensed', 'expired'].includes(transactionType)) {
        // Check if we have enough stock
        if (inventoryItem.currentStock < parseInt(quantity)) {
          return res.status(400).json({
            success: false,
            error: 'Not enough stock available for this transaction'
          });
        }
        newStock -= parseInt(quantity);
      } else if (transactionType === 'adjustment') {
        // For adjustments, the quantity is the new absolute value
        newStock = parseInt(quantity);
      }
      
      // Create transaction
      const transaction = await InventoryTransaction.create({
        inventoryId,
        transactionType,
        quantity: parseInt(quantity),
        batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        referenceNumber,
        patientId,
        supplierId,
        notes,
        performedBy: req.user.id
      });
      
      // Update inventory item
      await inventoryItem.update({
        currentStock: newStock,
        lastUpdated: new Date(),
        batchNumber: transactionType === 'stock_in' ? (batchNumber || inventoryItem.batchNumber) : inventoryItem.batchNumber,
        expiryDate: transactionType === 'stock_in' && expiryDate ? new Date(expiryDate) : inventoryItem.expiryDate
      });
      
      return res.status(200).json({
        success: true,
        data: {
          transaction,
          newStock
        },
        message: `Transaction recorded successfully. ${inventoryItem.medicationName} stock ${transactionType === 'stock_in' ? 'increased' : transactionType === 'adjustment' ? 'adjusted' : 'decreased'} to ${newStock} ${inventoryItem.unit}.`
      });
    } catch (error) {
      console.error('Error recording transaction:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to record transaction',
        details: error.message
      });
    }
  }

  /**
   * Get transaction history for an inventory item
   */
  static async getTransactionHistory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const inventoryItem = await Inventory.findByPk(id);
      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found'
        });
      }
      
      // Calculate pagination
      const offset = (page - 1) * limit;
      
      const transactions = await InventoryTransaction.findAndCountAll({
        where: { inventoryId: id },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        success: true,
        data: {
          items: transactions.rows,
          totalCount: transactions.count,
          page: parseInt(page),
          pageSize: parseInt(limit),
          totalPages: Math.ceil(transactions.count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch transaction history',
        details: error.message
      });
    }
  }

  /**
   * SUPPLIER MANAGEMENT
   */
  
  /**
   * Get all suppliers
   */
  static async getAllSuppliers(req, res) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      
      const filters = {};
      if (search) {
        filters[Op.or] = {
          name: { [Op.like]: `%${search}%` },
          contactPerson: { [Op.like]: `%${search}%` }
        };
      }
      
      // Calculate pagination
      const offset = (page - 1) * limit;
      
      const suppliers = await Supplier.findAndCountAll({
        where: filters,
        order: [['name', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        success: true,
        data: {
          items: suppliers.rows,
          totalCount: suppliers.count,
          page: parseInt(page),
          pageSize: parseInt(limit),
          totalPages: Math.ceil(suppliers.count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch suppliers',
        details: error.message
      });
    }
  }

  /**
   * Get a specific supplier by ID
   */
  static async getSupplierById(req, res) {
    try {
      const { id } = req.params;
      
      const supplier = await Supplier.findByPk(id, {
        include: [
          {
            model: Inventory,
            as: 'medications',
            attributes: ['id', 'medicationName', 'currentStock', 'minThreshold']
          }
        ]
      });
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          error: 'Supplier not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      console.error('Error fetching supplier:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch supplier',
        details: error.message
      });
    }
  }

  /**
   * Create a new supplier
   */
  static async createSupplier(req, res) {
    try {
      const {
        name,
        contactPerson,
        phone,
        email,
        address,
        isActive,
        notes
      } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Supplier name is required'
        });
      }
      
      // Check if supplier already exists
      const existing = await Supplier.findOne({
        where: {
          name: {
            [Op.iLike]: name
          }
        }
      });
      
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'A supplier with this name already exists'
        });
      }
      
      // Create new supplier
      const newSupplier = await Supplier.create({
        name,
        contactPerson,
        phone,
        email,
        address,
        isActive: isActive !== undefined ? isActive : true,
        notes
      });
      
      return res.status(201).json({
        success: true,
        data: newSupplier
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create supplier',
        details: error.message
      });
    }
  }

  /**
   * Update an existing supplier
   */
  static async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        contactPerson,
        phone,
        email,
        address,
        isActive,
        notes
      } = req.body;
      
      const supplier = await Supplier.findByPk(id);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          error: 'Supplier not found'
        });
      }
      
      // Check if supplier name is being changed and if it conflicts
      if (name && name !== supplier.name) {
        const existing = await Supplier.findOne({
          where: {
            name: {
              [Op.iLike]: name
            },
            id: {
              [Op.ne]: id
            }
          }
        });
        
        if (existing) {
          return res.status(409).json({
            success: false,
            error: 'A supplier with this name already exists'
          });
        }
      }
      
      // Update the supplier
      await supplier.update({
        name: name || supplier.name,
        contactPerson: contactPerson !== undefined ? contactPerson : supplier.contactPerson,
        phone: phone !== undefined ? phone : supplier.phone,
        email: email !== undefined ? email : supplier.email,
        address: address !== undefined ? address : supplier.address,
        isActive: isActive !== undefined ? isActive : supplier.isActive,
        notes: notes !== undefined ? notes : supplier.notes
      });
      
      return res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update supplier',
        details: error.message
      });
    }
  }

  /**
   * Delete a supplier
   */
  static async deleteSupplier(req, res) {
    try {
      const { id } = req.params;
      
      const supplier = await Supplier.findByPk(id);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          error: 'Supplier not found'
        });
      }
      
      // Check if supplier has associated inventory items
      const inventoryCount = await Inventory.count({
        where: {
          supplierId: id
        }
      });
      
      if (inventoryCount > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete supplier: ${inventoryCount} inventory items are associated with this supplier. Update those items first or deactivate the supplier instead.`
        });
      }
      
      // Delete the supplier
      await supplier.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete supplier',
        details: error.message
      });
    }
  }

  /**
   * Get inventory dashboard statistics
   */
  static async getInventoryStats(req, res) {
    try {
      const totalInventoryItems = await Inventory.count();
      
      const lowStockItems = await Inventory.count({
        where: {
          currentStock: {
            [Op.lte]: sequelize.col('minThreshold')
          }
        }
      });

      const outOfStockItems = await Inventory.count({
        where: {
          currentStock: 0
        }
      });

      // Get top dispensed medications (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const topDispensedItems = await InventoryTransaction.findAll({
        attributes: [
          'inventoryId',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalDispensed']
        ],
        where: {
          transactionType: 'dispensed',
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        include: [
          {
            model: Inventory,
            as: 'inventory',
            attributes: ['medicationName']
          }
        ],
        group: ['inventoryId', 'inventory.id', 'inventory.medicationName'],
        order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
        limit: 5
      });

      // Get recent transactions
      const recentTransactions = await InventoryTransaction.findAll({
        include: [
          {
            model: Inventory,
            as: 'inventory',
            attributes: ['medicationName']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      return res.status(200).json({
        success: true,
        data: {
          totalInventoryItems,
          lowStockItems,
          outOfStockItems,
          topDispensedItems,
          recentTransactions
        }
      });
    } catch (error) {
      console.error('Error getting inventory statistics:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get inventory statistics',
        details: error.message
      });
    }
  }
}

module.exports = InventoryController;