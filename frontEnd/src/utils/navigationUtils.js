/**
 * Navigation utilities to help with routing and navigation
 */

/**
 * Navigate to a route using the provided navigation function or fall back to window.location
 * 
 * @param {string} path - The route path to navigate to
 * @param {object} options - Navigation options
 */
export const navigateTo = (path, options = {}) => {
  console.log('Navigation request to:', path);
  
  try {
    // If React Router's useNavigate hook has been provided
    if (options.navigate && typeof options.navigate === 'function') {
      console.log('Using provided navigate function');
      options.navigate(path);
      return;
    }
    
    // If running inside React Router context but navigate not provided
    if (options.useHistory && window.history) {
      console.log('Using window.history.push');
      window.history.pushState({}, '', path);
      // Dispatch a popstate event to notify React Router of the change
      window.dispatchEvent(new Event('popstate'));
      return;
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
  
  // Fallback to basic location change
  console.log('Fallback: Using window.location');
  window.location.href = path;
};

/**
 * Helper for verify button click handlers
 * @param {string} destination - Where to navigate after verification
 * @param {function} navigate - React Router's navigate function (optional)
 */
const _handleVerifyClick = (destination, navigate = null) => {
  console.log('Verify button clicked, navigating to:', destination);
  navigateTo(destination, { navigate });
};

/**
 * Handle verification flow for various component types
 * @param {function} navigate - React Router's navigate function (optional)
 */
export const verificationHandlers = {
  /**
   * Handle verification for doctor components
   */
  doctor: {
    handleVerifyClick: (navigate = null) => _handleVerifyClick('/doctor/verify-patient', navigate)
  },
  
  /**
   * Handle verification for pharmacist components
   */
  pharmacist: {
    handleVerifyClick: (navigate = null) => _handleVerifyClick('/pharmacist/verify-prescription', navigate)
  },
  
  /**
   * Handle verification for patient components
   */
  patient: {
    handleVerifyClick: (navigate = null) => _handleVerifyClick('/patient/view-prescription', navigate)
  }
};

// Export a default handleVerifyClick function for backward compatibility
export const handleVerifyClick = (destination = '/verify', navigate = null) => {
  navigateTo(destination, { navigate });
};

export default {
  navigateTo,
  handleVerifyClick,
  verificationHandlers
};