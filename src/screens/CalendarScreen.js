import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import MedicationCalendar from '../components/Calendar/MedicationCalendar';

const CalendarScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MedicationCalendar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default CalendarScreen;
