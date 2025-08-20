const mongoose = require('mongoose');

// Your MongoDB connection string from render.yaml
const MONGODB_URI = 'mongodb+srv://vighnesh:admin@cluster.mongodb.net/finance_diary?retryWrites=true&w=majority';

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials in log
    
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection successful!');
    console.log('Connected to:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    
    // Test a simple operation
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error message:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('💡 This suggests incorrect username/password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 This suggests incorrect cluster URL');
    } else if (error.message.includes('bad auth')) {
      console.error('💡 This suggests authentication database issue');
    }
    
    process.exit(1);
  }
};

testConnection();
