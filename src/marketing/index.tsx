// use client
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setMarketingNav } from '../store/globalSlice';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import Detail from './detail'

interface RootState {
  global: {
    MarketingNav: string;
  };
}

export default function Dapps() {



  const MarketingNav = useSelector((state: RootState) => state.global.MarketingNav);
  const dispatch = useDispatch();





  return (
    <div className={styles.main}>
      

        {MarketingNav === "Home" && (
            <>

      <h2>Kilopi Proof of Development dApp</h2>
          <h2>Decentralized Applications</h2>

          <div className={styles.dApps} >
          <button className={styles.buttondApps} onClick={(event) => {
                                                                       event.preventDefault()
                                                                       dispatch(setMarketingNav('detail'));
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



          <button className={styles.buttonG} onClick={(event) => {
                                                                       event.preventDefault()

                                                                     }  }>Add Your Marketing Style
          </button>



          </>
)}


{MarketingNav === "detail" && (
<>

<Detail />

</>
)}

    </div>
  );
}
