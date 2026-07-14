import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BrainIcon from '../components/BrainIcon';
import HomeScreen     from '../screens/home/HomeScreen';
import AssessScreen   from '../screens/home/AssessScreen';
import PassportScreen from '../screens/passport/PassportScreen';
import ChatScreen     from '../screens/home/ChatScreen';
import ProfileScreen  from '../screens/home/ProfileScreen';

const Tab = createBottomTabNavigator();
const ACTIVE   = '#7C3AED';
const INACTIVE = '#9AA0B4';

const TABS = [
  { name: 'Home',     icon: 'home-variant-outline',          iconActive: 'home-variant',          label: 'Home' },
  { name: 'Assess',   icon: 'brain',                         iconActive: 'brain',                 label: 'Assess' },
  { name: 'Passport', icon: 'card-account-details-outline',  iconActive: 'card-account-details',  label: 'Passport' },
  { name: 'AICoach',  icon: 'message-text-outline',          iconActive: 'message-text',          label: 'Coach' },
  { name: 'Profile',  icon: 'account-outline',               iconActive: 'account',               label: 'Profile' },
];

// ── Animated tab item ────────────────────────────────────────────────────────
// The focused icon springs up and grows slightly; a soft lavender pill fades
// in behind it.
function TabItem({ route, tab, focused, onPress }) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true, speed: 16, bounciness: 12,
    }).start();
  }, [focused]);

  const scale      = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  return (
    <Pressable onPress={onPress} style={styles.item} hitSlop={6}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale }, { translateY }] }]}>
        <Animated.View style={[styles.iconPill, { opacity: anim }]} />
        {route.name === 'Assess' ? (
          <BrainIcon size={23} color={focused ? ACTIVE : INACTIVE} strokeWidth={2} />
        ) : (
          <MaterialCommunityIcons
            name={focused ? tab.iconActive : tab.icon}
            size={23}
            color={focused ? ACTIVE : INACTIVE}
          />
        )}
      </Animated.View>
      <Text style={[styles.label, focused && styles.labelActive]}>{tab.label}</Text>
    </Pressable>
  );
}

// ── Floating light tab bar ───────────────────────────────────────────────────
function LightTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, i) => {
          const tab = TABS.find(t => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === i;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return <TabItem key={route.key} route={route} tab={tab} focused={focused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <LightTabBar {...props} />}
    >
      {TABS.map(t => {
        const Comp = { Home: HomeScreen, Assess: AssessScreen, Passport: PassportScreen, AICoach: ChatScreen, Profile: ProfileScreen }[t.name];
        return <Tab.Screen key={t.name} name={t.name} component={Comp} />;
      })}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, backgroundColor: 'transparent' },
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 28, paddingVertical: 11, paddingHorizontal: 6,
    shadowColor: '#3A2C74', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 12,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 },
  iconWrap: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
  iconPill: { position: 'absolute', width: 40, height: 32, borderRadius: 16, backgroundColor: '#EFEBFB' },
  label: { fontSize: 10.5, fontWeight: '700', color: INACTIVE },
  labelActive: { color: ACTIVE },
});
