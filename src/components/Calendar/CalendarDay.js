import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format } from 'date-fns';
import TaskItem from './TaskItem';

const HOUR_HEIGHT = 60;
const START_HOUR = 7; // 7 AM
const END_HOUR = 22; // 10 PM

const CalendarDay = ({ date, tasks }) => {
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
      
      // Calculate position based on time
      const top = (hour - START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
      
      return (
        <TaskItem 
          key={task.id} 
          task={task} 
          style={{
            position: 'absolute',
            top: top,
            left: 70,
            right: 10
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

const styles = StyleSheet.create({
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

export default CalendarDay;
