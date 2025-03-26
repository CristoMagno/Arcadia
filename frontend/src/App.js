import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import GoogleMaps from "./Pages/GoogleMaps";

const App = () => {
  return (
    <div className="Todo">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GoogleMaps />} />
          <Route
            path="*"
            element={
              <>
                <Routes>
                  <Route path="/mapa" element={<GoogleMaps />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;