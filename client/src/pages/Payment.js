import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  CreditCard, 
  Wallet, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Clock,
  Shield
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Payment = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    isConnected, 
    account, 
    connectWallet, 
    sendPayment, 
    getBalance,
    isMetaMaskInstalled 
  } = useWeb3();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('crypto');

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (isConnected && account) {
      fetchWalletBalance();
    }
  }, [isConnected, account]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/${jobId}`);
      setJob(response.data.job);
      setPaymentAmount(response.data.job.budget?.min || 0);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const balance = await getBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const handlePayment = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!walletBalance || parseFloat(walletBalance) < paymentAmount) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setProcessing(true);
    try {
      const result = await sendPayment(
        process.env.REACT_APP_ADMIN_WALLET_ADDRESS || '0x739C1E478FE21cBFA35fB9E06702ee56F42f52Ca',
        paymentAmount.toString(),
        'ETH'
      );

      if (result.success) {
        // Update job payment status
        await axios.put(`/api/jobs/${jobId}/payment`, {
          transactionHash: result.transactionHash,
          amount: paymentAmount,
          currency: 'ETH'
        });

        toast.success('Payment successful! Job posted successfully.');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
          <p className="text-gray-600">The job you're trying to pay for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Secure blockchain payment powered by MetaMask
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
            
            {/* Job Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-2">{job.company}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.type}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="crypto"
                    checked={paymentMethod === 'crypto'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium">Crypto Payment (ETH/MATIC)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-500 text-sm">ETH</span>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            {!isConnected ? (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Wallet not connected
                  </span>
                </div>
                {!isMetaMaskInstalled() ? (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Install MetaMask
                  </a>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </button>
                )}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Wallet connected
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </p>
                {walletBalance && (
                  <p className="text-sm text-green-700 mt-1">
                    Balance: {walletBalance} ETH
                  </p>
                )}
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={!isConnected || processing || !walletBalance || parseFloat(walletBalance) < paymentAmount}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {paymentAmount} ETH
                </>
              )}
            </button>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Job Posting Fee</span>
                <span className="font-medium">${job.budget?.min || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gas Fee</span>
                <span className="font-medium">~$5-15</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">{paymentAmount} ETH</span>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Security Information</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Payments are processed on the blockchain</li>
                <li>• No sensitive data is stored on our servers</li>
                <li>• Transaction hash is recorded for verification</li>
                <li>• MetaMask ensures secure transaction signing</li>
              </ul>
            </div>

            {/* Processing Time */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Transaction typically completes in 1-3 minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 