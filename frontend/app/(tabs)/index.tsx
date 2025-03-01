import { Image, StyleSheet, Platform, Alert, Button } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as WebBrowster from 'expo-web-browser';
import * as React from 'react';

export default function HomeScreen() {
  const cameraRef = React.useRef<CameraView>(null);


  return (
    <ThemedView style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex:1}} />
    </ThemedView>
      
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
