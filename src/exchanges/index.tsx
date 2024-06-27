import { useSelector, useDispatch } from 'react-redux';
import { setExchangesNav } from '../store/globalSlice';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import Detail from './detail';
import getContract, { getSignerContract } from './contract';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers.js v6.x.x
import { TailSpin } from 'react-loader-spinner'; // Correct import for Loader
import Modal from '../modal/Modal'; // Import the Modal component

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
  const [withdrawId, setWithdrawId] = useState<string>(''); // New state for withdraw funds ID
  const [cancelId, setCancelId] = useState<string>(''); // New state for cancel campaign ID
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>(''); // New state for new owner address
  const [newSecondOwnerAddress, setNewSecondOwnerAddress] = useState<string>(''); // New state for new second owner address

  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // State for checking owner
  const [isSecondOwner, setIsSecondOwner] = useState(false); // State for checking second owner
  const [isThirdOwner, setIsThirdOwner] = useState(false); // State for checking third owner
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state

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
      const owner = await contract.owner();
      const secondOwner = await contract.secondOwner();
      const thirdOwner = await contract.thirdOwner();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
      setIsSecondOwner(secondOwner.toLowerCase() === account.toLowerCase());
      setIsThirdOwner(thirdOwner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCampaigns();
    checkMetamaskConnection();
    loadEnabledStates(); // Load the enabled/disabled states

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
          logoImageUrl: campaign[9],
        };

        const totalContributed = parseFloat(ethers.formatUnits(campaign[4], 18));
        const fundingGoal = parseFloat(ethers.formatUnits(campaign[3], 18));

        console.log(`Campaign ${i}`, {
          totalContributed,
          fundingGoal,
          listingConfirmed: campaignWithId.listingConfirmed,
          finalized: campaignWithId.finalized,
        });

        if (campaignWithId.finalized) {
          finalized.push(campaignWithId);
        } else if (campaignWithId.listingConfirmed) {
          payback.push(campaignWithId);
        } else if (totalContributed >= fundingGoal) {
          listing.push(campaignWithId);
        } else {
          funding.push(campaignWithId);
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

  const [createCampaignEnabled, setCreateCampaignEnabled] = useState(false);
  const [confirmListingEnabled, setConfirmListingEnabled] = useState(false);
  const [payBackEnabled, setPayBackEnabled] = useState(false);
  const [withdrawFundsEnabled, setWithdrawFundsEnabled] = useState(false);
  const [cancelCampaignEnabled, setCancelCampaignEnabled] = useState(false);
  const [ownerAddressChangeEnabled, setOwnerAddressChangeEnabled] = useState(false); // State for owner address change enabled
  const [secondOwnerAddressChangeEnabled, setSecondOwnerAddressChangeEnabled] = useState(false); // State for second owner address change enabled

  const loadEnabledStates = async () => {
    try {
      const contract = await getContract();
      const createCampaignState = await contract.createCampaignEnabled();
      const confirmListingState = await contract.confirmListingEnabled();
      const payBackState = await contract.payBackEnabled();
      const withdrawFundsState = await contract.withdrawFundsEnabled();
      const cancelCampaignState = await contract.cancelCampaignEnabled();
      const ownerAddressChangeState = await contract.ownerAddressChangeEnabled(); // Load owner address change enabled state
      const secondOwnerAddressChangeState = await contract.secondOwnerAddressChangeEnabled(); // Load second owner address change enabled state

      setCreateCampaignEnabled(createCampaignState);
      setConfirmListingEnabled(confirmListingState);
      setPayBackEnabled(payBackState);
      setWithdrawFundsEnabled(withdrawFundsState);
      setCancelCampaignEnabled(cancelCampaignState);
      setOwnerAddressChangeEnabled(ownerAddressChangeState); // Set owner address change enabled state
      setSecondOwnerAddressChangeEnabled(secondOwnerAddressChangeState); // Set second owner address change enabled state
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCampaign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    if (!createCampaignEnabled) {
      setErrorMessage("Create campaign functionality is currently disabled");
      setLoading(false);
      return;
    }
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
    setErrorMessage(null);
    if (!confirmListingEnabled) {
      setErrorMessage("Confirm listing functionality is currently disabled");
      setLoading(false);
      return;
    }
    try {
      const contract = await getSignerContract();
      const tx = await contract.confirmListing(parseInt(confirmId));
      await tx.wait();
      loadCampaigns(); // Reload campaigns after confirming listing
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayback = async () => {
    setLoading(true);
    setErrorMessage(null);
    if (!payBackEnabled) {
      setErrorMessage("Payback functionality is currently disabled");
      setLoading(false);
      return;
    }
    try {
      const contract = await getSignerContract();
      const tx = await contract.payBack(parseInt(paybackId));
      await tx.wait();
      loadCampaigns(); // Reload campaigns after payback
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFunds = async () => {
    setLoading(true);
    setErrorMessage(null);
    if (!withdrawFundsEnabled) {
      setErrorMessage("Withdraw funds functionality is currently disabled");
      setLoading(false);
      return;
    }
    try {
      const contract = await getSignerContract();
      const tx = await contract.withdrawFunds(parseInt(withdrawId));
      await tx.wait();
      loadCampaigns(); // Reload campaigns after withdrawing funds
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCampaign = async () => {
    setLoading(true);
    setErrorMessage(null);
    if (!cancelCampaignEnabled) {
      setErrorMessage("Cancel campaign functionality is currently disabled");
      setLoading(false);
      return;
    }
    try {
      const contract = await getSignerContract();
      const tx = await contract.cancelCampaign(parseInt(cancelId));
      await tx.wait();
      loadCampaigns(); // Reload campaigns after cancelling the campaign
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOwnerAddress = async () => {
    setLoading(true);
    setErrorMessage(null);
    if (!ownerAddressChangeEnabled) {
      setErrorMessage("Owner Address Change is not enabled");
      setLoading(false);
      return;
    }
    try {
      const contract = await getSignerContract();
      const tx = await contract.changeOwnerAddress(newOwnerAddress);
      await tx.wait();
      // Add any additional logic if needed
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSecondOwnerAddress = async () => {
    setLoading(true);
    setErrorMessage(null);
    if (!secondOwnerAddressChangeEnabled) {
      setErrorMessage("Second Owner Address Change is not enabled");
      setLoading(false);
      return;
    }
    try {
      const contract = await getSignerContract();
      const tx = await contract.changeSecondOwnerAddress(newSecondOwnerAddress);
      await tx.wait();
      // Add any additional logic if needed
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCreateCampaign = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const currentStatus = await contract.createCampaignEnabled();
      const tx = await contract.setCreateCampaignEnabled(!currentStatus);
      await tx.wait();
      loadEnabledStates();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfirmListing = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const currentStatus = await contract.confirmListingEnabled();
      const tx = await contract.setConfirmListingEnabled(!currentStatus);
      await tx.wait();
      loadEnabledStates();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayBack = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const currentStatus = await contract.payBackEnabled();
      const tx = await contract.setPayBackEnabled(!currentStatus);
      await tx.wait();
      loadEnabledStates();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWithdrawFunds = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const currentStatus = await contract.withdrawFundsEnabled();
      const tx = await contract.setWithdrawFundsEnabled(!currentStatus);
      await tx.wait();
      loadEnabledStates();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCancelCampaign = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const currentStatus = await contract.cancelCampaignEnabled();
      const tx = await contract.setCancelCampaignEnabled(!currentStatus);
      await tx.wait();
      loadEnabledStates();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOwnerAddressChange = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const currentStatus = await contract.ownerAddressChangeEnabled();
      const tx = await contract.setOwnerAddressChangeEnabled(!currentStatus);
      await tx.wait();
      loadEnabledStates();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSecondOwnerAddressChange = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const currentStatus = await contract.secondOwnerAddressChangeEnabled();
      const tx = await contract.setSecondOwnerAddressChangeEnabled(!currentStatus);
      await tx.wait();
      loadEnabledStates();
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
      {errorMessage && (
        <Modal message={errorMessage} onClose={() => setErrorMessage(null)} />
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

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Withdraw Funds</h4>
                    <h5>Withdraw contributed funds for listing confirmation</h5>
                    <div className={styles.inputGroup}>
                      <label htmlFor="withdrawId">Campaign ID:</label>
                      <input
                        type="text"
                        id="withdrawId"
                        value={withdrawId}
                        onChange={(e) => setWithdrawId(e.target.value)}
                        required
                      />
                    </div>
                    <button className={styles.buttonG} onClick={handleWithdrawFunds} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? 'Withdraw Funds' : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Cancel Campaign</h4>
                    <h5>Cancel an active campaign</h5>
                    <div className={styles.inputGroup}>
                      <label htmlFor="cancelId">Campaign ID:</label>
                      <input
                        type="text"
                        id="cancelId"
                        value={cancelId}
                        onChange={(e) => setCancelId(e.target.value)}
                        required
                      />
                    </div>
                    <button className={styles.buttonG} onClick={handleCancelCampaign} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? 'Cancel Campaign' : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Toggle Second Owner Address Change</h4>
                    <p>Current State: {secondOwnerAddressChangeEnabled ? "Enabled" : "Disabled"}</p>
                    <button className={styles.buttonG} onClick={handleToggleSecondOwnerAddressChange} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? (secondOwnerAddressChangeEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {isSecondOwner && (
            <div className={styles.row}>
              <div className={styles.formContainerWrapper}>
                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Toggle Create Campaign</h4>
                    <p>Current State: {createCampaignEnabled ? "Enabled" : "Disabled"}</p>
                    <button className={styles.buttonG} onClick={handleToggleCreateCampaign} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? (createCampaignEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Toggle Confirm Listing</h4>
                    <p>Current State: {confirmListingEnabled ? "Enabled" : "Disabled"}</p>
                    <button className={styles.buttonG} onClick={handleToggleConfirmListing} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? (confirmListingEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Toggle Pay Back</h4>
                    <p>Current State: {payBackEnabled ? "Enabled" : "Disabled"}</p>
                    <button className={styles.buttonG} onClick={handleTogglePayBack} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? (payBackEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Toggle Withdraw Funds</h4>
                    <p>Current State: {withdrawFundsEnabled ? "Enabled" : "Disabled"}</p>
                    <button className={styles.buttonG} onClick={handleToggleWithdrawFunds} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? (withdrawFundsEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Toggle Cancel Campaign</h4>
                    <p>Current State: {cancelCampaignEnabled ? "Enabled" : "Disabled"}</p>
                    <button className={styles.buttonG} onClick={handleToggleCancelCampaign} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? (cancelCampaignEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Toggle Owner Address Change</h4>
                    <p>Current State: {ownerAddressChangeEnabled ? "Enabled" : "Disabled"}</p>
                    <button className={styles.buttonG} onClick={handleToggleOwnerAddressChange} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? (ownerAddressChangeEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {isThirdOwner && (
            <div className={styles.row}>
              <div className={styles.formContainerWrapper}>
                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Change Owner Address</h4>
                    <div className={styles.inputGroup}>
                      <label htmlFor="newOwnerAddress">New Owner Address:</label>
                      <input
                        type="text"
                        id="newOwnerAddress"
                        value={newOwnerAddress}
                        onChange={(e) => setNewOwnerAddress(e.target.value)}
                        required
                      />
                    </div>
                    <button className={styles.buttonG} onClick={handleChangeOwnerAddress} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? 'Change Owner Address' : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </div>
                </div>

                <div className={styles.formContainer}>
                  <div className={styles.form}>
                    <h4>Change Second Owner Address</h4>
                    <div className={styles.inputGroup}>
                      <label htmlFor="newSecondOwnerAddress">New Second Owner Address:</label>
                      <input
                        type="text"
                        id="newSecondOwnerAddress"
                        value={newSecondOwnerAddress}
                        onChange={(e) => setNewSecondOwnerAddress(e.target.value)}
                        required
                      />
                    </div>
                    <button className={styles.buttonG} onClick={handleChangeSecondOwnerAddress} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? 'Change Second Owner Address' : 'Metamask (Harmony Testnet) Needed'}
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
