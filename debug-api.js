// Debug script to test API endpoints
// Run this in your browser console on your deployed frontend

// Test 1: Check if API URL is correct
console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// Test 2: Test health endpoint
fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/../health`)
  .then(response => response.json())
  .then(data => console.log('Health check:', data))
  .catch(error => console.error('Health check failed:', error));

// Test 3: Test registration with sample data
const testRegister = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        email: 'test@example.com',
        password: 'testpass123'
      })
    });
    
    const data = await response.json();
    console.log('Registration test:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });
  } catch (error) {
    console.error('Registration test failed:', error);
  }
};

// Uncomment to run registration test
// testRegister();
