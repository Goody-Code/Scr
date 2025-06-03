import React from 'react';
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t('loginTitle')}</h2>
      <p>{t('loginMessage')}</p>
      <form>
        <div>
          <label htmlFor="email">{t('loginEmailLabel')}</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">{t('loginPasswordLabel')}</label>
          <input type="password" id="password" name="password" />
        </div>
        <button type="submit">{t('loginButton')}</button>
      </form>
    </div>
  );
};

export default LoginPage;
