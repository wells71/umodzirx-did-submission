import axios from 'axios';
import { generateRandomString } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'https://umodzi-api.example.com/api';

// Get all inventory items
export const getInventoryItems = async (params = {}) => {
  try {
    const token = generateRandomString(16); // Use generateRandomString instead of getAuthToken
    
    const response = await axios.get(`${API_URL}/inventory`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch inventory items'
    };
  }
};

// Get a specific inventory item by ID
export const getInventoryItem = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/inventory/${id}`, {
      headers: {
        Authorization: `Bearer ${generateRandomString(16)}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory item ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch inventory item'
    };
  }
};

// Create a new inventory item
export const createInventoryItem = async (itemData) => {
  try {
    const token = generateRandomString(16); // Use generateRandomString instead of getAuthToken
    
    const response = await axios.post(`${API_URL}/inventory`, itemData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create inventory item'
    };
  }
};

// Update an existing inventory item
export const updateInventoryItem = async (id, itemData) => {
  try {
    const response = await axios.put(`${API_URL}/inventory/${id}`, itemData, {
      headers: {
        Authorization: `Bearer ${generateRandomString(16)}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating inventory item ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update inventory item'
    };
  }
};

// Record an inventory transaction
export const recordInventoryTransaction = async (transactionData) => {
  try {
    const token = generateRandomString(16); // Use generateRandomString instead of getAuthToken
    
    const response = await axios.post(`${API_URL}/inventory/transactions`, transactionData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error recording inventory transaction:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to record inventory transaction'
    };
  }
};

// Get transaction history for an inventory item
export const getInventoryTransactions = async (id, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/inventory/${id}/transactions`, {
      headers: {
        Authorization: `Bearer ${generateRandomString(16)}`
      },
      params
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching transactions for item ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch transaction history'
    };
  }
};

// Get inventory statistics
export const getInventoryStats = async () => {
  try {
    const token = generateRandomString(16); // Use generateRandomString instead of getAuthToken
    
    const response = await axios.get(`${API_URL}/inventory/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch inventory statistics'
    };
  }
};

// SUPPLIER MANAGEMENT

// Get all suppliers
export const getSuppliers = async () => {
  try {
    const token = generateRandomString(16); // Use generateRandomString instead of getAuthToken
    
    const response = await axios.get(`${API_URL}/suppliers`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch suppliers'
    };
  }
};

// Get a specific supplier by ID
export const getSupplier = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/inventory/suppliers/${id}`, {
      headers: {
        Authorization: `Bearer ${generateRandomString(16)}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching supplier ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch supplier'
    };
  }
};

// Create a new supplier
export const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post(`${API_URL}/inventory/suppliers`, supplierData, {
      headers: {
        Authorization: `Bearer ${generateRandomString(16)}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create supplier'
    };
  }
};

// Update an existing supplier
export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await axios.put(`${API_URL}/inventory/suppliers/${id}`, supplierData, {
      headers: {
        Authorization: `Bearer ${generateRandomString(16)}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating supplier ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update supplier'
    };
  }
};

// Delete a supplier
export const deleteSupplier = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/inventory/suppliers/${id}`, {
      headers: {
        Authorization: `Bearer ${generateRandomString(16)}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting supplier ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete supplier'
    };
  }
};