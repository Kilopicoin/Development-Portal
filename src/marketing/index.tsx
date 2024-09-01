'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setMarketingNav } from '../store/globalSlice';
import styles from "../styles/global.module.css";
import Detail from './detail';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers.js v6.x.x
import { TailSpin } from 'react-loader-spinner'; // Correct import for Loader
import getContract, { getSignerContract } from './contract'; // Import contract functions
import Modal from '../modal/Modal'; // Import the Modal component
import usdtABI from './lopTokenABI.json';

interface RootState {
  global: {
    MarketingNav: string;
  };
}

export default function ApplicationDevelopment() {
  const dAppsNav = useSelector((state: RootState) => state.global.MarketingNav);
  const dispatch = useDispatch();

  const [theoryPhase, setTheoryPhase] = useState<any[]>([]);
  const [developmentPhase, setDevelopmentPhase] = useState<any[]>([]);
  const [livePhase, setLivePhase] = useState<any[]>([]);
  const [prestigePhase, setPrestigePhase] = useState<any[]>([]);
  const [pendingApproval, setPendingApproval] = useState<any[]>([]);
  const [pendingUpdate, setPendingUpdate] = useState<any[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isSecondOwner, setIsSecondOwner] = useState(false);
  const [isThirdOwner, setIsThirdOwner] = useState(false); // New state for checking third owner
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stakedTokens, setStakedTokens] = useState<bigint>(BigInt(0)); // Use bigint for stakedTokens
  const [rewards, setRewards] = useState<bigint>(BigInt(0)); // Use bigint for rewards
  const [votingPower, setVotingPower] = useState<bigint>(BigInt(0)); // Use bigint for votingPower
  const [account, setAccount] = useState<string | null>(null); // State for account

  const [lastClaimed, setLastClaimed] = useState<bigint>(BigInt(0));
  const [startingDate, setStartingDate] = useState<bigint>(BigInt(0));
  const [claimCooldown, setClaimCooldown] = useState<number>(60 * 60 * 24 * 30); // Claim cooldown period in seconds (e.g., 24 hours) 30 * 24 * 60 * 60
  const [timeLeftToClaim, setTimeLeftToClaim] = useState<number>(0);

  const [approveElementEnabled, setApproveElementEnabled] = useState(true);
  const [rejectElementEnabled, setRejectElementEnabled] = useState(true);
  const [removeElementEnabled, setRemoveElementEnabled] = useState(true);
  const [confirmUpdateEnabled, setConfirmUpdateEnabled] = useState(true);
  const [refuseUpdateEnabled, setRefuseUpdateEnabled] = useState(true);
  const [changeSecondAdminEnabled, setChangeSecondAdminEnabled] = useState(true); // State for toggling changeSecondAdmin function
  const [changeAdminEnabled, setChangeAdminEnabled] = useState(true); // State for toggling changeAdmin function

  const [newOwnerAddress, setNewOwnerAddress] = useState<string>(''); // New state for new owner address
  const [newSecondOwnerAddress, setNewSecondOwnerAddress] = useState<string>(''); // New state for new second owner address

  // New state variables for the admin card
  const [totalStakedTokens, setTotalStakedTokens] = useState<bigint>(BigInt(0));
  const [totalTokenBalance, setTotalTokenBalance] = useState<bigint>(BigInt(0));
  const [calculatedValue, setCalculatedValue] = useState<bigint>(BigInt(0));
  const [generalStatus, setGeneralStatus] = useState<boolean>(false);

  const harmonyTestnetChainId = '0x61';
  const usdtContractAddress = '0x7E6E8a28DEd7551370Edc54a794D165F6Ec85Ab2';
  const MainContractAddress = '0xD123C72C7caf103c072FE6D978A589683E0D59e2';
  const ELEMENT_CREATION_COST = 10000; // Cost for creating an element in LOP tokens

 



  const checkMetamaskConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsMetamaskConnected(accounts.length > 0);
      setIsCorrectNetwork(chainId === harmonyTestnetChainId);
      if (accounts.length > 0) {
        await checkOwner(accounts[0]);
        setAccount(accounts[0]);
        loadStakingDetails(accounts[0]);
        checkPendingApplication(accounts[0]);
      }
    }
  }, [harmonyTestnetChainId]);

  const checkOwner = async (account: string) => {
    try {
      const contract = await getContract();
      const owner = await contract.admin();
      const secondOwner = await contract.secondAdmin();
      const thirdOwner = await contract.thirdAdmin(); // Get third admin from contract
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
      setIsSecondOwner(secondOwner.toLowerCase() === account.toLowerCase());
      setIsThirdOwner(thirdOwner.toLowerCase() === account.toLowerCase()); // Set third admin state
    } catch (error) {
      console.error(error);
    }
  };

  

  const checkPendingApplication = async (account: string) => {
    try {
      const contract = await getContract();
      const hasPending = await contract.hasPendingApplication(account);
      setHasPendingApplication(hasPending);
    } catch (error) {
      console.error(error);
    }
  };

  const loadClaimableReward = async (account: string) => {
    try {
      const contract = await getContract();
      const claimableReward = await contract.getClaimableReward(account);
      setRewards(BigInt(claimableReward));
    } catch (error) {
      console.error(error);
    }
  };

  const loadLastClaimedDate = async (account: string) => {
    try {
      const contract = await getContract();
      const lastClaimedDate = await contract.getLastClaimedDate(account);
      setLastClaimed(BigInt(lastClaimedDate));
    } catch (error) {
      console.error(error);
    }
  };

  const loadStartingDate = async (account: string) => {
    try {
      const contract = await getContract();
      const startingDate = await contract.startingDate(account);
      setStartingDate(BigInt(startingDate));
    } catch (error) {
      console.error(error);
    }
  };

  const loadStakingDetails = async (account: string) => {
    try {
      const contract = await getContract();
      const staked = BigInt(await contract.stakes(account));
      const power = BigInt(await contract.votingPower(account));

      setStakedTokens(staked);
      setVotingPower(power);

      await loadClaimableReward(account);
      await loadLastClaimedDate(account);
      await loadStartingDate(account);

      const currentTime = BigInt(Math.floor(Date.now() / 1000)); // current time in seconds
      const timeElapsed = currentTime - lastClaimed; // time elapsed in seconds
      const cooldownRemaining = Math.max(0, claimCooldown - Number(timeElapsed));
      setTimeLeftToClaim(cooldownRemaining);
    } catch (error) {
      console.error(error);
    }
  };

  const loadContractDetails = async () => {
    try {
      const contract = await getContract();
      const totalStaked = BigInt(await contract.getTotalStakedTokens());
      const tokenBalance = BigInt(await contract.getTotalTokenBalance());
      const calculated = totalStaked + ((totalStaked * BigInt(3)) / BigInt(100)) - tokenBalance;
      const status = await contract.generalStatus();

      setTotalStakedTokens(totalStaked);
      setTotalTokenBalance(tokenBalance);
      setCalculatedValue(calculated);
      setGeneralStatus(status);
    } catch (error) {
      console.error(error);
    }
  };

  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [showUsingPlatform, setShowUsingPlatform] = useState(false);
  const [showUserRisks, setShowUserRisks] = useState(false);
  const [showExampleUserFlow, setShowExampleUserFlow] = useState(false);
  const [ExampleCreatorFlow, setExampleCreatorFlow] = useState(false);

  const toggleSection = (section: string) => {
    if (section === "GettingStarted") setShowGettingStarted(!showGettingStarted);
    if (section === "UsingPlatform") setShowUsingPlatform(!showUsingPlatform);
    if (section === "UserRisks") setShowUserRisks(!showUserRisks);
    if (section === "ExampleUserFlow") setShowExampleUserFlow(!showExampleUserFlow);
    if (section === "ExampleCreatorFlow") setExampleCreatorFlow(!ExampleCreatorFlow);
  };
  
  




  const handleClaimRewards = async () => {
    if (rewards === BigInt(0)) {
      setErrorMessage('No Rewards to Collect');
      return;
    }

    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.claimMonthlyReward();
      await tx.wait();
      loadStakingDetails(account!);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadFunctionStatus = async () => {
    try {
      const contract = await getContract();
      setApproveElementEnabled(await contract.functionStatus("approveElement"));
      setRejectElementEnabled(await contract.functionStatus("rejectElement"));
      setRemoveElementEnabled(await contract.functionStatus("removeElement"));
      setConfirmUpdateEnabled(await contract.functionStatus("confirmUpdate"));
      setRefuseUpdateEnabled(await contract.functionStatus("refuseUpdate"));
      setChangeSecondAdminEnabled(await contract.functionStatus("changeSecondAdmin")); // Load changeSecondAdmin function status
      setChangeAdminEnabled(await contract.functionStatus("changeAdmin")); // Load changeAdmin function status
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadElements();
    checkMetamaskConnection();
    loadFunctionStatus();
    loadContractDetails();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', checkMetamaskConnection);
      window.ethereum.on('chainChanged', checkMetamaskConnection);

      return () => {
        window.ethereum.removeListener('accountsChanged', checkMetamaskConnection);
        window.ethereum.removeListener('chainChanged', checkMetamaskConnection);
      };
    }
  }, [checkMetamaskConnection]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastClaimed > BigInt(0)) {
        const currentTime = BigInt(Math.floor(Date.now() / 1000)); // current time in seconds
        const timeElapsed = currentTime - lastClaimed; // time elapsed in seconds
        const cooldownRemaining = Math.max(0, claimCooldown - Number(timeElapsed));
        setTimeLeftToClaim(cooldownRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaimed, claimCooldown]);

  const loadElements = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const elementCount = await contract.elementCount();
      const theory = [];
      const development = [];
      const live = [];
      const prestige = [];
      const pending = [];
      const pendingUpdates = [];

      for (let i = 0; i < elementCount; i++) {
        const element = await contract.elements(i);
        const elementWithId = {
          id: i,
          name: element.name,
          description: element.description,
          mediaLink: element.mediaLink,
          exampleLink: element.exampleLink,
          performanceMetricsLink: element.performanceMetricsLink,
          email: element.email,
          logoUrl: element.logoUrl,
          phase: Number(element.phase),
          voteCount: Number(element.voteCount),
        };

        if (elementWithId.phase !== 5) { // Exclude elements in the Deleted phase
          if (elementWithId.phase === 1) {
            theory.push(elementWithId);
          } else if (elementWithId.phase === 2) {
            development.push(elementWithId);
          } else if (elementWithId.phase === 3) {
            live.push(elementWithId);
          } else if (elementWithId.phase === 4) {
            prestige.push(elementWithId);
          }

          if (elementWithId.phase === 0) {
            pending.push(elementWithId);
          }

          if (
            (elementWithId.phase === 1 && elementWithId.mediaLink) ||
            (elementWithId.phase === 2 && elementWithId.exampleLink) ||
            (elementWithId.phase === 3 && elementWithId.performanceMetricsLink)
          ) {
            pendingUpdates.push(elementWithId);
          }
        }
      }

      setTheoryPhase(theory);
      setDevelopmentPhase(development);
      setLivePhase(live);
      setPrestigePhase(prestige);
      setPendingApproval(pending);
      setPendingUpdate(pendingUpdates);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleCreateElement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const usdtContract = new ethers.Contract(usdtContractAddress, usdtABI.abi, signer);
      const balance = BigInt(await usdtContract.balanceOf(account));
      const elementCreationCost = BigInt(ethers.parseUnits(ELEMENT_CREATION_COST.toString(), 6).toString());

      if (balance < elementCreationCost) {
        setErrorMessage("Insufficient tokens to create a new element.");
        setLoading(false);
        return;
      }

      const approveTx = await usdtContract.approve(MainContractAddress, elementCreationCost);
      await approveTx.wait();

      const contract = await getSignerContract();
      const tx = await contract.createElement(name, description, email, logoUrl);
      await tx.wait();
      loadElements();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleElementClick = (elementId: number) => {
    setSelectedElementId(elementId);
    dispatch(setMarketingNav('detail'));
  };

  const handleApproveElement = async (elementId: number) => {
    if (!approveElementEnabled) {
      setErrorMessage("Approve Element function is currently disabled.");
      return;
    }
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.approveElement(elementId);
      await tx.wait();
      loadElements();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectElement = async (elementId: number) => {
    if (!rejectElementEnabled) {
      setErrorMessage("Reject Element function is currently disabled.");
      return;
    }
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.rejectElement(elementId);
      await tx.wait();
      loadElements(); // Reload elements after rejection
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateElement = async (elementId: number) => {
    if (!confirmUpdateEnabled) {
      setErrorMessage("Confirm Update function is currently disabled.");
      return;
    }
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.confirmUpdate(elementId);
      await tx.wait();
      loadElements();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefuseUpdateElement = async (elementId: number) => {
    if (!refuseUpdateEnabled) {
      setErrorMessage("Refuse Update function is currently disabled.");
      return;
    }
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.refuseUpdate(elementId);
      await tx.wait();
      loadElements();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStakeTokens = async () => {
    if (!generalStatus) {
      setErrorMessage("New Staking is Disabled Currently");
      return;
    }

    setLoading(true);

    try {
      const contractZ = await getContract();
      const claimableReward = await contractZ.getClaimableReward(account);
      setRewards(BigInt(claimableReward));

      if (claimableReward > BigInt(0)) {
        setErrorMessage("Please claim your rewards first.");
        setLoading(false);
        return;
      }
      
      const contract = await getSignerContract();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const usdtContract = new ethers.Contract(usdtContractAddress, usdtABI.abi, signer);

      const approveTx = await usdtContract.approve(MainContractAddress, ethers.parseUnits(stakeAmount, 6));
      await approveTx.wait();

      const tx = await contract.stakeTokens(ethers.parseUnits(stakeAmount, 6)); // Ensure stakeAmount is in correct units
      await tx.wait();
      loadStakingDetails(account!);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawStake = async () => {
    setLoading(true);
    try {

      const contractZ = await getContract();
      const claimableReward = await contractZ.getClaimableReward(account);
      setRewards(BigInt(claimableReward));


      if (claimableReward > BigInt(0)) {
        setErrorMessage("Please claim your rewards first.");
        setLoading(false);
        return;
      }

      const contract = await getSignerContract();
      const tx = await contract.withdrawStake(ethers.parseUnits(withdrawAmount, 6)); // Ensure withdrawAmount is in correct units
      await tx.wait();
      loadStakingDetails(account!);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFunctionStatus = async (functionName: string, status: boolean) => {
    setLoading(true);
    try {
      const contract = await getSignerContract();

      let tx;
      if (functionName === "changeSecondAdmin") {
        // If toggling changeSecondAdmin, use the toggleFunctionStatusByAdmin function
        tx = await contract.toggleFunctionStatusByAdmin(functionName, status);
      } else {
        // For all other functions, use the regular toggleFunctionStatus function
        tx = await contract.toggleFunctionStatus(functionName, status);
      }

      await tx.wait();
      loadFunctionStatus();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOwnerAddress = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (!changeAdminEnabled) {
        setErrorMessage("Change Admin function is currently disabled.");
        setLoading(false);
        return;
      }

      const contract = await getSignerContract();
      const tx = await contract.changeAdmin(newOwnerAddress);
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
    try {
      if (!changeSecondAdminEnabled) {
        setErrorMessage("Change Second Admin function is currently disabled.");
        setLoading(false);
        return;
      }

      const contract = await getSignerContract();
      const tx = await contract.changeSecondAdmin(newSecondOwnerAddress);
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

  const handleChangeGeneralStatus = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.changeGeneralStatus();
      await tx.wait();
      loadContractDetails();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const connectMetamask = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      checkMetamaskConnection();
    } catch (error) {
      console.error(error);
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <>
      <Head>
        <title>Kilopi - Marketing Protocol</title>
        <meta name="description" content="Marketing Protocol ensures Kilopi project keeps developing new marketing elements and creates new media areas for the LOP token." />
        <meta property="og:title" content="Kilopi - Marketing Protocol" />
        <meta property="og:description" content="Marketing Protocol ensures Kilopi project keeps developing new marketing elements and creates new media areas for the LOP token." />
        <meta property="og:image" content="/images/Kilopi_Full.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add more meta tags as needed */}
      </Head>

      <div className={styles.main}>
        {loading && (
          <div className={styles.loaderWrapper}>
            <TailSpin color="#00BFFF" height={80} width={80} />
          </div>
        )}
        {errorMessage && (
          <Modal message={errorMessage} onClose={() => setErrorMessage(null)} />
        )}
        {dAppsNav === "Home" && (
          <>
            {!isMetamaskConnected && (
              <button onClick={connectMetamask} className={styles.buttonG}>
                Connect to MetaMask
              </button>
            )}

            {isMetamaskConnected && (
              <div className={styles.phaseContainer}>
                <h3>Staking & Rewards</h3>
                <div className={styles.inputGroup}>
                  <label>Connected Wallet: {account}</label>
                  <label>Voting Power: {parseFloat(ethers.formatUnits(votingPower, -2)).toString()}</label>
                </div>
                <div className={styles.dAppsX}>
                  <div className={styles.buttondAppsX}>
                    <div className={styles.carddApps}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="stakeAmount">Stake Amount (LOP):</label>
                        <input
                          type="text"
                          id="stakeAmount"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                        />
                        <button onClick={handleStakeTokens} className={styles.buttonG}>
                          Stake Tokens
                        </button>
                        {!generalStatus && (
                          <p className={styles.warning}>New Staking is Disabled Currently</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.buttondAppsX}>
                    <div className={styles.carddApps}>
                      <div className={styles.inputGroup}>
                        <label>Staked Tokens: {parseFloat(ethers.formatUnits(stakedTokens, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</label>
                        <label>Rewards: {parseFloat(ethers.formatUnits(rewards, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</label>

                        <button
                          onClick={handleClaimRewards}
                          className={styles.buttonG}
                          disabled={timeLeftToClaim > 0}
                        >
                          {timeLeftToClaim > 0
                            ? `Claim available in ${formatTimeLeft(timeLeftToClaim)}`
                            : 'Claim Rewards'}
                        </button>
                        <label>Last Claimed: {lastClaimed > 0 ? formatDate(lastClaimed) : 'Never claimed'}</label>
                        <label>Starting Date: {startingDate > 0 ? formatDate(startingDate) : 'Not started yet'}</label>
                      </div>
                    </div>
                  </div>
                  <div className={styles.buttondAppsX}>
                    <div className={styles.carddApps}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="withdrawAmount">Unstake Amount (LOP):</label>
                        <input
                          type="text"
                          id="withdrawAmount"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <button onClick={handleWithdrawStake} className={styles.buttonG}>
                          Unstake Tokens
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2>Marketing Protocol</h2>

            <div className={styles.phaseContainer}>
              <h3>1 - Theory Phase</h3>
              <div className={styles.dApps}>
                {theoryPhase.map((element, index) => (
                  <button key={index} className={styles.buttondApps} onClick={() => handleElementClick(element.id)}>
                    <div className={styles.carddApps}>
                      {element.logoUrl ? (
                        <img src={element.logoUrl} alt="Logo" width={50} height={50} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#ccc' }} />
                      )}
                      <div className={styles.carddAppsDescription}>
                        <p>Name: {element.name}</p>
                        <p>Votes: {element.voteCount}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.phaseContainer}>
              <h3>2 - Development Phase</h3>
              <div className={styles.dApps}>
                {developmentPhase.map((element, index) => (
                  <button key={index} className={styles.buttondApps} onClick={() => handleElementClick(element.id)}>
                    <div className={styles.carddApps}>
                      {element.logoUrl ? (
                        <img src={element.logoUrl} alt="Logo" width={50} height={50} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#ccc' }} />
                      )}
                      <div className={styles.carddAppsDescription}>
                        <p>Name: {element.name}</p>
                        <p>Votes: {element.voteCount}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.phaseContainer}>
              <h3>3 - Live Phase</h3>
              <div className={styles.dApps}>
                {livePhase.map((element, index) => (
                  <button key={index} className={styles.buttondApps} onClick={() => handleElementClick(element.id)}>
                    <div className={styles.carddApps}>
                      {element.logoUrl ? (
                        <img src={element.logoUrl} alt="Logo" width={50} height={50} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#ccc' }} />
                      )}
                      <div className={styles.carddAppsDescription}>
                        <p>Name: {element.name}</p>
                        <p>Votes: {element.voteCount}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.phaseContainer}>
              <h3>4 - Prestige Phase</h3>
              <div className={styles.dApps}>
                {prestigePhase.map((element, index) => (
                  <button key={index} className={styles.buttondApps} onClick={() => handleElementClick(element.id)}>
                    <div className={styles.carddApps}>
                      {element.logoUrl ? (
                        <img src={element.logoUrl} alt="Logo" width={50} height={50} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#ccc' }} />
                      )}
                      <div className={styles.carddAppsDescription}>
                        <p>Name: {element.name}</p>
                        <p>Votes: {element.voteCount}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.row}>
              {!hasPendingApplication ? (
                <>
                  <button onClick={() => setShowCreateForm(!showCreateForm)} className={styles.buttonG}>
                    {showCreateForm ? 'Hide Create Form' : 'Create New Media'}
                  </button>
                  {showCreateForm && (
                    <div className={styles.formContainer}>
                      <form onSubmit={handleCreateElement} className={styles.form}>
                        <div className={styles.inputGroup}>
                          <label htmlFor="name">Media Name:</label>
                          <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label htmlFor="description">Short Description:</label>
                          <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label htmlFor="email">Email:</label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label htmlFor="logoUrl">Logo URL (Approx. 200x200 and no-background):</label>
                          <input
                            type="text"
                            id="logoUrl"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                        <label htmlFor="logoUrl">Creating new media requires 10.000,00 LOP tokens</label>
                        </div>
                        <button type="submit" className={styles.buttonG} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                          {isMetamaskConnected && isCorrectNetwork ? 'Create New Media' : 'Metamask (Binance Smart Chain) Needed'}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <p>You have a pending application, you will receive an email</p>
              )}
            </div>



            {!isOwner && !isSecondOwner && !isThirdOwner && (
  <div className={styles.infoButtons}>
    <button onClick={() => toggleSection("GettingStarted")} className={styles.buttonG}>
      Getting Started
    </button>
    {showGettingStarted && (
      <div className={styles.infoContent}>
        <h4>Getting Started</h4>
        <p><strong>Step 1: Connect Your Wallet</strong></p>
        <p><strong>Install Metamask:</strong></p>
        <p>If you haven&apos;t already, download and install the Metamask wallet extension for your browser.</p>
        <p><strong>Connect to Binance Smart Chain:</strong></p>
        <p>Open Metamask.</p>
        <p>Click on the network dropdown at the top and select &quot;BSC (Binance Smart Chain)&quot;.</p>
        <p>If Binance Smart Chain is not listed, you can add it manually by clicking on &quot;Add Network&quot; and entering the following details:</p>
        <p>Network Name: BNB Smart Chain</p>
        <p>New RPC URL: https://bsc-dataseed.binance.org/</p>
        <p>Chain ID: 56</p>
        <p>Symbol: BNB</p>
        <p>Block Explorer URL: https://bscscan.com/</p>
      </div>
    )}
    <button onClick={() => toggleSection("UsingPlatform")} className={styles.buttonG}>
      Using the Platform
    </button>
    {showUsingPlatform && (
      <div className={styles.infoContent}>
        <h4>Using the Platform</h4>
        <p><strong>Exploring Phases</strong></p>
        <p><strong>Navigate to Marketing Phases:</strong></p>
        <p>Go to the &quot;Marketing Protocol&quot; section on the platform&apos;s main page.</p>
        <p>Marketing Elements are categorized into four phases: Theory, Development, Live, and Prestige.</p>
        <p><strong>View Application Details:</strong></p>
        <p>Click on any marketing element card to view detailed information about the media, including its current phase, description, and voting status.</p>
        <p><strong>Staking and Voting</strong></p>
        <p><strong>Stake Tokens:</strong></p>
        <p>Enter the amount of LOP tokens you want to stake. Minimum stake amount: 1 LOP.</p>
        <p>Ensure you have sufficient LOP balance in your Metamask wallet.</p>
        <p><strong>Receive Rewards:</strong></p>
        <p>Wait for at least one month and claim your both rewards and voting power.</p>
        <p><strong>Vote for an Application:</strong></p>
        <p>Select a marketing element you support and enter the amount of your voting power you want to allocate.</p>
        <p>Confirm the voting transaction in Metamask.</p>
      </div>
    )}
    <button onClick={() => toggleSection("UserRisks")} className={styles.buttonG}>
      User Risks and Considerations
    </button>
    {showUserRisks && (
      <div className={styles.infoContent}>
        <h4>User Risks and Considerations</h4>
        <p><strong>Staking Risks</strong></p>
        <p><strong>Locked Funds:</strong></p>
        <p>Staked tokens are locked in the contract until you decide to unstake them. Be aware that your tokens will be inaccessible during this period.</p>
        <p><strong>Project Risks:</strong></p>
        <p>If a marketing element fails or is removed, your voting power will not be refunded.</p>
        <p><strong>Voting Risks</strong></p>
        <p><strong>Use Voting Power Wisely:</strong></p>
        <p>Once allocated, your voting power cannot be recovered.</p>
        <p><strong>Responsibility:</strong></p>
        <p>By participating in this protocol, you accept all associated risks and confirm your responsibility for your actions.</p>
      </div>
    )}
    <button onClick={() => toggleSection("ExampleUserFlow")} className={styles.buttonG}>
      Example User Flow
    </button>
    {showExampleUserFlow && (
      <div className={styles.infoContent}>
        <h4>Example User Flow</h4>
        <p><strong>Step 1: Connect Wallet</strong></p>
        <p>Connect your Metamask wallet to the BSC Binance Smart Chain on the platform.</p>
        <p><strong>Step 2: Explore Marketing Elements</strong></p>
        <p>Browse the elements in various phases and select one that interests you.</p>
        <p><strong>Step 3: Stake Tokens</strong></p>
        <p><strong>Enter Stake Amount:</strong></p>
        <p>Enter the amount of LOP tokens you wish to stake.</p>
        <p>Confirm the staking transaction in Metamask.</p>
        <p><strong>Receive Rewards:</strong></p>
        <p>Wait for at least one month and claim your both rewards and voting power.</p>
        <p>Rewards Rate for users: 1st year: 0.6%, 2nd year: 1.2%, 3rd and 3+ years: 1.8%.</p>
        <p><strong>Step 4: Vote for Marketing Element</strong></p>
        <p>Decide how much voting power you want to allocate to your selected element.</p>
        <p><strong>Step 5: Monitor Marketing Progress</strong></p>
        <p>Regularly check the marketing element details to monitor its progress and your voting impact.</p>
      </div>
    )}



<button onClick={() => toggleSection("ExampleCreatorFlow")} className={styles.buttonG}>
      Example Application Creator Flow
    </button>
    {ExampleCreatorFlow && (
      <div className={styles.infoContent}>
        <h4>Example Application Creator Flow</h4>
        <p><strong>Step 1: Connect Wallet</strong></p>
        <p>Connect your Metamask wallet to the BSC Binance Smart Chain on the platform.</p>
        <p><strong>Step 2: Create New Media</strong></p>
        <p>Click Create New Media button, fill the inputs correctly and click Create New Media button.</p>
        <p><strong>Step 3: Check your email</strong></p>
        <p>You will receive an email containing necessary information about your application.</p>
        <p>Follow the instructions in your email.</p>
        <p><strong>Updating your project:</strong></p>
        <p>Keep email conversation with the Kilopi management and update your media element with the developments.</p>
        <p><strong>Step 4: Follow your wallet balance with LOP tokens</strong></p>
        <p>Every time a user claims LOP token rewards, you will receive your portion according to your marketing element&apos;s vote amount.</p>
        <p>Rewards Rate for creators: 1st year: 0.4%, 2nd year: 0.8%, 3rd and 3+ years: 1.2%.</p>
        <p><strong>Step 5: Develop your media to a better version</strong></p>
        <p>Keep working on your media, gather more users, receive more votes and increase your rewards.</p>
      </div>
    )}




    <button
      className={styles.buttonG}
      onClick={() => window.open('https://youtu.be/-iHwMgerX6s?si=M9pHkyVeBldkE3MI', '_blank')}
    >
      Tutorial Video
    </button>
  </div>
)}




            {isOwner && (
              <>
                <div className={styles.phaseContainer}>
                  <h3>Pending Approval</h3>
                  <div className={styles.dApps}>
                    {pendingApproval.map((element, index) => (
                      <div key={index} className={styles.carddApps}>
                        <div className={styles.carddAppsDescription}>
                          <p>ID: {element.id}</p>
                          <p>Name: {element.name}</p>
                          <p>Description: {element.description}</p>
                          <p>Email: {element.email}</p> {/* Display email */}
                          {element.logoUrl ? (
                            <img src={element.logoUrl} alt="Logo" width={50} height={50} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                          ) : (
                            <div style={{ width: 50, height: 50, background: '#ccc' }} />
                          )}
                          <button onClick={() => handleApproveElement(element.id)} className={styles.buttonG}>
                            Approve
                          </button>
                          <button onClick={() => handleRejectElement(element.id)} className={styles.buttonG}>
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.phaseContainer}>
                  <h3>Pending Update</h3>
                  <div className={styles.dApps}>
                    {pendingUpdate.map((element, index) => (
                      <div key={index} className={styles.carddApps}>
                        <div className={styles.carddAppsDescription}>
                          <p>ID: {element.id}</p>
                          <p>Name: {element.name}</p>
                          <p>Description: {element.description}</p>
                          <p>Email: {element.email}</p> {/* Display email */}
                          {element.logoUrl ? (
                            <img src={element.logoUrl} alt="Logo" width={50} height={50} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                          ) : (
                            <div style={{ width: 50, height: 50, background: '#ccc' }} />
                          )}
                          {element.mediaLink && (
                            <p>Media: <a href={element.mediaLink} target="_blank">Link</a></p>
                          )}
                          {element.exampleLink && (
                            <p>Example Content: <a href={element.exampleLink} target="_blank">Link</a></p>
                          )}
                          {element.performanceMetricsLink && (
                            <p>Performance Metrics: <a href={element.performanceMetricsLink} target="_blank">Link</a></p>
                          )}
                          <button onClick={() => handleUpdateElement(element.id)} className={styles.buttonG}>
                            Update
                          </button>
                          <button onClick={() => handleRefuseUpdateElement(element.id)} className={styles.buttonG}>
                            Refuse
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Change Second Admin</h4>
                      <p>Current State: {changeSecondAdminEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("changeSecondAdmin", !changeSecondAdminEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (changeSecondAdminEnabled ? 'Disable' : 'Enable') : 'Metamask (Binance Smart Chain) Needed'}
                      </button>
                    </div>
                  </div>
                
              </>
            )}

            {isOwner && (
              <div className={styles.formContainer}>
                <div className={styles.form}>
                  <h3>Admin Information</h3>
                  <p>Smart Contract Address: {MainContractAddress}</p>
                  <p>Total Staked Tokens: {parseFloat(ethers.formatUnits(totalStakedTokens, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p>LOP Token Balance of Smart Contract: {parseFloat(ethers.formatUnits(totalTokenBalance, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p>Estimated Debt: {parseFloat(ethers.formatUnits(calculatedValue, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            )}

            {isOwner && (
              <div className={styles.formContainer}>
                <div className={styles.form}>
                  <h3>General Status</h3>
                  <p>New Staking Allowance: {generalStatus ? "Enabled" : "Disabled"}</p>
                  <button className={styles.buttonG} onClick={handleChangeGeneralStatus} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                    {isMetamaskConnected && isCorrectNetwork ? 'Change New Staking Allowance' : 'Metamask (Binance Smart Chain) Needed'}
                  </button>
                </div>
              </div>
            )}

            {isSecondOwner && (
              <div className={styles.row}>
                <div className={styles.formContainerWrapper}>
                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Approve Element</h4>
                      <p>Current State: {approveElementEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("approveElement", !approveElementEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (approveElementEnabled ? 'Disable' : 'Enable') : 'Metamask (Binance Smart Chain) Needed'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Reject Element</h4>
                      <p>Current State: {rejectElementEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("rejectElement", !rejectElementEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (rejectElementEnabled ? 'Disable' : 'Enable') : 'Metamask (Binance Smart Chain) Needed'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Remove Element</h4>
                      <p>Current State: {removeElementEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("removeElement", !removeElementEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (removeElementEnabled ? 'Disable' : 'Enable') : 'Metamask (Binance Smart Chain) Needed'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Confirm Update</h4>
                      <p>Current State: {confirmUpdateEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("confirmUpdate", !confirmUpdateEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (confirmUpdateEnabled ? 'Disable' : 'Enable') : 'Metamask (Binance Smart Chain) Needed'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Refuse Update</h4>
                      <p>Current State: {refuseUpdateEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("refuseUpdate", !refuseUpdateEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (refuseUpdateEnabled ? 'Disable' : 'Enable') : 'Metamask (Binance Smart Chain) Needed'}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Change Admin</h4>
                      <p>Current State: {changeAdminEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("changeAdmin", !changeAdminEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (changeAdminEnabled ? 'Disable' : 'Enable') : 'Metamask (Binance Smart Chain) Needed'}
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
                        {isMetamaskConnected && isCorrectNetwork ? 'Change Owner Address' : 'Metamask (Binance Smart Chain) Needed'}
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
                        {isMetamaskConnected && isCorrectNetwork ? 'Change Second Owner Address' : 'Metamask (Binance Smart Chain) Needed'}
                      </button>
                    </div>
                  </div>
                  
                </div>
              </div>
            )}

          </>
        )}
        {dAppsNav === "detail" && selectedElementId !== null && (
          <>
            <Detail elementId={selectedElementId} />
          </>
        )}









      </div>
    </>
  );
}
