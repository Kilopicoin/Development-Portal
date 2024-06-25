// use client
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setExchangesNav } from '../store/globalSlice';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import Detail from './detail';
import getContract, { getSignerContract } from './contract';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers.js v6.x.x
import { TailSpin } from 'react-loader-spinner'; // Correct import for Loader

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

  const [confirmId, setConfirmId] = useState<string>(''); // New state for confirm listing ID
  const [paybackId, setPaybackId] = useState<string>(''); // New state for payback ID

  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // State for checking owner

  const harmonyTestnetChainId = '0x6357d2e0'; // Harmony Testnet chain ID in hexadecimal

  const checkMetamaskConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsMetamaskConnected(accounts.length > 0);
      setIsCorrectNetwork(chainId === harmonyTestnetChainId);
      if (accounts.length > 0) {
        await checkOwner(accounts[0]);
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
    loadCampaigns();
    checkMetamaskConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', checkMetamaskConnection);
      window.ethereum.on('chainChanged', checkMetamaskConnection);

      return () => {
        window.ethereum.removeListener('accountsChanged', checkMetamaskConnection);
        window.ethereum.removeListener('chainChanged', checkMetamaskConnection);
      };
    }
  }, []);

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
        const campaignWithId = {
          id: i,
          exchangeName: campaign[1],
          supportedChains: campaign[2],
          fundingGoal: campaign[3],
          totalContributed: campaign[4],
          paybackGoal: campaign[5],
          paybackAmount: campaign[6],
          listingConfirmed: campaign[7],
          finalized: campaign[8],
          logoImageUrl: campaign[9]
        };

        console.log(`Campaign ${i}:`, campaignWithId); // Log the fetched campaign data
        const totalContributed = parseFloat(ethers.formatUnits(campaign.totalContributed, 18));
        const fundingGoal = parseFloat(ethers.formatUnits(campaign.fundingGoal, 18));

        if (campaignWithId.listingConfirmed && !campaignWithId.finalized) {
          payback.push(campaignWithId);
        } else if (totalContributed >= fundingGoal && !campaignWithId.listingConfirmed && !campaignWithId.finalized) {
          listing.push(campaignWithId);
        } else if (!campaignWithId.listingConfirmed && !campaignWithId.finalized) {
          funding.push(campaignWithId);
        } else if (campaignWithId.finalized) {
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

  const handleCreateCampaign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const contract = await getSignerContract();
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
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmListing = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.confirmListing(parseInt(confirmId));
      await tx.wait();
      loadCampaigns(); // Reload campaigns after confirming listing
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayback = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.payBack(parseInt(paybackId));
      await tx.wait();
      loadCampaigns(); // Reload campaigns after payback
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignClick = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    dispatch(setExchangesNav('detail'));
  };

  return (
    <div className={styles.main}>
      {loading && (
        <div className={styles.loaderWrapper}>
          <TailSpin color="#00BFFF" height={80} width={80} />
        </div>
      )}
      {ExchangesNav === "Home" && (
        <>
          <h3>Exchange Listings</h3>

          <div className={styles.row}>
            <h4>Funding Phase</h4>
            <div className={styles.dApps}>
              {fundingPhase.map((campaign, index) => {
                const exchangeName = campaign.exchangeName;
                const supportedChains = campaign.supportedChains;
                const fundingGoal = campaign.fundingGoal;
                const totalContributed = campaign.totalContributed;
                const logoImageUrl = campaign.logoImageUrl;

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
                        <p>Exchange Name: {exchangeName ? exchangeName : 'N/A'}</p>
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
                const exchangeName = campaign.exchangeName;
                const supportedChains = campaign.supportedChains;
                const fundingGoal = campaign.fundingGoal;
                const totalContributed = campaign.totalContributed;
                const logoImageUrl = campaign.logoImageUrl;

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
                        <p>Exchange Name: {exchangeName ? exchangeName : 'N/A'}</p>
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
                const exchangeName = campaign.exchangeName;
                const supportedChains = campaign.supportedChains;
                const fundingGoal = campaign.fundingGoal;
                const totalContributed = campaign.totalContributed;
                const logoImageUrl = campaign.logoImageUrl;

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
                        <p>Exchange Name: {exchangeName ? exchangeName : 'N/A'}</p>
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
                const exchangeName = campaign.exchangeName;
                const supportedChains = campaign.supportedChains;
                const fundingGoal = campaign.fundingGoal;
                const totalContributed = campaign.totalContributed;
                const logoImageUrl = campaign.logoImageUrl;

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
                        <p>Exchange Name: {exchangeName ? exchangeName : 'N/A'}</p>
                        <p>Funding Goal: {fundingGoal ? ethers.formatUnits(fundingGoal, 18) : 'N/A'} USDT</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {isOwner && (
            <div className={styles.row}>
              <div className={styles.formContainerWrapper}>
                <div className={styles.formContainer}>
                  <form onSubmit={handleCreateCampaign} className={styles.form}>
                    <h4>Add New Exchange</h4>
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
                    <button type="submit" className={styles.buttonG} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? 'Add New Exchange' : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </form>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Confirm Listing</h4>
                    <h5>Once the token gets listed</h5>
                    <div className={styles.inputGroup}>
                      <label htmlFor="confirmId">Campaign ID:</label>
                      <input
                        type="text"
                        id="confirmId"
                        value={confirmId}
                        onChange={(e) => setConfirmId(e.target.value)}
                        required
                      />
                    </div>
                    <button className={styles.buttonG} onClick={handleConfirmListing} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? 'Confirm Listing' : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Execute Payback</h4>
                    <h5>Distribute funds to contributors</h5>
                    <div className={styles.inputGroup}>
                      <label htmlFor="paybackId">Campaign ID:</label>
                      <input
                        type="text"
                        id="paybackId"
                        value={paybackId}
                        onChange={(e) => setPaybackId(e.target.value)}
                        required
                      />
                    </div>
                    <button className={styles.buttonG} onClick={handlePayback} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? 'Execute Payback' : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
