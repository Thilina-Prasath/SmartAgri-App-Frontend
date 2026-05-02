import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Translations } from '../constants/Translations';
import { AppCustomTheme } from '../constants/AppTheme';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [language, setLanguage] = useState('Sinhala');
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const savedLang = await AsyncStorage.getItem('appLanguage');
        const savedTheme = await AsyncStorage.getItem('appTheme');
        const savedOffline = await AsyncStorage.getItem('appOfflineMode');
        if (savedLang) setLanguage(savedLang);
        if (savedTheme) setIsDarkMode(savedTheme === 'dark');
        if (savedOffline) setIsOfflineMode(savedOffline === 'true');
    };

    const toggleTheme = async () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        await AsyncStorage.setItem('appTheme', newTheme ? 'dark' : 'light');
    };

    const changeLanguage = async (lang: string) => {
        setLanguage(lang);
        await AsyncStorage.setItem('appLanguage', lang);
    };

    const toggleOfflineMode = async (value: boolean) => {
        setIsOfflineMode(value);
        await AsyncStorage.setItem('appOfflineMode', value.toString());
    };

    // Helper translation function
    const t = (key: string) => {
        const currentTranslations = Translations[language] || Translations['Sinhala'];
        return currentTranslations[key] || key;
    };

    const colors = isDarkMode ? AppCustomTheme.dark : AppCustomTheme.light;

    return (
        <AppContext.Provider value={{ isDarkMode, toggleTheme, language, changeLanguage, t, colors, isOfflineMode, toggleOfflineMode }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);