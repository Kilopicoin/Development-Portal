'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setdAppsNav } from '../store/globalSlice';
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
    dAppsNav: string;
  };
}

export default function ApplicationDevelopment() {
  const dAppsNav = useSelector((state: RootState) => state.global.dAppsNav);
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
  const [whitepaperLink, setWhitepaperLink] = useState('');
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
  const [claimCooldown, setClaimCooldown] = useState<number>(5 * 60); // Claim cooldown period in seconds (e.g., 24 hours) 30 * 24 * 60 * 60
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
  const usdtContractAddress = '0xf2c1687C10b2c4ceF3Be82ddD15DceEed3f1bF6D';
  const MainContractAddress = '0xA1C9c9cCCb07327214801414800b85918D46C321';
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

  const toggleSection = (section: string) => {
    if (section === "GettingStarted") setShowGettingStarted(!showGettingStarted);
    if (section === "UsingPlatform") setShowUsingPlatform(!showUsingPlatform);
    if (section === "UserRisks") setShowUserRisks(!showUserRisks);
    if (section === "ExampleUserFlow") setShowExampleUserFlow(!showExampleUserFlow);
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
          whitepaperLink: element.whitepaperLink,
          websiteLink: element.websiteLink,
          tutorialLink: element.tutorialLink,
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
            (elementWithId.phase === 1 && elementWithId.websiteLink) ||
            (elementWithId.phase === 2 && elementWithId.tutorialLink) ||
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
      const tx = await contract.createElement(name, description, whitepaperLink, email, logoUrl);
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
    dispatch(setdAppsNav('detail'));
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
        <title>Kilopi - Application Development Protocol</title>
        <meta name="description" content="Application Development Protocol ensures Kilopi project keeps developing new applications and creates new utility areas for the LOP token." />
        <meta property="og:title" content="Kilopi - Application Development Protocol" />
        <meta property="og:description" content="Application Development Protocol ensures Kilopi project keeps developing new applications and creates new utility areas for the LOP token." />
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

            <h2>Application Development Protocol</h2>

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
                    {showCreateForm ? 'Hide Create Form' : 'Create New Project'}
                  </button>
                  {showCreateForm && (
                    <div className={styles.formContainer}>
                      <form onSubmit={handleCreateElement} className={styles.form}>
                        <div className={styles.inputGroup}>
                          <label htmlFor="name">Project Name:</label>
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
                          <label htmlFor="whitepaperLink">Whitepaper Link:</label>
                          <label>Whitepaper must have;</label>
                          <label>Blockchain Choice, Application's Clear Explanation, Tokenomics, Benefits for Kilopi, Roadmap, Team</label>
                          <input
                            type="text"
                            id="whitepaperLink"
                            value={whitepaperLink}
                            onChange={(e) => setWhitepaperLink(e.target.value)}
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
                        <button type="submit" className={styles.buttonG} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                          {isMetamaskConnected && isCorrectNetwork ? 'Create New Project' : 'Metamask (Harmony Testnet) Needed'}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <p>You have a pending application, you will receive an email</p>
              )}
            </div>

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
                          <p>Whitepaper: <a href={element.whitepaperLink} target="_blank">Link</a></p>
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
                          <p>Whitepaper: <a href={element.whitepaperLink} target="_blank">Link</a></p>
                          {element.websiteLink && (
                            <p>Website: <a href={element.websiteLink} target="_blank">Link</a></p>
                          )}
                          {element.tutorialLink && (
                            <p>Tutorial: <a href={element.tutorialLink} target="_blank">Link</a></p>
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
                        {isMetamaskConnected && isCorrectNetwork ? (changeSecondAdminEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
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
                    {isMetamaskConnected && isCorrectNetwork ? 'Change New Staking Allowance' : 'Metamask (Harmony Testnet) Needed'}
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
                        {isMetamaskConnected && isCorrectNetwork ? (approveElementEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Reject Element</h4>
                      <p>Current State: {rejectElementEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("rejectElement", !rejectElementEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (rejectElementEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Remove Element</h4>
                      <p>Current State: {removeElementEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("removeElement", !removeElementEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (removeElementEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Confirm Update</h4>
                      <p>Current State: {confirmUpdateEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("confirmUpdate", !confirmUpdateEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (confirmUpdateEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Refuse Update</h4>
                      <p>Current State: {refuseUpdateEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("refuseUpdate", !refuseUpdateEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (refuseUpdateEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.formContainer}>
                    <div className={styles.form}>
                      <h4>Toggle Change Admin</h4>
                      <p>Current State: {changeAdminEnabled ? "Enabled" : "Disabled"}</p>
                      <button className={styles.buttonG} onClick={() => handleToggleFunctionStatus("changeAdmin", !changeAdminEnabled)} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                        {isMetamaskConnected && isCorrectNetwork ? (changeAdminEnabled ? 'Disable' : 'Enable') : 'Metamask (Harmony Testnet) Needed'}
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
        {dAppsNav === "detail" && selectedElementId !== null && (
          <>
            <Detail elementId={selectedElementId} />
          </>
        )}



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
        <p><strong>Connect to Harmony Testnet:</strong></p>
        <p>Open Metamask.</p>
        <p>Click on the network dropdown at the top and select &quot;Harmony Testnet&quot;.</p>
        <p>If Harmony Testnet is not listed, you can add it manually by clicking on &quot;Add Network&quot; and entering the following details:</p>
        <p>Network Name: Harmony Testnet</p>
        <p>New RPC URL: https://api.s0.b.hmny.io/</p>
        <p>Chain ID: 1666700000</p>
        <p>Symbol: ONE</p>
        <p>Block Explorer URL: https://explorer.pops.one/</p>
      </div>
    )}
    <button onClick={() => toggleSection("UsingPlatform")} className={styles.buttonG}>
      Using the Platform
    </button>
    {showUsingPlatform && (
      <div className={styles.infoContent}>
        <h4>Using the Platform</h4>
        <p><strong>Exploring Phases</strong></p>
        <p><strong>Navigate to Application Phases:</strong></p>
        <p>Go to the &quot;Application Development Protocol&quot; section on the platform&apos;s main page.</p>
        <p>Applications are categorized into four phases: Theory, Development, Live, and Prestige.</p>
        <p><strong>View Application Details:</strong></p>
        <p>Click on any application card to view detailed information about the application, including its current phase, description, and voting status.</p>
        <p><strong>Staking and Voting</strong></p>
        <p><strong>Stake Tokens:</strong></p>
        <p>Enter the amount of LOP tokens you want to stake. Minimum stake amount: 1 LOP.</p>
        <p>Ensure you have sufficient LOP balance in your Metamask wallet.</p>
        <p><strong>Vote for an Application:</strong></p>
        <p>Select an application you support and enter the amount of your voting power you want to allocate.</p>
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
        <p>If an application fails or is removed, your voting power will not be refunded.</p>
        <p><strong>Voting Risks</strong></p>
        <p><strong>Use Voting Power Wisely:</strong></p>
        <p>Once allocated, your voting power cannot be recovered unless the application progresses to the next phase or is successful.</p>
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
        <p>Connect your Metamask wallet to the Harmony Testnet on the platform.</p>
        <p><strong>Step 2: Explore Applications</strong></p>
        <p>Browse the applications in various phases and select one that interests you.</p>
        <p><strong>Step 3: Stake Tokens</strong></p>
        <p><strong>Enter Stake Amount:</strong></p>
        <p>Enter the amount of LOP tokens you wish to stake.</p>
        <p>Confirm the staking transaction in Metamask.</p>
        <p><strong>Step 4: Vote for Application</strong></p>
        <p>Decide how much voting power you want to allocate to your selected application.</p>
        <p><strong>Step 5: Monitor Application Progress</strong></p>
        <p>Regularly check the application details to monitor its progress and your voting impact.</p>
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





      </div>
    </>
  );
}
