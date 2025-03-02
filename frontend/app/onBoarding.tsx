import { Image, StyleSheet, Platform, Alert, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { usePermissions } from 'expo-media-library';
import { useCameraPermissions } from 'expo-camera';

export default function OnBoardingScreen() {

    const router = useRouter();
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] =usePermissions();
  
    const handleContinue = async () => {
      const allPermissionsGranted = await requestAllPermissions();
      if (allPermissionsGranted) {
        // navigate to tabs
        router.replace("/(tabs)");
      } else {
        Alert.alert("To continue please provide permissions in settings");
      }
    };
  
    async function requestAllPermissions() {
      const cameraStatus = await requestCameraPermission();
      if (!cameraStatus.granted) {
        Alert.alert("Error", "Camera permission is required.");
        return false;
      }
  
      const mediaLibraryStatus = await requestMediaLibraryPermission();
      if (!mediaLibraryStatus.granted) {
        Alert.alert("Error", "Media Library permission is required.");
        return false;
      }
  
      // only set to true once user provides permissions
      // this prevents taking user to home screen without permissions
      await AsyncStorage.setItem("hasOpened", "true");
      return true;
    }
    

    return (
        <ThemedView>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Snapchat Camera!</ThemedText>
            <HelloWave />
          </ThemedView>
          <ThemedView style={styles.stepContainer}>
            <ThemedText>
              Welcome to friend! To provide the best experience, this app requires
              permissions for the following:
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Camera Permissions</ThemedText>
            <ThemedText>🎥 For taking pictures and videos</ThemedText>
          </ThemedView>
          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Microphone Permissions</ThemedText>
            <ThemedText>🎙️ For taking videos with audio</ThemedText>
          </ThemedView>
          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Media Library Permissions</ThemedText>
            <ThemedText>📸 To save/view your amazing shots </ThemedText>
          </ThemedView>
          <Button title="Continue" onPress={handleContinue} />
        </ThemedView>
      );
    }
    
    const styles = StyleSheet.create({
      titleContainer: {
        flexDirection: "row",
        alignItems: "center",
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
        position: "absolute",
      },
    });