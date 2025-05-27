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

      window.dispatchEvent(new Event('popstate'));
      return;
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }

  console.log('Fallback: Using window.location');
  window.location.href = path;
};

const _handleVerifyClick = (destination, navigate = null) => {
  console.log('Verify button clicked, navigating to:', destination);
  navigateTo(destination, { navigate });
};

export const verificationHandlers = {

  doctor: {
    handleVerifyClick: (navigate = null) => _handleVerifyClick('/doctor/verify-patient', navigate)
  },
  
  pharmacist: {
    handleVerifyClick: (navigate = null) => _handleVerifyClick('/pharmacist/verify-prescription', navigate)
  },
  
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