// app.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Components and Pages
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateProfilePage from './pages/CreateProfilePage'; 
import ClientProfilePage from './pages/ClientProfilePage';
import JobsPage from './pages/JobsPage';
import ProjectCatalogPage from './pages/ProjectCatalogPage';
import ConsultationsPage from './pages/ConsultationsPage';
import Articles from './pages/Articles';
import EscrowInitializationPage from './pages/EscrowInitializationPage';
import ClientDashboard from './pages/ClientDashboard';

const App = () => {
  return (
    // You must wrap everything in a single parent element. 
    // The main container div is perfect for this.
    <div>
      {/* The Navbar is placed here, OUTSIDE of <Routes>.
        This ensures the Navbar renders on every page defined below.
      */}
      <Navbar /> 

      <main>
        <Routes>
          {/* Main Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/Jobs' element={<JobsPage />} />
          <Route path='/consultations' element={<ConsultationsPage />} />
          <Route path='/catalog' element={<ProjectCatalogPage />} />
          <Route path="/articles" element={<Articles />} />

          {/* User/Client Specific Routes */}
          <Route path='/profile' element={<CreateProfilePage />} />
          <Route path='/dashboard' element={<ClientDashboard />} />
          <Route path='/post-job' element={<ClientProfilePage />} /> {/* Assuming this is the 'post job' form */}

          {/* Transaction/Process Routes */}
          <Route path='/create-escrow' element={<EscrowInitializationPage />} />

          {/* Optional: Add a 404/Catch-all Route */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </main>
    </div>
  )
}

export default App