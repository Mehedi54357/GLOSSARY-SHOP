import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'হোম',
          tabBarIcon: () => <Text>🏠</Text>
        }} 
      />
      <Tabs.Screen 
        name="add-product" 
        options={{ 
          title: 'প্রোডাক্ট যোগ',
          tabBarIcon: () => <Text>➕</Text>
        }} 
      />
      <Tabs.Screen 
        name="inventory" 
        options={{ 
          title: 'ইনভেন্টরি',
          tabBarIcon: () => <Text>📦</Text>
        }} 
      />
    </Tabs>
  );
}