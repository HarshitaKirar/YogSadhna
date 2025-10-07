const mongoose = require('mongoose');
const { User } = require('../model/user');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/yogaWeb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function createAdmin() {
  try {
    // Create first admin
    const admin1 = new User({
      firstName: 'Admin',
      lastName: 'One',
      email: 'admin1@yogaweb.com',
      password: 'admin123',
      isAdmin: true,
      membershipType: 'premium'
    });

    // Create second admin
    const admin2 = new User({
      firstName: 'Admin',
      lastName: 'Two', 
      email: 'admin2@yogaweb.com',
      password: 'admin123',
      isAdmin: true,
      membershipType: 'premium'
    });

    await admin1.save();
    await admin2.save();

    console.log('Admin users created successfully!');
    console.log('Admin 1: admin1@yogaweb.com / admin123');
    console.log('Admin 2: admin2@yogaweb.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin users:', error);
    process.exit(1);
  }
}

createAdmin();