// use client
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setExchangesNav } from '../store/globalSlice';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import Detail from './detail';
import getContract from './contract';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers.js v6.x.x

interface RootState {
  global: {
    MarketingNav: string;
    ExchangesNav: string;
  };
}

export default function Dapps() {
  const ExchangesNav = useSelector((state: RootState) => state.global.ExchangesNav);
  const dispatch = useDispatch();

  const [fundingPhase, setFundingPhase] = useState<any[]>([]);
  const [listingPhase, setListingPhase] = useState<any[]>([]);
  const [paybackPhase, setPaybackPhase] = useState<any[]>([]);
  const [finalizedPhase, setFinalizedPhase] = useState<any[]>([]);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const contract = await getContract();
        const campaignCount = await contract.campaignCount();
        const funding = [];
        const listing = [];
        const payback = [];
        const finalized = [];

        for (let i = 1; i <= campaignCount; i++) {
          const campaign = await contract.campaigns(i);
          if (!campaign.listingConfirmed && !campaign.finalized) {
            funding.push(campaign);
          } else if (campaign.listingConfirmed && !campaign.finalized) {
            listing.push(campaign);
          } else if (campaign.listingConfirmed && campaign.finalized) {
            payback.push(campaign);
          } else if (campaign.finalized) {
            finalized.push(campaign);
          }
        }

        setFundingPhase(funding);
        setListingPhase(listing);
        setPaybackPhase(payback);
        setFinalizedPhase(finalized);
      } catch (error) {
        console.error(error);
      }
    };
    loadCampaigns();
  }, []);

  return (
    <div className={styles.main}>
      {ExchangesNav === "Home" && (
        <>
          <h2>Kilopi Proof of Development dApp</h2>
          <h2>Decentralized Applications</h2>

          <div className={styles.row}>
            <h3>Funding Phase</h3>
            <div className={styles.dApps}>
              {fundingPhase.map((campaign, index) => (
                <button key={index} className={styles.buttondApps} onClick={() => dispatch(setExchangesNav('detail'))}>
                  <div className={styles.carddApps}>
                    <Image src="/images/logo1.png" alt="Logo 1" width={50} height={50} />
                    <div className={styles.carddAppsDescription}>
                      <p>Kilopi DEX</p>
                      <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
                    </div>
                  </div>
                  Staked LOP Tokens: {ethers.formatUnits(campaign.totalContributed, 18)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <h3>Listing Phase</h3>
            <div className={styles.dApps}>
              {listingPhase.map((campaign, index) => (
                <button key={index} className={styles.buttondApps} onClick={() => dispatch(setExchangesNav('detail'))}>
                  <div className={styles.carddApps}>
                    <Image src="/images/logo1.png" alt="Logo 1" width={50} height={50} />
                    <div className={styles.carddAppsDescription}>
                      <p>Kilopi DEX</p>
                      <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
                    </div>
                  </div>
                  Staked LOP Tokens: {ethers.formatUnits(campaign.totalContributed, 18)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <h3>Payback Phase</h3>
            <div className={styles.dApps}>
              {paybackPhase.map((campaign, index) => (
                <button key={index} className={styles.buttondApps} onClick={() => dispatch(setExchangesNav('detail'))}>
                  <div className={styles.carddApps}>
                    <Image src="/images/logo1.png" alt="Logo 1" width={50} height={50} />
                    <div className={styles.carddAppsDescription}>
                      <p>Kilopi DEX</p>
                      <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
                    </div>
                  </div>
                  Staked LOP Tokens: {ethers.formatUnits(campaign.totalContributed, 18)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <h3>Finalized Phase</h3>
            <div className={styles.dApps}>
              {finalizedPhase.map((campaign, index) => (
                <button key={index} className={styles.buttondApps} onClick={() => dispatch(setExchangesNav('detail'))}>
                  <div className={styles.carddApps}>
                    <Image src="/images/logo1.png" alt="Logo 1" width={50} height={50} />
                    <div className={styles.carddAppsDescription}>
                      <p>Kilopi DEX</p>
                      <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
                    </div>
                  </div>
                  Staked LOP Tokens: {ethers.formatUnits(campaign.totalContributed, 18)}
                </button>
              ))}
            </div>
          </div>

          <button className={styles.buttonG} onClick={async (event) => {
            event.preventDefault();
            try {
              const contract = await getContract();
              const tx = await contract.createCampaign(ethers.parseUnits('1000', 18)); // Example funding goal
              await tx.wait();
              // Reload campaigns after creating a new one
              const campaignCount = await contract.campaignCount();
              const campaignsList = [];
              for (let i = 1; i <= campaignCount; i++) {
                const campaign = await contract.campaigns(i);
                campaignsList.push(campaign);
              }
              setFundingPhase(campaignsList.filter(campaign => !campaign.listingConfirmed && !campaign.finalized));
              setListingPhase(campaignsList.filter(campaign => campaign.listingConfirmed && !campaign.finalized));
              setPaybackPhase(campaignsList.filter(campaign => campaign.listingConfirmed && campaign.finalized));
              setFinalizedPhase(campaignsList.filter(campaign => campaign.finalized));
            } catch (error) {
              console.error(error);
            }
          }}>Add New Exchange</button>
        </>
      )}
      {ExchangesNav === "detail" && (
        <>
          <Detail />
        </>
      )}
    </div>
  );
}
