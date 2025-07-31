import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      // Show a more helpful message with installation link
      toast.error(
        <div>
          <div>MetaMask is not installed.</div>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Click here to install MetaMask
          </a>
        </div>,
        { duration: 6000 }
      );
      return { success: false, error: 'MetaMask not installed' };
    }

    setIsConnecting(true);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get network info
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setChainId(chainId);
      setIsConnected(true);

      toast.success('Wallet connected successfully!');
      return { success: true, account, chainId };
    } catch (error) {
      console.error('Wallet connection error:', error);
      const message = error.code === 4001 
        ? 'Connection rejected by user' 
        : 'Failed to connect wallet';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  // Switch network
  const switchNetwork = async (targetChainId) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      // Update chain ID
      const network = await provider.getNetwork();
      setChainId(network.chainId.toString());
      
      toast.success('Network switched successfully!');
      return { success: true };
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error('Failed to switch network');
      return { success: false, error: 'Network switch failed' };
    }
  };

  // Send payment transaction
  const sendPayment = async (toAddress, amount, currency = 'ETH') => {
    if (!isConnected || !signer) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      // Convert amount to wei (assuming ETH)
      const amountInWei = ethers.parseEther(amount.toString());
      
      // Create transaction
      const tx = {
        to: toAddress,
        value: amountInWei,
      };

      // Send transaction
      const transaction = await signer.sendTransaction(tx);
      
      toast.success('Transaction sent! Waiting for confirmation...');
      
      // Wait for confirmation
      const receipt = await transaction.wait();
      
      toast.success('Payment confirmed!');
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Payment error:', error);
      const message = error.code === 4001 
        ? 'Transaction rejected by user' 
        : 'Payment failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get account balance
  const getBalance = async () => {
    if (!isConnected || !provider || !account) {
      return null;
    }

    try {
      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Get balance error:', error);
      return null;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
      } else {
        // Account changed
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(chainId);
      toast.info('Network changed');
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (isMetaMaskInstalled() && window.ethereum.selectedAddress) {
        await connectWallet();
      }
    };

    autoConnect();
  }, [connectWallet]);

  const value = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    sendPayment,
    getBalance,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}; 