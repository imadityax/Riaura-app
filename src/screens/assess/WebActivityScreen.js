// Hosts a self-contained HTML/JS activity (the Collaborative Sandbox creative
// problem-solving game) inside a WebView. The HTML is bundled as an asset and
// read to a string at runtime, then handed to the WebView via source={{ html }}.
// When the game reaches its results screen it posts { type:'complete' } back
// through window.ReactNativeWebView, which marks the RiAura activity done.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';
import { dark } from '../../theme/colors';

// Registry of bundled web activities, keyed by the `web` flag on the activity.
const WEB_ACTIVITIES = {
  'collaborative-sandbox': require('../../../assets/activities/collaborative-sandbox.html'),
};

// Read a bundled asset module to a UTF-8 string. Mirrors the fetch-with-File
// fallback used by src/components/gltfLoader.js (Android release builds can't
// fetch a file:// URI, so fall back to the expo-file-system File API).
async function readAssetText(moduleId) {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  try {
    const res = await fetch(uri);
    return await res.text();
  } catch (e) {
    const { File } = require('expo-file-system');
    return await new File(uri).text();
  }
}

export default function WebActivityScreen({ navigation, route }) {
  const activity = route?.params?.activity || {};
  const color    = route?.params?.color || dark.neon;
  const onComplete = route?.params?.onComplete;

  const [html, setHtml] = useState(null);
  const [failed, setFailed] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    const moduleId = WEB_ACTIVITIES[activity.web];
    if (!moduleId) { setFailed(true); return; }
    readAssetText(moduleId)
      .then(str => { if (alive) setHtml(str); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [activity.web]);

  function handleMessage(event) {
    let msg;
    try { msg = JSON.parse(event.nativeEvent.data); } catch (_) { return; }
    if (msg?.type === 'complete' && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(msg);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="close" size={22} color={dark.text} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{activity.title || 'Activity'}</Text>
        <View style={styles.backBtn} />
      </View>

      {failed ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={40} color={dark.textSub} />
          <Text style={styles.errText}>This activity could not be loaded.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.retryBtn, { backgroundColor: color }]}>
            <Text style={styles.retryText}>Go back</Text>
          </TouchableOpacity>
        </View>
      ) : html == null ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={color} />
          <Text style={styles.loadingText}>Loading activity…</Text>
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          style={styles.web}
          containerStyle={styles.web}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6EFDF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: dark.glassBorder,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '800', color: dark.text },
  web: { flex: 1, backgroundColor: '#F6EFDF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '600', color: dark.textSub },
  errText: { fontSize: 14, fontWeight: '600', color: dark.textSub, textAlign: 'center' },
  retryBtn: { borderRadius: 20, paddingHorizontal: 22, paddingVertical: 12, marginTop: 6 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
