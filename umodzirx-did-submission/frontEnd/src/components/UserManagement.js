import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { FiEdit2, FiTrash2, FiUserPlus, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import axios from 'axios';

const admin_BASE_URL = process.env.REACT_APP_admin_BASE_URL || "http://localhost:5000";

const UserManagement = forwardRef((props, ref) => {
  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    status: 'Active',
    digitalID: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false
  });  const [searchTerm, setSearchTerm] = useState('');
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const mainContentRef = useRef(null);

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    showAddUserModal: () => handleAddUserClick()
  }));

  const handleAddUserClick = () => {
    setSelectedUser(null);
    setEditFormData({
      name: '',
      role: '',
      status: 'Active',
      digitalID: ''
    });
    setShowEditModal(true);
  };

  // Scroll event handler for floating button visibility
  // Replace the existing useEffect scroll handler with this:
useEffect(() => {
  const handleScroll = () => {
    if (mainContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainContentRef.current;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      
      // Show button unless we're within 200px of the bottom
      setShowFloatingButton(distanceFromBottom > 200);
    }
  };

  const contentElement = mainContentRef.current;
  if (contentElement) {
    contentElement.addEventListener('scroll', handleScroll);
  }

  return () => {
    if (contentElement) {
      contentElement.removeEventListener('scroll', handleScroll);
    }  };
}, []);

  // API request helper
  const adminRequest = async (method, endpoint, data = null) => {
    try {
      const response = await axios({ 
        method, 
        url: `${admin_BASE_URL}${endpoint}`, 
        data,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Admin Error: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  };

  // Fetch users with pagination
  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminRequest('get', `/admin/users?page=${page}&limit=${pagination.limit}`);
      if (data?.users && Array.isArray(data.users)) {
        setUsers(data.users);
        setPagination({
          ...data.pagination,
          limit: pagination.limit
        });
      }
    } catch (error) {
      setError('Failed to fetch users.');
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  // Find specific user by ID
  const findUserById = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a Digital ID to search');
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const user = await adminRequest('get', `/admin/users/${searchTerm.trim()}`);
      if (user) {
        setUsers([user]);
      } else {
        setError('User not found');
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      setError('User not found');
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
  }
  };

  // Delete user flow
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await adminRequest('delete', `/admin/users/${userToDelete.digitalID}`);
      setSuccessMessage(`User ${userToDelete.name} deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowDeleteModal(false);
      if (searchTerm) {
        findUserById();
      } else {
        fetchUsers(pagination.page);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user.');
      setTimeout(() => setError(""), 3000);
    } finally {
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // User edit flow
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      role: user.role,
      status: user.status || 'Active',
      digitalID: user.digitalID
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = selectedUser ? `/admin/users/${selectedUser.digitalID}` : '/admin/users';
      const method = selectedUser ? 'put' : 'post';
      
      await adminRequest(method, endpoint, editFormData);
      setSuccessMessage(`User ${selectedUser ? 'updated' : 'added'} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowEditModal(false);
      if (searchTerm) {
        findUserById();
      } else {
        fetchUsers(pagination.page);
      }
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${selectedUser ? 'update' : 'add'} user.`);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Form handling
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchUsers(newPage);
    }
  };
  // Initial data fetch
  useEffect(() => {
    fetchUsers(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search filtering
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const search = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(search)) ||
      (user.role && user.role.toLowerCase().includes(search)) ||
      (user.digitalID && user.digitalID.toLowerCase().includes(search))
    );
  });

  // UI helpers
  const getStatusBadgeClass = (status) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    return status === 'Active' 
      ? `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
      : `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
  };

  return (
    <div 
      ref={mainContentRef}
      className="relative min-h-screen bg-white dark:bg-gray-800 rounded-lg shadow"
      style={{ overflowY: 'auto', height: '100%' }}
    >
      {/* Success/Error messages */}
      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 dark:border-green-700 text-green-700 dark:text-green-200 p-4 mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-200 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      ) : (
        <>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.digitalID} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.digitalID}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(user.status || 'Active')}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/50"
                          title="Edit"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/50"
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {users.length === 0 ? 'No users found' : 'No users match your search'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {!searchTerm && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Add User Button */}
      {showFloatingButton && (
        <div className="fixed bottom-4 right-10 z-10 transition-opacity duration-300">
          <button 
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
            onClick={handleAddUserClick}
          >
            <FiUserPlus className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Confirm Deletion
                </h3>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete user <span className="font-semibold">{userToDelete?.name}</span>?
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  This action cannot be undone. All user data will be permanently removed.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
                
                {!selectedUser && (
                  <div>
                    <label htmlFor="digitalID" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Digital ID
                    </label>
                    <input
                      type="text"
                      id="digitalID"
                      name="digitalID"
                      value={editFormData.digitalID}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="pharmacist">Pharmacist</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedUser ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default UserManagement;