import { useEffect, useState } from "react";
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCVA6g0s25NHqbJrJlW1PPvp_w5uAI_IHw`;
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
  const [markers, setMarkers] = useState([]); // <-- Agregado para manejar marcadores

  // Función para solicitar la ubicación
  const requestLocation = async () => {
    setError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err) {
      console.error("Error de geolocalización:", err);
      setError(err.message);
    }
  };

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

    // Limpieza: Remover el script al desmontar
    return () => {
      isMounted = false;
      const googleMapScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (googleMapScript) {
        googleMapScript.remove();
      }
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
        mapTypeControl: false,
        gestureHandling: 'greedy',
        disableDoubleClickZoom: true,
      });

      // Marcador de la ubicación actual
      new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: 'Mi ubicación actual',
      });

      // Evento de clic para agregar nuevos marcadores personalizados
      window.google.maps.event.addListener(map, 'click', (e) => {
        const nombre = prompt("Introduce un nombre para el marcador:");
        if (!nombre) {
          alert("Nombre inválido. Marcador no creado.");
          return;
        }

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: nombre,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<strong>${nombre}</strong><br>${lat.toFixed(5)}, ${lng.toFixed(5)}`
        });

        marker.addListener('click', () => infoWindow.open(map, marker));

        setMarkers(prev => [...prev, { nombre, lat, lng, marker }]);
        console.log("Marcadores actuales:", [...markers, { nombre, lat, lng }]);
      });
    }
  }, [location, mapLoaded]);

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
