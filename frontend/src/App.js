// frontend/src/App.js

import React, { useState} from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate ,Navigate} from 'react-router-dom';

// Import Pages/Components
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import CategoryProducts from './pages/CategoryProducts';
import Products from './pages/Products'; 
import ProductDetail from './pages/ProductDetail'; 
// frontend/src/App.js (Add import at the top)
import SearchResults from './pages/SearchResults';



import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // <-- NEW IMPORT

// Component to handle navigation logic after Sign In/Out
const AppContent = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  // Removed isLoggedIn check here; handle it inside ProtectedRoute

  const navigate = useNavigate();

  const handleSetToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <>
      {/* The Navbar is now only rendered IF the token exists. 
        We use conditional rendering here.
      */}
      {!!token && <Navbar handleLogout={handleLogout} />} 
      
      

      <div style={{ padding: '20px' }}>
        <Routes>
          {/* If the user is NOT logged in and hits the root path, redirect them to Sign Up */}
          <Route path="/" element={!!token ? <Navigate to="/home" replace /> : <SignUp />} />
          
          {/* 1. PUBLIC ROUTES (Accessible to everyone) */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn handleSetToken={handleSetToken} />} />
          
          {/* 2. PROTECTED ROUTES (Requires token) */}
          {/* This parent route checks the token and renders the nested routes if true */}
          <Route element={<ProtectedRoute token={token} />}>
            
            <Route path="/home" element={<Home/>}/>
            <Route path="/search" element={<SearchResults />} />
            <Route path="/products" element={<Products token={token} />} />
            <Route path="/category/:categoryId" element={<CategoryProducts />} />
            <Route path="/product/:productId" element={<ProductDetail />}/>
            <Route path="*" element={!!token ? <div>404 Not Found</div> : <Navigate to="/signup" replace />} />
                       
          </Route><Route path="*" element={!!token ? <div>404 Not Found</div> : <Navigate to="/signup" replace />} />

          
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;