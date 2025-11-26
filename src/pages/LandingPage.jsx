import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTemperatureHigh, FaTint, FaLightbulb, FaArrowRight, FaBuilding, FaLeaf, FaShieldAlt } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/layout/ThemeToggle";


const LandingPage = () => {
  const { isDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled 
            ? isDark 
              ? "bg-slate-900/80 backdrop-blur-md shadow-sm py-4 border-b border-slate-800" 
              : "bg-white/80 backdrop-blur-md shadow-sm py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/smart-office-icon.svg" alt="SmartOffice Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              SmartOffice
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`font-medium transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-600 hover:text-indigo-600'}`}>
              Features
            </a>
            <a href="#about" className={`font-medium transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-600 hover:text-indigo-600'}`}>
              About
            </a>
            <ThemeToggle />
            <Link
              to="/login"
              className={`px-6 py-2.5 rounded-full font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className={`absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-3xl ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-100/50'}`}></div>
          <div className={`absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl ${isDark ? 'bg-violet-900/20' : 'bg-violet-100/50'}`}></div>
        </div>

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 text-center lg:text-left animate-slide-up">
              <div className={`inline-block px-4 py-1.5 mb-6 rounded-full border text-sm font-semibold tracking-wide uppercase ${isDark ? 'bg-indigo-900/30 border-indigo-800 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                Next Gen Workspace
              </div>
              <h1 className={`text-5xl lg:text-7xl font-extrabold leading-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Intelligent Control for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Modern Offices</span>
              </h1>
              <p className={`text-lg mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Seamlessly monitor and adjust temperature, humidity, and lighting across your entire workspace. Enhance comfort, efficiency, and sustainability with SmartOffice.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Get Started <FaArrowRight />
                </Link>
                <a
                  href="#features"
                  className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg border transition-all ${isDark ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'}`}
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className={`relative z-10 backdrop-blur-xl rounded-3xl p-8 border shadow-2xl ${isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/40 border-white/50'}`}>
                 {/* Abstract UI Representation */}
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={`p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-500'}`}>
                            <FaTemperatureHigh size={20} />
                        </div>
                        <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>24°C</span>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Temperature</span>
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-500'}`}>
                            <FaTint size={20} />
                        </div>
                        <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>45%</span>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Humidity</span>
                    </div>
                 </div>
                 <div className={`p-6 rounded-2xl shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-500'}`}>
                                <FaLightbulb size={20} />
                            </div>
                            <div>
                                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Lighting</h3>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Meeting Room A</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className={`w-full rounded-full h-2 mb-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <div className="bg-yellow-400 h-2 rounded-full w-[75%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Dim</span>
                        <span>Bright</span>
                    </div>
                 </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl rotate-12 opacity-20 blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 relative ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Control at Your Fingertips</h2>
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Manage every aspect of your office environment with our intuitive IoT dashboard.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`group p-8 rounded-3xl border transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50 hover:shadow-indigo-500/20' : 'bg-slate-50 border-slate-100 hover:border-indigo-100 hover:shadow-indigo-100/50'} hover:shadow-xl`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform ${isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-500'}`}>
                <FaTemperatureHigh />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Temperature Control</h3>
              <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Maintain the perfect climate for productivity. Monitor real-time temperature and adjust HVAC systems remotely.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`group p-8 rounded-3xl border transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50 hover:shadow-blue-500/20' : 'bg-slate-50 border-slate-100 hover:border-blue-100 hover:shadow-blue-100/50'} hover:shadow-xl`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-500'}`}>
                <FaTint />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Humidity Monitoring</h3>
              <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Ensure healthy air quality by tracking humidity levels. Prevent mold and ensure comfort for all employees.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`group p-8 rounded-3xl border transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700 hover:border-yellow-500/50 hover:shadow-yellow-500/20' : 'bg-slate-50 border-slate-100 hover:border-yellow-100 hover:shadow-yellow-100/50'} hover:shadow-xl`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform ${isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-500'}`}>
                <FaLightbulb />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Smart Lighting</h3>
              <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Automate lighting based on occupancy or schedule. Save energy and create the right ambiance for any task.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Benefits Section */}
      <section id="about" className={`py-24 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
               <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl rotate-3 opacity-20"></div>
                  <div className={`relative p-8 rounded-3xl shadow-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                     <div className="flex items-start gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                           <FaLeaf size={24} />
                        </div>
                        <div>
                           <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Energy Efficiency</h4>
                           <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Reduce energy consumption by up to 30% with smart automation.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                           <FaBuilding size={24} />
                        </div>
                        <div>
                           <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Centralized Management</h4>
                           <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Control multiple rooms and floors from a single dashboard.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                           <FaShieldAlt size={24} />
                        </div>
                        <div>
                           <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Secure & Reliable</h4>
                           <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Enterprise-grade security for your IoT infrastructure.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="md:w-1/2">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Why Choose SmartOffice?</h2>
              <p className={`text-lg mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Modern workplaces require modern solutions. SmartOffice isn't just a remote control; it's an intelligent platform that adapts to your business needs.
              </p>
              <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                From reducing operational costs to improving employee well-being through better environmental control, we provide the tools you need to build the office of the future.
              </p>
              <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-2 group">
                Start Optimizing Today <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to Transform Your Workspace?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of forward-thinking companies using SmartOffice to manage their environments.
          </p>
          <Link
            to="/login"
            className="inline-block px-10 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Access Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
               <img src="/smart-office-icon.svg" alt="SmartOffice Logo" className="w-8 h-8 grayscale opacity-50" />
               <span className="text-xl font-bold text-slate-400">SmartOffice</span>
            </div>
            <div className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} SmartOffice IoT Solutions. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
