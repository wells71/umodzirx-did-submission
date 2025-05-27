import React, { useState } from 'react';
import { FiPackage, FiAlertTriangle, FiSearch, FiPlus, FiEdit, FiTrash2, FiX, FiFilter, FiDownload } from 'react-icons/fi';
import MetricsCard from '../../common/MetricsCard';

const PharmacistInventoryContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [stockAlert, setStockAlert] = useState(null);
  
  // Sample inventory metrics
  const inventoryMetrics = [
    {
      id: 'total-items',
      icon: <FiPackage />,
      title: 'Total Inventory Items',
      value: '126',
      increase: '4',
      subtitle: 'Last month: 122',
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'low-stock',
      icon: <FiAlertTriangle />,
      title: 'Low Stock Items',
      value: '14',
      increase: '2',
      subtitle: 'Need reordering',
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      id: 'expiring-soon',
      icon: <FiAlertTriangle />,
      title: 'Expiring Soon',
      value: '8',
      increase: '0',
      subtitle: 'Within 90 days',
      iconColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      id: 'stock-value',
      icon: <FiPackage />,
      title: 'Total Stock Value',
      value: 'K 52,436',
      increase: '5',
      subtitle: 'In inventory',
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ];

  // Sample inventory data
  const inventoryItems = [
    {
      id: 'med-001',
      name: 'Paracetamol 500mg',
      category: 'Analgesics',
      quantity: 240,
      unit: 'tablets',
      supplier: 'PharmSource Ltd',
      threshold: 50,
      expiryDate: '2026-06-15',
      lotNumber: 'LOT-2023-A457',
      unitPrice: 0.45,
      lastRestock: '2025-02-10',
      location: 'Shelf A-12'
    },
    {
      id: 'med-002',
      name: 'Amoxicillin 250mg',
      category: 'Antibiotics',
      quantity: 120,
      unit: 'capsules',
      supplier: 'MediCare Supplies',
      threshold: 40,
      expiryDate: '2026-04-22',
      lotNumber: 'LOT-2023-B112',
      unitPrice: 0.95,
      lastRestock: '2025-01-15',
      location: 'Shelf B-03'
    },
    {
      id: 'med-003',
      name: 'Metformin 500mg',
      category: 'Antidiabetics',
      quantity: 180,
      unit: 'tablets',
      supplier: 'PharmSource Ltd',
      threshold: 50,
      expiryDate: '2026-08-10',
      lotNumber: 'LOT-2023-C223',
      unitPrice: 0.75,
      lastRestock: '2025-02-20',
      location: 'Shelf C-08'
    },
    {
      id: 'med-004',
      name: 'Lisinopril 10mg',
      category: 'Antihypertensives',
      quantity: 30,
      unit: 'tablets',
      supplier: 'MediCare Supplies',
      threshold: 35,
      expiryDate: '2026-05-05',
      lotNumber: 'LOT-2023-D335',
      unitPrice: 1.25,
      lastRestock: '2025-01-05',
      location: 'Shelf B-11'
    },
    {
      id: 'med-005',
      name: 'Ibuprofen 400mg',
      category: 'Analgesics',
      quantity: 210,
      unit: 'tablets',
      supplier: 'PharmSource Ltd',
      threshold: 45,
      expiryDate: '2026-07-18',
      lotNumber: 'LOT-2023-E446',
      unitPrice: 0.60,
      lastRestock: '2025-02-25',
      location: 'Shelf A-15'
    },
    {
      id: 'med-006',
      name: 'Ciprofloxacin 500mg',
      category: 'Antibiotics',
      quantity: 28,
      unit: 'tablets',
      supplier: 'ZamMed Distributors',
      threshold: 30,
      expiryDate: '2025-12-30',
      lotNumber: 'LOT-2023-F557',
      unitPrice: 1.50,
      lastRestock: '2025-01-10',
      location: 'Shelf B-05'
    }
  ];

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Items' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'expiring-soon', label: 'Expiring Soon' },
    { id: 'antibiotics', label: 'Antibiotics' },
    { id: 'analgesics', label: 'Analgesics' }
  ];

  // Filter inventory items based on current filter and search term
  const filteredItems = inventoryItems.filter(item => {
    // Filter by search term
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply category filters
    switch (currentFilter) {
      case 'low-stock':
        return item.quantity <= item.threshold;
      case 'expiring-soon':
        const expiryDate = new Date(item.expiryDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return expiryDate <= threeMonthsFromNow;
      case 'antibiotics':
        return item.category === 'Antibiotics';
      case 'analgesics':
        return item.category === 'Analgesics';
      default:
        return true;
    }
  });

  // Handle medication click
  const handleMedicationClick = (medication) => {
    setSelectedMedication(medication);
    setShowMedicationModal(true);
  };

  // Close medication modal
  const closeMedicationModal = () => {
    setShowMedicationModal(false);
    setSelectedMedication(null);
  };

  // Handle stock alert creation
  const handleCreateStockAlert = (medication) => {
    setStockAlert({
      medication: medication.name,
      quantity: medication.threshold * 2,
      supplier: medication.supplier,
      urgency: 'Normal'
    });
    setTimeout(() => {
      setStockAlert(null);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Inventory Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Track, manage, and optimize your pharmacy inventory</p>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventoryMetrics.map((metric) => (
          <MetricsCard 
            key={metric.id}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            increase={metric.increase}
            subtitle={metric.subtitle}
            iconColor={metric.iconColor}
            bgColor={metric.bgColor}
          />
        ))}
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:justify-between space-y-3 md:space-y-0">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search medications..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <select
                className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentFilter}
                onChange={(e) => setCurrentFilter(e.target.value)}
              >
                {filterOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <FiFilter className="h-4 w-4" />
              </div>
            </div>
            <button 
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <FiPlus className="mr-2" />
              Add Item
            </button>
          </div>
        </div>
      </div>
      
      {/* Stock Alert Notification */}
      {stockAlert && (
        <div className="fixed top-6 right-6 z-50 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 p-4 rounded-lg shadow-lg flex items-start max-w-sm">
          <div className="mr-3 mt-0.5">
            <FiPackage className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Stock Alert Created</p>
            <p className="text-sm mt-1">Order placed for {stockAlert.quantity} units of {stockAlert.medication} from {stockAlert.supplier}</p>
          </div>
          <button onClick={() => setStockAlert(null)} className="text-green-500 hover:text-green-700">
            <FiX className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleMedicationClick(item)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center">
                        <p className={`font-medium ${
                          item.quantity <= item.threshold ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      {item.quantity <= item.threshold && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Low stock!
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${
                      new Date(item.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-gray-900 dark:text-white">K {item.unitPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button 
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMedicationClick(item);
                      }}
                    >
                      <FiEdit className="h-5 w-5" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete action
                      }}
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredItems.length}</span> of{' '}
                <span className="font-medium">{inventoryItems.length}</span> items
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
        {/* Export & Actions Row */}
      <div className="flex justify-end">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">
          <FiDownload className="mr-2 h-4 w-4" /> Export Inventory
        </button>
      </div>
      
      {/* Medication Detail Modal */}
      {showMedicationModal && selectedMedication && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={closeMedicationModal}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full z-10 overflow-hidden transform transition-all">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Medication Details</h3>
              <button 
                onClick={closeMedicationModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedMedication.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {selectedMedication.category}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Medication ID</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedMedication.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedMedication.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Stock</h4>
                  <div className={`bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md ${
                    selectedMedication.quantity <= selectedMedication.threshold ? 'border-l-4 border-red-500' : ''
                  }`}>
                    <p className={`text-lg font-bold ${
                      selectedMedication.quantity <= selectedMedication.threshold 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {selectedMedication.quantity} {selectedMedication.unit}
                    </p>
                    {selectedMedication.quantity <= selectedMedication.threshold && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Below threshold ({selectedMedication.threshold})
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit Price</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md">
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      K {selectedMedication.unitPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Total value: K {(selectedMedication.quantity * selectedMedication.unitPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lot Number</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md">
                    <p className="text-base text-gray-800 dark:text-gray-200">{selectedMedication.lotNumber}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</h4>
                  <div className={`bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md ${
                    new Date(selectedMedication.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'border-l-4 border-amber-500' : ''
                  }`}>
                    <p className={`text-base ${
                      new Date(selectedMedication.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {new Date(selectedMedication.expiryDate).toLocaleDateString()}
                    </p>
                    {new Date(selectedMedication.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Expiring soon
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supplier Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md">
                  <p className="text-base text-gray-800 dark:text-gray-200">{selectedMedication.supplier}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Last restocked on {new Date(selectedMedication.lastRestock).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  onClick={closeMedicationModal}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  onClick={() => handleCreateStockAlert(selectedMedication)}
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistInventoryContent;
