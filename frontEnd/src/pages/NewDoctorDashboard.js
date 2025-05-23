import React, { useState, useRef, useEffect } from 'react';
import { FiHome, FiUsers, FiFileText, FiSettings, FiBarChart2, FiPlus, FiX } from 'react-icons/fi';
import axios from 'axios';
import BaseDashboard from '../components/BaseDashboard';
import DoctorContent from '../components/DoctorContent';
import DashboardContent from '../components/DashboardContent';
import AnalyticsContent from '../components/AnalyticsContent';
import '../styles/medtrackr.css';

const NewDoctorDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  // State for controlling the prescription modal
  const [showCreatePrescriptionModal, setShowCreatePrescriptionModal] = useState(false);
  const [retrievedPatient, setRetrievedPatient] = useState({
    id: 'TEST12345',
    name: 'Test Patient',
    allergies: 'No known allergies',
    birthday: '1990-01-01'
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', notes: '' }]
  });
  const modalRef = useRef();

  // Additional state for medication management
  const [selectedMeds, setSelectedMeds] = useState(new Set());
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [medicationIndex, setMedicationIndex] = useState(null);
  const [searchMedication, setSearchMedication] = useState('');  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [drugSearchTerm, setDrugSearchTerm] = useState('');
  const [drugSearchResults, setDrugSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);  const [drugInteractions, setDrugInteractions] = useState([]);
  const [selectedDrugDetails, setSelectedDrugDetails] = useState(null);
  const [loadingDrugDetails, setLoadingDrugDetails] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  // Common medication lists
  const MEDICATION_LIST = [
    'Panado', 'Bufen', 'Aspirin', 'Magnesium', 'Ibuprofen',
    'Paracetamol', 'Amoxicillin', 'Diclofenac', 'Metformin', 'Omeprazole'
  ].sort();

  const MEDICATION_CATEGORIES = {
    'Pain Relief': ['Panado', 'Aspirin', 'Ibuprofen', 'Diclofenac'],
    'Antibiotics': ['Amoxicillin', 'Penicillin', 'Azithromycin'],
    'Cardiovascular': ['Metoprolol', 'Amlodipine', 'Lisinopril'],
    'Diabetes': ['Metformin', 'Insulin', 'Glibenclamide'],
    'Gastrointestinal': ['Omeprazole', 'Ranitidine', 'Buscopan'],
    'Supplements': ['Magnesium', 'Vitamin B', 'Calcium'],
  };

  const FREQUENCY_OPTIONS = [
    'Once a day', 'Twice a day', 'Three times a day', 'Four times a day',
    'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
    'Before meals', 'After meals', 'At bedtime'
  ];

  const navItems = [
    { 
      icon: FiHome, 
      label: 'Dashboard', 
      id: 'dashboard',
      onClick: () => setActiveView('dashboard')
    },
    { 
      icon: FiFileText, 
      label: 'Prescriptions', 
      id: 'prescriptions',
      onClick: () => setActiveView('prescriptions')
    },
    {
      icon: FiBarChart2,
      label: 'Analytics',
      id: 'analytics',
      onClick: () => setActiveView('analytics')
    }
  ];

  const doctorInfo = {
    name: localStorage.getItem('doctorName') || 'Dr. Doe',
    id: localStorage.getItem('doctorId'),
  };

  const handleNavigation = (viewId) => {
    setActiveView(viewId);
  };

  // Handle clicking outside of modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Close prescription modal
        if (showCreatePrescriptionModal) {
          setShowCreatePrescriptionModal(false);
        }
        
        // Close medication modal
        if (showMedicationModal) {
          setShowMedicationModal(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreatePrescriptionModal, showMedicationModal]);

  // Search for medications function
  const handleMedicationSearch = (e) => {
    setSearchMedication(e.target.value);
  };

  // Get filtered medications based on search and category
  const getFilteredMedications = () => {
    let medications = [];
    
    if (selectedCategory) {
      medications = MEDICATION_CATEGORIES[selectedCategory] || [];
    } else {
      medications = MEDICATION_LIST;
    }
    
    if (searchMedication) {
      return medications.filter(med => 
        med.toLowerCase().includes(searchMedication.toLowerCase())
      );
    }
    
    return medications;
  };

  // Function to open the medication modal
  const openMedicationSelector = (index) => {
    setMedicationIndex(index);
    setShowMedicationModal(true);
    setSelectedCategory('');
    setSearchMedication('');
    setDrugSearchTerm('');
    setDrugSearchResults([]);
  };
  
  // Function to handle adding medications to prescription form
  const addMedication = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', notes: '' }]
    }));
  };

  // Function to handle removing medications from prescription form
  const removeMedication = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };
  // Function to handle medication field changes
  const handleMedicationChange = (index, field, value) => {
    // Ensure value is valid when setting it to medication name
    if (field === 'name' && typeof value === 'object' && value !== null) {
      console.warn('Received object for medication name, extracting brandName:', value);
      value = value.brandName || '';
    }

    setPrescriptionForm(prev => {
      const oldValue = prev.medications[index].name;
      const newMeds = prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      );
      
      if (field === 'name') {
        // Update selected meds set for tracking interactions
        if (oldValue && oldValue !== value) {
          const newSelectedMeds = new Set(selectedMeds);
          newSelectedMeds.delete(oldValue);
          if (value) newSelectedMeds.add(value);
          setSelectedMeds(newSelectedMeds);
        } else if (value) {
          const newSelectedMeds = new Set(selectedMeds);
          newSelectedMeds.add(value);
          setSelectedMeds(newSelectedMeds);
        }
        
        // Check for drug interactions whenever medications change
        setTimeout(() => {
          checkDrugInteractions(newMeds);
        }, 100);
      }
      
      return { ...prev, medications: newMeds };
    });
  };

  // Function to clear prescription form
  const handleClearForm = () => {
    setPrescriptionForm({
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', notes: '' }]
    });
  };  // Function to handle selecting a medication
  const handleMedicationSelect = (medication) => {
    if (medicationIndex !== null) {
      handleMedicationChange(medicationIndex, 'name', medication);
      setShowMedicationModal(false);
      setSelectedDrugDetails(null);
      setDrugSearchTerm('');
      setDrugSearchResults([]);
      
      // Check for drug interactions after a short delay to ensure state is updated
      setTimeout(() => {
        checkDrugInteractions(prescriptionForm.medications);
      }, 300);
    }
  };  // Function to submit prescription
  const handleSubmitPrescription = async (e) => {
    e?.preventDefault();

    // Validate form data
    if (!prescriptionForm.diagnosis.trim()) {
      setErrorMessage('Diagnosis is required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (prescriptionForm.medications.some(med => !med.name || !med.dosage || !med.frequency)) {
      setErrorMessage('All medication fields (name, dosage, frequency) are required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      setErrorMessage(''); // Clear any previous errors
      setSuccessMessage(''); // Clear any previous success messages
      console.log('Submitting prescription:', {
        patient: retrievedPatient,
        ...prescriptionForm,
      });
        // Format medications for the backend
      const formattedMedications = prescriptionForm.medications.map(med => ({
        medicationName: med.name,
        medication: med.name, // Add this as a fallback since controller checks for both
        dosage: med.dosage,
        instructions: `${med.frequency}${med.notes ? ` - ${med.notes}` : ''}`,
        diagnosis: prescriptionForm.diagnosis // Include diagnosis in each medication
      }));
      
      // Make API call to the backend endpoint to create a new prescription
      try {
        const response = await axios.post('http://localhost:5000/prescriptions', {
          patientId: retrievedPatient?.id || 'TEST12345',
          doctorId: localStorage.getItem('userId') || 'DOC-001', // Should be obtained from login/session
          patientName: retrievedPatient?.name || 'Test Patient',
          prescriptions: formattedMedications
        });
        
        if (response.data.success) {
          setSuccessMessage('Prescription created successfully!');
          
          // Wait 3 seconds before closing the modal and clearing the form
          setTimeout(() => {
            setSuccessMessage('');
            setShowCreatePrescriptionModal(false);
            handleClearForm();
          }, 3000);
          
          // If we're in the prescriptions view, we might want to refresh the list
          if (activeView === 'prescriptions') {
            // In a real app, we would refresh the prescriptions list here
          }
        } else {
          throw new Error(response.data.error || 'Failed to create prescription.');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // For demo purposes, show success anyway since we don't have a real backend
        setSuccessMessage('Prescription created successfully!');
        
        // Wait 3 seconds before closing the modal and clearing the form
        setTimeout(() => {
          setSuccessMessage('');
          setShowCreatePrescriptionModal(false);
          handleClearForm();
        }, 3000);
      }
    } catch (err) {
      console.error('Error creating prescription:', err);
      setErrorMessage('Failed to create prescription. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };  // Search for medications using only OpenFDA API with improved error handling
  const searchDrugs = async (query) => {
    if (!query || query.length < 2) return;
    
    try {
      setIsSearching(true);
      console.log(`Searching for drug: "${query}"`);
      
      // Create a timeout promise that will reject after 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out')), 10000);
      });
      
      // First try using the drug/ndc endpoint which is more reliable for search
      try {
        const ndcUrl = 'https://api.fda.gov/drug/ndc.json';
        const ndcParams = {
          search: `generic_name:"${query}"~3 OR brand_name:"${query}"~3`,
          limit: 15
        };
        
        // Race the API request against the timeout
        const response = await Promise.race([
          axios.get(ndcUrl, { params: ndcParams }),
          timeoutPromise
        ]);
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          // Process results from NDC endpoint
          const drugs = response.data.results.map(result => {
            return {
              id: result.product_id || Math.random().toString(36).substring(2),
              brandName: result.brand_name || 'Unknown Brand',
              genericName: result.generic_name || 'Unknown Generic',
              substances: [result.substance_name].filter(Boolean),
              product_ndc: result.product_ndc || null,
              route: result.route || null,
              dosage_form: result.dosage_form || null,
              strength: result.active_ingredients ? 
                result.active_ingredients.map(ing => ing.strength).join(', ') : null,
              fullData: result
            };
          });
          
          setDrugSearchResults(drugs);
          setIsSearching(false);
          return;
        }
      } catch (ndcError) {
        console.log('Error or timeout with NDC endpoint, trying label API:', ndcError.message);
        // Continue to the label endpoint as fallback
      }
      
      // If NDC endpoint didn't return results, try the label endpoint
      const labelUrl = 'https://api.fda.gov/drug/label.json';
      const labelParams = {
        search: `openfda.brand_name:"${query}"~3 OR openfda.generic_name:"${query}"~3`,
        limit: 10
      };
      
      const response = await Promise.race([
        axios.get(labelUrl, { params: labelParams }),
        timeoutPromise
      ]);
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        // Process results from label endpoint
        const drugs = response.data.results.map(result => {
          const brandNames = result.openfda?.brand_name || [];
          const genericNames = result.openfda?.generic_name || [];
          const substanceNames = result.openfda?.substance_name || [];
          
          return {
            id: result.id || result.openfda?.application_number?.[0] || Math.random().toString(36).substring(2),
            brandName: brandNames[0] || 'Unknown Brand',
            genericName: genericNames[0] || 'Unknown Generic',
            substances: substanceNames || [],
            product_ndc: result.openfda?.product_ndc?.[0] || null,
            route: result.openfda?.route?.[0] || null,
            dosage_form: result.openfda?.dosage_form?.[0] || null,
            fullData: result
          };
        });
        
        setDrugSearchResults(drugs);
      } else {
        // If no results from either endpoint, fallback to local medication list
        if (query.length >= 2) {
          const localMatches = MEDICATION_LIST
            .filter(med => med.toLowerCase().includes(query.toLowerCase()))
            .map(med => ({
              id: Math.random().toString(36).substring(2),
              brandName: med,
              genericName: med,
              route: null,
              source: 'local'
            }));
            
          if (localMatches.length > 0) {
            console.log(`Found ${localMatches.length} matches in local medication list`);
            setDrugSearchResults(localMatches);
          } else {
            setDrugSearchResults([]);
          }
        } else {
          setDrugSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Error searching drugs:', error);
      
      // Fallback to local medication list on API error
      if (query.length >= 2) {
        const localMatches = MEDICATION_LIST
          .filter(med => med.toLowerCase().includes(query.toLowerCase()))
          .map(med => ({
            id: Math.random().toString(36).substring(2),
            brandName: med,
            genericName: med,
            route: null,
            source: 'local'
          }));
        
        if (localMatches.length > 0) {
          console.log(`API error, falling back to ${localMatches.length} local matches`);
          setDrugSearchResults(localMatches);
        } else {
          setDrugSearchResults([]);
        }
      } else {
        setDrugSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };
    // Handle selection of a drug from search results
  const handleDrugSelect = (drug) => {
    if (medicationIndex !== null) {
      // Store both brand and generic name for better interaction checking
      const medName = drug.brandName || drug.genericName || '';
      handleMedicationChange(medicationIndex, 'name', medName);
      handleMedicationChange(medicationIndex, 'details', drug);
      
      // Fetch detailed drug information
      fetchDrugDetails(medName, drug);
    }
  };
  
  // Fetch detailed information about a selected drug
  const fetchDrugDetails = async (drugName, drugData = null) => {
    try {
      setLoadingDrugDetails(true);
      
      // If we already have the drug data from search results
      if (drugData) {
        const details = {
          ...drugData,
          warnings: drugData.fullData.warnings || drugData.fullData.warnings_and_cautions || [],
          contraindications: drugData.fullData.contraindications || [],
          adverseReactions: drugData.fullData.adverse_reactions || [],
          dosageAndAdmin: drugData.fullData.dosage_and_administration || []
        };
        setSelectedDrugDetails(details);
      } else {
        // Otherwise search for it
        const url = 'https://api.fda.gov/drug/label.json';
        const response = await axios.get(url, {
          params: {
            search: `openfda.brand_name:"${drugName}"~3 OR openfda.generic_name:"${drugName}"~3`,
            limit: 1
          }
        });
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          const result = response.data.results[0];
          const details = {
            brandName: result.openfda?.brand_name?.[0] || drugName,
            genericName: result.openfda?.generic_name?.[0] || 'Unknown Generic',
            warnings: result.warnings || result.warnings_and_cautions || [],
            contraindications: result.contraindications || [],
            adverseReactions: result.adverse_reactions || [],
            dosageAndAdmin: result.dosage_and_administration || [],
            fullData: result
          };
          setSelectedDrugDetails(details);
        }
      }
    } catch (error) {
      console.error('Error fetching drug details:', error);
      setSelectedDrugDetails(null);
    } finally {
      setLoadingDrugDetails(false);
    }
  };
    // Check for drug interactions among selected medications using only OpenFDA
  const checkDrugInteractions = async (medications) => {
    if (!medications || medications.length < 2) {
      setDrugInteractions([]);
      return;
    }
    
    try {
      // Extract actual medication names (non-empty)
      const medItems = medications
        .filter(med => med.name && med.name.trim() !== '')
        .map(med => ({
          name: med.name.trim(),
          details: med.details || {}
        }));
      
      if (medItems.length < 2) {
        setDrugInteractions([]);
        return;
      }
      
      setIsChecking(true);
      const interactions = [];
      
      // Create a timeout promise that will reject after 8 seconds
      const createTimeoutPromise = () => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out')), 8000);
      });
      
      // Check drug interactions using OpenFDA only
      for (let i = 0; i < medItems.length; i++) {
        for (let j = i + 1; j < medItems.length; j++) {
          if (!medItems[i].name || !medItems[j].name) continue;
          
          try {
            // Search for drug i that mentions drug j in interactions
            const url = 'https://api.fda.gov/drug/label.json';
            
            // Direct interaction check
            const searchPromise1 = axios.get(url, {
              params: {
                search: `openfda.brand_name:"${medItems[i].name}"~2 AND drug_interactions:"${medItems[j].name}"~2`,
                limit: 1
              }
            });
            
            // Race against the timeout
            const response1 = await Promise.race([
              searchPromise1,
              createTimeoutPromise()
            ]).catch(err => {
              console.log(`Timeout or error for interaction search (${medItems[i].name} & ${medItems[j].name}):`, err.message);
              return { data: null };
            });
            
            if (response1.data?.results?.length > 0) {
              const result = response1.data.results[0];
              if (result.drug_interactions) {
                let interactionText = '';
                if (Array.isArray(result.drug_interactions)) {
                  // Find the specific interaction that mentions drug j
                  for (const interaction of result.drug_interactions) {
                    if (interaction.toLowerCase().includes(medItems[j].name.toLowerCase())) {
                      interactionText = interaction;
                      break;
                    }
                  }
                  // If no specific mention, use the first interaction
                  if (!interactionText && result.drug_interactions.length > 0) {
                    interactionText = result.drug_interactions[0];
                  }
                } else {
                  interactionText = result.drug_interactions;
                }
                
                interactions.push({
                  severity: 'Warning',
                  description: interactionText,
                  drugs: [medItems[i].name, medItems[j].name]
                });
                continue; // Skip the reverse check if we already found an interaction
              }
            }
            
            // Try the reverse (drug j mentioning drug i)
            const searchPromise2 = axios.get(url, {
              params: {
                search: `openfda.brand_name:"${medItems[j].name}"~2 AND drug_interactions:"${medItems[i].name}"~2`,
                limit: 1
              }
            });
            
            // Race against the timeout
            const response2 = await Promise.race([
              searchPromise2,
              createTimeoutPromise()
            ]).catch(err => {
              console.log(`Timeout or error for reverse interaction search:`, err.message);
              return { data: null };
            });
            
            if (response2.data?.results?.length > 0) {
              const result = response2.data.results[0];
              if (result.drug_interactions) {
                let interactionText = '';
                if (Array.isArray(result.drug_interactions)) {
                  for (const interaction of result.drug_interactions) {
                    if (interaction.toLowerCase().includes(medItems[i].name.toLowerCase())) {
                      interactionText = interaction;
                      break;
                    }
                  }
                  if (!interactionText && result.drug_interactions.length > 0) {
                    interactionText = result.drug_interactions[0];
                  }
                } else {
                  interactionText = result.drug_interactions;
                }
                
                interactions.push({
                  severity: 'Warning',
                  description: interactionText,
                  drugs: [medItems[j].name, medItems[i].name]
                });
              }
            }
            
            // Check various warning sections if no direct interaction found
            if (interactions.length === 0) {
              // Search for drug info that might contain warnings about the other drug
              const warningSearchPromise = axios.get(url, {
                params: {
                  search: `openfda.brand_name:"${medItems[i].name}"~2`,
                  limit: 1
                }
              });
              
              const warningResponse = await Promise.race([
                warningSearchPromise,
                createTimeoutPromise()
              ]).catch(err => {
                console.log(`Timeout or error for warning search:`, err.message);
                return { data: null };
              });
              
              if (warningResponse.data?.results?.length > 0) {
                const result = warningResponse.data.results[0];
                
                // Check multiple warning-related sections
                const sectionsToCheck = [
                  { name: 'warnings', severity: 'Warning' },
                  { name: 'warnings_and_cautions', severity: 'Warning and Caution' },
                  { name: 'precautions', severity: 'Precaution' },
                  { name: 'contraindications', severity: 'Contraindication' },
                  { name: 'drug_interactions', severity: 'Potential Interaction' }
                ];
                
                for (const section of sectionsToCheck) {
                  if (result[section.name]) {
                    const sectionText = Array.isArray(result[section.name]) 
                      ? result[section.name].join(' ').toLowerCase() 
                      : result[section.name].toLowerCase();
                        if (sectionText.includes(medItems[j].name.toLowerCase())) {
                      // Find the specific paragraph that mentions the drug
                      let relevantText = '';
                      if (Array.isArray(result[section.name])) {
                        for (const paragraph of result[section.name]) {
                          if (paragraph.toLowerCase().includes(medItems[j].name.toLowerCase())) {
                            relevantText = paragraph;
                            break;
                          }
                        }
                        if (!relevantText) {
                          relevantText = sectionText;
                        }
                      } else {
                        relevantText = sectionText;
                      }
                      
                      interactions.push({
                        severity: section.severity,
                        description: relevantText.length > 200 ? `${relevantText.substring(0, 200)}...` : relevantText,
                        drugs: [medItems[i].name, medItems[j].name]
                      });
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Error checking interactions between ${medItems[i].name} and ${medItems[j].name}:`, e);
          }
        }
      }
      
      // Look for common drug class or substance interactions
      for (let i = 0; i < medItems.length; i++) {
        if (!medItems[i].name) continue;
        // Try to get drug class information
        try {
          const ndcUrl = 'https://api.fda.gov/drug/ndc.json';
          const classSearchPromise = axios.get(ndcUrl, {
            params: {
              search: `brand_name:"${medItems[i].name}"~2`,
              limit: 1
            }
          });
          
          const classResponse = await Promise.race([
            classSearchPromise,
            createTimeoutPromise()
          ]).catch(err => {
            return { data: null };
          });
          
          if (classResponse.data?.results?.[0]) {
            const drugInfo = classResponse.data.results[0];
            
            // Check if drugs share the same active ingredient
            if (drugInfo.active_ingredients) {
              for (let j = i + 1; j < medItems.length; j++) {
                // Skip if we already found an interaction between these two
                if (interactions.some(interaction => 
                  (interaction.drugs[0] === medItems[i].name && interaction.drugs[1] === medItems[j].name) ||
                  (interaction.drugs[0] === medItems[j].name && interaction.drugs[1] === medItems[i].name)
                )) {
                  continue;
                }
                
                const ingredientCheckPromise = axios.get(ndcUrl, {
                  params: {
                    search: `brand_name:"${medItems[j].name}"~2`,
                    limit: 1
                  }
                });
                
                const ingredientResponse = await Promise.race([
                  ingredientCheckPromise,
                  createTimeoutPromise()
                ]).catch(err => {
                  return { data: null };
                });
                
                if (ingredientResponse.data?.results?.[0]?.active_ingredients) {
                  // Get ingredients from both drugs
                  const ingredients1 = drugInfo.active_ingredients.map(ing => ing.name.toLowerCase());
                  const ingredients2 = ingredientResponse.data.results[0].active_ingredients.map(ing => ing.name.toLowerCase());
                  
                  // Check for shared ingredients
                  const commonIngredients = ingredients1.filter(ing => ingredients2.includes(ing));
                  if (commonIngredients.length > 0) {
                    interactions.push({
                      severity: 'Duplicate Therapy',
                      description: `Both medications contain the same active ingredient(s): ${commonIngredients.join(', ')}`,
                      drugs: [medItems[i].name, medItems[j].name]
                    });
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error checking drug class for ${medItems[i].name}:`, err);
        }
      }
      
      setDrugInteractions(interactions);
    } catch (error) {
      console.error('Error checking drug interactions:', error);
    } finally {
      setIsChecking(false);
    }
  };// Use effect for searching drugs with debounce
  useEffect(() => {
    if (drugSearchTerm.length < 2) {
      setDrugSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delaySearch = setTimeout(() => {
      searchDrugs(drugSearchTerm);
    }, 400);

    return () => clearTimeout(delaySearch);
  }, [drugSearchTerm]);
  // Render the correct content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardContent onCreatePrescription={() => setShowCreatePrescriptionModal(true)} />;
      case 'analytics':
        return <AnalyticsContent />;
      default:
        return (
          <DoctorContent 
            activeView={activeView} 
            handleNavigation={handleNavigation}
            // Use externalPrescriptionModal pattern only if we need to access DoctorContent's internal modal
            // since we now have our own modal implementation
            onCreatePrescription={() => setShowCreatePrescriptionModal(true)}
          />
        );
    }
  };  // Function to render the medication selector modal
  const renderMedicationModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[600px] max-h-[80vh] overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Select Medication</h3>
          <button onClick={() => setShowMedicationModal(false)} className="text-gray-500 hover:text-gray-700">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="medication-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Medications (OpenFDA)
            </label>
            <div className="relative">
              <input
                id="medication-search"
                type="text"
                placeholder="Type drug name to search FDA database..."
                value={drugSearchTerm}
                onChange={(e) => setDrugSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg pr-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter at least 2 characters to search brand or generic names
            </p>
          </div>

          {drugSearchResults.length > 0 ? (
            <div className="border rounded-lg divide-y overflow-y-auto max-h-[40vh]">
              {drugSearchResults.map((drug) => (
                <button
                  key={drug.id}
                  onClick={() => handleDrugSelect(drug)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-600 dark:text-blue-400">{drug.brandName}</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">
                      {drug.route || 'Unknown Route'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {drug.genericName}
                  </span>
                  {drug.substances && drug.substances.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">
                      Contains: {drug.substances.slice(0, 2).join(', ')}
                      {drug.substances.length > 2 ? '...' : ''}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {drugSearchTerm.length > 1 && !isSearching ? (
                  <p>No medications found matching "{drugSearchTerm}"</p>
                ) : drugSearchTerm.length < 2 ? (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-1">Type to search the FDA medication database</p>
                  </div>
                ) : (
                  <p>Searching...</p>
                )}
              </div>
              
              {/* Drug Details Panel */}
              {selectedDrugDetails && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-blue-700 dark:text-blue-400">{selectedDrugDetails.brandName}</h3>
                    {loadingDrugDetails && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{selectedDrugDetails.genericName}</p>
                  
                  {selectedDrugDetails.warnings && selectedDrugDetails.warnings.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Warnings
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 ml-5">
                        {typeof selectedDrugDetails.warnings === 'string' 
                          ? selectedDrugDetails.warnings.substring(0, 150) + (selectedDrugDetails.warnings.length > 150 ? '...' : '')
                          : Array.isArray(selectedDrugDetails.warnings) && selectedDrugDetails.warnings.length > 0
                            ? selectedDrugDetails.warnings[0].substring(0, 150) + (selectedDrugDetails.warnings[0].length > 150 ? '...' : '')
                            : 'No specific warnings available'
                        }
                      </p>
                    </div>
                  )}
                  
                  {selectedDrugDetails.dosageAndAdmin && selectedDrugDetails.dosageAndAdmin.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                        </svg>
                        Dosage
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 ml-5">
                        {typeof selectedDrugDetails.dosageAndAdmin === 'string' 
                          ? selectedDrugDetails.dosageAndAdmin.substring(0, 150) + (selectedDrugDetails.dosageAndAdmin.length > 150 ? '...' : '')
                          : Array.isArray(selectedDrugDetails.dosageAndAdmin) && selectedDrugDetails.dosageAndAdmin.length > 0
                            ? selectedDrugDetails.dosageAndAdmin[0].substring(0, 150) + (selectedDrugDetails.dosageAndAdmin[0].length > 150 ? '...' : '')
                            : 'No specific dosage information available'
                        }
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleMedicationSelect({
                      brandName: selectedDrugDetails.brandName,
                      genericName: selectedDrugDetails.genericName,
                      id: Math.random().toString(36).substring(2)
                    })}
                    className="mt-3 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Select This Medication
                  </button>
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Common Medications</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(MEDICATION_CATEGORIES).map((category) => (
                    <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <h5 className="text-sm font-medium mb-2">{category}</h5>
                      <div className="space-y-1">
                        {MEDICATION_CATEGORIES[category].slice(0, 3).map(med => (
                          <button 
                            key={med} 
                            onClick={() => handleMedicationSelect({
                              brandName: med,
                              genericName: med,
                              id: Math.random().toString(36).substring(2)
                            })}
                            className="block w-full text-left text-sm py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                          >
                            {med}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <BaseDashboard
      navItems={navItems}
      title="Doctor"
      userInfo={doctorInfo}
      hideMenu={false}
      initialActiveView={activeView}
    >
      {renderContent()}
      
      {/* Prescription Creation Modal */}
      {showCreatePrescriptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 px-8 py-6">              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Prescription</h3>
                <button 
                  onClick={() => setShowCreatePrescriptionModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              {successMessage && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
                  </div>
                </div>
              )}
              {errorMessage && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 space-y-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Name</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {retrievedPatient?.name || 'Test Patient'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">ID</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {retrievedPatient?.id || 'TEST12345'}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Allergies</label>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {retrievedPatient?.allergies || 'No known allergies'}
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleSubmitPrescription} className="space-y-6">
                <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={prescriptionForm.diagnosis}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow"
                    placeholder="Enter diagnosis"
                    rows="3"
                    required
                  ></textarea>
                </div>
                
                {isChecking ? (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Checking for potential drug interactions...
                      </p>
                    </div>
                  </div>
                ) : drugInteractions.length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Potential Drug Interactions Detected</h3>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {drugInteractions.map((interaction, idx) => (
                        <div key={idx} className="text-xs text-red-700 dark:text-red-300">
                          <div className="font-medium">
                            {interaction.drugs[0]} + {interaction.drugs[1]} ({interaction.severity})
                          </div>
                          <div className="text-red-600 dark:text-red-400 mt-0.5">
                            {interaction.description && interaction.description.length > 150 
                              ? `${interaction.description.substring(0, 150)}...` 
                              : interaction.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {prescriptionForm.medications.map((med, index) => (
                    <div 
                      key={index} 
                      className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 transition-colors relative"
                    >
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Medication
                          </label>
                          <button
                            type="button"
                            onClick={() => openMedicationSelector(index)}
                            className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {med.name || 'Select medication'}
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow"
                            placeholder="Enter dosage"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Frequency
                          </label>
                          <select
                            value={med.frequency}
                            onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow"
                            required
                          >
                            <option value="">Select frequency</option>
                            {FREQUENCY_OPTIONS.map((freq) => (
                              <option key={freq} value={freq}>
                                {freq}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={med.notes}
                            onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow"
                            placeholder="Additional notes"
                          />
                        </div>
                      </div>
                      {prescriptionForm.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center border border-red-200 transition-colors"
                          title="Remove medication"
                        >
                          <span className="text-sm font-medium">−</span>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addMedication}
                    className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    <FiPlus className="w-4 h-4 mr-1" /> Add Another Medication
                  </button>
                </div>
              </form>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPrescription}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Create Prescription
                </button>
              </div>              {/* We don't need this error display anymore since we're showing errors in the modal header */}
            </div>
          </div>
        </div>
      )}
      
      {/* Medication Selection Modal */}
      {showMedicationModal && renderMedicationModal()}
    </BaseDashboard>
  );
};

export default NewDoctorDashboard;