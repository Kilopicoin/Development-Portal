// use client
'use client';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setExchangesNav } from '../store/globalSlice';
import getContract from './contract';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers.js v6.x.x

interface DetailProps {
  campaignId: number;
}

const Detail: React.FC<DetailProps> = ({ campaignId }) => {
  const dispatch = useDispatch();
  const [campaign, setCampaign] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [contributions, setContributions] = useState<any[]>([]);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const contract = await getContract();
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          
          const campaign = await contract.campaigns(campaignId); // Load the campaign with the given ID
          setCampaign(campaign);
          
          const contribution = await contract.contributors(campaignId, address); // Load contributions for the campaign
          setContributions([contribution]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadCampaign();
  }, [campaignId]);

  const handleContribute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const contract = await getContract();
      const tx = await contract.contribute(campaignId, ethers.parseUnits(amount, 18)); // Contribute to the campaign with the given ID
      await tx.wait();
      // Reload campaign data after contributing
      const updatedCampaign = await contract.campaigns(campaignId);
      setCampaign(updatedCampaign);

      if (typeof window.ethereum !== 'undefined') {
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
            <form onSubmit={handleContribute} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount in USDT"
                  className={styles.shortInput}
                />
                <button type="submit" className={styles.buttonG}>Contribute</button>
              </div>
            </form>
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
