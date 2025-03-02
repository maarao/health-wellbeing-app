import { Image, StyleSheet, Platform, Alert, Button, View } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as WebBrowster from 'expo-web-browser';
import * as React from 'react';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const cameraRef = React.useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        console.log('Photo taken:', photo);

        // Save the photo to local storage
        const fileUri = `${FileSystem.documentDirectory}photo.jpg`;
        await FileSystem.moveAsync({
          from: photo.uri,
          to: fileUri,
        });
        console.log('Photo saved to:', fileUri);

        // Update the state with the photo URI
        setPhotoUri(fileUri);
      } else {
        console.log('Failed to take photo');
      }
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} />
      <ThemedView style={styles.buttonContainer}>
        <Button title="Take Photo" onPress={takePhoto} />
      </ThemedView>
      {photoUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: photoUri }} style={styles.image} />
        </View>
      )}
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
  buttonContainer: {
    position: 'absolute',
    bottom: 300,
    left: 200,
  },
  imageContainer: {
    position: 'absolute',
    bottom: 300,
    left: 200,
  },
  image: {
    width: 200,
    height: 200,
  },
});