// use client
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setMarketingNav } from '../store/globalSlice';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import Detail from './detail'
import Head from 'next/head';

interface RootState {
  global: {
    MarketingNav: string;
  };
}

export default function Dapps() {



  const MarketingNav = useSelector((state: RootState) => state.global.MarketingNav);
  const dispatch = useDispatch();





  return (

    <>
    <Head>
        <title>Kilopi - Marketing Protocol</title>
        <meta name="description" content="Marketing Protocol ensures Kilopi project keeps its marketing activities in a sustainable and long term way" />
        <meta property="og:title" content="Kilopi - Marketing Protocol" />
        <meta property="og:description" content="Marketing Protocol ensures Kilopi project keeps its marketing activities in a sustainable and long term way" />
        <meta property="og:image" content="/images/Kilopi_Full.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add more meta tags as needed */}
      </Head>


    <div className={styles.main}>
      

        {MarketingNav === "Home" && (
            <>


          <h2>Marketing Protocol</h2>

          <div className={styles.dApps} >
       
          <h3>This protocol is under development, stay tuned</h3>


          </div>





          </>
)}


{MarketingNav === "detail" && (
<>

<Detail />

</>
)}

    </div>
    </>
  );
}
