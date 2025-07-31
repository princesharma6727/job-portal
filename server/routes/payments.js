const express = require('express');
const { ethers } = require('ethers');
const Payment = require('../models/Payment');
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get payment requirements for job posting
router.get('/requirements', auth, async (req, res) => {
  try {
    const platformFee = {
      ETH: 0.001,
      MATIC: 0.001,
      SOL: 0.01
    };

    const adminWallet = process.env.ADMIN_WALLET_ADDRESS;

    res.json({
      platformFee,
      adminWallet,
      networks: {
        ethereum: {
          name: 'Ethereum',
          symbol: 'ETH',
          chainId: 1,
          rpcUrl: 'https://mainnet.infura.io/v3/your-project-id'
        },
        polygon: {
          name: 'Polygon',
          symbol: 'MATIC',
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com'
        }
      }
    });
  } catch (error) {
    console.error('Get payment requirements error:', error);
    res.status(500).json({ error: 'Failed to get payment requirements' });
  }
});

// Process payment for job posting
router.post('/process', auth, async (req, res) => {
  try {
    const { jobId, transactionHash, amount, currency, network } = req.body;

    // Validate required fields
    if (!jobId || !transactionHash || !amount || !currency || !network) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ transactionHash });
    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Get user
    const user = await User.findById(req.user.userId);

    // Create payment record
    const payment = new Payment({
      user: req.user.userId,
      job: jobId,
      amount,
      currency,
      transactionHash,
      fromAddress: user.walletAddress,
      toAddress: process.env.ADMIN_WALLET_ADDRESS,
      network,
      status: 'pending',
      metadata: {
        jobTitle: job.title,
        userEmail: user.email,
        platformFee: amount
      }
    });

    await payment.save();

    // Update job payment status
    job.paymentStatus = 'pending';
    job.paymentTransaction = {
      hash: transactionHash,
      amount,
      currency,
      timestamp: new Date()
    };
    await job.save();

    res.json({
      message: 'Payment processed successfully. Awaiting confirmation.',
      payment
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Verify payment on blockchain
router.post('/verify/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { network } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user is authorized
    if (payment.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Verify transaction on blockchain
    const provider = new ethers.JsonRpcProvider(
      network === 'polygon' 
        ? 'https://polygon-rpc.com'
        : 'https://mainnet.infura.io/v3/your-project-id'
    );

    const transaction = await provider.getTransaction(payment.transactionHash);
    
    if (!transaction) {
      return res.status(400).json({ error: 'Transaction not found on blockchain' });
    }

    const receipt = await provider.getTransactionReceipt(payment.transactionHash);
    
    if (receipt && receipt.status === 1) {
      // Transaction confirmed
      await payment.confirmPayment(
        receipt.blockNumber,
        receipt.gasUsed.toString(),
        transaction.gasPrice.toString()
      );

      // Update job status
      const job = await Job.findById(payment.job);
      if (job) {
        job.paymentStatus = 'completed';
        job.status = 'active';
        await job.save();
        
        // Update user stats when payment is completed
        const user = await User.findById(payment.user);
        if (user) {
          user.stats.jobsPosted += 1;
          await user.save();
          console.log('✅ User stats updated after payment completion');
        }
      }

      res.json({
        message: 'Payment verified successfully',
        payment,
        job: job
      });
    } else {
      res.json({
        message: 'Payment pending confirmation',
        payment
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.getUserPayments(req.user.userId);
    
    res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Get payment by ID
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('job', 'title company')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user is authorized
    if (payment.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Get platform revenue (admin only)
router.get('/admin/revenue', auth, async (req, res) => {
  try {
    // Check if user is admin (you can implement admin role checking)
    const user = await User.findById(req.user.userId);
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const ethRevenue = await Payment.getTotalRevenue('ETH');
    const maticRevenue = await Payment.getTotalRevenue('MATIC');
    const solRevenue = await Payment.getTotalRevenue('SOL');

    const pendingPayments = await Payment.getPendingPayments();

    res.json({
      revenue: {
        ETH: ethRevenue[0] || { totalAmount: 0, totalTransactions: 0 },
        MATIC: maticRevenue[0] || { totalAmount: 0, totalTransactions: 0 },
        SOL: solRevenue[0] || { totalAmount: 0, totalTransactions: 0 }
      },
      pendingPayments
    });
  } catch (error) {
    console.error('Get admin revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

// Webhook for blockchain events (optional)
router.post('/webhook', async (req, res) => {
  try {
    const { transactionHash, status, blockNumber } = req.body;

    const payment = await Payment.findOne({ transactionHash });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (status === 'confirmed') {
      await payment.confirmPayment(blockNumber);
      
      // Update job status
      const job = await Job.findById(payment.job);
      if (job) {
        job.paymentStatus = 'completed';
        job.status = 'active';
        await job.save();
        
        // Update user stats when payment is completed
        const user = await User.findById(payment.user);
        if (user) {
          user.stats.jobsPosted += 1;
          await user.save();
          console.log('✅ User stats updated after webhook payment confirmation');
        }
      }
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router; 