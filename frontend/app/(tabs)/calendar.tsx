import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { 
  format, 
  addDays, 
  isSameDay, 
  differenceInDays,
  getDay,
  getDate
} from 'date-fns';
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
const DAYS_TO_SHOW = 14; // Show two weeks of dates
const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Generate array of dates starting from today
  const generateDays = () => {
    const daysArray = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const currentDate = addDays(new Date(), i);
      
      // Get tasks for this specific date (including recurring ones)
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        
        // For non-recurring tasks, just check if it's the same day
        if (task.frequency === 'once') {
          return isSameDay(taskDate, currentDate);
        }
        
        // For recurring tasks, check if this day matches the recurrence pattern
        const daysSinceTaskCreated = differenceInDays(currentDate, taskDate);
        
        if (daysSinceTaskCreated < 0) {
          return false; // Task hasn't started yet
        }
        
        switch (task.frequency) {
          case 'daily':
            // Task occurs every day
            return true;
          
          case 'weekly':
            // Task occurs on the same day of the week
            return getDay(currentDate) === getDay(taskDate);
          
          case 'monthly':
            // Task occurs on the same day of the month
            return getDate(currentDate) === getDate(taskDate);
          
          default:
            return isSameDay(taskDate, currentDate);
        }
      });
      
      daysArray.push({
        date: currentDate,
        dayTasks
      });
    }
    return daysArray;
  };
  
  const days = generateDays();

  const handleAddTask = (newTask: TaskPayload) => {
    const taskWithId: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      date: newTask.date.toISOString(),
      frequency: newTask.frequency,
      type: newTask.type,
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
            key={`${task.id}-${date.toISOString()}`}
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
      <View style={[styles.dayContainer, { width }]}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayName}>{format(date, 'EEEE')}</Text>
          <Text style={styles.dayNumber}>{format(date, 'MMMM d, yyyy')}</Text>
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

  // Renders the date selector at the top
  const renderDateSelector = () => {
    return (
      <View style={styles.dateSelectorContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={days}
          keyExtractor={(item, index) => `date-${index}`}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={[
                styles.dateItem, 
                selectedDateIndex === index ? styles.selectedDateItem : null
              ]}
              onPress={() => {
                setSelectedDateIndex(index);
                flatListRef.current?.scrollToIndex({ index, animated: true });
              }}
            >
              <Text 
                style={[
                  styles.dateSelectorDay, 
                  selectedDateIndex === index ? styles.selectedDateText : null
                ]}
              >
                {format(item.date, 'EEE')}
              </Text>
              <Text 
                style={[
                  styles.dateSelectorDate, 
                  selectedDateIndex === index ? styles.selectedDateText : null
                ]}
              >
                {format(item.date, 'd')}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.dateList}
        />
      </View>
    );
  };

  // Handle viewable items change
  const handleViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: Array<{ index: number }> }) => {
    if (viewableItems.length > 0) {
      setSelectedDateIndex(viewableItems[0].index);
    }
  }, []);

  // View configuration for FlatList
  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  // Force re-render when tasks change to update recurring events
  React.useEffect(() => {
    // This ensures the calendar updates when tasks are added/modified
  }, [tasks]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Schedule</Text>
      </View>
      
      {/* Date selector strip */}
      {renderDateSelector()}
      
      {/* Swipeable calendar days */}
      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={days}
        renderItem={({ item }) => (
          <CalendarDay
            date={item.date}
            tasks={item.dayTasks}
          />
        )}
        keyExtractor={(item, index) => `day-${index}`}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={selectedDateIndex}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      
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
    backgroundColor: 'white',
  },
  header: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
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
  },
  dayHeader: {
    height: 40, // Reduced height
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  dayName: {
    fontSize: 14, // Smaller font
    color: '#666666',
  },
  dayNumber: {
    fontSize: 16, // Smaller font
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
  dateSelectorContainer: {
    height: 45, // Reduced height
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateList: {
    paddingVertical: 6, // Reduced padding
    paddingHorizontal: 8,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4, // Reduced margin
    paddingHorizontal: 10, // Reduced padding
    paddingVertical: 4, // Reduced padding
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedDateItem: {
    backgroundColor: '#007AFF',
  },
  dateSelectorDay: {
    fontSize: 11, // Smaller font
    color: '#666',
  },
  dateSelectorDate: {
    fontSize: 13, // Smaller font
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff',
  },
});