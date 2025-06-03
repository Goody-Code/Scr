import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language, i18n.dir]); // Added i18n.dir to dependency array

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Router>
      <div>
        <header>
          <nav>
            <ul>
              <li><Link to="/">{t('appName')}</Link></li> {/* Using appName as home link text */}
              <li><Link to="/login">{t('navLogin')}</Link></li>
              <li><Link to="/register">{t('navRegister')}</Link></li>
            </ul>
          </nav>
          <div className="lang-switcher">
            <button onClick={() => changeLanguage('en')}>{t('english')}</button>
            <button onClick={() => changeLanguage('ar')}>{t('arabic')}</button>
          </div>
        </header>
        <hr />
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        <footer>
          <p>{t('footerText')}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
