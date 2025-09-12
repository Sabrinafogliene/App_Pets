import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const ProtectedRoute = ({ children, userType }) => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        });
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userType && profile?.user_type !== userType) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;