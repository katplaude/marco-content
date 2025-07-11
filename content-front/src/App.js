import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';

import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import AccountCreation from './components/AccountCreation';
import Login from './components/Login';
import Profile from './components/Profile';

export const UserContext = createContext(null);

function App() {
    const [locale, setLocale] = useState('en');
    const [user, setUser] = useState(null);
    const [jwt, setJwt] = useState(null);

    useEffect(() => {
        const storedJwt = localStorage.getItem('jwt');
        const storedUser = localStorage.getItem('user');
        if (storedJwt && storedUser) {
            setJwt(storedJwt);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <Router>
            <UserContext.Provider value={{ user, setUser, jwt, setJwt }}>
                <main className="app-main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/register" replace />} />
                        <Route path="/register" element={<AccountCreation />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/events" element={<EventList locale={locale} />} />
                        <Route path="/events/:id" element={<EventDetails locale={locale} />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/" element={user ? <Navigate to="/events" replace /> : <Navigate to="/register" replace />} />
                    </Routes>
                </main>
            </UserContext.Provider>
        </Router>
    );
}

export default App;