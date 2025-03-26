import React, { useState } from 'react';
import {
  FaBars, FaTh
} from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import '../Estilos/Sidebar.css';
import logo from '../Images/logo.jpeg';
import logoPng from '../Images/logopng.png'

const Sidebar = ({ nose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenuIndex, setExpandedMenuIndex] = useState(null);

  const toggle = () => {
    if (isOpen) {
      setExpandedMenuIndex(null);
    }
    setIsOpen(!isOpen);
  };

  const toggleSubMenu = (index) => {
    if (!isOpen) {
      setIsOpen(true);
      setExpandedMenuIndex(index);
    } else {
      setExpandedMenuIndex(prevIndex => (prevIndex === index ? null : index));
    }
  };

  const menuItems = [
    {
      name: 'Inicio',
      path: '/login',
      icon: <FaTh />,
      submenu: [
        { name: 'Volver', path: '/login' }
      ]
    }
  ];

  const renderMenuItem = (item, index) => {
    const isExpanded = expandedMenuIndex === index;
    if (item.submenu) {
      return (
        <div key={index}>
          <div className="link" onClick={() => toggleSubMenu(index)}>
            <div className="icon">{item.icon}</div>
            <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{item.name}</div>
          </div>
          {isExpanded && item.submenu.map((subitem, subindex) => (
            <NavLink to={subitem.path} key={subindex} className="link sublink" activeclassname="active">
              <div className="submenu_text">{subitem.name}</div>
            </NavLink>
          ))}
        </div>
      );
    } else {
      return (
        <NavLink to={item.path} key={index} className="link" activeclassname="active">
          <div className="icon">{item.icon}</div>
          <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{item.name}</div>
        </NavLink>
      );
    }
  };

  return (
    <div className="contenedor">
      <div className={`sidebar ${isOpen ? "open" : ""}`} style={{ width: isOpen ? "200px" : "60px" }}>
        <div className="top">
          <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">
            <img src={logo} alt="Imagen de login" className="logo-image" />
          </h1>
          <div className="bars" onClick={toggle}>
            <FaBars/>
          </div>
        </div>
        {menuItems.map(renderMenuItem)}
      </div>
      <main>{nose}</main>
      {/* Botón para móviles */}
      <div className="mobile-menu-toggle" onClick={toggle}>
   
          <img alt="logopng" src={logoPng} className='logoPng' />
       
      </div>
    </div>
  );
};

export default Sidebar;
