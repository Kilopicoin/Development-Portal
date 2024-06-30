// use client
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setdAppsNav } from '../store/globalSlice';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import Detail from './detail'
import Head from 'next/head';

interface RootState {
  global: {
    dAppsNav: string;
  };
}

export default function Dapps() {



  const dAppsNav = useSelector((state: RootState) => state.global.dAppsNav);
  const dispatch = useDispatch();





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
      

        {dAppsNav === "Home" && (
            <>


          <h2>Application Development Protocol</h2>

          <div className={styles.dApps} >
      


          <h3>This protocol is under development, stay tuned</h3>




      


       




          </div>



        




          </>
)}


{dAppsNav === "detail" && (
<>

<Detail />

</>
)}

    </div>
    </>
  );
}
