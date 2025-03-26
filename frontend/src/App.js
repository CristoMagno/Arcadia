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
          <Route path="/" element={<InicioSesion />} />
          
          <Route path="/login" element={<InicioSesion />} />

          <Route path="/signup" element={<Registro />} />
          
          <Route path="/mapa" element={<GoogleMaps />} />
          
          {/* Redirigir cualquier ruta no encontrada al inicio de sesión */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
