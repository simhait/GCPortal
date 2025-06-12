import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { signIn } from '../lib/auth';
import { useStore, clearUserState } from '../store/useStore';
import { getTimeBasedGreeting } from '../components/TimeOfDayIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const clearState = useStore((state) => state.clearState);
  const cachedProfile = useStore((state) => state.cachedProfile);
  const setCachedProfile = useStore((state) => state.setCachedProfile);
  const darkMode = useStore((state) => state.darkMode);

  useEffect(() => {
    if (cachedProfile?.email) {
      setEmail(cachedProfile.email);
      // If it's the demo account, pre-fill the password
      if (cachedProfile.email === 'director@demo.com') {
        setPassword('demo123');
      }
    }
  }, [cachedProfile]);

  useEffect(() => {
    // Clear user state when login page is loaded
    clearState();
  }, [clearState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await signIn(email, password);
      setCachedProfile({ 
        email, 
        name: user.first_name || user.email.split('@')[0],
        avatar_url: user.avatar_url
      });
      setUser(user);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center pt-24 pb-12">
        <Logo size="large" className={`h-24 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow sm:rounded-lg overflow-visible relative mt-20`}>
          {!showEmailInput && cachedProfile ? (
            <form onSubmit={handleSubmit} className="p-6 pt-24">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-col items-center">
                {/* Avatar positioned to stick out above the card */}
                <div className="absolute left-1/2 -top-20 transform -translate-x-1/2">
                  <div className={`w-40 h-40 rounded-full ring-4 ${
                    darkMode ? 'ring-gray-800 bg-gray-700' : 'ring-white bg-gray-100'
                  } flex items-center justify-center overflow-hidden`}>
                    {cachedProfile.avatar_url ? (
                      <img 
                        src={cachedProfile.avatar_url} 
                        alt={cachedProfile.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className={`text-5xl font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                        {cachedProfile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <h2 className={`text-xl font-medium text-center mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getTimeBasedGreeting(cachedProfile.name.split(' ')[0])}
                </h2>

                <div className="w-full">
                  <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-6 w-full flex flex-col space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmailInput(true)}
                    className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Not you?
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <h2 className={`text-xl font-medium mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {getTimeBasedGreeting()}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>

                  {cachedProfile && (
                    <button
                      type="button"
                      onClick={() => setShowEmailInput(false)}
                      className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Return to previous user
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;