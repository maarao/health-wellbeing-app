// Fixed TaskModal with complete styles and updated prop types
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

export interface TaskPayload {
  title: string;
  description: string;
  date: string;
  frequency: string;
  type: string;
}

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: TaskPayload) => void;
}

const TaskModal = ({ visible, onClose, onSave }: TaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequency, setFrequency] = useState('once');
  const [taskType, setTaskType] = useState('medication');
  
  const frequencyOptions = [
    { label: 'Once', value: 'once' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];
  
  const taskTypes = ['medication', 'wound', 'appointment', 'other'];
  
  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    onSave({
      title,
      description,
      date: date.toISOString(),
      frequency,
      type: taskType
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDate(new Date());
    setFrequency('once');
    setTaskType('medication');
  };
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setShowTimePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Health Task</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Task Type</Text>
            <SegmentedControl
              values={taskTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1))}
              selectedIndex={taskTypes.indexOf(taskType)}
              onChange={(event) => {
                setTaskType(taskTypes[event.nativeEvent.selectedSegmentIndex]);
              }}
              style={styles.segmentedControl}
            />
            
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
            />
            
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task details"
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.label}>Date & Time</Text>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{date.toLocaleTimeString()}</Text>
            </TouchableOpacity>
            
            {(showDatePicker || showTimePicker) && (
              <DateTimePicker
                value={date}
                mode={showDatePicker ? 'date' : 'time'}
                display="default"
                onChange={onDateChange}
              />
            )}
            
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyContainer}>
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyOption,
                    frequency === option.value && styles.frequencyOptionSelected
                  ]}
                  onPress={() => setFrequency(option.value)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === option.value && styles.frequencyTextSelected
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TaskModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  formContainer: {
    flexGrow: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFF',
    color: '#000',
  },
  textArea: {
    height: 70,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  segmentedControl: {
    marginBottom: 10,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  frequencyOption: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  frequencyOptionSelected: {
    backgroundColor: '#007AFF',
  },
  frequencyText: {
    color: '#007AFF',
  },
  frequencyTextSelected: {
    color: '#FFF',
  },
});