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
  );
}
