import React from 'react';
import { useTranslation } from 'react-i18next';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t('registerTitle')}</h2>
      <p>{t('registerMessage')}</p>
      <form>
        <div>
          <label htmlFor="username">{t('registerUsernameLabel')}</label>
          <input type="text" id="username" name="username" />
        </div>
        <div>
          <label htmlFor="email">{t('registerEmailLabel')}</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">{t('registerPasswordLabel')}</label>
          <input type="password" id="password" name="password" />
        </div>
        <div>
          <label htmlFor="confirmPassword">{t('registerConfirmPasswordLabel')}</label>
          <input type="password" id="confirmPassword" name="confirmPassword" />
        </div>
        <button type="submit">{t('registerButton')}</button>
      </form>
    </div>
  );
};

export default RegisterPage;
