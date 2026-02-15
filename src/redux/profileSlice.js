import { createSlice } from '@reduxjs/toolkit';

// Load initial state from LocalStorage (Privacy-First)
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('userProfile');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (e) {
    return undefined;
  }
};

const initialState = loadState() || {
  name: '',
  preferences: {
    fontType: 'sans', // 'sans' or 'dyslexic'
    stepGranularity: 'detailed',
    visualCues: true,
  },
  triggers: '',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      // Merge new data
      const newState = { ...state, ...action.payload };
      // Save to LocalStorage
      localStorage.setItem('userProfile', JSON.stringify(newState));
      return newState;
    },
    toggleFont: (state) => {
      state.preferences.fontType = state.preferences.fontType === 'sans' ? 'dyslexic' : 'sans';
      localStorage.setItem('userProfile', JSON.stringify(state));
    },
  },
});

export const { updateProfile, toggleFont } = profileSlice.actions;
export default profileSlice.reducer;