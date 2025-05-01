import { useEffect, useState, useRef, useCallback } from "react";
import styles from '../Estilos/GoogleMaps.module.css';
import Sidebar from "../Components/Sidebar";
import { IoReloadCircle } from "react-icons/io5";
import { MdGpsFixed, MdGpsOff } from "react-icons/md";

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
  const [externalGpsLocation, setExternalGpsLocation] = useState(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [usingExternalGps, setUsingExternalGps] = useState(false);
  const [showExternalGpsButton, setShowExternalGpsButton] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const externalMarkerRef = useRef(null);
  const wsRef = useRef(null);
  const [lastUpdate, setLastUpdate] = useState(null);

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

  // Conectar al WebSocket para recibir datos del GPS externo
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) return; // Evitar múltiples conexiones

    try {
      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Conectado al WebSocket del servidor para datos GPS');
        setShowExternalGpsButton(true);
      };

      ws.onclose = () => {
        console.log('Desconectado del WebSocket del GPS');
        wsRef.current = null;
        setShowExternalGpsButton(false);
        
        // Revertir a GPS del dispositivo si estábamos usando GPS externo
        if (usingExternalGps) {
          setUsingExternalGps(false);
        }
        
        // Reintentar conexión después de 5 segundos
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('Error en WebSocket del GPS:', error);
        setShowExternalGpsButton(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'gps_update' && message.payload) {
            const { lat, lng } = message.payload;
            console.log('Datos GPS recibidos:', message.payload);
            
            setExternalGpsLocation({
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              timestamp: new Date().toLocaleTimeString()
            });
            
            setLastUpdate(new Date());
            setShowExternalGpsButton(true);
            
            // Si estamos usando GPS externo, actualizar la vista del mapa
            if (usingExternalGps && mapRef.current) {
              updateExternalGpsMarker(parseFloat(lat), parseFloat(lng));
            }
          }
        } catch (error) {
          console.error('Error al procesar mensaje WebSocket:', error);
        }
      };
    } catch (error) {
      console.error('Error al conectar con WebSocket:', error);
      setShowExternalGpsButton(false);
    }
  }, [usingExternalGps]);

  // Función para desconectar WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      console.log('Cerrando WebSocket del GPS manualmente');
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Limpiar estados del GPS externo
    setShowExternalGpsButton(false);
    if (usingExternalGps) {
      setUsingExternalGps(false);
    }
    
    // Ocultar el marcador del GPS externo si existe
    if (externalMarkerRef.current && mapRef.current) {
      externalMarkerRef.current.setVisible(false);
    }
    
    // Mostrar el marcador del GPS del dispositivo
    if (markerRef.current && mapRef.current) {
      markerRef.current.setVisible(true);
    }
    
    // Centrar el mapa en la ubicación del dispositivo si está disponible
    if (location && mapRef.current) {
      mapRef.current.panTo({ lat: location.lat, lng: location.lng });
    }
  }, [location, usingExternalGps]);

  // Actualizar marcador de GPS externo
  const updateExternalGpsMarker = (lat, lng) => {
    if (!mapRef.current || !window.google?.maps) return;
    
    const position = { lat, lng };
    
    // Si no existe el marcador, crearlo
    if (!externalMarkerRef.current) {
      externalMarkerRef.current = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        title: 'GPS Externo',
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="5" fill="#FF3300"/>
              <circle cx="20" cy="20" r="7" fill="none" stroke="#ffffff" stroke-width="4"/>
              <circle cx="20" cy="20" r="20" fill="#FFCCCC" fill-opacity="0.4"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
        zIndex: 2, // Poner encima del marcador de ubicación normal
      });
      
      // Crear un infowindow para mostrar datos
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div>
          <strong>GPS Externo</strong><br>
          Lat: ${lat.toFixed(6)}<br>
          Lng: ${lng.toFixed(6)}<br>
          Última actualización: ${new Date().toLocaleTimeString()}
        </div>`
      });
      
      // Mostrar info al hacer clic
      externalMarkerRef.current.addListener('click', () => {
        infoWindow.open(mapRef.current, externalMarkerRef.current);
      });
    } else {
      // Actualizar posición del marcador existente
      externalMarkerRef.current.setPosition(position);
    }
    
    // Actualizar visibilidad según el modo de GPS
    if (externalMarkerRef.current) {
      externalMarkerRef.current.setVisible(usingExternalGps);
    }
    
    // Centrar el mapa en la nueva posición si está activado el seguimiento
    if (usingExternalGps) {
      mapRef.current.panTo(position);
    }
  };

  // Cambiar entre GPS del dispositivo y GPS externo
  const toggleGpsSource = () => {
    const newUsingExternalGps = !usingExternalGps;
    setUsingExternalGps(newUsingExternalGps);
    
    // Asegurarnos de que los marcadores se muestren correctamente
    if (mapRef.current) {
      if (markerRef.current) {
        markerRef.current.setVisible(!newUsingExternalGps);
      }
      
      if (externalMarkerRef.current) {
        externalMarkerRef.current.setVisible(newUsingExternalGps);
      }
      
      // Centrar el mapa en la ubicación correcta
      if (newUsingExternalGps && externalGpsLocation) {
        mapRef.current.panTo({ lat: externalGpsLocation.lat, lng: externalGpsLocation.lng });
      } else if (!newUsingExternalGps && location) {
        mapRef.current.panTo({ lat: location.lat, lng: location.lng });
      }
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

    // Limpiar al desmontar
    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      const googleMapScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (googleMapScript) {
        googleMapScript.remove();
      }
    };
  }, []);

  // Escuchar eventos de conexión de GPS desde Sidebar
  useEffect(() => {
    const handleGpsConnected = (event) => {
      console.log("Evento de GPS conectado recibido");
      connectWebSocket();
    };
    
    const handleGpsDisconnected = (event) => {
      console.log("Evento de GPS desconectado recibido");
      disconnectWebSocket();
    };

    window.addEventListener('gps-connected', handleGpsConnected);
    window.addEventListener('gps-disconnected', handleGpsDisconnected);
    
    return () => {
      window.removeEventListener('gps-connected', handleGpsConnected);
      window.removeEventListener('gps-disconnected', handleGpsDisconnected);
    };
  }, [connectWebSocket, disconnectWebSocket]);

  // Efecto para inicializar y actualizar el mapa
  useEffect(() => {
    if (!mapLoaded || !window.google?.maps) return;
    
    // Usar la ubicación adecuada según el modo seleccionado
    const currentLocation = usingExternalGps ? externalGpsLocation : location;
    
    // Si no hay ubicación disponible para el modo seleccionado, no hacer nada
    if (!currentLocation) return;
    
    // Si el mapa ya está creado, actualizar
    if (mapRef.current) {
      // Actualizar vista si cambió el modo de GPS
      mapRef.current.panTo({ lat: currentLocation.lat, lng: currentLocation.lng });
      
      // Actualizar visibilidad de los marcadores según el modo
      if (markerRef.current) {
        markerRef.current.setPosition({ lat: location?.lat || 0, lng: location?.lng || 0 });
        markerRef.current.setVisible(!usingExternalGps);
      }
      
      if (externalMarkerRef.current && externalGpsLocation) {
        externalMarkerRef.current.setPosition({ 
          lat: externalGpsLocation.lat, 
          lng: externalGpsLocation.lng 
        });
        externalMarkerRef.current.setVisible(usingExternalGps);
      }
      
      return;
    }
    
    // Crear el mapa por primera vez
    mapRef.current = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: currentLocation.lat, lng: currentLocation.lng },
      zoom: 16,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      gestureHandling: 'greedy',
      disableDoubleClickZoom: true,
    });

    // Crear marcador de ubicación del dispositivo
    if (location) {
      markerRef.current = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapRef.current,
        title: 'Mi ubicación actual',
        visible: !usingExternalGps,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="5" fill="#0033FF"/>
              <circle cx="20" cy="20" r="7" fill="none" stroke="#ffffff" stroke-width="4"/>
              <circle cx="20" cy="20" r="20" fill="#AECBFA" fill-opacity="0.4"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
      });
    }
    
    // Si tenemos ubicación por GPS externo, crear su marcador también
    if (externalGpsLocation) {
      updateExternalGpsMarker(externalGpsLocation.lat, externalGpsLocation.lng);
      
      // Asegurarse de que el marcador externo se muestre solo cuando corresponda
      if (externalMarkerRef.current) {
        externalMarkerRef.current.setVisible(usingExternalGps);
      }
    }
    
  }, [location, externalGpsLocation, mapLoaded, usingExternalGps]);

  return (
    <div className={styles.mapRoot}>
      <Sidebar />
      <div className={`${styles.mapHeader} ${styles.transparentHeader}`}>
        {location && (
          <button onClick={requestLocation} className={styles.mapButton} title="Actualizar ubicación del dispositivo">
            <IoReloadCircle className={styles.reload} size={40} />
          </button>
        )}
        
        {/* Botón para cambiar entre GPS del dispositivo y GPS externo */}
        {showExternalGpsButton && externalGpsLocation && (
          <button 
            onClick={toggleGpsSource} 
            className={`${styles.mapButton} ${styles.gpsToggle} ${usingExternalGps ? styles.active : ''}`}
            title={usingExternalGps ? "Cambiar a GPS del dispositivo" : "Cambiar a GPS externo"}
          >
            {usingExternalGps ? <MdGpsFixed size={30} /> : <MdGpsOff size={30} />}
            <span className={styles.gpsLabel}>
              {usingExternalGps ? "GPS Externo" : "GPS Dispositivo"}
            </span>
          </button>
        )}
        
        {/* Indicador de última actualización del GPS externo */}
        {showExternalGpsButton && externalGpsLocation && (
          <div className={styles.gpsInfo}>
            <div className={styles.gpsCoords}>
              {externalGpsLocation.lat.toFixed(6)}, {externalGpsLocation.lng.toFixed(6)}
            </div>
            <div className={styles.gpsTimestamp}>
              Actualizado: {externalGpsLocation.timestamp}
            </div>
          </div>
        )}
        
        {error && (
          <div className={styles.errorBox}>
            <p>{error}</p>
          </div>
        )}
      </div>
      <div className={styles.mapContainer}>
        <div id="map" className={styles.mapElement}></div>
        {!location && !externalGpsLocation && !error && !mapLoaded && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Esperando respuesta de ubicación...</p>
          </div>
        )}
      </div>
    </div>
  );
}