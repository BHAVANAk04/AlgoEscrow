import React from 'react';
import { FaEnvelope, FaPhone, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';

const GetInTouch = () => {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Get in Touch
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Have questions? We'd love to hear from you
        </p>
      </div>

      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Section: Contact Form */}
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-gradient-to-r bg-lime-400 to-[#7dffe3]   "
            >
              Send Message
            </button>
          </div>
        </form>

        {/* Right Section: Contact Info and Socials */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-gray-600">
            <FaEnvelope className="h-5 w-5" />
            <span>hello@foodsafe.com</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <FaPhone className="h-5 w-5" />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <div className="flex space-x-4">
              <a href="#" aria-label="Twitter">
                <FaTwitter className="h-5 w-5 hover:text-gray-900 transition-colors" />
              </a>
              <a href="#" aria-label="Facebook">
                <FaFacebook className="h-5 w-5 hover:text-gray-900 transition-colors" />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram className="h-5 w-5 hover:text-gray-900 transition-colors" />
              </a>
            </div>
            <span className="sr-only">Social</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;