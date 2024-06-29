// use client
'use client';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setExchangesNav } from '../store/globalSlice';
import getContract, { getSignerContract } from './contract';
import usdtABI from './usdtABI.json'; // Import the ABI JSON file
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers.js v6.x.x
import { TailSpin } from 'react-loader-spinner'; // Correct import for Loader
import Modal from '../modal/Modal'; // Import the Modal component

const usdtContractAddress = '0x94895123784c24b92C851711149d2D4Ae294d796'; // Replace with the actual USDT contract address
const multiExchangeListingAddress = '0xc207dBD1cED9c6a570EbCFf08772D73C3ac7cA30'; // MultiExchangeListing contract address

interface DetailProps {
  campaignId: number;
}

const Detail: React.FC<DetailProps> = ({ campaignId }) => {
  const dispatch = useDispatch();
  const [campaign, setCampaign] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [paybackAmount, setPaybackAmount] = useState(''); // New state for payback amount input
  const [contributions, setContributions] = useState<any[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [isOwner, setIsOwner] = useState(false); // State for checking owner
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state

  const harmonyTestnetChainId = '0x61'; // Harmony Testnet chain ID in hexadecimal

  const checkMetamaskConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsMetamaskConnected(accounts.length > 0);
      setIsCorrectNetwork(chainId === harmonyTestnetChainId);
      if (accounts.length > 0 && chainId === harmonyTestnetChainId) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        const contract = await getContract();
        const contribution = await contract.contributors(campaignId, address); // Load contributions for the campaign
        setContributions([contribution]);

        await checkOwner(address);
      }
    }
  };

  const checkOwner = async (account: string) => {
    try {
      const contract = await getContract();
      const owner = await contract.owner(); // Assuming your contract has an owner() function
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const contract = await getContract();
        const campaign = await contract.campaigns(campaignId); // Load the campaign with the given ID
        setCampaign(campaign);
        checkMetamaskConnection();
      } catch (error) {
        console.error(error);
      }
    };
    loadCampaign();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', checkMetamaskConnection);
      window.ethereum.on('chainChanged', checkMetamaskConnection);

      return () => {
        window.ethereum.removeListener('accountsChanged', checkMetamaskConnection);
        window.ethereum.removeListener('chainChanged', checkMetamaskConnection);
      };
    }
  }, [campaignId]);

  const handleApproveAndContribute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); // Start loading
    setErrorMessage(null); // Reset error message
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(usdtContractAddress, usdtABI.abi, signer);
      const amountInWei = ethers.parseUnits(amount, 18);

      // Define limits
      const minAmount = ethers.parseUnits('1', 18);
      const maxAmount = ethers.parseUnits((parseFloat(ethers.formatUnits(campaign.fundingGoal, 18)) - parseFloat(ethers.formatUnits(campaign.totalContributed, 18))).toString(), 18);

      // Check limits
      if (amountInWei < minAmount) {
        throw new Error("The contribution amount must be at least 1 USDT");
      }
      if (amountInWei > maxAmount) {
        throw new Error("The contribution amount exceeds the maximum limit");
      }

      // Check user's USDT balance
      const usdtBalance = await usdtContract.balanceOf(account);
      if (usdtBalance < amountInWei) {
        throw new Error("You do not have enough USDT in your wallet");
      }

      // Always approve the contribution amount
      const approveTx = await usdtContract.approve(multiExchangeListingAddress, amountInWei);
      await approveTx.wait();

      // Now proceed with the contribution
      const contract = await getSignerContract();
      const contributeTx = await contract.contribute(campaignId, amountInWei); // Contribute to the campaign with the given ID
      await contributeTx.wait();

      // Reload campaign data after contributing
      const updatedCampaign = await contract.campaigns(campaignId);
      setCampaign(updatedCampaign);

      if (isMetamaskConnected) {
        const contribution = await contract.contributors(campaignId, account); // Load contributions for the campaign
        setContributions([contribution]);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleApproveAndAddPaybackFunds = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); // Start loading
    setErrorMessage(null); // Reset error message
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(usdtContractAddress, usdtABI.abi, signer);
      const paybackAmountInWei = ethers.parseUnits(paybackAmount, 18);

      // Define limits
      const minAmount = ethers.parseUnits('1', 18);
      const maxAmount = ethers.parseUnits((parseFloat(ethers.formatUnits(campaign.paybackGoal, 18)) - parseFloat(ethers.formatUnits(campaign.totalPaybackAdded, 18))).toString(), 18);

      // Check limits
      if (paybackAmountInWei < minAmount) {
        throw new Error("The payback amount must be at least 1 USDT");
      }
      if (paybackAmountInWei > maxAmount) {
        throw new Error("The payback amount exceeds the maximum limit");
      }

      // Check user's USDT balance
      const usdtBalance = await usdtContract.balanceOf(account);
      if (usdtBalance < paybackAmountInWei) {
        throw new Error("You do not have enough USDT in your wallet");
      }

      // Always approve the payback amount
      const approveTx = await usdtContract.approve(multiExchangeListingAddress, paybackAmountInWei);
      await approveTx.wait();

      // Now proceed with adding payback funds
      const contract = await getSignerContract();
      const addPaybackTx = await contract.addPaybackFunds(campaignId, paybackAmountInWei); // Add payback funds to the campaign
      await addPaybackTx.wait();

      // Reload campaign data after adding payback funds
      const updatedCampaign = await contract.campaigns(campaignId);
      setCampaign(updatedCampaign);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const getProgress = () => {
    if (campaign) {
      const totalContributed = parseFloat(ethers.formatUnits(campaign.totalContributed, 18));
      const fundingGoal = parseFloat(ethers.formatUnits(campaign.fundingGoal, 18));
      return (totalContributed / fundingGoal) * 100;
    }
    return 0;
  };

  const getPaybackProgress = () => {
    if (campaign) {
      const totalPaybackAdded = parseFloat(ethers.formatUnits(campaign.totalPaybackAdded, 18));
      const paybackGoal = parseFloat(ethers.formatUnits(campaign.paybackGoal, 18));
      return (totalPaybackAdded / paybackGoal) * 100;
    }
    return 0;
  };

  const getPaybackAmount = (contributionAmount: string) => {
    const interestRate = 10; // 10% interest rate
    return parseFloat(contributionAmount) * (1 + interestRate / 100);
  };

  const getPhase = () => {
    if (!campaign) return 'Unknown';

    const totalContributed = parseFloat(ethers.formatUnits(campaign.totalContributed, 18));
    const fundingGoal = parseFloat(ethers.formatUnits(campaign.fundingGoal, 18));
    const totalPaybackAdded = parseFloat(ethers.formatUnits(campaign.totalPaybackAdded, 18));

    if (campaign.finalized) {
      return totalPaybackAdded === 0 ? 'Cancelled' : 'Finalized';
    } else if (campaign.listingConfirmed) {
      return 'Payback Phase';
    } else if (totalContributed >= fundingGoal) {
      return 'Listing Phase';
    } else {
      return 'Funding Phase';
    }
  };

  // Function to handle input validation
  const handleNumericInput = (event: React.ChangeEvent<HTMLInputElement>, setState: (value: string) => void) => {
    const value = event.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setState(value);
    }
  };

  const formatDeadline = (timestamp: number) => {
    const date = new Date(Number(timestamp) * 1000); // Convert seconds to milliseconds
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.main}>
      {loading && (
        <div className={styles.loaderWrapper}>
          <TailSpin color="#00BFFF" height={80} width={80} />
        </div>
      )}
      {errorMessage && (
        <Modal message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
      <h3>Exchange Listings Detail Page</h3>
      <button className={styles.buttonG} onClick={() => dispatch(setExchangesNav('Home'))}>
        Back to Exchange Listings Main Page
      </button>
      <div className={styles.dApps}>
        {campaign && (
          <div className={styles.buttondAppsDetail}>
            <div className={styles.carddApps}>
              <Image 
                src={campaign.logoImageUrl} // Use the logo image URL from the campaign
                alt="Logo"
                width={300}
                height={300}
              />
              <div className={styles.carddAppsDescription}>
                <p>Exchange Name: {campaign.exchangeName}</p>
                <p>Supported Chains: {campaign.supportedChains}</p>
                {getPhase() === 'Cancelled' && (
                  <>
                    <p>Funding Goal: {ethers.formatUnits(campaign.fundingGoal, 18)} USDT</p>
                  </>
                )}
                {getPhase() === 'Finalized' && (
                  <>
                    <p>Payback Goal: {ethers.formatUnits(campaign.paybackGoal, 18)} USDT</p>
                    <p>Total Payback Added: {ethers.formatUnits(campaign.totalPaybackAdded, 18)} USDT</p>
                  </>
                )}
                {getPhase() !== 'Payback Phase' && getPhase() !== 'Finalized' && getPhase() !== 'Cancelled' && (
                  <>
                    <p>Funding Goal: {ethers.formatUnits(campaign.fundingGoal, 18)} USDT</p>
                    <p>Total Contributed: {ethers.formatUnits(campaign.totalContributed, 18)} USDT</p>
                  </>
                )}
                {getPhase() === 'Payback Phase' && (
                  <>
                    <p>Payback Goal: {ethers.formatUnits(campaign.paybackGoal, 18)} USDT</p>
                    <p>Total Payback Added: {ethers.formatUnits(campaign.totalPaybackAdded, 18)} USDT</p>
                  </>
                )}
                <p>Current Phase: {getPhase()}</p>
              </div>
            </div>
            {getPhase() === 'Funding Phase' && (
              <div className={styles.progressBarWrapper}>
                <h5 className={styles.progressBarLabel}>Funding Progress Bar</h5>
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBar} style={{ width: `${getProgress()}%` }}></div>
                  <span className={styles.progressText}>
                    {getProgress().toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
            {getPhase() === 'Payback Phase' && (
              <div className={styles.progressBarWrapper}>
                <h5 className={styles.progressBarLabel}>Payback Progress Bar</h5>
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBar} style={{ width: `${getPaybackProgress()}%` }}></div>
                  <span className={styles.progressText}>
                    {getPaybackProgress().toFixed(2)}%
                  </span>
                </div>
                <p>Payback Deadline: {formatDeadline(Number(campaign.paybackDeadline))}</p>
                {isOwner && (
                  <form onSubmit={handleApproveAndAddPaybackFunds} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        value={paybackAmount}
                        onChange={(e) => handleNumericInput(e, setPaybackAmount)}
                        placeholder="Amount in USDT"
                        className={styles.shortInput}
                      />
                      <button type="submit" className={styles.buttonG} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? 'Add Payback Funds' : 'Metamask (Harmony Testnet) Needed'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            {getPhase() === 'Funding Phase' && (
              <form onSubmit={handleApproveAndContribute} className={styles.form}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleNumericInput(e, setAmount)}
                    placeholder="Amount in USDT"
                    className={styles.shortInput}
                  />
                  <button type="submit" className={styles.buttonG} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                    {isMetamaskConnected && isCorrectNetwork ? 'Contribute' : 'Metamask (Harmony Testnet) Needed'}
                  </button>
                </div>
              </form>
            )}
            <div className={styles.contributions}>
              <h4>Your Contribution</h4>
              <table>
                <thead>
                  <tr>
                    <th>Contribution</th>
                    <th>Payback Amount</th>
                    <th>Payback Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((contribution, index) => (
                    <tr key={index}>
                      <td>{parseFloat(ethers.formatUnits(contribution.amount, 18)).toFixed(2)} USDT</td>
                      <td>{getPaybackAmount(ethers.formatUnits(contribution.amount, 18)).toFixed(2)} USDT</td>
                      <td>{contribution.paidBack ? "Paid Back" : "Not Paid Back"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Detail;
