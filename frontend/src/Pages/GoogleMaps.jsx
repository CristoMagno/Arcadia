import { useEffect, useState } from "react";
import styles from '../Estilos/GoogleMaps.module.css';

export default function GoogleMaps() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const requestLocation = () => {
    setError(null);
    
    if (!navigator.geolocation) {
      setError("La geolocalización no es soportada por tu navegador");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        setError("Ubicación no obtenida");
      },
      options
    );
  };

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google?.maps) {
        setMapLoaded(true);
        return;
      }

      const googleMapScript = document.createElement('script');
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCVA6g0s25NHqbJrJlW1PPvp_w5uAI_IHw`;
      googleMapScript.async = true;
      googleMapScript.defer = true;
      googleMapScript.onload = () => {
        setMapLoaded(true);
        requestLocation();
      };

      document.head.appendChild(googleMapScript);
    };
    
    loadGoogleMapsScript();
    
    return () => {
      const googleMapScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (googleMapScript) googleMapScript.remove();
    };
  }, []);

  useEffect(() => {
    if (location && mapLoaded && window.google?.maps) {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: location.lat, lng: location.lng },
        zoom: 16,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false
      });

      new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: 'Mi ubicación actual',
      });
    }
  }, [location, mapLoaded]);

  return (
    <div className={styles.mapRoot}>
      <div className={styles.mapHeader}>
        <h1 className={styles.mapTitle}>Mapa en Vivo</h1>
        
        {location && (
          <button 
            onClick={requestLocation}
            className={styles.mapButton}
          >
            Actualizar ubicación
          </button>
        )}

        {error && (
          <div className={styles.errorBox}>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className={styles.mapContainer}>
        <div id="map" className={styles.mapElement}></div>
        
        {!location && !error && !mapLoaded && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Esperando respuesta de ubicación...</p>
          </div>
        )}
      </div>
    </div>
  );
}