// src/components/AccountCreation.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function AccountCreation() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthday, setBirthday] = useState('');
    const [phone, setPhone] = useState('');

    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);

        try {
            const registerResponse = await axios.post('http://localhost:1337/api/auth/local/register', {
                username: email,
                email,
                password,
            });

            console.log('User registered successfully:', registerResponse.data);
            const jwt = registerResponse.data.jwt;
            const userId = registerResponse.data.user.id;

            await axios.put(`http://localhost:1337/api/users/${userId}`, {
                first_name: firstName,
                last_name: lastName,
                birthday,
                phone,
                roleChoice: 'companion',
            }, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            setMessage('Account created and profile updated successfully! You can now log in.');

            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
            setBirthday('');
            setPhone('');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data && error.response.data.error && error.response.data.error.message
                ? error.response.data.error.message
                : 'Something went wrong during registration. Check console for details.';
            setMessage(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card">
            <h2>Create Your Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name:</label>
                    <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="birthday">Birthday:</label>
                    <input type="date" id="birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone:</label>
                    <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register Account'}
                </button>
            </form>
            {message && <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}

            <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Log in here</Link>
            </p>
        </div>
    );
}

export default AccountCreation;