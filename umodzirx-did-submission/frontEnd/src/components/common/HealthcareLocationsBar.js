import React, { useState, useEffect } from 'react';
import { FiMapPin, FiHospital, FiPackage, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import locationService from '../../services/locationService';

/**
 * HealthcareLocationsBar - A component that displays nearby pharmacies and hospitals
 * 
 * @returns {JSX.Element} The rendered component
 */
const HealthcareLocationsBar = () => {
  const [locations, setLocations] = useState({
    pharmacies: [],
    hospitals: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('pharmacies');
  const [isVisible, setIsVisible] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch locations data
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user's location (in a real app, you would use the browser's geolocation API)
        // For now, we'll use default options
        const locationOptions = {
          // latitude: userPosition.latitude,
          // longitude: userPosition.longitude,
          radius: 5 // 5km radius
        };
        
        // Fetch locations from the service
        const locationsData = await locationService.getNearbyLocations(locationOptions);
        
        // Set the locations in state
        setLocations(locationsData);
        setIsLoading(false);
        
      } catch (err) {
        console.error('Error fetching healthcare locations:', err);
        setError('Failed to load healthcare locations. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchLocations();
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const closeBar = () => {
    setIsVisible(false);
  };
  
  // Handle location selection
  const handleLocationSelect = async (location, type) => {
    try {
      setSelectedLocation(location);
      setDetailsLoading(true);
      
      // Fetch detailed information about the selected location
      const details = await locationService.getLocationDetails(location.id, type === 'pharmacies' ? 'pharmacy' : 'hospital');
      
      setLocationDetails(details);
      setDetailsLoading(false);
    } catch (err) {
      console.error('Error fetching location details:', err);
      setDetailsLoading(false);
    }
  };
  
  // Close the location details modal
  const closeLocationDetails = () => {
    setSelectedLocation(null);
    setLocationDetails(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-md z-30">
      {/* Collapsed view */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <div className="mr-2 p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {activeTab === 'pharmacies' ? <FiPackage className="h-4 w-4" /> : <FiHospital className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {activeTab === 'pharmacies' ? 'Nearby Pharmacies' : 'Nearby Hospitals'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? 'Loading...' : 
                error ? 'Error loading locations' : 
                `${locations[activeTab].length} locations found`}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('pharmacies')}
            className={`px-3 py-1 text-xs rounded-md mr-2 ${
              activeTab === 'pharmacies' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Pharmacies
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3 py-1 text-xs rounded-md mr-2 ${
              activeTab === 'hospitals' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Hospitals
          </button>
          <button
            onClick={toggleExpand}
            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <FiChevronDown className="h-4 w-4" /> : <FiChevronUp className="h-4 w-4" />}
          </button>
          <button
            onClick={closeBar}
            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ml-1"
            aria-label="Close"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Expanded view */}
      {isExpanded && (
        <div className="px-4 pb-4 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500 dark:text-red-400">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations[activeTab].map(location => (
                <button 
                  key={location.id}
                  className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors w-full text-left"
                  onClick={() => handleLocationSelect(location, activeTab)}
                >
                  <div className="flex items-start">
                    <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3 mt-0.5">
                      <FiMapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{location.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{location.address}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{location.distance}</span>
                        <span 
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${location.phone}`;
                          }}
                        >
                          {location.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Location Details Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={closeLocationDetails}
            aria-hidden="true"
          ></div>
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full z-10 overflow-hidden transform transition-all"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {detailsLoading ? 'Loading...' : selectedLocation.name}
              </h3>
              <button 
                onClick={closeLocationDetails}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              {detailsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ) : locationDetails ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm text-gray-900 dark:text-white">{locationDetails.address}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <a 
                      href={`tel:${locationDetails.phone}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {locationDetails.phone}
                    </a>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hours</p>
                    <p className="text-sm text-gray-900 dark:text-white">{locationDetails.hours}</p>
                  </div>
                  
                  {locationDetails.services && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Services</p>
                      <ul className="list-disc pl-5 text-sm text-gray-900 dark:text-white">
                        {locationDetails.services.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {locationDetails.departments && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Departments</p>
                      <ul className="list-disc pl-5 text-sm text-gray-900 dark:text-white">
                        {locationDetails.departments.map((dept, index) => (
                          <li key={index}>{dept}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {locationDetails.website && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</p>
                      <a 
                        href={locationDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {locationDetails.website}
                      </a>
                    </div>
                  )}
                  
                  <div className="pt-4 flex justify-end">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(locationDetails.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-red-500 dark:text-red-400">
                  <p>Failed to load location details. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthcareLocationsBar;