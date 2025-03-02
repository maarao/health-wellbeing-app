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
  const [photoTaken, setPhotoTaken] = React.useState<boolean>(false);

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

        // Update the state with the photo URI and mark the photo as taken
        setPhotoUri(fileUri);
        setPhotoTaken(true);
      } else {
        console.log('Failed to take photo');
      }
    }
  };

  const resetCamera = () => {
    setPhotoTaken(false);
    setPhotoUri(null);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {!photoTaken ? (
        <>
          <CameraView ref={cameraRef} style={{ flex: 1 }} />
          <ThemedView style={styles.buttonContainer}>
            <Button title="Take Photo" onPress={takePhoto} />
          </ThemedView>
        </>
      ) : (
        <ThemedView style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
          <ThemedText style={styles.headerText}>Photo Captured!</ThemedText>
          
          <View style={styles.resultContainer}>
            <ThemedText style={styles.descriptionText}>
              Here's the photo you took. You can continue or take another one.
            </ThemedText>
            
            {photoUri && (
              <Image source={{ uri: photoUri }} style={styles.resultImage} />
            )}
            
            <View style={styles.buttonRow}>
              <Button title="Take Another Photo" onPress={resetCamera} />
              <Button title="Continue" onPress={() => {
                // Add your logic to continue with this photo
                console.log('Continuing with photo:', photoUri);
              }} />
            </View>
          </View>
        </ThemedView>
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
    bottom: 200,
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    gap: 20,
  },
  resultImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 20,
  },
});