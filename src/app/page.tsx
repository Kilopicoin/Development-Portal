// use client
'use client';
import styles from "../styles/global.module.css";
import {useState} from 'react';
import Dapps from '../dapps/index';
import Marketing from '../marketing/index';
import Exchanges from '../exchanges/index';
import { useSelector, useDispatch } from 'react-redux';
import { setdAppsNav, setMarketingNav, setExchangesNav } from '../store/globalSlice';
import Head from 'next/head';

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
<>
    <Head>
        <title>Kilopi - Proof of Development</title>
        <meta name="description" content="Decentralized Proof of Development system ensures the project keeps its development in all ways.
There 3 major categories in this manner. Application Development, Marketing and Exchange Listing Protocols." />
        <meta property="og:title" content="Kilopi - Proof of Development" />
        <meta property="og:description" content="Decentralized Proof of Development system ensures the project keeps its development in all ways.
There 3 major categories in this manner. Application Development, Marketing and Exchange Listing Protocols." />
        <meta property="og:image" content="/images/Kilopi_Full.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add more meta tags as needed */}
      </Head>


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

                                                                     }  }>Application Development Protocol
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

                                                                     }  }>Marketing Protocol
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

                                                             }  }>Exchange Listing Protocol
  </button>
</h2>




      </div>
      <div className={styles.columnright}>

        {nav === "Home" && (
          <>
          <h2>Kilopi, Decentralized &quot;Proof of Development&quot; System</h2>
          <h2>Home</h2>
          <br></br>
          <h4>Decentralized &quot;Proof of Development&quot; system ensures the project keeps its development in all ways.</h4>
          <h4>There 3 major categories in this manner. Application Development, Marketing and Exchange Listing Protocols.</h4>
          <h4>Please use the navigation menu to review these categories.</h4>
          <br></br>
          <h4>The purpose of these categories;</h4>
          <br></br>
          <h4>Application Development Protocol</h4>
          <h4>This protocol ensures Kilopi project keeps developing new applications and creates new utility areas for the LOP token</h4>
          <br></br>
          <h4>Marketing Protocol</h4>
          <h4>This protocol ensures Kilopi project keeps its marketing activities in a sustainable and long term way</h4>
          <br></br>
          <h4>Exchange Listing Protocol</h4>
          <h4>This protocol ensures Kilopi project&apos;s LOP token to gets listed on new exchanges continuously</h4>


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
    </>
  );
}
