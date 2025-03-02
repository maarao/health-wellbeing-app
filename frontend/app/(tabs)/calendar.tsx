import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { format, addDays } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TaskModal, { TaskPayload } from '../../components/Calendar/TaskModal';
// Updated import path to use the new TypeScript component
import TaskItem from '../../components/Calendar/TaskItem';

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  frequency: string;
  type: string;
}

const HOUR_HEIGHT = 60;
const START_HOUR = 7; // 7 AM
const END_HOUR = 22; // 10 PM

export default function CalendarScreen() {
  const [currentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const days = [
    {
      date: currentDate,
      dayTasks: tasks.filter(task => {
        const taskDate = new Date(task.date);
        return (
          taskDate.getDate() === currentDate.getDate() &&
          taskDate.getMonth() === currentDate.getMonth() &&
          taskDate.getFullYear() === currentDate.getFullYear()
        );
      })
    },
    {
      date: addDays(currentDate, 1),
      dayTasks: tasks.filter(task => {
        const taskDate = new Date(task.date);
        const nextDate = addDays(currentDate, 1);
        return (
          taskDate.getDate() === nextDate.getDate() &&
          taskDate.getMonth() === nextDate.getMonth() &&
          taskDate.getFullYear() === nextDate.getFullYear()
        );
      })
    }
  ];

  const handleAddTask = (newTask: TaskPayload) => {
    const taskWithId: Task = {
      id: Date.now().toString(),
      ...newTask,
    };
    setTasks(prevTasks => [...prevTasks, taskWithId]);
    setIsModalVisible(false);
  };

  const CalendarDay = ({
    date,
    tasks,
  }: {
    date: Date;
    tasks: Task[];
  }) => {
    const renderTimeSlots = () => {
      const slots = [];
      for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
        slots.push(
          <View key={hour} style={styles.timeSlot}>
            <Text style={styles.timeText}>
              {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
            </Text>
            <View style={styles.hourLine} />
          </View>
        );
      }
      return slots;
    };

    const renderTasks = () => {
      return tasks.map(task => {
        const taskDate = new Date(task.date);
        const hour = taskDate.getHours();
        const minutes = taskDate.getMinutes();
        const top =
          (hour - START_HOUR) * HOUR_HEIGHT +
          (minutes / 60) * HOUR_HEIGHT;

        return (
          <TaskItem
            key={task.id}
            task={task}
            style={{
              position: 'absolute',
              top,
              left: 70,
              right: 10,
            }}
          />
        );
      });
    };

    return (
      <View style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayName}>{format(date, 'EEE')}</Text>
          <Text style={styles.dayNumber}>{format(date, 'd')}</Text>
        </View>
        <ScrollView style={styles.timeSlotsContainer}>
          <View style={styles.contentContainer}>
            {renderTimeSlots()}
            {renderTasks()}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

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
    bottom: 100,
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
  dayContainer: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: '#E0E0E0',
  },
  dayHeader: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  dayName: {
    fontSize: 14,
    color: '#666666',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  timeSlotsContainer: {
    flex: 1,
  },
  contentContainer: {
    position: 'relative',
    height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT,
  },
  timeSlot: {
    height: HOUR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeText: {
    width: 60,
    fontSize: 12,
    color: '#999999',
    paddingLeft: 8,
    paddingTop: 2,
  },
  hourLine: {
    height: 1,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
  },
});
