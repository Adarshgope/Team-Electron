import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, toggleFont } from '../redux/profileSlice';
import { Type, ShieldAlert, Save, X } from 'lucide-react';

const ProfileSettings = ({ onClose }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  
  // Local state for editing before saving
  const [formData, setFormData] = useState(profile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle nested objects safely
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    dispatch(updateProfile(formData));
    alert("Profile Saved Locally!");
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in-up relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
        <X size={24} />
      </button>

      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        Neuro-Profile
      </h2>

      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-1">Your Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="For personalization..."
            className="w-full p-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
          />
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <ShieldAlert size={12} /> Stored on your device only.
          </p>
        </div>

        {/* Triggers Input */}
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-1">Avoid Triggers</label>
          <input
            type="text"
            name="triggers"
            value={formData.triggers}
            onChange={handleChange}
            placeholder="e.g. Loud noises, Dense text"
            className="w-full p-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
          />
        </div>

        {/* Font Toggle */}
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-3">
            <Type className="text-yellow-600" />
            <span className="text-slate-700 font-medium">Dyslexia-Friendly Font</span>
          </div>
          <button 
            onClick={() => dispatch(toggleFont())}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              profile.preferences.fontType === 'dyslexic' 
                ? 'bg-yellow-400 text-yellow-900 shadow-md' 
                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
            }`}
          >
            {profile.preferences.fontType === 'dyslexic' ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <Save size={18} /> Save Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;