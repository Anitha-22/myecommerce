// frontend/src/pages/SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
    const [formData, setFormData] = useState({
        firstname: '', lastname: '', email: '', password: '', confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Validate email format in real-time
        if (name === 'email') {
            validateEmail(value);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('');
        } else if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous message
        console.log('Data sent to backend:', formData);
        
        // Frontend validation: Check password match
        if (formData.password !== formData.confirmPassword) {
            setMessage('Error: Passwords do not match.');
            return;
        }
        
        // Frontend validation: Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setMessage('Error: Please enter a valid email address.');
            return;
        }
       
        try {
            const response = await axios.post('http://localhost:5000/api/auth/signup', formData);
            setMessage(response.data.message);
            
            // **Success: Directly goes to the Sign In page**
            setTimeout(() => {
                navigate('/signin'); 
            }, 1500); // Redirect after a short delay
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
            setMessage(`Error: ${errorMessage}`);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Your Account</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input 
                            type="text" 
                            name="firstname" 
                            placeholder="First Name" 
                            onChange={handleChange} 
                            required 
                            style={styles.input}
                        />
                        <input 
                            type="text" 
                            name="lastname" 
                            placeholder="Last Name" 
                            onChange={handleChange} 
                            required 
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.emailContainer}>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email Address" 
                            onChange={handleChange} 
                            required 
                            style={{
                                ...styles.input,
                                borderColor: emailError ? '#e74c3c' : '#ddd'
                            }}
                        />
                        {emailError && (
                            <p style={styles.emailError}>{emailError}</p>
                        )}
                    </div>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Confirm Password" 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={!!emailError} // Disable button if email is invalid
                    >
                        Sign Up
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
                <p style={styles.loginText}>
                    Already have an account?{' '}
                    <span 
                        style={styles.loginLink}
                        onClick={() => navigate('/signin')}
                    >
                        Sign In
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
        gap: '15px'
    },
    inputGroup: {
        display: 'flex',
        gap: '15px'
    },
    emailContainer: {
        position: 'relative'
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
    emailError: {
        color: '#e74c3c',
        fontSize: '12px',
        marginTop: '5px',
        marginBottom: '0',
        textAlign: 'left'
    },
    button: {
        padding: '12px',
        backgroundColor: '#3498db',
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
    loginText: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666',
        fontSize: '14px'
    },
    loginLink: {
        color: '#3498db',
        cursor: 'pointer',
        fontWeight: '600',
        textDecoration: 'underline'
    }
};

export default SignUp;