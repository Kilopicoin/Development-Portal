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

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const contract = await getContract();
        const campaign = await contract.campaigns(1); // Example: Load the first campaign
        setCampaign(campaign);
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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.main}>
      <h2>Kilopi Proof of Development dApp</h2>
      <h2>Decentralized Application Details</h2>
      <div className={styles.dApps}>
        {campaign && (
          <div className={styles.buttondAppsDetail}>
            <div className={styles.carddApps}>
              <Image src="/images/logo1.png" alt="Logo 1" width={300} height={300} />
              <div className={styles.carddAppsDescription}>
                <p>Kilopi DEX</p>
                <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
                <p>Website</p>
                <p>Social Links</p>
                <p>Roadmap</p>
                <p>...</p>
              </div>
            </div>
            Staked LOP Tokens: {ethers.formatUnits(campaign.totalContributed, 18)}
            <form onSubmit={handleContribute}>
              <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in USDT" />
              <button type="submit" className={styles.buttonG}>Stake LOP tokens on this Project</button>
            </form>
          </div>
        )}
        <button className={styles.buttonG} onClick={() => dispatch(setExchangesNav('Home'))}>
          Back to Decentralized Apps
        </button>
      </div>
    </div>
  );
}
