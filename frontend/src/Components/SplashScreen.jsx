import React from 'react';
import logoPng from '../Images/logopng.png'; // Asegúrate que la ruta al logo sea correcta
import styles from '../Estilos/SplashScreen.module.css'; // Crearemos este archivo CSS

const SplashScreen = () => {
  return (
    <div className={styles.splashContainer}>
      <img src={logoPng} alt="Arcadia Explorer Logo" className={styles.splashLogo} />
      <h1 className={styles.splashTitle}>Arcadia Explorer</h1>
    </div>
  );
};

export default SplashScreen;