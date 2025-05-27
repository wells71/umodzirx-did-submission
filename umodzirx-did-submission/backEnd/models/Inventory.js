const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Inventory Model - Tracks medication inventory in the system
 */
const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  medicationName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Name of the medication'
  },
  genericName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Generic name of the medication'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Category of medication (e.g., Antibiotic, Pain Relief)'
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Current quantity in stock'
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'units',
    comment: 'Unit of measurement (e.g., tablets, bottles)'
  },
  minThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20,
    comment: 'Minimum stock level threshold for alerts'
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    comment: 'Level at which reordering should occur'
  },
  batchNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Current batch number'
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expiration date of current stock'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Price per unit'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Storage location'
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reference to supplier'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  createdBy: {
    type: DataTypes.INTEGER,
    comment: 'User ID who created this inventory item'
  }
}, {
  timestamps: true,
  tableName: 'inventories'
});

/**
 * InventoryTransaction Model - Tracks all inventory movements (stocking, dispensing)
 */
const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inventoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inventories',
      key: 'id'
    }
  },
  transactionType: {
    type: DataTypes.ENUM('stock_in', 'dispensed', 'adjustment', 'expired', 'return'),
    allowNull: false,
    comment: 'Type of transaction'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Quantity added or removed'
  },
  batchNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  referenceNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Reference to prescription or order number'
  },
  patientId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Patient ID if dispensed to a patient'
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Supplier ID if stocked in'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  performedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User ID who performed the transaction'
  }
}, {
  timestamps: true,
  tableName: 'inventory_transactions'
});

/**
 * Supplier Model - Tracks medication suppliers
 */
const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  contactPerson: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'suppliers'
});

// Define relationships
Inventory.hasMany(InventoryTransaction, { foreignKey: 'inventoryId', as: 'transactions' });
InventoryTransaction.belongsTo(Inventory, { foreignKey: 'inventoryId', as: 'inventory' });

Supplier.hasMany(Inventory, { foreignKey: 'supplierId', as: 'medications' });
Inventory.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

module.exports = {
  Inventory,
  InventoryTransaction,
  Supplier
};