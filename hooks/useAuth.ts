import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getUserProfile, createUserProfile } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'swimmer' | 'coach';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });

    // Check initial auth state
    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
          handleUserSignOut();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      if (currentUser) {
        await handleUserSignIn(currentUser);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSignIn = async (authUser: User) => {
    setUser(authUser);
    setIsAuthenticated(true);

    // Get or create user profile
    const { data: profile, error } = await getUserProfile(authUser.id);
    
    if (error && error.code === 'PGRST116') {
      // User profile doesn't exist, create one
      const newProfile = {
        email: authUser.email!,
        name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
        role: 'swimmer' as const, // Default role
        avatar_url: authUser.user_metadata?.avatar_url || null,
      };

      const { data: createdProfile, error: createError } = await createUserProfile(
        authUser.id,
        newProfile
      );

      if (createError) {
        console.error('Error creating user profile:', createError);
      } else {
        setUserProfile(createdProfile);
      }
    } else if (profile) {
      setUserProfile(profile);
    }
  };

  const handleUserSignOut = () => {
    setUser(null);
    setUserProfile(null);
    setIsAuthenticated(false);
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.data?.idToken) {
        // Sign in to Supabase with Google ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) {
          throw error;
        }

        return { success: true };
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, role: 'swimmer' | 'coach') => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          },
        },
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role: 'swimmer' | 'coach') => {
    if (!user || !userProfile) return { success: false, error: 'No user logged in' };

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUserProfile(data);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Google if applicable
      const isGoogleSignedIn = await GoogleSignin.isSignedIn();
      if (isGoogleSignedIn) {
        await GoogleSignin.signOut();
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    updateUserRole,
    logout,
  };
};