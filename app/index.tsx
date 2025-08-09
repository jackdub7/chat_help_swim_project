import React, { useState } from 'react';
import { View } from 'react-native';
import AuthenticationScreen from '@/components/AuthenticationScreen';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function IndexScreen() {
  const { isAuthenticated, userProfile, isLoading } = useAuth();

  const handleAuthentication = (role: 'swimmer' | 'coach') => {
    // Authentication is handled by the useAuth hook
    // This callback is mainly for UI feedback
  };

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#F8FAFC' }} />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthenticationScreen onAuthenticate={handleAuthentication} />
    </View>
  );
}