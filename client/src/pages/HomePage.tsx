import React from 'react';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('homeTitle')}</h1>
      <p>{t('homeMessage')}</p>
    </div>
  );
};

export default HomePage;
