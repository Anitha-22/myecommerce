// frontend/src/pages/SignIn.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = ({ handleSetToken }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        // ... after successful token generation (handleSetToken(token)):
        

        try {
            const response = await axios.post('http://localhost:5000/api/auth/signin', formData);
            
            // **Success: Token should be generated and stored**
            const token = response.data.token;
            console.log('Received and Storing Token:', token);
            handleSetToken(token); // Store token in state and localStorage
            
            setMessage('Sign-in successful!');
            setTimeout(() => {
                navigate('/'); // Redirect to Home page
            }, 500);

        } catch (error) {
            // **If it not shows the emailid or password is incorrect**
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
            setMessage(`Error: ${errorMessage}`);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome Back</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email Address" 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>
                        Sign In
                    </button>
                </form>
                {message && (
                    <p style={{
                        ...styles.message,
                        color: message.startsWith('Error') ? '#e74c3c' : '#27ae60'
                    }}>
                        {message}
                    </p>
                )}
                <p style={styles.signupText}>
                    Don't have an account?{' '}
                    <span 
                        style={styles.signupLink}
                        onClick={() => navigate('/signup')}
                    >
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333',
        fontSize: '28px',
        fontWeight: '600'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    input: {
        padding: '12px 15px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease',
        outline: 'none'
    },
    button: {
        padding: '12px',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginTop: '10px'
    },
    message: {
        textAlign: 'center',
        marginTop: '15px',
        fontSize: '14px',
        fontWeight: '500'
    },
    signupText: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666',
        fontSize: '14px'
    },
    signupLink: {
        color: '#3498db',
        cursor: 'pointer',
        fontWeight: '600',
        textDecoration: 'underline'
    }
};

export default SignIn;