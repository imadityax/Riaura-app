import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ui } from '../../theme/colors';

export default function ChatScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={ui.darkText} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>AI Coach</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconBg}>
          <Ionicons name="chatbubble-ellipses" size={36} color={ui.primaryBlue} />
        </View>
        <Text style={styles.title}>Your AI Coach is coming soon</Text>
        <Text style={styles.sub}>
          We're building a personal AI coach that will help you interpret your results, answer questions
          about your intelligence profile, and guide your growth. Check back soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ui.offWhite },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: ui.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  pageTitle: { fontSize: 17, fontWeight: '800', color: ui.darkText },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, marginTop: -60 },
  iconBg: {
    width: 84, height: 84, borderRadius: 24, backgroundColor: ui.challengeBg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '800', color: ui.darkText, textAlign: 'center', marginBottom: 10 },
  sub:   { fontSize: 13, color: ui.midText, textAlign: 'center', lineHeight: 20 },
});
