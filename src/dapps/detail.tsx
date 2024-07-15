// use client
'use client';
import styles from "../styles/global.module.css";
import { useDispatch } from 'react-redux';
import { setdAppsNav } from '../store/globalSlice';
import getContract from './contract';
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

  const harmonyTestnetChainId = '0x6357d2e0'; // Binance Chain chain ID in hexadecimal

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

        await loadElement();
      }
    }
  }, [harmonyTestnetChainId, elementId]);

  useEffect(() => {
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

  const getPhase = () => {
    if (!element) return 'Unknown';

    const phase = element.phase;

    if (phase === 3) {
      return 'Prestige';
    } else if (phase === 2) {
      return 'Live';
    } else if (phase === 1) {
      return 'Development';
    } else {
      return 'Theory';
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
        <h3>Application Development Detail Page</h3>
        <button className={styles.buttonG} onClick={() => dispatch(setdAppsNav('Home'))}>
          Back to Application Development Main Page
        </button>
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
                  <p>Whitepaper: <a href={element.whitepaperLink} target="_blank">Link</a></p>
                  {getPhase() !== 'Theory' && (
                    <p>Website: <a href={element.websiteLink} target="_blank">Link</a></p>
                  )}
                  {getPhase() === 'Live' && (
                    <p>Tutorial: <a href={element.tutorialLink} target="_blank">Link</a></p>
                  )}
                  {getPhase() === 'Prestige' && (
                    <>
                      <p>Tutorial: <a href={element.tutorialLink} target="_blank">Link</a></p>
                      <p>Performance Metrics: <a href={element.performanceMetricsLink} target="_blank">Link</a></p>
                    </>
                  )}
                  <p>Current Phase: {getPhase()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Detail;
