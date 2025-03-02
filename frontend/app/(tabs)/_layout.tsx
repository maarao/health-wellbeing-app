import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFirstTimeOpen } from '@/hooks/useFirstTimeOpen';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { firstTimeOpen, isLoaded } = useFirstTimeOpen();

  if(isLoaded) return <></>;
  if(firstTimeOpen) return <Redirect href={"/onBoarding"} />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          // Fixed position at the bottom of the screen
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          height: 60,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : Colors[colorScheme ?? 'light'].background,
          borderTopWidth: 0,
          zIndex: 8,
        },
        // Add bottom padding to content to prevent overlap with tab bar
        contentStyle: {
          paddingBottom: 60,
          marginTop: 20, // Add top margin here
        }
      }}>
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
    </Tabs>
  );
}