const axios = require('axios');
const { faker } = require('@faker-js/faker');

const admin_BASE_URL = 'http://localhost:5000'; // Update with your actual base URL
const ADMIN_TOKEN = 'your_admin_token_here'; // Replace with a valid admin token

// Function to generate a random digital ID
const generateDigitalID = () => {
  return faker.string.uuid().replace(/-/g, '').substring(0, 16);
};

// Function to create a single user
const createUser = async () => {
  const roles = ['admin', 'doctor', 'pharmacist'];
  const statuses = ['Active', 'Inactive'];
  
  const userData = {
    digitalID: generateDigitalID(),
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(roles),
    status: faker.helpers.arrayElement(statuses)
  };

  try {
    const response = await axios.post(`${admin_BASE_URL}/admin/users`, userData, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}` // Using the token directly
      }
    });
    console.log(`Created user: ${userData.name} (${userData.digitalID})`);
    return response.data;
  } catch (error) {
    console.error(`Error creating user ${userData.name}:`, error.response?.data?.message || error.message);
    return null;
  }
};

// Function to create multiple users with a delay between requests
const createMultipleUsers = async (count) => {
  const createdUsers = [];
  
  for (let i = 0; i < count; i++) {
    const user = await createUser();
    if (user) {
      createdUsers.push(user);
    }
    
    // Add a small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return createdUsers;
};

// Main execution
(async () => {
  try {
    console.log('Starting to create fake users...');
    const users = await createMultipleUsers(85);
    console.log(`Successfully created ${users.length} users.`);
    if (users.length > 0) {
      console.log('Sample created user:', users[0]);
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
})();