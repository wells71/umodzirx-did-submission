import React, { useState, useEffect } from 'react';
import { FiMapPin, FiHome, FiPackage, FiPhone, FiGlobe, FiClock, FiInfo, FiSearch, FiX, FiAlertCircle } from 'react-icons/fi';
import locationService from '../../../services/locationService';

/**
 * HealthcareLocationsContent - A component that displays nearby pharmacies and hospitals
 * 
 * @returns {JSX.Element} The rendered component
 */
const HealthcareLocationsContent = () => {
  const [locations, setLocations] = useState({
    pharmacies: [],
    hospitals: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pharmacies');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch locations data
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user's location (in a real implementation, use the browser's geolocation API)
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

  // Filter locations based on search query
  const filteredLocations = React.useMemo(() => {
    if (!searchQuery.trim()) return locations[activeTab];
    
    return locations[activeTab].filter(location => 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [locations, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Healthcare Locations</h2>
        
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('pharmacies')}
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === 'pharmacies' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <FiPackage className="mr-2" />
                Pharmacies
              </div>
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === 'hospitals' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <FiHome className="mr-2" />
                Hospitals
              </div>
            </button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <FiX className="h-4 w-4 text-gray-400 hover:text-gray-500" />
              </button>
            )}
          </div>
        </div>
        
        {/* Locations list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse flex space-x-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="rounded-full bg-gray-200 dark:bg-gray-600 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-400 dark:text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">Error Loading Locations</h3>
            <p className="text-red-600 dark:text-red-300 max-w-md mx-auto">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
        ) : filteredLocations.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <FiInfo className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Results Found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                No {activeTab} match your search criteria. Try a different search term or browse all locations.
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <FiInfo className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Locations Found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                There are no {activeTab} available in your area. Try switching to {activeTab === 'pharmacies' ? 'hospitals' : 'pharmacies'} or expanding your search radius.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map(location => (
              <button 
                key={location.id}
                className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors w-full text-left"
                onClick={() => handleLocationSelect(location, activeTab)}
              >
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3 mt-0.5">
                    {activeTab === 'pharmacies' ? 
                      <FiPackage className="h-5 w-5" /> : 
                      <FiHome className="h-5 w-5" />
                    }
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-base">{location.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{location.address}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {location.distance}
                      </span>
                      <span 
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${location.phone}`;
                        }}
                      >
                        <FiPhone className="h-3 w-3 mr-1" />
                        Call
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
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
                  <div className="flex items-start">
                    <FiMapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-sm text-gray-900 dark:text-white">{locationDetails.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FiPhone className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                      <a 
                        href={`tel:${locationDetails.phone}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {locationDetails.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FiClock className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hours</p>
                      <p className="text-sm text-gray-900 dark:text-white">{locationDetails.hours}</p>
                    </div>
                  </div>
                  
                  {locationDetails.services && (
                    <div className="flex items-start">
                      <FiInfo className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Services</p>
                        <ul className="list-disc pl-5 text-sm text-gray-900 dark:text-white">
                          {locationDetails.services.map((service, index) => (
                            <li key={index}>{service}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {locationDetails.departments && (
                    <div className="flex items-start">
                      <FiInfo className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Departments</p>
                        <ul className="list-disc pl-5 text-sm text-gray-900 dark:text-white">
                          {locationDetails.departments.map((dept, index) => (
                            <li key={index}>{dept}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {locationDetails.website && (
                    <div className="flex items-start">
                      <FiGlobe className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
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
                    </div>
                  )}
                  
                  <div className="pt-4 flex justify-between">
                    <a
                      href={`tel:${locationDetails.phone}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiPhone className="mr-2 h-4 w-4" />
                      Call
                    </a>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(locationDetails.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiMapPin className="mr-2 h-4 w-4" />
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

export default HealthcareLocationsContent;