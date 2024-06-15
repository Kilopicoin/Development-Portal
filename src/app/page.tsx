// use client
'use client';
import styles from "../styles/global.module.css";
import {useState} from 'react';
import Dapps from '../dapps/index';
import Marketing from '../marketing/index';
import Exchanges from '../exchanges/index';
import { useSelector, useDispatch } from 'react-redux';
import { setdAppsNav, setMarketingNav, setExchangesNav } from '../store/globalSlice';

interface RootState {
  global: {
    dAppsNav: string;
    marketingNav: string;
    exchangesNav: string;
  };
}

export default function Home() {

  const dAppsNav = useSelector((state: RootState) => state.global.dAppsNav);
  const marketingNav = useSelector((state: RootState) => state.global.marketingNav);
  const exchangesNav = useSelector((state: RootState) => state.global.exchangesNav);
  const dispatch = useDispatch();

  const [nav, setnav] = useState("Home");
  const [Loading, setLoading] = useState(0);



  return (
    <main className={styles.main}>
      
      <div className={styles.container}>
      <div className={styles.columnleft}>



        <h2>
          <button className={styles.button} onClick={(event) => {
                                                                       event.preventDefault()
                                                                       setnav("Home")
                                                                     }  }>Home
          </button>
        </h2>



        <hr className={styles.hr}></hr>

        <h2>
          <button className={styles.button} onClick={(event) => {
                                                                       event.preventDefault()
                                                                       if ( nav !== "dapps" ) {
                                                                        setnav("dapps")
                                                                      } 
                                                                      if ( dAppsNav === "detail" ) {
                                                                        dispatch(setdAppsNav('Home'));
                                                                      }

                                                                     }  }>Decentralized Applications
          </button>
        </h2>

        <hr className={styles.hr}></hr>

        <h2>
          <button className={styles.button} onClick={(event) => {
                                                                       event.preventDefault()
                                                                       if ( nav !== "marketing" ) {
                                                                        setnav("marketing")
                                                                      } 
                                                                      if ( marketingNav === "detail" ) {
                                                                        dispatch(setMarketingNav('Home'));
                                                                      }

                                                                     }  }>Marketing
          </button>
        </h2>

        <hr className={styles.hr}></hr>

<h2>
  <button className={styles.button} onClick={(event) => {
                                                               event.preventDefault()
                                                               if ( nav !== "exchanges" ) {
                                                                setnav("exchanges")
                                                              } 
                                                              if ( exchangesNav === "detail" ) {
                                                                dispatch(setExchangesNav('Home'));
                                                              }

                                                             }  }>Exchange Listings
  </button>
</h2>




      </div>
      <div className={styles.columnright}>

        {nav === "Home" && (
          <>
          <h2>Kilopi Proof of Development dApp</h2>
          <h2>Home</h2>
          <h4>Guide and Rules Page</h4>


          </>
        )}


{nav === "dapps" && (
          <>
         
          <Dapps/>

          </>
        )}


{nav === "marketing" && (
          <>
          <Marketing/>


          </>
        )}


{nav === "exchanges" && (
          <>
          <Exchanges/>


          </>
        )}
    





      </div>

      {Loading === 1 && (
        <div className={styles.elips}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}



    </div>


    </main>
  );
}
