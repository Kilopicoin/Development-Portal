// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import contractABI from './contractABI.json'; // Import the ABI JSON file

const contractAddress = '0x20E7a4C1298342023f5A233b23c6a5E0C87d5ACC';
const harmonyTestnetRPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

const getContract = async () => {
  const provider = new JsonRpcProvider(harmonyTestnetRPC);
  return new Contract(contractAddress, contractABI.abi, provider);
};

export const getSignerContract = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(contractAddress, contractABI.abi, signer);
  } else {
    throw new Error('Ethereum wallet is not installed');
  }
};

export default getContract;
