// use client
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setdAppsNav } from '../store/dAppsNavSlice';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import {useState} from 'react';
import Detail from './detail'

interface RootState {
  dAppsNav: string; // Adjust the type according to your actual state structure
  // Add other slices if you have them
}

export default function Dapps() {



    const dAppsNav = useSelector((state: RootState) => state.dAppsNav);
  const dispatch = useDispatch();





  return (
    <div className={styles.main}>
      

        {dAppsNav === "Home" && (
            <>

      <h2>Kilopi Proof of Development dApp</h2>
          <h2>Decentralized Applications</h2>

          <div className={styles.dApps} >
          <button className={styles.buttondApps} onClick={(event) => {
                                                                       event.preventDefault()
                                                                       dispatch(setdAppsNav('detail'));
                                                                     }  }>

          <div className={styles.carddApps}>
          <Image src="/images/logo1.png" alt="Logo 1" width={50} height={50} />
          <div className={styles.carddAppsDescription}>
            <p>Kilopi DEX</p>
            <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
            </div>

            </div>
            Staked LOP Tokens: 356.260,00
          </button>


          <button className={styles.buttondApps}>
            
          <div className={styles.carddApps}>
          <Image src="/images/logo2.png" alt="Logo 2" width={50} height={50} />
          <div className={styles.carddAppsDescription}>
            <p>Lucky Shot</p>
            <p>A Betting Game with a fair luck system integrated</p>
            </div>

            </div>
            Staked LOP Tokens: 356.260,00
          
          </button>


          <button className={styles.buttondApps}>
            
          <div className={styles.carddApps}>
          <Image src="/images/logo3.png" alt="Logo 3" width={50} height={50} />
          <div className={styles.carddAppsDescription}>
            <p>Kilopi DEX</p>
            <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
            </div>

            </div>
            Staked LOP Tokens: 356.260,00
          
          </button>


          <button className={styles.buttondApps}>

          <div className={styles.carddApps}>
          <Image src="/images/logo1.png" alt="Logo 1" width={50} height={50} />
          <div className={styles.carddAppsDescription}>
            <p>Kilopi DEX</p>
            <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
            </div>

            </div>
            Staked LOP Tokens: 356.260,00
          </button>


          <button className={styles.buttondApps}>
            
          <div className={styles.carddApps}>
          <Image src="/images/logo2.png" alt="Logo 2" width={50} height={50} />
          <div className={styles.carddAppsDescription}>
            <p>Lucky Shot</p>
            <p>A Betting Game with a fair luck system integrated</p>
            </div>

            </div>
            Staked LOP Tokens: 356.260,00
          
          </button>


          <button className={styles.buttondApps}>
            
          <div className={styles.carddApps}>
          <Image src="/images/logo3.png" alt="Logo 3" width={50} height={50} />
          <div className={styles.carddAppsDescription}>
            <p>Kilopi DEX</p>
            <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
            </div>

            </div>
            Staked LOP Tokens: 356.260,00
          
          </button>


          </div>
          </>
)}


{dAppsNav === "detail" && (
<>

<Detail />

</>
)}

    </div>
  );
}
