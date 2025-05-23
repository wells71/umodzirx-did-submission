import React from 'react';
import { FiInfo, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const AdherenceInfoCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <div className="flex items-center mb-4">
        <FiInfo className="text-blue-500 dark:text-blue-400 w-5 h-5 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Understanding Patient Adherence</h3>
      </div>
      
      <div className="prose dark:prose-invert max-w-none text-sm">
        <p className="text-gray-600 dark:text-gray-300">
          Patient adherence refers to the extent to which patients take their medications as prescribed by their healthcare provider. 
          In e-prescription apps like UmodziRx, adherence monitoring is a critical feature for ensuring treatment effectiveness.
        </p>
        
        <h4 className="font-medium text-gray-800 dark:text-white mt-4 mb-2">Why Patient Adherence Matters</h4>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-inside">
          <li className="flex items-start">
            <FiCheckCircle className="text-green-500 dark:text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Improved Health Outcomes:</strong> Proper medication adherence leads to better disease management and fewer complications.</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-green-500 dark:text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Reduced Healthcare Costs:</strong> Non-adherence leads to approximately $300 billion in avoidable healthcare costs annually.</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-green-500 dark:text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Better Treatment Decisions:</strong> Accurate adherence data helps doctors make informed decisions about therapy adjustments.</span>
          </li>
        </ul>
        
        <h4 className="font-medium text-gray-800 dark:text-white mt-4 mb-2">Common Barriers to Adherence</h4>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-inside">
          <li className="flex items-start">
            <FiAlertCircle className="text-amber-500 dark:text-amber-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Forgetfulness:</strong> Simply forgetting to take medication at the right time.</span>
          </li>
          <li className="flex items-start">
            <FiAlertCircle className="text-amber-500 dark:text-amber-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Medication Cost:</strong> Inability to afford prescribed medications.</span>
          </li>
          <li className="flex items-start">
            <FiAlertCircle className="text-amber-500 dark:text-amber-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Side Effects:</strong> Discontinuing medication due to adverse effects.</span>
          </li>
          <li className="flex items-start">
            <FiAlertCircle className="text-amber-500 dark:text-amber-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Complexity:</strong> Difficulty managing multiple medications or complex dosing schedules.</span>
          </li>
        </ul>
        
        <h4 className="font-medium text-gray-800 dark:text-white mt-4 mb-2">How UmodziRx Improves Adherence</h4>
        <p className="text-gray-600 dark:text-gray-300">
          Our e-prescription platform enhances medication adherence through:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-inside">
          <li className="flex items-start">
            <FiCheckCircle className="text-blue-500 dark:text-blue-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Smart Reminders:</strong> Automated notifications for medication times.</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-blue-500 dark:text-blue-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Refill Tracking:</strong> Monitoring prescription status and enabling timely refills.</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-blue-500 dark:text-blue-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Education:</strong> Patient resources on the importance of medication adherence.</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-blue-500 dark:text-blue-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Doctor Communication:</strong> Direct messaging with healthcare providers about concerns.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdherenceInfoCard;
