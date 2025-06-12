import { useAuth as useAuthContext } from '../context/AuthContext';

// Re-export the useAuth hook from context for convenience
export const useAuth = useAuthContext;

export default useAuth;
