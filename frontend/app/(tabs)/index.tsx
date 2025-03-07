import { Image, StyleSheet, Platform, Alert, Button, View, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as WebBrowster from 'expo-web-browser';
import * as React from 'react';
import { API_URL } from '@env';


import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type Message = {
  id: number;
  text: string;
  isUser: boolean;
};

type DiagnosisContext = {
  description: string;
  diagnosis: string;
  search_query: string;
  relevant_links: string[];
  page_contents: Record<string, string>;
};

export default function HomeScreen() {
  const cameraRef = React.useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = React.useState<boolean>(false);
  const [inConversation, setInConversation] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [userInput, setUserInput] = React.useState<string>('');
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [messageContext, setMessageContext] = React.useState<DiagnosisContext | null>(null);

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


        // Save photoUri to AsyncStorage - No longer needed


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

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const analyzeImage = async (): Promise<DiagnosisContext | null> => {
    console.log('analyzeImage called, photoUri:', photoUri);
    if (!photoUri) {
      console.log('No photo URI available');
      return null;
    }

    setLoading(true);
    let response;
    try {
      const base64Image = await convertImageToBase64(photoUri);
      console.log('base64Image length:', base64Image.length);
      
      const requestBody = { image: base64Image };
      console.log('Request body length:', JSON.stringify(requestBody).length);
      
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Backend response:', responseData);

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      return {
        description: responseData.description || '',
        diagnosis: responseData.diagnosis || '',
        search_query: responseData.search_query || '',
        relevant_links: responseData.relevant_links || [],
        page_contents: responseData.page_contents || {}
      };

    } catch (error) {
      console.error("Error analyzing image during fetch: ", error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
      return null;
    }
  };

  const startConversation = async () => {
    let analysisResult = null;
    if (photoUri) {
      analysisResult = await analyzeImage();
      if (analysisResult) {
        const {
          description,
          diagnosis,
          search_query,
          relevant_links,
          page_contents
        } = analysisResult;

        // Store the context for future chat messages
        setMessageContext({
          description,
          diagnosis,
          search_query,
          relevant_links,
          page_contents
        });

        setInConversation(true);
        // Initial AI message
        setMessages([
          {
            id: 1,
            text: diagnosis || "I couldn't analyze the photo. Please try again.",
            isUser: false
          }
        ]);
      }
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    // Add user message
    const newMessages = [...messages, {
      id: messages.length + 1,
      text: userInput,
      isUser: true
    }];
    setMessages(newMessages);

    setUserInput('');

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          context: {
            description: messageContext?.description || '',
            diagnosis: messageContext?.diagnosis || '',
            search_query: messageContext?.search_query || '',
            relevant_links: messageContext?.relevant_links || [],
            page_contents: messageContext?.page_contents || {}
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(current => [
        ...current,
        {
          id: current.length + 1,
          text: data.response,
          isUser: false
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove user's message if we couldn't get a response
      setMessages(messages);
    } finally {
      setLoading(false);
    }
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
    <ThemedView style={{flex: 1, borderTopWidth: 80, borderLeftWidth: 12, borderRightWidth: 12, borderColor: 'black'}}>
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
              <Button title="Take Another Photo" onPress={resetCamera} disabled={loading} />
              <Button title="Continue" onPress={startConversation} disabled={loading} />
            </View>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <ThemedText style={styles.loadingText}>Analyzing image...</ThemedText>
              </View>
            )}
          </View>
        </ThemedView>
      ) : (
        <ThemedView style={{ marginTop: 40, flex: 1 }}>
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
    marginBottom: 60,
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
    bottom: 50,
    paddingVertical: 16,
    margin: 8,
    borderTopWidth: 2,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});