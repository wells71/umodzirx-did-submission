import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Enhanced custom hook for authentication functionality
 * Extends the base useAuth hook with additional utilities
 * @returns {Object} Authentication utilities and state
 */
const useAuth = () => {
  const auth = useAuthContext();
  const navigate = useNavigate();

  /**
   * Enhanced logout function that also navigates to login
   */
  const logout = () => {
    auth.logout();
    localStorage.clear();
    navigate('/login');
  };
  /**
   * Get user information from localStorage
   * @returns {Object} User information
   */
  const getUserInfo = () => {
    const userRole = localStorage.getItem('userRole');
    
    // Get the appropriate ID based on role
    let userId;
    if (userRole === 'doctor') {
      userId = localStorage.getItem('doctorId') || localStorage.getItem('userId');
    } else if (userRole === 'pharmacist') {
      userId = localStorage.getItem('pharmaId') || localStorage.getItem('userId');
    } else if (userRole === 'patient') {
      userId = localStorage.getItem('patientId') || localStorage.getItem('userId');
    } else if (userRole === 'admin') {
      userId = localStorage.getItem('adminId') || localStorage.getItem('userId');
    } else {
      userId = localStorage.getItem('userId');
    }
    
    // Get the appropriate name based on role
    const userName = localStorage.getItem('userName') || 
                    localStorage.getItem('doctorName') || 
                    localStorage.getItem('pharmaName') || 
                    localStorage.getItem('adminName') ||
                    localStorage.getItem('patientName') ||
                    'User';
    
    console.log('Auth info from localStorage:', { 
      id: userId, 
      name: userName, 
      role: userRole,
      allUserIds: {
        userId: localStorage.getItem('userId'),
        doctorId: localStorage.getItem('doctorId'),
        pharmaId: localStorage.getItem('pharmaId'),
        patientId: localStorage.getItem('patientId'),
        adminId: localStorage.getItem('adminId')
      }
    });
    
    return {
      id: userId,
      name: userName,
      role: userRole
    };
  };

  return {
    ...auth,
    logout,
    getUserInfo
  };
};

export default useAuth;