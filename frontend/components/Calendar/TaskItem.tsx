import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { format } from 'date-fns';

interface TaskItemProps {
  task: {
    date: string;
    title: string;
    description: string;
    type: 'medication' | 'wound' | 'appointment' | string;
  };
  style?: ViewStyle;
}

const getTaskTypeStyles = (type: string): { backgroundColor: string; borderColor: string } => {
  switch (type) {
    case 'medication':
      return {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3'
      };
    case 'wound':
      return {
        backgroundColor: '#FFF9C4',
        borderColor: '#FFC107'
      };
    case 'appointment':
      return {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50'
      };
    default:
      return {
        backgroundColor: '#F5F5F5',
        borderColor: '#9E9E9E'
      };
  }
};

const TaskItem: React.FC<TaskItemProps> = ({ task, style }) => {
  const typeStyles = getTaskTypeStyles(task.type);
  
  return (
    <View style={[styles.container, typeStyles, style]}>
      <Text style={styles.time}>{format(new Date(task.date), 'h:mm a')}</Text>
      <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{task.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    padding: 8,
    borderRadius: 4,
    minHeight: 50,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  time: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  description: {
    fontSize: 12,
    color: '#666666',
  },
});

export default TaskItem;