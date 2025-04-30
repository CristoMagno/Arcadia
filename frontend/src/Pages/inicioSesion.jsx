import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Estilos/inicioSesion.module.css';
import logo from '../Images/logo.jpeg';
import logoGoogle from '../Images/g-logo.png';
import ConfirmationDialog from '../Components/ConfirmationDialog';

// Componente de form-group para reducir repetición de código
const FormGroup = memo(({ label, id, type, placeholder, value, onChange, required, showPasswordToggle, onTogglePassword, showPassword }) => {
  return (
    <div className={styles['form-group']}>
      <label htmlFor={id}>{label}</label>
      {showPasswordToggle ? (
        <div className={styles['password-input']}>
          <input
            type={showPassword ? "text" : "password"}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className={styles['toggle-password']}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      ) : (
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
      )}
    </div>
  );
});

FormGroup.displayName = 'FormGroup';

// Componente principal optimizado
export default function InicioSesion() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
 
  // Optimizado con useCallback para evitar recreaciones en cada render
  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  }, []);
 
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Implementación de lógica de inicio de sesión
  }, [formData]);
 
  const handleContinueWithoutLogin = useCallback(() => {
    setShowConfirmation(true);
  }, []);
 
  const handleConfirmContinue = useCallback(() => {
    setShowConfirmation(false);
    navigate('/mapa');
  }, [navigate]);

  const handleCancelContinue = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prevState => !prevState);
  }, []);
 
  return (
    <div className={styles['login-container']}>
      <div className={styles['login-wrapper']}>
        <div className={styles['login-image-panel']}>
          <img 
            src={logo} 
            alt="Imagen de login" 
            className={styles['login-image']}
            loading="lazy" 
          />
        </div>
 
        <div className={styles['login-form-panel']}>
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder.</p>
 
          <form onSubmit={handleSubmit}>
            <FormGroup
              label="Correo Electrónico"
              id="email"
              type="email"
              placeholder="ej. juan.perez@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              required={true}
            />
 
            <FormGroup
              label="Contraseña"
              id="password"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleInputChange}
              required={true}
              showPasswordToggle={true}
              onTogglePassword={togglePasswordVisibility}
              showPassword={showPassword}
            />
 
            <button type="submit" className={styles['login-button']}>
              Iniciar sesión
            </button>
 
            <div className={styles['login-link']}>
              <p>¿No tienes cuenta? <a href="/signup">Regístrate</a></p>
            </div>
          </form>

          <button type="button" className={styles['google-button']}>
            <img src={logoGoogle} alt="Google" className={styles['google-icon']} />
            Continuar con Google
          </button>
 
          <button
            onClick={handleContinueWithoutLogin}
            className={styles['continue-button']}
          >
            Continuar sin iniciar sesión
          </button>

          <ConfirmationDialog
            isOpen={showConfirmation}
            message="Se perderán funcionalidades, ¿seguro?"
            onConfirm={handleConfirmContinue}
            onCancel={handleCancelContinue}
          />
        </div>
      </div>
    </div>
  );
}