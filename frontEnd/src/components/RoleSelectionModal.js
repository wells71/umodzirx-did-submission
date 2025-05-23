import React from "react";

const RoleSelectionModal = ({ roles, onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
        <h2 className="text-xl font-semibold mb-4">Select Your Role</h2>
        <p className="text-gray-600 mb-4">Please select a role to continue:</p>
        <div className="flex flex-col gap-2">
          {roles.map((role) => (
            <button
              key={role}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => onSelect(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
        <button
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
