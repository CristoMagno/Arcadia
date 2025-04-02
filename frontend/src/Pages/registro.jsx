import React, { useState } from 'react';
import styles from '../Estilos/registro.module.css'; // Usamos CSS Modules
import logo from '../Images/logo.jpeg';
import logoGoogle from '../Images/g-logo.png';

export default function Registro() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'radio' ? value : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className={styles['signup-container']}>
      <div className={styles['signup-wrapper']}>
        <div className={styles['signup-image-panel']}>
          <img src={logo} alt="Registro" className={styles['signup-image']} />
        </div>

        <div className={styles['signup-form-panel']}>
          <h2>Crear Cuenta</h2>
          <p>Ingresa tus datos personales para crear tu cuenta.</p>

          <form onSubmit={handleSubmit}>
            <div className={styles['name-inputs']}>
              <div className={styles['input-group']}>
                <label htmlFor="firstName">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName" // Añadimos el atributo name
                  placeholder="ej. Juan"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles['input-group']}>
                <label htmlFor="lastName">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName" // Añadimos el atributo name
                  placeholder="ej. Pérez"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className={styles['form-group']}>
              <label>Género</label>
              <div className={styles['radio-group']}>
                {['Masculino', 'Femenino'].map((gender) => (
                  <label key={gender} className={`${styles['radio-option']} ${formData.gender === gender.toLowerCase() ? styles['radio-option--checked'] : ''}`}>
                    <input
                      type="radio"
                      name="gender" // El atributo name ya está aquí
                      value={gender.toLowerCase()}
                      checked={formData.gender === gender.toLowerCase()}
                      onChange={handleInputChange}
                      required
                    />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email" // Añadimos el atributo name
                placeholder="ej. juan.perez@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles['password-input']}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password" // Añadimos el atributo name
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles['toggle-password']}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button type="submit" className={styles['submit-button']}>
              Registrarse
            </button>
            <div className={styles['divider']}>
              <div className={styles['divider-line']}></div>
              <span>o regístrate con Google.</span>
              <div className={styles['divider-line']}></div>
            </div>

            <button type="button" className={styles['google-button']}>
              <img src={logoGoogle} alt="Google" className={styles['google-icon']} />
              Continuar con Google
            </button>

            <div className={styles['login-link']}>
              <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}