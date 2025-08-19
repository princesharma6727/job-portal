const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

async function updateJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all jobs to have active status
    const result = await Job.updateMany(
      { status: { $ne: 'active' } }, // Find jobs that are not active
      { 
        $set: { 
          status: 'active'
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} jobs to active status`);

    // Get total count of active jobs
    const activeJobsCount = await Job.countDocuments({ status: 'active' });
    console.log(`Total active jobs: ${activeJobsCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating jobs:', error);
    process.exit(1);
  }
}

updateJobs();
