import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen    from '../screens/home/HomeScreen';
import AssessScreen  from '../screens/home/AssessScreen';
import DNAScreen     from '../screens/home/DNAScreen';
import GrowthScreen  from '../screens/home/GrowthScreen';
import ProfileScreen from '../screens/home/ProfileScreen';
import { ui } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',    icon: '🏠', component: HomeScreen    },
  { name: 'Assess',  icon: '🧠', component: AssessScreen  },
  { name: 'DNA',     icon: '📊', component: DNAScreen     },
  { name: 'Growth',  icon: '📈', component: GrowthScreen  },
  { name: 'Profile', icon: '👤', component: ProfileScreen },
];

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ focused }) => {
          const tab = TABS.find(t => t.name === route.name);
          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{tab?.icon}</Text>
            </View>
          );
        },
      })}
    >
      {TABS.map(t => (
        <Tab.Screen key={t.name} name={t.name} component={t.component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: ui.white,
    borderTopWidth: 1,
    borderTopColor: ui.borderGray,
    height: 60,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem:         { paddingVertical: 6 },
  iconWrap:        { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  iconWrapActive:  { backgroundColor: ui.primaryBlue + '18' },
  tabEmoji:        { fontSize: 22 },
  tabEmojiActive:  { },
});
