// use client
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setdAppsNav } from '../store/globalSlice';
import styles from "../styles/global.module.css";
import Image from 'next/image';
import Detail from './detail'

interface RootState {
  global: {
    dAppsNav: string;
  };
}

export default function Dapps() {



  const dAppsNav = useSelector((state: RootState) => state.global.dAppsNav);
  const dispatch = useDispatch();





  return (
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
  );
}
