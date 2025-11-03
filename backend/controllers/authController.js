// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// update the secret key
// A "pepper" can be a secret string known only to the server.
const PEPPER = process.env.PEPPER || '0405493735f7254cdf4d896042fb2498be832dc93952354cd2192b7983773ca3';
const JWT_SECRET = process.env.JWT_SECRET || '1a5f94cc188e5041a92f0c950b2e88407deca660646d334b452c12d65351008a55cb404016b5ca2063001389cdba12164373e9a6d3da9d3fd98081dc6bfbd717';
console.log(PEPPER);
const signup = async (req, res) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    // Basic Validation: Password Match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Password and Confirm Password do not match.' });
    }

    try {
        // 1. Combine password and pepper for extra security before hashing (simple pepper implementation)
        const passwordWithPepper = password + PEPPER;
        // 2. Hash the password (bcrypt handles salting internally)
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(passwordWithPepper, saltRounds);

        // 3. Store user in database
        const query = 'INSERT INTO users (firstname, lastname, email, password_hash) VALUES (?, ?, ?, ?)';
        db.query(query, [firstname, lastname, email, password_hash], (err, result) => {
            if (err) {
                // Handle duplicate email error (MySQL error code 1062)
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'Email already exists.' });
                }
                console.error(err);
                return res.status(500).json({ message: 'Server error during signup.' });
            }
            // Success: Frontend will redirect to Sign In page
            res.status(201).json({ message: 'User registered successfully. Please sign in.' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// ... (signin logic follows)

// backend/controllers/authController.js (continued)

const signin = async (req, res) => {
    const { email, password } = req.body;

    // 1. Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error during signin.' });
        }

        const user = results[0];
        // Check 1: User exists
        if (!user) {
            // Use a generic message for security
            return res.status(401).json({ message: 'Incorrect Email or Password.' });
        }

        // 2. Compare the provided password (with pepper) with the stored hash
        const passwordWithPepper = password + PEPPER;
        const isMatch = await bcrypt.compare(passwordWithPepper, user.password_hash);

        // Check 2: Password matches
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect Email or Password.' });
        }

        // 3. Generate JWT Token (The token helps the user not sign in again and again)
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload: info to store in the token
            JWT_SECRET,
            { expiresIn: '1d' } // Token expires in 1 day
        );
        console.log('Generated Token:', token); 

        // Success: Send token to frontend
        res.json({
            message: 'Sign-in successful.',
            token, // Store this token on the frontend
            user: { id: user.id, firstname: user.firstname, email: user.email }
        });
    });
};






module.exports = { signup, signin };