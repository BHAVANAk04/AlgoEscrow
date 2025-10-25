import React, { useState, useEffect } from 'react'
import { db } from '../firebase'; // Adjust path to your firebase config file
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navbar from '../components/Navbar'
import HomeHero from '../components/HomeHero'
import { ref, onValue } from "firebase/database";
import HomeFeatures from '../components/HomeFeatures'
import ProfileCreationSplit from '../components/ProfileCreationSplit'
import ExploreCategories from '../components/ExploreCategories'
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
    // 1. Create a reference to the 'testimonials' node in the Realtime Database
    const testimonialsRef = ref(db, 'testimonials');

    // 2. Use onValue to subscribe to real-time updates
    const unsubscribe = onValue(testimonialsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (data) {
          // Firebase Realtime DB returns an object; convert it to an array
          const loadedTestimonials = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setTestimonials(loadedTestimonials);
        } else {
          setTestimonials([]); // No testimonials found
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError("Failed to load testimonials.");
        setLoading(false);
      }
    });

    // 3. Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);


  return (
    <div>
        <Navbar/>
        <HomeHero/>
        <HomeFeatures/>
        <ProfileCreationSplit/>
        <ExploreCategories/>
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