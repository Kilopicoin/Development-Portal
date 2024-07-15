// use client
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
  const [pendingApproval, setPendingApproval] = useState<any[]>([]); // New state for pending approval elements
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [whitepaperLink, setWhitepaperLink] = useState('');
  const [email, setEmail] = useState(''); // New state for email
  const [logoUrl, setLogoUrl] = useState(''); // New state for logoUrl

  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // State for checking owner
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state
  const [showCreateForm, setShowCreateForm] = useState(false); // State for showing/hiding the create form

  const harmonyTestnetChainId = '0x6357d2e0'; // Harmony Testnet chain ID in hexadecimal

  const checkMetamaskConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsMetamaskConnected(accounts.length > 0);
      setIsCorrectNetwork(chainId === harmonyTestnetChainId);
      if (accounts.length > 0) {
        await checkOwner(accounts[0]);
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

  const loadElements = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const elementCount = await contract.elementCount();
      const theory = [];
      const development = [];
      const live = [];
      const prestige = [];
      const pending = []; // New array for pending approval elements

      for (let i = 0; i < elementCount; i++) {
        const element = await contract.elements(i);
        console.log('Element:', element); // Debugging line
        const elementWithId = {
          id: i,
          name: element.name,
          description: element.description,
          whitepaperLink: element.whitepaperLink,
          websiteLink: element.websiteLink,
          tutorialLink: element.tutorialLink,
          performanceMetricsLink: element.performanceMetricsLink,
          email: element.email, // Add email
          logoUrl: element.logoUrl, // Add logoUrl
          phase: Number(element.phase), // Ensure phase is a number
          voteCount: Number(element.voteCount), // Ensure voteCount is a number
        };

        console.log('Element with ID:', elementWithId); // Debugging line

        if (elementWithId.phase === 1) {
          theory.push(elementWithId);
        } else if (elementWithId.phase === 2) {
          development.push(elementWithId);
        } else if (elementWithId.phase === 3) {
          live.push(elementWithId);
        } else if (elementWithId.phase === 4) {
          prestige.push(elementWithId);
        }

        if (elementWithId.phase === 0) { // Assuming phase 0 means pending approval
          pending.push(elementWithId);
        }
      }

      setTheoryPhase(theory);
      setDevelopmentPhase(development);
      setLivePhase(live);
      setPrestigePhase(prestige);
      setPendingApproval(pending); // Set the state for pending approval elements

      console.log('Theory Phase:', theory); // Debugging line
      console.log('Development Phase:', development); // Debugging line
      console.log('Live Phase:', live); // Debugging line
      console.log('Prestige Phase:', prestige); // Debugging line
      console.log('Pending Approval:', pending); // Debugging line
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
      loadElements(); // Reload elements after creating a new one
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
      const tx = await contract.approveElement(elementId); // Call the approveElement function
      await tx.wait();
      loadElements(); // Reload elements after approving one
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
            <h2>Application Development Protocol</h2>
            {!isMetamaskConnected && (
              <button onClick={connectMetamask} className={styles.buttonG}>
                Connect to MetaMask
              </button>
            )}

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
                        <p>ID: {element.id}</p>
                        <p>Name: {element.name}</p>
                        <p>Description: {element.description}</p>
                        <p>Whitepaper: <a href={element.whitepaperLink} target="_blank">Link</a></p>
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
                        <p>ID: {element.id}</p>
                        <p>Name: {element.name}</p>
                        <p>Description: {element.description}</p>
                        <p>Whitepaper: <a href={element.whitepaperLink} target="_blank">Link</a></p>
                        <p>Website: <a href={element.websiteLink} target="_blank">Link</a></p>
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
                        <p>ID: {element.id}</p>
                        <p>Name: {element.name}</p>
                        <p>Description: {element.description}</p>
                        <p>Whitepaper: <a href={element.whitepaperLink} target="_blank">Link</a></p>
                        <p>Website: <a href={element.websiteLink} target="_blank">Link</a></p>
                        <p>Tutorial: <a href={element.tutorialLink} target="_blank">Link</a></p>
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
                        <p>ID: {element.id}</p>
                        <p>Name: {element.name}</p>
                        <p>Description: {element.description}</p>
                        <p>Whitepaper: <a href={element.whitepaperLink} target="_blank">Link</a></p>
                        <p>Website: <a href={element.websiteLink} target="_blank">Link</a></p>
                        <p>Tutorial: <a href={element.tutorialLink} target="_blank">Link</a></p>
                        <p>Performance Metrics: <a href={element.performanceMetricsLink} target="_blank">Link</a></p>
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
                      {isMetamaskConnected && isCorrectNetwork ? 'Create New Element' : 'Metamask (Binance Chain) Needed'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {isOwner && (
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
                      </div>
                    </div>
                  ))}
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
