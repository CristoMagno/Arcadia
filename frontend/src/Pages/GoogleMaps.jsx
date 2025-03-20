import { useEffect, useState } from "react";
import '../Estilos/GoogleMaps.css'; 

export default function GoogleMaps() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLocationRequested, setIsLocationRequested] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Función para solicitar ubicación de forma explícita
  const requestLocation = () => {
    setIsLocationRequested(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("La geolocalización no es soportada por tu navegador");
      return;
    }

    // Para dispositivos móviles, es importante usar estas opciones
    const options = {
      enableHighAccuracy: true, // Usa GPS en móviles si está disponible
      timeout: 15000,
      maximumAge: 0, // No usar cache
    };

    // Forzar la solicitud de permisos
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        
        // En móviles, es bueno verificar si la precisión es suficiente
        if (position.coords.accuracy > 100) {
          console.warn("Precisión baja: " + position.coords.accuracy + " metros");
        }
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        if (error.code === 1) { // PERMISSION_DENIED
          setError("Permiso denegado. Por favor, activa la ubicación en la configuración de tu dispositivo y refresca la página.");
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          setError("Información de ubicación no disponible. Verifica que el GPS esté activado.");
        } else if (error.code === 3) { // TIMEOUT
          setError("Se agotó el tiempo de espera para obtener la ubicación. Intenta nuevamente.");
        } else {
          setError(`Error desconocido: ${error.message}`);
        }
      },
      options
    );
  };

  // Cargar el script de Google Maps API previamente
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
      };
      
      document.head.appendChild(googleMapScript);
    };
    
    loadGoogleMapsScript();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Inicializar mapa cuando tengamos ubicación y script cargado
  useEffect(() => {
    if (location && mapLoaded && window.google?.maps) {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: location.lat, lng: location.lng },
        zoom: 16,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
      });
      
      // Añadir círculo azul en la ubicación exacta
      const locationCircle = new window.google.maps.Circle({
        strokeColor: '#1E90FF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#1E90FF',
        fillOpacity: 0.35,
        map,
        center: { lat: location.lat, lng: location.lng },
        radius: Math.min(location.accuracy || 50, 50), // Limitar el radio a 100m máximo para mejor visualización
      });
      
      // Añadir marcador en el centro exacto
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: 'Mi ubicación actual',
        animation: window.google.maps.Animation.DROP
      });
      
      // Añadir información al hacer clic en el marcador
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="text-align:center">
                    <strong>Tu ubicación actual</strong><br>
                    Lat: ${location.lat.toFixed(6)}<br>
                    Lng: ${location.lng.toFixed(6)}<br>
                    Precisión: ${location.accuracy?.toFixed(2)} metros
                  </div>`
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    }
  }, [location, mapLoaded]);

  // Para detectar cambios en la ubicación (modo navegación)
  const setupWatchPosition = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error("Error al seguir ubicación:", error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
      
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">Mi Ubicación en Google Maps</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={requestLocation}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
          >
            Intentar nuevamente
          </button>
        </div>
      )}
      
      {!location && !error && (
        <div className="text-center mb-4 w-full max-w-md">
          {!isLocationRequested ? (
            <>
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">Permiso de ubicación necesario</p>
                <p className="mb-3">Esta aplicación necesita acceso a tu ubicación para mostrar el mapa con tu posición exacta.</p>
              </div>
              <button 
                onClick={requestLocation}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg w-full"
              >
                Permitir acceso a mi ubicación
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <p>Esperando respuesta de ubicación...</p>
              <p className="text-sm text-gray-600 mt-1">Si no aparece el diálogo de permisos, verifica la configuración de tu navegador</p>
              <div className="mt-4 w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
      
      {location && (
        <div className="text-center w-full">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
            <p>Ubicación obtenida con éxito</p>
            <p className="mb-1 text-sm">Precisión: {location.accuracy?.toFixed(2)} metros</p>
          </div>
          
          <div 
            id="map" 
            style={{ height: "450px", width: "100%", maxWidth: "600px", borderRadius: "8px", margin: "0 auto" }}
          ></div>
          
          <div className="mt-4 flex justify-center">
            <button 
              onClick={requestLocation}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Actualizar mi ubicación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
