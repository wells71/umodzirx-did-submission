import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewPatientPrescriptions = () => {
    const { id } = useParams(); // Get patient ID from URL
    const navigate = useNavigate();
    const [digitalId, setDigitalId] = useState(id || '');
    const [prescriptions, setPrescriptions] = useState([]);
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If ID is provided in the URL, load patient data automatically
    useEffect(() => {
        if (id) {
            fetchPatientPrescriptions(id);
        }
    }, [id]);

    const fetchPatientPrescriptions = async (patientId) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/patient/prescriptions`, {
                params: { patientId }
            });
            
            if (response.data.success) {
                setPrescriptions(response.data.data.prescriptions || []);
                setPatientInfo({
                    name: response.data.data.patientName,
                    id: response.data.data.patientId
                });
            } else {
                setError('No prescriptions found for this patient');
                setPrescriptions([]);
            }
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
            setError('Failed to fetch patient prescriptions. Please try again.');
            setPrescriptions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewPrescriptions = () => {
        if (!digitalId.trim()) {
            setError('Please enter a patient ID');
            return;
        }
        fetchPatientPrescriptions(digitalId);
    };

    return (
        <div className="p-3 sm:p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto my-4 sm:my-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">View Patient Prescriptions</h2>
            <div className="space-y-3 sm:space-y-4">
                <div>
                    <label htmlFor="digitalId" className="block text-xs sm:text-sm font-medium text-gray-700">
                        Patient Digital ID
                    </label>
                    <input
                        type="text"
                        id="digitalId"
                        value={digitalId}
                        onChange={(e) => setDigitalId(e.target.value)}
                        className="mt-1 block w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                        placeholder="Enter Patient Digital ID"
                    />
                </div>
                <button
                    onClick={handleViewPrescriptions}
                    className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    View Prescriptions
                </button>
            </div>

            {prescriptions.length > 0 && (
                <div className="mt-4 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Prescriptions</h3>
                    <ul className="space-y-2 sm:space-y-3">
                        {prescriptions.map((prescription) => (
                            <li key={prescription.id} className="p-3 sm:p-4 bg-gray-50 rounded-md shadow-sm hover:shadow-md transition-shadow">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3">
                                    <p className="text-xs sm:text-sm"><span className="font-medium">Medication:</span> {prescription.medication}</p>
                                    <p className="text-xs sm:text-sm"><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                                </div>
                                <p className="text-xs sm:text-sm mt-1 sm:mt-2"><span className="font-medium">Instructions:</span> {prescription.instructions}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ViewPatientPrescriptions;
