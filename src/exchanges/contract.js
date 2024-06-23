// contract.js
import { BrowserProvider, Contract } from 'ethers';
import contractABI from './contractABI.json'; // Import the ABI JSON file

// Replace with your contract's address
const contractAddress = '0x6aE5bfEA89bDCc9571437eFeE56C37cC146069Ed';

const getContract = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request access to the user's Ethereum account
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(contractAddress, contractABI.abi, signer);
  } else {
    throw new Error('Ethereum wallet is not installed');
  }
};

export default getContract;
