import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getWeekDates, formatDate, getDayName } from '@/utils/dateUtils';

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  mode?: 'week' | 'month';
}

export default function CalendarView({ 
  onDateSelect, 
  selectedDate,
  mode = 'week'
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dates, setDates] = useState<Date[]>([]);
  
  useEffect(() => {
    if (mode === 'week') {
      setDates(getWeekDates(currentDate));
    }
    // Add month mode implementation if needed
  }, [currentDate, mode]);

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (mode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (mode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthYear}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.navigationButtons}>
          <Pressable onPress={navigatePrevious} style={styles.navButton}>
            <ChevronLeft size={20} color={Colors.text.primary} />
          </Pressable>
          <Pressable onPress={navigateNext} style={styles.navButton}>
            <ChevronRight size={20} color={Colors.text.primary} />
          </Pressable>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {dates.map((date, index) => (
          <Pressable
            key={index}
            style={[
              styles.dayItem,
              isSelected(date) && styles.selectedDay
            ]}
            onPress={() => onDateSelect(date)}
          >
            <Text style={[
              styles.dayName,
              isSelected(date) && styles.selectedText
            ]}>
              {getDayName(date, true)}
            </Text>
            <View style={[
              styles.dateCircle,
              isToday(date) && styles.todayCircle,
              isSelected(date) && styles.selectedCircle
            ]}>
              <Text style={[
                styles.dateNumber,
                isToday(date) && styles.todayText,
                isSelected(date) && styles.selectedDateText
              ]}>
                {date.getDate()}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
  },
  navButton: {
    padding: 8,
  },
  daysContainer: {
    paddingHorizontal: 8,
  },
  dayItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dayName: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  todayCircle: {
    backgroundColor: Colors.border,
  },
  todayText: {
    fontWeight: '700',
  },
  selectedDay: {
    backgroundColor: Colors.primary + '10',
  },
  selectedCircle: {
    backgroundColor: Colors.primary,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  selectedDateText: {
    color: 'white',
    fontWeight: '600',
  },
});
