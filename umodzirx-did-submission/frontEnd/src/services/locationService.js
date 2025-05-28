import axios from 'axios';

/**
 * Service for fetching healthcare location data
 */
const locationService = {
  /**
   * Fetch nearby healthcare locations (pharmacies and hospitals)
   * 
   * @param {Object} options - Options for the request
   * @param {number} [options.latitude] - User's latitude
   * @param {number} [options.longitude] - User's longitude
   * @param {number} [options.radius=5] - Search radius in kilometers
   * @returns {Promise<Object>} - Promise resolving to location data
   */
  async getNearbyLocations(options = {}) {
    try {
      // API:
      // const response = await axios.get('http://localhost:5000/healthcare-locations', {
      //   params: {
      //     lat: options.latitude,
      //     lng: options.longitude,
      //     radius: options.radius || 5
      //   }
      // });
      // return response.data;
      
      // Mock data for demonstration
      return {
        pharmacies: [
          { id: 'p1', name: 'City Pharmacy', address: 'Lilongwe', distance: '0.8 km', phone: '+265 1 234 5678' },
          { id: 'p2', name: 'Health Plus Pharmacy', address: 'Lilongwe', distance: '1.2 km', phone: '+265 1 987 6543' },
          { id: 'p3', name: 'MedExpress Pharmacy', address: 'Lilongwe', distance: '2.5 km', phone: '+265 1 567 8901' },
        ],
        hospitals: [
          { id: 'h1', name: 'Kamuzu Central Hospital', address: 'Lilongwe', distance: '1.5 km', phone: '+265 1 789 0123' },
          { id: 'h2', name: 'Bwaila Hospital', address: 'Lilongwe', distance: '3.2 km', phone: '+265 1 345 6789' },
          { id: 'h3', name: 'Daeyang Luke Hospital', address: 'Lilongwe', distance: '4.8 km', phone: '+265 1 234 5678' },
        ]
      };
    } catch (error) {
      console.error('Error fetching healthcare locations:', error);
      throw error;
    }
  },
  
  async getLocationDetails(id, type) {
    try {
      // API:
      // const response = await axios.get(`http://localhost:5000/healthcare-locations/${type}/${id}`);
      // return response.data;
      
      // Mock data for demonstration
      const mockPharmacies = {
        'p1': {
          id: 'p1',
          name: 'City Pharmacy',
          address: 'Lilongwe',
          phone: '+265 1 234 5678',
          hours: 'Mon-Fri: 8am-8pm, Sat: 9am-6pm, Sun: 10am-4pm',
          services: ['Prescription Filling', 'Medication Counseling', 'Immunizations'],
          website: 'https://citypharmacy.mw'
        },
        'p2': {
          id: 'p2',
          name: 'Health Plus Pharmacy',
          address: 'Lilongwe',
          phone: '+265 1 987 6543',
          hours: 'Mon-Sat: 8am-9pm, Sun: 9am-5pm',
          services: ['Prescription Filling', 'Health Screenings', 'Medication Therapy Management'],
          website: 'https://healthplus.mw'
        },
        'p3': {
          id: 'p3',
          name: 'MedExpress Pharmacy',
          address: 'Lilongwe',
          phone: '+265 1 567 8901',
          hours: 'Mon-Fri: 7am-10pm, Sat-Sun: 8am-8pm',
          services: ['24/7 Prescription Services', 'Home Delivery', 'Medication Synchronization'],
          website: 'https://medexpress.mw'
        }
      };
      
      const mockHospitals = {
        'h1': {
          id: 'h1',
          name: 'Kamuzu Central Hospital',
          address: 'Lilongwe',
          phone: '+265 1 789 0123',
          hours: '24/7 Emergency Services',
          departments: ['Emergency', 'Surgery', 'Pediatrics', 'Obstetrics', 'Internal Medicine'],
          website: 'https://kch.mw'
        },
        'h2': {
          id: 'h2',
          name: 'Bwaila Hospital',
          address: 'Lilongwe',
          phone: '+265 1 345 6789',
          hours: '24/7 Emergency Services',
          departments: ['Maternity', 'Pediatrics', 'General Medicine'],
          website: 'https://bwailahospital.mw'
        },
        'h3': {
          id: 'h3',
          name: 'Daeyang Luke Hospital',
          address: 'Lilongwe',
          phone: '+265 1 234 5678',
          hours: 'Mon-Sun: 8am-8pm, Emergency: 24/7',
          departments: ['Surgery', 'Pediatrics', 'Obstetrics', 'Dental'],
          website: 'https://daeyanghospital.org'
        }
      };
      
      if (type === 'pharmacy') {
        return mockPharmacies[id] || null;
      } else if (type === 'hospital') {
        return mockHospitals[id] || null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching details for ${type} ${id}:`, error);
      throw error;
    }
  }
};

export default locationService;