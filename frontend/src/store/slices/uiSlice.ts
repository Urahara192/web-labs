import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  error: string | null;
  modal: {
    isOpen: boolean;
    title: string;
    content: React.ReactNode | null;
  };
}

const initialState: UIState = {
  isLoading: false,
  error: null,
  modal: {
    isOpen: false,
    title: '',
    content: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    openModal: (state, action: PayloadAction<{ title: string; content: React.ReactNode }>) => {
      state.modal.isOpen = true;
      state.modal.title = action.payload.title;
      state.modal.content = action.payload.content;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.title = '';
      state.modal.content = null;
    },
  },
});

export const { setLoading, setError, openModal, closeModal } = uiSlice.actions;

export default uiSlice.reducer; 