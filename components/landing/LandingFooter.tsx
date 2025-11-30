import React from 'react';
import { Facebook, Heart, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LandingFooterProps {
  onLogin: () => void;
}

const LandingFooter: React.FC<LandingFooterProps> = ({ onLogin }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">ImmiPath</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Making European relocation accessible, transparent, and enjoyable for everyone.
            </p>
            <button
              onClick={onLogin}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Go to app
            </button>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button className="hover:text-primary-400 transition-colors">Relocation Plan</button>
              </li>
              <li>
                <button className="hover:text-primary-400 transition-colors">Community Events</button>
              </li>
              <li>
                <button className="hover:text-primary-400 transition-colors">Explore Places</button>
              </li>
              <li>
                <button className="hover:text-primary-400 transition-colors">Pricing</button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2024 ImmiPath Inc. All rights reserved.</p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> in Europe
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
