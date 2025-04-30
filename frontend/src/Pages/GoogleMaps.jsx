import { useEffect, useState, useRef, useCallback } from "react";
import styles from '../Estilos/GoogleMaps.module.css';
import Sidebar from "../Components/Sidebar";
import logoPng from "../Images/logopng.png";
import { IoReloadCircle } from "react-icons/io5";

// Función que carga el script de Google Maps y devuelve una promesa
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      return resolve();
    }
    const script = document.createElement("script");
    const apiKey = process.env.REACT_APP_Maps_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Error al cargar Google Maps"));
    document.head.appendChild(script);
  });
};

// Función que envuelve la geolocalización en una promesa
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("La geolocalización no es soportada por tu navegador"));
    }
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(new Error("Ubicación no obtenida")),
      options
    );
  });
};

export default function GoogleMaps() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Referencias para manipular el mapa y el marcador directamente
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Función para solicitar la ubicación envuelta en useCallback
  const requestLocation = useCallback(async () => {
    setError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      
      // Si el mapa ya existe, actualizamos su centro en lugar de recrearlo
      if (mapRef.current && window.google?.maps) {
        mapRef.current.panTo({ lat: loc.lat, lng: loc.lng });
        
        // Actualizar la posición del marcador existente
        if (markerRef.current) {
          markerRef.current.setPosition({ lat: loc.lat, lng: loc.lng });
        }
      }
    } catch (err) {
      console.error("Error de geolocalización:", err);
      setError(err.message);
    }
  }, []);

  // Función para inicializar el mapa envuelta en useCallback
  const onMapLoad = useCallback((location) => {
    if (!mapRef.current && mapContainerRef.current && window.google?.maps) {
      // Crear el mapa solo la primera vez
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 16,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        gestureHandling: 'greedy',
        disableDoubleClickZoom: true,
      });

      // Crear el marcador solo la primera vez
      markerRef.current = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapRef.current,
        title: 'Mi ubicación actual',
      });
    } else if (mapRef.current) {
      // Solo actualizamos el centro del mapa y la posición del marcador
      mapRef.current.panTo({ lat: location.lat, lng: location.lng });
      if (markerRef.current) {
        markerRef.current.setPosition({ lat: location.lat, lng: location.lng });
      }
    }
  }, []);

  // Cargar el script de Google Maps una sola vez
  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript();
        if (isMounted) {
          setMapLoaded(true);
          await requestLocation();
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(err.message);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      // No es necesario eliminar el script al desmontar, ya que queremos reutilizarlo
    };
  }, [requestLocation]);

  // Inicializar o actualizar el mapa cuando la ubicación cambia
  useEffect(() => {
    if (location && mapLoaded && window.google?.maps) {
      onMapLoad(location);
    }
  }, [location, mapLoaded, onMapLoad]);

  return (
    <div className={styles.mapRoot}>
      <Sidebar />
      <div className={styles.mapHeader}>
        {location && (
          <button onClick={requestLocation} className={styles.mapButton}>
            <IoReloadCircle className={styles.reload} size={40} />
          </button>
        )}
        {error && (
          <div className={styles.errorBox}>
            <p>{error}</p>
          </div>
        )}
      </div>
      <div className={styles.mapContainer}>
        <div ref={mapContainerRef} className={styles.mapElement}></div>
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