// Debug script for testing API connection
// Add this to your browser console on https://finance-diary-frontend.vercel.app/

console.log('=== API Debug Test ===');

// Test 1: Check API URL
const API_URL = 'https://daily-income-expense-tracker.onrender.com/api';
console.log('API URL:', API_URL);

// Test 2: Test health endpoint (should work)
fetch('https://daily-income-expense-tracker.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log('✅ Health check success:', data))
  .catch(error => console.error('❌ Health check failed:', error));

// Test 3: Test register endpoint
const testRegistration = async () => {
  console.log('Testing registration...');
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'testpass123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration success:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ Registration failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
  }
};

// Run the test
setTimeout(testRegistration, 2000);
