import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the section types
type SectionType = 'identification' | 'medicalHistory' | 'allergies' | 'notifications' | 'medications';

export default function ProfileScreen() {
  // Mock user data
  const initialUser = {
    name: 'Jake the Dog',
    email: 'bacon@pancakes.com',
    avatar: '../../../assets/images/jake_the_dog.png',
    dateOfBirth: '01/15/1985',
    gender: 'Male',
    bloodType: 'O+',
    height: '5\'10"',
    weight: '165 lbs',
    medicalHistory: [
      { id: '1', condition: 'Asthma', diagnosedDate: '2010' },
      { id: '2', condition: 'Hypertension', diagnosedDate: '2018' },
    ],
    allergies: [
      { id: '1', allergen: 'Peanuts', severity: 'Severe' },
      { id: '2', allergen: 'Dust', severity: 'Moderate' },
      { id: '3', allergen: 'Penicillin', severity: 'Moderate' },
    ],
    medications: [
      { id: '1', name: 'Albuterol', dosage: '90mcg', frequency: 'As needed' },
      { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    ]
  };

  const [activeSection, setActiveSection] = useState<SectionType>('identification');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [editedUser, setEditedUser] = useState(initialUser);

  useEffect(() => {
    loadProfileData();
  }, []);

  const saveProfileData = async () => {
    try {
      const profileData = {
        allergies: user.allergies,
        medications: user.medications,
      };
      await AsyncStorage.setItem('profileData', JSON.stringify(profileData));
      console.log('Profile data saved');
    } catch (error) {
      console.error('Failed to save profile data', error);
    }
  };

  const loadProfileData = async () => {
    console.log('loadProfileData function called');
    try {
      const profileDataString = await AsyncStorage.getItem('profileData');
      if (profileDataString) {
        const profileData = JSON.parse(profileDataString);
        setUser((prevUser) => ({
          ...prevUser,
          allergies: profileData.allergies,
          medications: profileData.medications,
        }));
        console.log('Profile data loaded');
        console.log(profileData);
      } else {
        console.log('No profile data found in local storage');
      }
    } catch (error) {
      console.error('Failed to load profile data', error);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setUser(editedUser);
    setIsEditing(false);
    saveProfileData();
  };

  const handleCancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleChange = (key: string, value: string) => {
    setEditedUser({ ...editedUser, [key]: value });
  };

  const renderEditProfileView = () => (
    <View style={styles.editProfileContainer}>
      <ScrollView>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <TextInput
            style={styles.infoValue}
            value={editedUser.name}
            onChangeText={(text) => handleChange('name', text)}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <TextInput
            style={styles.infoValue}
            value={editedUser.email}
            onChangeText={(text) => handleChange('email', text)}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date of Birth</Text>
          <TextInput
            style={styles.infoValue}
            value={editedUser.dateOfBirth}
            onChangeText={(text) => handleChange('dateOfBirth', text)}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gender</Text>
          <TextInput
            style={styles.infoValue}
            value={editedUser.gender}
            onChangeText={(text) => handleChange('gender', text)}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Blood Type</Text>
          <TextInput
            style={styles.infoValue}
            value={editedUser.bloodType}
            onChangeText={(text) => handleChange('bloodType', text)}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Height</Text>
          <TextInput
            style={styles.infoValue}
            value={editedUser.height}
            onChangeText={(text) => handleChange('height', text)}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Weight</Text>
          <TextInput
            style={styles.infoValue}
            value={editedUser.weight}
            onChangeText={(text) => handleChange('weight', text)}
          />
        </View>
        <View style={styles.editProfileButtons}>
          <TouchableOpacity style={styles.saveProfileButton} onPress={handleSaveProfile}>
            <Text style={styles.saveProfileText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelProfileButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelProfileText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // Render content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'identification':
        return (
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{initialUser.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{initialUser.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{initialUser.dateOfBirth}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{initialUser.gender}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Blood Type</Text>
              <Text style={styles.infoValue}>{initialUser.bloodType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{initialUser.height}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{initialUser.weight}</Text>
            </View>
            <View>
                <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'medicalHistory':
        return (
          <View style={styles.sectionContent}>
            {user.medicalHistory.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <View>
                  <Text style={styles.listItemTitle}>{item.condition}</Text>
                  <Text style={styles.listItemSubtitle}>Diagnosed in {item.diagnosedDate}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </View>
            ))}
            <TouchableOpacity onPress={saveProfileData} style={styles.addButton}>
              <Icon name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Medical Condition</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'allergies':
        return (
          <View style={styles.sectionContent}>
            {user.allergies.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <View>
                  <Text style={styles.listItemTitle}>{item.allergen}</Text>
                  <Text style={styles.listItemSubtitle}>Severity: {item.severity}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </View>
            ))}
            <TouchableOpacity onPress={loadProfileData} style={styles.addButton}>
              <Icon name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Allergy</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'notifications':
        return (
          <View style={styles.sectionContent}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Medication Reminders</Text>
              <Icon name="toggle-on" size={36} color="#4CAF50" />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Appointment Reminders</Text>
              <Icon name="toggle-on" size={36} color="#4CAF50" />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Health Tips</Text>
              <Icon name="toggle-off" size={36} color="#ccc" />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Weekly Reports</Text>
              <Icon name="toggle-on" size={36} color="#4CAF50" />
            </View>
          </View>
        );
      
      case 'medications':
        return (
          <View style={styles.sectionContent}>
            {user.medications.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <View>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {item.dosage} • {item.frequency}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </View>
            ))}
            <TouchableOpacity style={styles.addButton}>
              <Icon name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isEditing ? (
        renderEditProfileView()
      ) : (
        <>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../assets/images/jake_the_dog.png')} 
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Icon name="edit" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{user.name}</Text>
          </View>

          <ScrollView style={styles.contentContainer}>
            {/* Navigation Tabs */}
            <View style={styles.tabsContainer}>
              {[
                { id: 'identification', label: 'Identification', icon: 'person' },
                { id: 'medicalHistory', label: 'Medical History', icon: 'history' },
                { id: 'allergies', label: 'Allergies', icon: 'warning' },
                { id: 'notifications', label: 'Notifications', icon: 'notifications' },
                { id: 'medications', label: 'Medications', icon: 'medication' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabButton,
                    activeSection === tab.id && styles.activeTabButton
                  ]}
                  onPress={() => setActiveSection(tab.id as SectionType)}
                >
                  <Icon 
                    name={tab.icon} 
                    size={24} 
                    color={activeSection === tab.id ? '#4CAF50' : '#666'} 
                  />
                  <Text 
                    style={[
                      styles.tabLabel,
                      activeSection === tab.id && styles.activeTabLabel
                    ]}
                  >
                    {tab.label}
                  </Text>
                  <Icon 
                    name="chevron-right" 
                    size={24} 
                    color="#ccc" 
                    style={styles.tabArrow}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Section Content */}
            {renderSectionContent()}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  editProfileButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: 'lightgrey',
    borderRadius: 20,
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    left: '30%',
    height: 30,

  },
  editProfileText: {
    color: '#666',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: 'white',
    marginTop: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: '#f9fff9',
  },
  tabLabel: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  activeTabLabel: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  tabArrow: {
    marginLeft: 'auto',
  },
  sectionContent: {
    backgroundColor: 'white',
    marginTop: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    padding: 15,
    marginBottom: 20,
    alignContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  editProfileContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  editProfileButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  saveProfileText: {
    color: '#fff',
    fontWeight: '500',
  },
  cancelProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  cancelProfileText: {
    color: '#666',
    fontWeight: '500',
  },
});