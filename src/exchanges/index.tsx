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
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  const [exchangeName, setExchangeName] = useState('');
  const [supportedChains, setSupportedChains] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [logoImageUrl, setLogoImageUrl] = useState('');

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
        const campaignWithId = { ...campaign, id: i };
        console.log(`Campaign ${i}:`, campaignWithId); // Log the fetched campaign data
        const totalContributed = parseFloat(ethers.formatUnits(campaign.totalContributed, 18));
        const fundingGoal = parseFloat(ethers.formatUnits(campaign.fundingGoal, 18));

        if (totalContributed >= fundingGoal && !campaign.listingConfirmed && !campaign.finalized) {
          listing.push(campaignWithId);
        } else if (!campaign.listingConfirmed && !campaign.finalized) {
          funding.push(campaignWithId);
        } else if (campaign.listingConfirmed && !campaign.finalized) {
          listing.push(campaignWithId);
        } else if (campaign.listingConfirmed && campaign.finalized) {
          payback.push(campaignWithId);
        } else if (campaign.finalized) {
          finalized.push(campaignWithId);
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

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleCreateCampaign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const contract = await getContract();
      const tx = await contract.createCampaign(
        exchangeName,
        supportedChains,
        ethers.parseUnits(fundingGoal, 18),
        logoImageUrl
      );
      await tx.wait();
      loadCampaigns(); // Reload campaigns after creating a new one
    } catch (error) {
      console.error(error);
    }
  };

  const handleCampaignClick = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    dispatch(setExchangesNav('detail'));
  };

  return (
    <div className={styles.main}>
      {ExchangesNav === "Home" && (
        <>
          <h3>Exchange Listings</h3>

          <div className={styles.row}>
            <h4>Funding Phase</h4>
            <div className={styles.dApps}>
              {fundingPhase.map((campaign, index) => {
                const exchangeName = campaign[1];
                const supportedChains = campaign[2];
                const fundingGoal = campaign[3];
                const totalContributed = campaign[4];
                const logoImageUrl = campaign[7];

                return (
                  <button key={index} className={styles.buttondApps} onClick={() => handleCampaignClick(campaign.id)}>
                    <div className={styles.carddApps}>
                      {logoImageUrl ? (
                        <Image src={logoImageUrl} alt="Logo" width={50} height={50} />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#ccc' }} />
                      )}
                      <div className={styles.carddAppsDescription}>
                        <p>ID: {campaign.id}</p>
                        <p>Exchange Name: {exchangeName || 'N/A'}</p>
                        <p>Funding Goal: {fundingGoal ? ethers.formatUnits(fundingGoal, 18) : 'N/A'} USDT</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.row}>
            <h4>Listing Phase</h4>
            <div className={styles.dApps}>
              {listingPhase.map((campaign, index) => {
                const exchangeName = campaign[1];
                const supportedChains = campaign[2];
                const fundingGoal = campaign[3];
                const totalContributed = campaign[4];
                const logoImageUrl = campaign[7];

                return (
                  <button key={index} className={styles.buttondApps} onClick={() => handleCampaignClick(campaign.id)}>
                    <div className={styles.carddApps}>
                      {logoImageUrl ? (
                        <Image src={logoImageUrl} alt="Logo" width={50} height={50} />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#ccc' }} />
                      )}
                      <div className={styles.carddAppsDescription}>
                        <p>ID: {campaign.id}</p>
                        <p>Exchange Name: {exchangeName || 'N/A'}</p>
                        <p>Funding Goal: {fundingGoal ? ethers.formatUnits(fundingGoal, 18) : 'N/A'} USDT</p>
                      </div>
                    </div>
                    
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.row}>
            <h4>Payback Phase</h4>
            <div className={styles.dApps}>
              {paybackPhase.map((campaign, index) => {
                const exchangeName = campaign[1];
                const supportedChains = campaign[2];
                const fundingGoal = campaign[3];
                const totalContributed = campaign[4];
                const logoImageUrl = campaign[7];

                return (
                  <button key={index} className={styles.buttondApps} onClick={() => handleCampaignClick(campaign.id)}>
                    <div className={styles.carddApps}>
                      {logoImageUrl ? (
                        <Image src={logoImageUrl} alt="Logo" width={50} height={50} />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#ccc' }} />
                      )}
                      <div className={styles.carddAppsDescription}>
                        <p>ID: {campaign.id}</p>
                        <p>Exchange Name: {exchangeName || 'N/A'}</p>
                        <p>Funding Goal: {fundingGoal ? ethers.formatUnits(fundingGoal, 18) : 'N/A'} USDT</p>
                      </div>
                    </div>
                    
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.row}>
            <h4>Finalized Phase</h4>
            <div className={styles.dApps}>
              {finalizedPhase.map((campaign, index) => {
                const exchangeName = campaign[1];
                const supportedChains = campaign[2];
                const fundingGoal = campaign[3];
                const totalContributed = campaign[4];
                const logoImageUrl = campaign[7];

                return (
                  <button key={index} className={styles.buttondApps} onClick={() => handleCampaignClick(campaign.id)}>
                    <div className={styles.carddApps}>
                      {logoImageUrl ? (
                        <Image src={logoImageUrl} alt="Logo" width={50} height={50} />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#ccc' }} />
                      )}
                      <div className={styles.carddAppsDescription}>
                        <p>ID: {campaign.id}</p>
                        <p>Exchange Name: {exchangeName || 'N/A'}</p>
                        <p>Funding Goal: {fundingGoal ? ethers.formatUnits(fundingGoal, 18) : 'N/A'} USDT</p>
                      </div>
                    </div>
                    
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleCreateCampaign} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="exchangeName">Exchange Name:</label>
              <input
                type="text"
                id="exchangeName"
                value={exchangeName}
                onChange={(e) => setExchangeName(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="supportedChains">Supported Chains:</label>
              <input
                type="text"
                id="supportedChains"
                value={supportedChains}
                onChange={(e) => setSupportedChains(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="fundingGoal">Funding Goal (in USDT):</label>
              <input
                type="text"
                id="fundingGoal"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="logoImageUrl">Logo Image URL (200x200 Transparent):</label>
              <input
                type="text"
                id="logoImageUrl"
                value={logoImageUrl}
                onChange={(e) => setLogoImageUrl(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.buttonG}>Add New Exchange</button>
          </form>
        </>
      )}
      {ExchangesNav === "detail" && selectedCampaignId !== null && (
        <>
          <Detail campaignId={selectedCampaignId} />
        </>
      )}
    </div>
  );
}
