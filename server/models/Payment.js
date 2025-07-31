const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['ETH', 'MATIC', 'SOL'],
    required: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  fromAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  network: {
    type: String,
    enum: ['ethereum', 'polygon', 'solana'],
    required: true
  },
  blockNumber: {
    type: Number
  },
  gasUsed: {
    type: Number
  },
  gasPrice: {
    type: Number
  },
  confirmationCount: {
    type: Number,
    default: 0
  },
  confirmedAt: {
    type: Date
  },
  metadata: {
    jobTitle: String,
    userEmail: String,
    platformFee: Number
  }
}, {
  timestamps: true
});

// Index for transaction hash
paymentSchema.index({ transactionHash: 1 });

// Index for user payments
paymentSchema.index({ user: 1, createdAt: -1 });

// Index for job payments
paymentSchema.index({ job: 1 });

// Index for status
paymentSchema.index({ status: 1 });

// Virtual for USD equivalent (if needed)
paymentSchema.virtual('usdEquivalent').get(function() {
  // This would need to be calculated based on current exchange rates
  // For now, return the original amount
  return this.amount;
});

// Method to confirm payment
paymentSchema.methods.confirmPayment = function(blockNumber, gasUsed, gasPrice) {
  this.status = 'confirmed';
  this.blockNumber = blockNumber;
  this.gasUsed = gasUsed;
  this.gasPrice = gasPrice;
  this.confirmedAt = new Date();
  this.confirmationCount = 1;
  return this.save();
};

// Method to update confirmation count
paymentSchema.methods.updateConfirmationCount = function(count) {
  this.confirmationCount = count;
  if (count >= 12) { // 12 confirmations for security
    this.status = 'confirmed';
    this.confirmedAt = new Date();
  }
  return this.save();
};

// Static method to get pending payments
paymentSchema.statics.getPendingPayments = function() {
  return this.find({ status: 'pending' })
    .populate('user', 'name email')
    .populate('job', 'title company');
};

// Static method to get user payment history
paymentSchema.statics.getUserPayments = function(userId) {
  return this.find({ user: userId })
    .populate('job', 'title company')
    .sort({ createdAt: -1 });
};

// Static method to get total platform revenue
paymentSchema.statics.getTotalRevenue = function(currency = 'ETH') {
  return this.aggregate([
    {
      $match: {
        status: 'confirmed',
        currency: currency
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalTransactions: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema); 