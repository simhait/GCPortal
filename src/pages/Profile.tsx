import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { User, Mail, Building, Shield, Camera, Loader2, Check } from 'lucide-react';
import { updateUserProfile, uploadAvatar } from '../lib/api';

const Profile = () => {
  const { user, setUser } = useStore();
  const darkMode = useStore((state) => state.darkMode);
  const setCachedProfile = useStore((state) => state.setCachedProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    title: user?.title || '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await updateUserProfile(user!.id, {
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`.trim(),
      });
      setUser(updatedUser);
      // Update cached profile
      setCachedProfile({
        email: updatedUser.email,
        name: updatedUser.first_name || updatedUser.email.split('@')[0],
        avatar_url: updatedUser.avatar_url
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const updatedUser = await uploadAvatar(user!.id, file);
      setUser(updatedUser);
      // Update cached profile with new avatar
      setCachedProfile({
        email: updatedUser.email,
        name: updatedUser.first_name || updatedUser.email.split('@')[0],
        avatar_url: updatedUser.avatar_url
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 ${
            isEditing 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } rounded-lg transition-colors`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg relative`}>
        {/* Avatar positioned to stick out above the card */}
        <div className="absolute left-6 -top-12">
          <div 
            className={`h-24 w-24 rounded-full ring-4 ${
              darkMode ? 'ring-gray-800 bg-gray-700' : 'ring-white bg-gray-100'
            } flex items-center justify-center overflow-hidden cursor-pointer`}
            onClick={handleAvatarClick}
            style={{ cursor: isEditing ? 'pointer' : 'default' }}
          >
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name || user.email} 
                className="h-full w-full object-cover"
              />
            ) : (
              <span className={`text-3xl font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                {user?.first_name?.[0] || user?.email?.[0].toUpperCase()}
              </span>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={!isEditing}
          />
        </div>

        <div className="px-4 py-5 sm:p-6 pt-16">
          {/* User info section Goes here*/}
          <div className="mt-2">
            <h2 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email?.split('@')[0]}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {user?.role === 'director' ? 'District Director' : 'School Manager'}
            </p>
          </div>

          <div className={`mt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                    <User className="w-4 h-4 mr-2" />
                    First Name
                  </dt>
                  <dd className="mt-1">
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border-gray-300 text-gray-900'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                      />
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {user?.first_name || 'Not set'}
                      </p>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                    <User className="w-4 h-4 mr-2" />
                    Last Name
                  </dt>
                  <dd className="mt-1">
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border-gray-300 text-gray-900'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                      />
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {user?.last_name || 'Not set'}
                      </p>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </dt>
                  <dd className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {user?.email}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                    <Building className="w-4 h-4 mr-2" />
                    Title
                  </dt>
                  <dd className="mt-1">
                    {isEditing ? (
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border-gray-300 text-gray-900'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                      />
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {user?.title || 'Not set'}
                      </p>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                    <Shield className="w-4 h-4 mr-2" />
                    Role
                  </dt>
                  <dd className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {user?.role === 'director' ? 'District Director' : 'School Manager'}
                  </dd>
                </div>
              </dl>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;