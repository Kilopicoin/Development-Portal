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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stakedTokens, setStakedTokens] = useState<bigint>(BigInt(0)); // Use bigint for stakedTokens
  const [rewards, setRewards] = useState<bigint>(BigInt(0)); // Use bigint for rewards
  const [votingPower, setVotingPower] = useState<bigint>(BigInt(0)); // Use bigint for votingPower
  const [account, setAccount] = useState<string | null>(null); // State for account

  const [lastClaimed, setLastClaimed] = useState<bigint>(BigInt(0));
  const [claimCooldown, setClaimCooldown] = useState<number>(30 * 24 * 60 * 60); // Claim cooldown period in seconds (e.g., 24 hours)
  const [timeLeftToClaim, setTimeLeftToClaim] = useState<number>(0);

  const harmonyTestnetChainId = '0x6357d2e0';

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
      }
    }
  }, [harmonyTestnetChainId]);

  const checkOwner = async (account: string) => {
    try {
      const contract = await getContract();
      const owner = await contract.admin();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error(error);
    }
  };

  const loadStakingDetails = async (account: string) => {
    try {
      const contract = await getContract();
      const staked = BigInt(await contract.stakes(account));
      const power = BigInt(await contract.votingPower(account));
      const lastClaimed = BigInt(await contract.lastClaimed(account));

      // Convert bigint to number for timeElapsed calculation
      const currentTime = BigInt(Math.floor(Date.now() / 1000)); // current time in seconds
      const timeElapsed = currentTime - lastClaimed; // time elapsed in seconds

      // Calculate rewards
      const reward = (staked * BigInt(3) / BigInt(100)) * timeElapsed / BigInt(365 * 24 * 60 * 60);

      setStakedTokens(staked);
      setVotingPower(power);
      setRewards(reward);
      setLastClaimed(lastClaimed);

      const cooldownRemaining = Math.max(0, claimCooldown - Number(timeElapsed));
      setTimeLeftToClaim(cooldownRemaining);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaimRewards = async () => {
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.claimRewards();
      await tx.wait();
      loadStakingDetails(account!);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElements();
    checkMetamaskConnection();

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
      const contract = await getSignerContract();
      const tx = await contract.createElement(name, description, whitepaperLink, email, logoUrl);
      await tx.wait();
      loadElements();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleElementClick = (elementId: number) => {
    setSelectedElementId(elementId);
    dispatch(setdAppsNav('detail'));
  };

  const handleApproveElement = async (elementId: number) => {
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
    setLoading(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.stakeTokens(ethers.parseUnits(stakeAmount, 18)); // Ensure stakeAmount is in correct units
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
      const contract = await getSignerContract();
      const tx = await contract.withdrawStake(ethers.parseUnits(withdrawAmount, 18)); // Ensure withdrawAmount is in correct units
      await tx.wait();
      loadStakingDetails(account!);
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
                <label>Voting Power: {ethers.formatUnits(votingPower, 18)}</label>
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
                    </div>
                    </div>
                    </div>

                    <div className={styles.buttondAppsX}>
                    <div className={styles.carddApps}>

                    <div className={styles.inputGroup}>
                    <label>Staked Tokens: {ethers.formatUnits(stakedTokens, 18)}</label>
                    <label>Rewards: {ethers.formatUnits(rewards, 18)}</label>
                      
                      <button
                        onClick={handleClaimRewards}
                        className={styles.buttonG}
                        disabled={timeLeftToClaim > 0}
                      >
                        {timeLeftToClaim > 0
                          ? `Claim available in ${formatTimeLeft(timeLeftToClaim)}`
                          : 'Claim Rewards'}
                      </button>
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
              <button onClick={() => setShowCreateForm(!showCreateForm)} className={styles.buttonG}>
                {showCreateForm ? 'Hide Create Form' : 'Create New Element'}
              </button>
              {showCreateForm && (
                <div className={styles.formContainer}>
                  <form onSubmit={handleCreateElement} className={styles.form}>
                    <h4>Create New Element</h4>
                    <div className={styles.inputGroup}>
                      <label htmlFor="name">Name:</label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="description">Description:</label>
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
                      <label htmlFor="logoUrl">Logo URL:</label>
                      <input
                        type="text"
                        id="logoUrl"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className={styles.buttonG} disabled={!isMetamaskConnected || !isCorrectNetwork}>
                      {isMetamaskConnected && isCorrectNetwork ? 'Create New Element' : 'Metamask (Harmony Testnet) Needed'}
                    </button>
                  </form>
                </div>
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
              </>
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
