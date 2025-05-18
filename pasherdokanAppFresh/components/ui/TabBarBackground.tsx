import React from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';

export function TabBarBackground() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={styles.container}>
      <BlurView 
        intensity={80} 
        tint={colorScheme === 'dark' ? 'dark' : 'light'} 
        style={StyleSheet.absoluteFill} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fallback for when BlurView isn't supported
  },
});