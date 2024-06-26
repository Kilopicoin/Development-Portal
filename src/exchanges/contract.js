// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import contractABI from './contractABI.json'; // Import the ABI JSON file

const contractAddress = '0x8D6ACa9D18136F556d0D1e82E0d7780A693AE6e6';
const harmonyTestnetRPC = 'https://api.s0.b.hmny.io';

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
