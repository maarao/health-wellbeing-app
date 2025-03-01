import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  TextInput,
  Button,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

interface Task {
  description: string;
  date: Date;
  time: string;
  frequency: string;
}

export default function CalendarScreen() {
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDate, setTaskDate] = useState(new Date());
  const [taskTime, setTaskTime] = useState('');
  const [taskFrequency, setTaskFrequency] = useState('');

  const toggleAddTaskModal = () => {
    setIsAddTaskModalVisible(!isAddTaskModalVisible);
  };

  const handleAddTask = () => {
    // Implement logic to add task to the tasks array
    const newTask: Task = {
      description: taskDescription,
      date: taskDate,
      time: taskTime,
      frequency: taskFrequency,
    };
    setTasks([...tasks, newTask]);
    toggleAddTaskModal();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* <Calendar
          style={styles.calendar}
          current={'2025-03-01'}
          minDate={'2023-01-01'}
          maxDate={'2027-12-31'}
          onDayPress={(day: any) => {
            console.log('selected day', day);
          }}
          monthFormat={'yyyy MM'}
          hideExtraDays={true}
          onPressArrowLeft={(subtractMonth: () => void) => subtractMonth()}
          onPressArrowRight={(addMonth: () => void) => addMonth()}
        /> */}

        <View style={styles.scheduleContainer}>
          <Text>Today's Schedule:</Text>
          {tasks
            .filter((task) => {
              const today = new Date();
              const taskDateOnly = new Date(task.date.getFullYear(), task.date.getMonth(), task.date.getDate());
              return (
                taskDateOnly.getFullYear() === today.getFullYear() &&
                taskDateOnly.getMonth() === today.getMonth() &&
                taskDateOnly.getDate() === today.getDate()
              );
            })
            .map((task, index) => (
              <View key={index} style={styles.taskItem}>
                <Text>{task.description}</Text>
                <Text>{task.time}</Text>
              </View>
            ))}

          <Text>Tomorrow's Schedule:</Text>
          {tasks
            .filter((task) => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const taskDateOnly = new Date(task.date.getFullYear(), task.date.getMonth(), task.date.getDate());
              return (
                taskDateOnly.getFullYear() === tomorrow.getFullYear() &&
                taskDateOnly.getMonth() === tomorrow.getMonth() &&
                taskDateOnly.getDate() === tomorrow.getDate()
              );
            })
            .map((task, index) => (
              <View key={index} style={styles.taskItem}>
                <Text>{task.description}</Text>
                <Text>{task.time}</Text>
              </View>
            ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={toggleAddTaskModal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddTaskModalVisible}
        onRequestClose={() => {
          setIsAddTaskModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Add Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Description"
              value={taskDescription}
              onChangeText={setTaskDescription}
            />
            {/* Date, Time, Frequency pickers will be added here */}
            <Calendar
              style={styles.calendar}
              current={taskDate.toISOString().split('T')[0]}
              onDayPress={(day: any) => {
                setTaskDate(new Date(day.dateString));
              }}
              monthFormat={'yyyy MM'}
              hideExtraDays={true}
            />
            <TextInput
              style={styles.input}
              placeholder="Time"
              value={taskTime}
              onChangeText={setTaskTime}
            />
            <TextInput
              style={styles.input}
              placeholder="Frequency"
              value={taskFrequency}
              onChangeText={setTaskFrequency}
            />
            <Button title="Save" onPress={handleAddTask} />
            <Button title="Cancel" onPress={toggleAddTaskModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calendar: {
    borderWidth: 1,
    borderColor: 'gray',
    height: 350,
  },
  scheduleContainer: {
    padding: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'blue',
    width: 60,
    height: 60,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  taskItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
