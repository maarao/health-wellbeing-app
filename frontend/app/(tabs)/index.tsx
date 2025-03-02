import { Image, StyleSheet, Platform, Alert, Button, View, TextInput, ScrollView } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as WebBrowster from 'expo-web-browser';
import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type Message = {
  id: number;
  text: string;
  isUser: boolean;
};

export default function HomeScreen() {
  const cameraRef = React.useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = React.useState<boolean>(false);
  const [inConversation, setInConversation] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [userInput, setUserInput] = React.useState<string>('');
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const storedPhotoUri = await AsyncStorage.getItem('photoUri');
        const storedMessages = await AsyncStorage.getItem('messages');
        if (storedPhotoUri) {
          setPhotoUri(storedPhotoUri);
          setPhotoTaken(true);
        }
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      } catch (error) {
        console.error('Error loading async storage data', error);
      }
    };
    loadData();
  }, []);

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

        // Save photoUri to AsyncStorage
        await AsyncStorage.setItem('photoUri', fileUri);

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
    setInConversation(false);
    setMessages([]);
  };

  const analyzeImage = async () => {
    console.log('analyzeImage called, photoUri:', photoUri);
    if (!photoUri) {
      console.log('No photo URI available');
      return;
    }
    
    try {
      console.log('Fetching photo from URI:', photoUri);
      const responseBlob = await fetch(photoUri);
      console.log('Response status:', responseBlob.status, 'type:', responseBlob.type);
      
      console.log('Converting response to blob');
      const blob = await responseBlob.blob();
      console.log('Blob size:', blob.size, 'type:', blob.type);
    } catch (error) {
      console.error("Error analyzing image: ", error);
    }
  };

  const startConversation = async () => {
    if (photoUri) {
      await analyzeImage();
    }
    setInConversation(true);
    // Initial AI message
    setMessages([
      {
        id: 1,
        text: "I can see your photo! It looks like you're interested in health and wellbeing. What would you like to know about the image you've taken?",
        isUser: false
      }
    ]);
  };

  const sendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { 
      id: messages.length + 1, 
      text: userInput, 
      isUser: true 
    }];
    
    setMessages(newMessages);
    AsyncStorage.setItem('messages', JSON.stringify(newMessages));
    setUserInput('');
    
    // Simulate AI response (in a real app, you would call an API here)
    setTimeout(() => {
      setMessages(current => [
        ...current, 
        { 
          id: current.length + 1, 
          text: getAIResponse(userInput), 
          isUser: false 
        }
      ]);
    }, 1000);
  };
  
  // Simple function to simulate AI responses
  const getAIResponse = (input: string) => {
    const responses = [
      "That's a great question about your health! Based on what I can see, I'd recommend focusing on balanced nutrition and regular exercise.",
      "From the image you shared, it seems like you're on the right track. Would you like some specific wellness tips?",
      "Interesting point! Health is about both physical and mental wellbeing. Have you been practicing any mindfulness lately?",
      "I notice some patterns in your photo that suggest you might benefit from more hydration throughout the day.",
      "Your photo shows good progress! Remember that consistency is key to achieving your health goals."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Scroll to bottom whenever messages change
  React.useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <ThemedView style={{ flex: 1 }}>
      {!photoTaken ? (
        <>
          <CameraView ref={cameraRef} style={{ flex: 1 }} />
          <ThemedView style={styles.buttonContainer}>
            <Button title='' onPress={takePhoto} />
          </ThemedView>
        </>
      ) : !inConversation ? (
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
              <Button title="Continue" onPress={startConversation} />
            </View>
          </View>
        </ThemedView>
      ) : (
        <ThemedView style={{ flex: 1 }}>
          <ThemedView style={styles.chatHeader}>
            <Button title="Back" onPress={() => setInConversation(false)} />
            <ThemedText style={styles.chatHeaderTitle}>AI Health Assistant</ThemedText>
            <View style={{ width: 50 }} />
          </ThemedView>
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContentContainer}
          >
            {photoUri && (
              <Image source={{ uri: photoUri }} style={styles.chatImage} />
            )}
            
            {messages.map(message => (
              <View 
                key={message.id} 
                style={[
                  styles.messageBubble, 
                  message.isUser ? styles.userBubble : styles.aiBubble
                ]}
              >
                <ThemedText style={message.isUser ? styles.userText : styles.aiText}>
                  {message.text}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
          
          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Type your message..."
              placeholderTextColor="#666"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <Button title="Send" onPress={sendMessage} />
          </ThemedView>
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
    bottom: 60,
    padding: 8,
    margin: 8,
    width: 75,
    height: 75,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 8,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 2000,
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
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  messageBubble: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0b93f6',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    bottom: 60,
    paddingVertical: 16,
    margin: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
});