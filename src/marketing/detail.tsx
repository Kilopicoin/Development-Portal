// use client
'use client';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setMarketingNav } from '../store/globalSlice';

export default function Detail() {

  const dispatch = useDispatch();

  return (
    <div className={styles.main}>


<h2>Kilopi Proof of Development dApp</h2>
<h2>Decentralized Application Details</h2>


      <div className={styles.dApps} >
          <div className={styles.buttondAppsDetail}>

          <div className={styles.carddApps}>
          <Image src="/images/logo1.png" alt="Logo 1" width={300} height={300} />
          <div className={styles.carddAppsDescription}>
            <p>Kilopi DEX</p>
            <p>A Decentralized Exchange utilizing the Kilopi [LOP] token</p>
            <p>Website</p>
            <p>Social Links</p>
            <p>Roadmap</p>
            <p>...</p>
            </div>

            </div>
            Staked LOP Tokens: 356.260,00
          
          <p>
          <button className={styles.buttonG} onClick={(event) => {
                                                                       event.preventDefault()

                                                                     }  }>Stake LOP tokens on this Project
          </button>
          </p>

          </div>

          <button className={styles.buttonG} onClick={(event) => {
                                                                       event.preventDefault()
                                                                       dispatch(setMarketingNav('Home'));

                                                                     }  }>Back to Decentralized Apps
          </button>

        </div>


    </div>
  );
}
