import { Image, StyleSheet, Platform, Alert, Button } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { usePermissions } from 'expo-media-library';
import { useCameraPermissions } from 'expo-camera';

export default function HomeScreen() {
  const [cameraPermissions, requestCameraPermissions] = useCameraPermissions();
  const [mediaLibraryPermissions, requestMediaLibraryPermissions] = usePermissions();

  async function requestAllPermissions() {
    const { status } = await requestCameraPermissions();
    if (status != 'granted') {
      Alert.alert('Permission required', 'Please allow camera permissions to use this feature.');
    }

    const { status: mediaLibraryStatus } = await requestMediaLibraryPermissions();
    if (mediaLibraryStatus != 'granted') {
      Alert.alert('Permission required', 'Please allow media library permissions to use this feature.');
    }
  }


  return (
    <ThemedView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>


      <Button title="Request Camera Permissions" onPress={requestPermissions} />
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
