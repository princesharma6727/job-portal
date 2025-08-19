const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

async function testDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all jobs
    const allJobs = await Job.find({});
    console.log('Total jobs in database:', allJobs.length);
    
    // Get active jobs
    const activeJobs = await Job.find({ status: 'active' });
    console.log('Active jobs:', activeJobs.length);
    
    
    
    // Get jobs matching our search criteria
    const searchJobs = await Job.find({ 
      status: 'active'
    });
    console.log('Jobs matching search criteria:', searchJobs.length);
    
    // Get jobs without expiry filter
    const noExpiryJobs = await Job.find({ status: 'active' });
    console.log('Active jobs without expiry filter:', noExpiryJobs.length);
    
    console.log('\nSample jobs:');
    allJobs.slice(0, 5).forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - Status: ${job.status} - Expires: ${job.expiresAt}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing database:', error);
    process.exit(1);
  }
}

testDatabase();
