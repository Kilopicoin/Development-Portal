'use client';
import styles from "../styles/global.module.css";
import { useDispatch } from 'react-redux';
import { setMarketingNav } from '../store/globalSlice';
import getContract, { getSignerContract } from './contract';
import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers.js v6.x.x
import { TailSpin } from 'react-loader-spinner'; // Correct import for Loader
import Modal from '../modal/Modal'; // Import the Modal component
import Head from 'next/head';

interface DetailProps {
  elementId: number;
}

const Detail: React.FC<DetailProps> = ({ elementId }) => {
  const dispatch = useDispatch();
  const [element, setElement] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state
  const [newMediaLink, setNewMediaLink] = useState<string>(''); // State for new media link
  const [newExampleLink, setNewExampleLink] = useState<string>(''); // State for new example link
  const [newPerformanceMetricsLink, setNewPerformanceMetricsLink] = useState<string>(''); // State for new performance metrics link
  const [voteAmount, setVoteAmount] = useState<string>(''); // State for vote amount
  const [admin, setAdmin] = useState<string | null>(null); // State for admin

  // New state variables for staking details
  const [stakedTokens, setStakedTokens] = useState<bigint>(BigInt(0));
  const [rewards, setRewards] = useState<bigint>(BigInt(0));
  const [votingPower, setVotingPower] = useState<bigint>(BigInt(0));

  // State for function status
  const [removeElementEnabled, setRemoveElementEnabled] = useState(true);

  const harmonyTestnetChainId = '0x61'; // Harmony Testnet chain ID in hexadecimal

  const checkMetamaskConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsMetamaskConnected(accounts.length > 0);
      setIsCorrectNetwork(chainId === harmonyTestnetChainId);
      if (accounts.length > 0 && chainId === harmonyTestnetChainId) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        await loadStakingDetails(address); // Fetch staking details
        await loadAdmin(); // Load admin address
      }
    }
  }, [harmonyTestnetChainId, elementId]);

  useEffect(() => {
    checkMetamaskConnection();
    loadElement();
    loadFunctionStatus();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', checkMetamaskConnection);
      window.ethereum.on('chainChanged', checkMetamaskConnection);

      return () => {
        window.ethereum.removeListener('accountsChanged', checkMetamaskConnection);
        window.ethereum.removeListener('chainChanged', checkMetamaskConnection);
      };
    }
  }, [checkMetamaskConnection]);

  const loadElement = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const element = await contract.elements(elementId);
      setElement(element);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const loadStakingDetails = async (account: string) => {
    setLoading(true);
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmin = async () => {
    try {
      const contract = await getContract();
      const adminAddress = await contract.admin();
      setAdmin(adminAddress);
    } catch (error) {
      console.error(error);
    }
  };

  const loadFunctionStatus = async () => {
    try {
      const contract = await getContract();
      setRemoveElementEnabled(await contract.functionStatus("removeElement"));
    } catch (error) {
      console.error(error);
    }
  };

  const getPhase = () => {
    if (!element) return 'Unknown';

    const phase = Number(element.phase);

    switch (phase) {
      case 0:
        return 'Approval Pending';
      case 1:
        return 'Theory';
      case 2:
        return 'Development';
      case 3:
        return 'Live';
      case 4:
        return 'Prestige';
      default:
        return 'Unknown';
    }
  };

  const getVoteCount = () => {
    if (!element) return 'Unknown';

    const voteCount = Number(element.voteCount);
    return voteCount;
  };

  const handleVote = async () => {
    setLoading(true);
    try {
      const voteAmountNumber = parseFloat(voteAmount);
      if (isNaN(voteAmountNumber) || voteAmountNumber < 1) {
        setErrorMessage("The minimum vote amount is 1.");
        setLoading(false);
        return;
      }

      const voteAmountInBigInt = BigInt(ethers.parseUnits(voteAmount, 0).toString());
      if (voteAmountInBigInt > votingPower) {
        setErrorMessage("You do not have enough Voting Power.");
        setLoading(false);
        return;
      }

      const contract = await getSignerContract();
      const tx = await contract.voteOnElement(elementId, voteAmountInBigInt);
      await tx.wait();
      loadElement(); // Reload element data after voting
      await loadStakingDetails(account!); // Reload staking details to update voting power
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateElement = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const contract = await getSignerContract();
      let tx;
      if (getPhase() === 'Development') {
        tx = await contract.updateElementExample(elementId, newExampleLink);
      } else if (getPhase() === 'Live') {
        tx = await contract.updateElementMetrics(elementId, newPerformanceMetricsLink);
      } else {
        tx = await contract.updateElementMedia(elementId, newMediaLink);
      }
      await tx.wait();
      loadElement(); // Reload element data after update
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveElement = async () => {
    setLoading(true);
    try {
      if (!removeElementEnabled) {
        setErrorMessage("Remove Element function is currently disabled.");
        setLoading(false);
        return;
      }

      const contract = await getSignerContract();
      const tx = await contract.removeElement(elementId);
      await tx.wait();
      dispatch(setMarketingNav('Home')); // Navigate back to home after removal
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxVote = () => {
    setVoteAmount(ethers.formatUnits(votingPower, 0).toString());
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
        <h3>Marketing Protocol Detail Page</h3>
        <button className={styles.buttonG} onClick={() => dispatch(setMarketingNav('Home'))}>
          Back to Marketing Protocol Main Page
        </button>

        {isMetamaskConnected && (
          <div className={styles.phaseContainer}>
            <div className={styles.inputGroup}>
              <label>Connected Wallet: {account}</label>
              <label>Voting Power: {ethers.formatUnits(votingPower, 0)}</label>
            </div>
          </div>
        )}

        <div className={styles.dApps}>
          {element && (
            <div className={styles.buttondAppsDetail}>
              <div className={styles.carddApps}>
                {element.logoUrl ? (
                  <img
                    src={element.logoUrl}
                    alt="Logo"
                    width={300}
                    height={300}
                    style={{ width: '200px', height: '200px', objectFit: 'contain' }} 
                  />
                ) : (
                  <div style={{ width: 200, height: 200, background: '#ccc' }} />
                )}
                <div className={styles.carddAppsDescription}>
                  <p>Name: {element.name}</p>
                  <p>Email: {element.email}</p>
                  <p>Description: {element.description}</p>
                  {getPhase() !== 'Theory' && (
                    <p>Media: <a href={element.mediaLink} target="_blank">Link</a></p>
                  )}
                  {getPhase() === 'Live' && (
                    <p>Example Content: <a href={element.exampleLink} target="_blank">Link</a></p>
                  )}
                  {getPhase() === 'Prestige' && (
                    <>
                      <p>Example Content: <a href={element.exampleLink} target="_blank">Link</a></p>
                      <p>Performance Metrics: <a href={element.performanceMetricsLink} target="_blank">Link</a></p>
                    </>
                  )}
                  <p>Current Phase: {getPhase()}</p>
                  <p>Vote Count: {getVoteCount()}</p> {/* Display vote count */}
                </div>
              </div>

              {isMetamaskConnected && (
                <div className={styles.voteContainer}>
                  <h4>Vote for this Element</h4>
                  <div className={`${styles.inputGroup} ${styles.voteInputContainer}`}>
                    <label htmlFor="voteAmount">Vote Amount (LOP):</label>
                    <div className={styles.voteInputWrapper}>
                      <input
                        type="text"
                        id="voteAmount"
                        className={styles.voteInput}
                        value={voteAmount}
                        onChange={(e) => setVoteAmount(e.target.value)}
                      />
                      <button onClick={handleMaxVote} className={styles.buttonG}>
                        Max
                      </button>
                    </div>
                    <button onClick={handleVote} className={styles.buttonG}>
                      Vote
                    </button>
                  </div>
                </div>
              )}

              {isMetamaskConnected && element.creator.toLowerCase() === account?.toLowerCase() && getPhase() !== 'Prestige' && (
                <div className={styles.updateCard}>
                  <h4>Update Element</h4>
                  {getPhase() === 'Development' ? (
                    element.exampleLink ? (
                      <p>Update Request Pending Confirmation</p>
                    ) : (
                      <div className={styles.inputGroup}>
                        <label htmlFor="exampleLink">Example Content Link:</label>
                        <input
                          type="text"
                          id="exampleLink"
                          value={newExampleLink}
                          onChange={(e) => setNewExampleLink(e.target.value)}
                          required
                        />
                        <button onClick={handleUpdateElement} className={styles.buttonG}>
                          Update Element
                        </button>
                      </div>
                    )
                  ) : getPhase() === 'Live' ? (
                    element.performanceMetricsLink ? (
                      <p>Update Request Pending Confirmation</p>
                    ) : (
                      <div className={styles.inputGroup}>
                        <label htmlFor="performanceMetricsLink">Performance Metrics Link:</label>
                        <input
                          type="text"
                          id="performanceMetricsLink"
                          value={newPerformanceMetricsLink}
                          onChange={(e) => setNewPerformanceMetricsLink(e.target.value)}
                          required
                        />
                        <button onClick={handleUpdateElement} className={styles.buttonG}>
                          Update Element
                        </button>
                      </div>
                    )
                  ) : (
                    element.mediaLink ? (
                      <p>Update Request Pending Confirmation</p>
                    ) : (
                      <div className={styles.inputGroup}>
                        <label htmlFor="mediaLink">Media Link:</label>
                        <input
                          type="text"
                          id="mediaLink"
                          value={newMediaLink}
                          onChange={(e) => setNewMediaLink(e.target.value)}
                          required
                        />
                        <button onClick={handleUpdateElement} className={styles.buttonG}>
                          Update Element
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {isMetamaskConnected && admin?.toLowerCase() === account?.toLowerCase() && (
                <div className={styles.adminActions}>
                  <button onClick={handleRemoveElement} className={styles.buttonR}>
                    Remove Element
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default Detail;
