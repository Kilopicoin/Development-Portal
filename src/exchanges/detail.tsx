// use client
'use client';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setExchangesNav } from '../store/globalSlice';
import getContract from './contract';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers.js v6.x.x

export default function Detail() {
  const dispatch = useDispatch();
  const [campaign, setCampaign] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [contributions, setContributions] = useState<any[]>([]);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const contract = await getContract();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        const campaign = await contract.campaigns(1); // Example: Load the first campaign
        setCampaign(campaign);
        
        const contribution = await contract.contributors(1, address); // Load contributions for the first campaign
        setContributions([contribution]);
      } catch (error) {
        console.error(error);
      }
    };
    loadCampaign();
  }, []);

  const handleContribute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const contract = await getContract();
      const tx = await contract.contribute(1, ethers.parseUnits(amount, 18)); // Example: Contribute to the first campaign
      await tx.wait();
      // Reload campaign data after contributing
      const updatedCampaign = await contract.campaigns(1);
      setCampaign(updatedCampaign);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contribution = await contract.contributors(1, address); // Load contributions for the first campaign
      setContributions([contribution]);
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

  const getPaybackAmount = (contributionAmount: string) => {
    const interestRate = 10; // 10% interest rate
    return parseFloat(contributionAmount) * (1 + interestRate / 100);
  };

  return (
    <div className={styles.main}>
      <h2>Kilopi Proof of Development dApp</h2>
      <h2>Exchange Listing Details</h2>
      <div className={styles.dApps}>
        {campaign && (
          <div className={styles.buttondAppsDetail}>
            <div className={styles.carddApps}>
              <Image src="/images/logo1.png" alt="Logo 1" width={300} height={300} />
              <div className={styles.carddAppsDescription}>
                <p>Exchange Name: {campaign.exchangeName}</p>
                <p>Funding Goal: {ethers.formatUnits(campaign.fundingGoal, 18)} USDT</p>
                <p>Supported Chains: {campaign.supportedChains}</p>
                <p>Total Contributed: {ethers.formatUnits(campaign.totalContributed, 18)} USDT</p>
              </div>
            </div>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${getProgress()}%` }}></div>
              <span className={styles.progressText}>
                {getProgress().toFixed(2)}%
              </span>
            </div>
            <form onSubmit={handleContribute}>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in USDT"
              />
              <button type="submit" className={styles.buttonG}>Stake LOP tokens on this Project</button>
            </form>
            <div className={styles.contributions}>
              <h3>Your Contributions</h3>
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
        <button className={styles.buttonG} onClick={() => dispatch(setExchangesNav('Home'))}>
          Back to Exchange Listings
        </button>
      </div>
    </div>
  );
}
