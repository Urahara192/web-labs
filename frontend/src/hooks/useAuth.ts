import { useAppSelector, useAppDispatch } from '../store/hooks';
import { login, logout, register } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      const result = await dispatch(register({ email, password, name })).unwrap();
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}; 