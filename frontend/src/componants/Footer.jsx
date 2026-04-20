import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-2">
            <Logo className="h-10 mb-6" />
            <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
              Empowering global change through technological excellence. We connect donors, passionate volunteers, and verified NGOs seamlessly across India.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-[#004B8D] transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-[#004B8D] transition-colors"><Instagram size={20} /></a>
              <a href="https://www.linkedin.com/in/sumit-raj-29402828b" target="_blank" rel="noopener noreferrer" className="hover:text-[#0A66C2] transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4 tracking-tight">Platform</h4>
            <ul className="space-y-3">
              {user?.role === 'ngo' ? (
                <>
                  <li><Link to="/ngo-dashboard" className="text-gray-500 hover:text-[#004B8D] transition-colors text-sm font-medium">Operations Dashboard</Link></li>
                  <li><Link to="/ngo-items" className="text-gray-500 hover:text-[#004B8D] transition-colors text-sm font-medium">Community Feed</Link></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#004B8D] transition-colors text-sm font-medium">Partner Support APIs</a></li>
                </>
              ) : user?.role === 'donor' ? (
                <>
                  <li><Link to="/map" className="text-gray-500 hover:text-[#004B8D] transition-colors text-sm font-medium">NGO Locator Map</Link></li>
                  <li><Link to="/donate" className="text-gray-500 hover:text-[#004B8D] transition-colors text-sm font-medium">Open Campaigns</Link></li>
                  <li><Link to="/create-listing" className="text-gray-500 hover:text-[#004B8D] transition-colors text-sm font-medium">Donate Physical Items</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/map" className="text-gray-500 hover:text-[#004B8D] transition-colors text-sm font-medium">NGO Locator</Link></li>
                  <li><Link to="/donate" className="text-gray-500 hover:text-[#004B8D] transition-colors text-sm font-medium">Campaigns & Donors</Link></li>
                  <li><Link to="/auth" className="text-gray-500 hover:text-[#004B8D] transition-colors text-sm font-medium">Join as Organization</Link></li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4 tracking-tight">Contact Hub</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                <Mail size={16} className="text-emerald-500" /> support@servex.in
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                 1-800-SERVE-IN
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm font-medium">© {new Date().getFullYear()} ServeX Technologies Initiative. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}