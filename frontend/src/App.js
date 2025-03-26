import React from "react";
import { BrowserRouter, Route, Routes, Navigate  } from "react-router-dom";
import "./App.css";
import './Estilos/global.css';
import GoogleMaps from "./Pages/GoogleMaps";
import Registro from "./Pages/registro";
import InicioSesion from "./Pages/inicioSesion";

const App = () => {
  return (
    <div className="Todo">
      <BrowserRouter>
      <Routes>
          {/* Ruta de inicio predeterminada */}
          <Route path="/" element={<InicioSesion />} />
          
          {/* Ruta de inicio de sesión */}
          <Route path="/login" element={<InicioSesion />} />

          
          {/* Ruta de registro */}
          <Route path="/signup" element={<Registro />} />
          
          {/* Ruta del mapa */}
          <Route path="/mapa" element={<GoogleMaps />} />
          
          {/* Redirigir cualquier ruta no encontrada al inicio de sesión */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
