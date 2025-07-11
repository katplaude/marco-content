import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { setUser, setJwt } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:1337/api/auth/local', {
                identifier: email,
                password,
            });

            console.log('User logged in successfully:', response.data);
            setMessage('Logged in successfully!');

            setUser(response.data.user);
            setJwt(response.data.jwt);
            localStorage.setItem('jwt', response.data.jwt);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirect to events page after successful login
            setTimeout(() => {
                navigate('/events');
            }, 1000); // Redirect after 1 second

        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data && error.response.data.error && error.response.data.error.message
                ? error.response.data.error.message
                : 'Something went wrong during login. Please check your credentials.';
            setMessage(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card"> {/* Apply card style */}
            <h2>Login to Your Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging In...' : 'Login'}
                </button>
            </form>
            {message && <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}

            <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-light)' }}> {/* FIXED LINE */}
                Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Create one here</Link>
            </p>
        </div>
    );
}

export default Login;