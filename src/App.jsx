// app.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Components and Pages
import Home from './pages/Home';
import CreateProfilePage from './pages/CreateProfilePage'; 
import ClientProfilePage from './pages/ClientProfilePage';
import JobsPage from './pages/JobsPage';
import ProjectCatalogPage from './pages/ProjectCatalogPage';
import ConsultationsPage from './pages/ConsultationsPage';
import Articles from './pages/Articles';
import EscrowInitializationPage from './pages/EscrowInitializationPage';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import AuthPage from './pages/AuthPage';
import JobDetailPage from './pages/JobDetailPage';
import NFTPurchasePage from './pages/NFTPurchasePage';

const App = () => {
  return (
    // You must wrap everything in a single parent element. 
    // The main container div is perfect for this.
    <div>
      {/* Note: Navbar is already included in HomeHero and other pages, 
        so we don't need to render it here separately to avoid duplication */}

      <main>
        <Routes>
          {/* Authentication Routes */}
          <Route path='/auth' element={<AuthPage />} />

          {/* Main Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/jobs' element={<JobsPage />} />
          <Route path='/consultations' element={<ConsultationsPage />} />
          <Route path='/catalog' element={<ProjectCatalogPage />} />
          <Route path="/articles" element={<Articles />} />

          {/* User/Client Specific Routes */}
          <Route path='/profile' element={<CreateProfilePage />} />
          <Route path='/client/dashboard' element={<ClientDashboard />} />
          <Route path='/freelancer/dashboard' element={<FreelancerDashboard />} />
          <Route path='/post-job' element={<ClientProfilePage />} />

          {/* Transaction/Process Routes */}
          <Route path='/create-escrow' element={<EscrowInitializationPage />} />
          <Route path='/project/:projectId/purchase' element={<NFTPurchasePage />} />

          {/* Optional: Add a 404/Catch-all Route */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
          <Route path='/job/:id' element={<JobDetailPage />} />
          


        </Routes>
      </main>
    </div>
  )
}

export default App