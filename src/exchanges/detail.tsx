// use client
'use client';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setExchangesNav } from '../store/globalSlice';
import getContract, { getSignerContract } from './contract';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers.js v6.x.x

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

  const harmonyTestnetChainId = '0x6357d2e0'; // Harmony Testnet chain ID in hexadecimal

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
      }
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

  const handleContribute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const contract = await getSignerContract();
      const tx = await contract.contribute(campaignId, ethers.parseUnits(amount, 18)); // Contribute to the campaign with the given ID
      await tx.wait();
      // Reload campaign data after contributing
      const updatedCampaign = await contract.campaigns(campaignId);
      setCampaign(updatedCampaign);

      if (isMetamaskConnected) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contribution = await contract.contributors(campaignId, address); // Load contributions for the campaign
        setContributions([contribution]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddPaybackFunds = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const contract = await getSignerContract();
      const tx = await contract.addPaybackFunds(campaignId, ethers.parseUnits(paybackAmount, 18)); // Add payback funds to the campaign
      await tx.wait();
      // Reload campaign data after adding payback funds
      const updatedCampaign = await contract.campaigns(campaignId);
      setCampaign(updatedCampaign);
    } catch (error) {
      console.error(error);
    }
  };

  const getProgress = () => {
    if (campaign) {
      const totalContributed = ethers.formatUnits(campaign.totalContributed, 18);
      const fundingGoal = ethers.formatUnits(campaign.fundingGoal, 18);
      return (parseFloat(totalContributed) / parseFloat(fundingGoal)) * 100;
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

    if (campaign.finalized) {
      return 'Finalized';
    } else if (campaign.listingConfirmed) {
      return 'Payback Phase';
    } else if (totalContributed >= fundingGoal) {
      return 'Listing Phase';
    } else {
      return 'Funding Phase';
    }
  };

  return (
    <div className={styles.main}>
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
                {getPhase() !== 'Payback Phase' && (
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
                <form onSubmit={handleAddPaybackFunds} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={paybackAmount}
                      onChange={(e) => setPaybackAmount(e.target.value)}
                      placeholder="Amount in USDT"
                      className={styles.shortInput}
                    />
                    <button type="submit" className={styles.buttonG} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? 'Add Payback Funds' : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {getPhase() === 'Funding Phase' && (
              <form onSubmit={handleContribute} className={styles.form}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
                      <td>{ethers.formatUnits(contribution.amount, 18)} USDT</td>
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
