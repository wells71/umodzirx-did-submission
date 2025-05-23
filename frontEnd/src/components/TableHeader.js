import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const TableHeader = ({ 
  title, 
  searchPlaceholder = "Search...",
  onSearch,
  onFilter,
  searchValue,
  onSearchChange,
  onSearchReset,
  showFilterButton = true,
  filterOptions = []
}) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef();
  const searchInputRef = useRef();

  // Handle click outside filter menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          {searchValue && (
            <button
              onClick={() => {
                onSearchReset();
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={onSearch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Search
        </button>
        {showFilterButton && (
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${showFilterMenu ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
            >
              <FiFilter className="h-5 w-5" />
            </button>
            {showFilterMenu && filterOptions.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                {filterOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onFilter(option.value);
                      setShowFilterMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableHeader;
