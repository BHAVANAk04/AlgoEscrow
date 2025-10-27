import React, { useState, useEffect } from 'react'
import { db } from '../firebase'; // Adjust path to your firebase config file
import { collection, getDocs, query, orderBy } from "firebase/firestore"; // 1. Updated Imports for Firestore
import Navbar from '../components/Navbar'
import HomeHero from '../components/HomeHero'
// import { ref, onValue } from "firebase/database"; // Removed Realtime DB imports
import HomeFeatures from '../components/HomeFeatures'
import ProfileCreationSplit from '../components/ProfileCreationSplit'

import FeaturedJobs from '../components/FeaturedJobs'
import EscrowProcessFlow from '../components/EscrowProcessFlow'
import Testimonals from '../components/Testimonals'
import { Contact } from 'lucide-react'
import Footer from '../components/Footer'
import GetInTouch from '../components/GetInTouch'

const Home = () => {
  // State to hold testimonials data fetched from Firebase
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 2. Define the asynchronous function to fetch data from Firestore
    const fetchTestimonials = async () => {
      try {
        // Create a query for the 'testimonials' collection, ordered by a field (e.g., 'createdAt')
        // NOTE: You may need to create an index in Firebase console if using orderBy
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')); // Assuming 'createdAt' field exists

        // Get a snapshot of the documents
        const querySnapshot = await getDocs(q);

        // Map the documents to an array of objects
        const loadedTestimonials = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setTestimonials(loadedTestimonials);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError("Failed to load testimonials.");
        setLoading(false);
      }
    };

    fetchTestimonials();

    // 3. Cleanup: No subscription cleanup is strictly needed for a one-time getDocs
    // but you could add an AbortController for more complex scenarios, which is omitted here for simplicity.

  }, []); // Empty dependency array means this runs once on mount


  return (
    <div>
      <Navbar/>
      <HomeHero/>
      <HomeFeatures/>
      <ProfileCreationSplit/>
      
      <FeaturedJobs/>
      <EscrowProcessFlow/>
      {/* Pass the fetched data and loading/error states to the Testimonals component */}
      <Testimonals 
        data={testimonials} 
        loading={loading}
        error={error}
      />
      <GetInTouch/>
      <Footer/>
    </div>
  )
}

export default Home