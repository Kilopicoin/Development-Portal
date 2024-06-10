// use client
'use client';
import styles from "../styles/global.module.css";
import {useState} from 'react';
import Dapps from '../dapps/index';
import { useSelector, useDispatch } from 'react-redux';
import { setdAppsNav } from '../store/dAppsNavSlice';

interface RootState {
  dAppsNav: string; // Adjust the type according to your actual state structure
  // Add other slices if you have them
}

export default function Home() {

  const dAppsNav = useSelector((state: RootState) => state.dAppsNav);
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
          <h2>Kilopi Proof of Development dApp</h2>
          <h2>Marketing</h2>


          </>
        )}


{nav === "exchanges" && (
          <>
          <h2>Kilopi Proof of Development dApp</h2>
          <h2>Exchange Listings</h2>


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
