import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, addDays } from 'date-fns';
import TaskModal from './TaskModal';
import CalendarDay from './CalendarDay';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MedicationCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const days = [
    { date: currentDate, dayTasks: [] },
    { date: addDays(currentDate, 1), dayTasks: [] }
  ];
  
  // Group tasks by day
  useEffect(() => {
    days.forEach(day => {
      day.dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return (
          taskDate.getDate() === day.date.getDate() &&
          taskDate.getMonth() === day.date.getMonth() &&
          taskDate.getFullYear() === day.date.getFullYear()
        );
      });
    });
  }, [tasks, currentDate]);

  const handleAddTask = (newTask) => {
    setTasks([...tasks, { ...newTask, id: Date.now().toString() }]);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Schedule</Text>
      </View>
      
      <View style={styles.calendarContainer}>
        {days.map((day, index) => (
          <CalendarDay 
            key={index} 
            date={day.date}
            tasks={day.dayTasks}
          />
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Icon name="add" size={24} color="#FFF" />
      </TouchableOpacity>
      
      <TaskModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  calendarContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
});

export default MedicationCalendar;
