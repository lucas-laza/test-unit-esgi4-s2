import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import './App.css';
import ArticlePage from './ArticlePage';
import OrderPage from './OrderPage';
import OrdersPage from './OrdersPage'; // Import the OrdersPage component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Add navigation buttons */}
        <nav>
          <Link to="/" className="nav-button">Articles</Link>
          <Link to="/orders" className="nav-button">Orders</Link>
        </nav>

        {/* Add routes */}
        <Routes>
          <Route path="/" element={<ArticlePage />} />
          <Route path="/orders" element={<OrdersPage />} /> {/* Add the route for OrdersPage */}
          <Route path="/orders/:id" element={<OrderPage />} />
        </Routes>
      </header>
    </div>
  );
}

export default App;
