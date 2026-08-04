import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useWorkerUrl } from '@/context/WorkerUrlContext';
import { useColors } from '@/hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { workerUrl, saveWorkerUrl } = useWorkerUrl();
  const [draft, setDraft] = useState(workerUrl);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Sync draft when workerUrl loads
  useEffect(() => {
    setDraft(workerUrl);
  }, [workerUrl]);

  const handleSave = async () => {
    const url = draft.trim().replace(/\/$/, '');
    if (!url) {
      Alert.alert('URL 필요', 'Cloudflare Worker URL을 입력해주세요.');
      return;
    }
    if (!url.startsWith('http')) {
      Alert.alert('잘못된 URL', 'https:// 로 시작하는 URL을 입력해주세요.');
      return;
    }
    await saveWorkerUrl(url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.canGoBack() && router.back();
  };

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === 'web' ? Math.max(insets.bottom, 34) : insets.bottom;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: bottomPad + 24,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      textTransform: 'uppercase' as const,
      marginBottom: 8,
      fontFamily: 'Inter_600SemiBold',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 16,
    },
    inputRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
    helperText: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 10,
      lineHeight: 18,
      fontFamily: 'Inter_400Regular',
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: 'center' as const,
      marginTop: 8,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 8,
    },
    saveBtnText: {
      color: colors.primaryForeground,
      fontSize: 15,
      fontWeight: '600' as const,
      fontFamily: 'Inter_600SemiBold',
    },
    infoCard: {
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 14,
      marginBottom: 20,
      flexDirection: 'row' as const,
      gap: 10,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 20,
      fontFamily: 'Inter_400Regular',
    },
    linkText: {
      color: colors.primary,
      textDecorationLine: 'underline' as const,
    },
    statusRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      marginTop: 10,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: workerUrl ? '#22c55e' : '#ef4135',
    },
    statusText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
  });

  return (
    <View style={[styles.container, Platform.OS === 'web' ? { paddingTop: topPad } : {}]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.mutedForeground} />
          <Text style={styles.infoText}>
            Cloudflare Worker URL을 입력하면 이동 중에도 프랑스 공공데이터를 AI로 분석할 수 있습니다.{'\n\n'}
            Worker 배포 방법은{' '}
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL('https://github.com/cloudflare/workers-sdk')}
            >
              cloudflare-worker/README.md
            </Text>
            를 참고하세요.
          </Text>
        </View>

        {/* URL Input */}
        <Text style={styles.sectionLabel}>Worker URL</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Feather name="link" size={16} color={colors.mutedForeground} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="https://your-worker.workers.dev"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            {draft.length > 0 && (
              <Pressable onPress={() => setDraft('')} hitSlop={8}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
          <Text style={styles.helperText}>
            Cloudflare Worker의 배포 URL을 입력하세요.{'\n'}
            예: https://france-opendata.your-name.workers.dev
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {workerUrl ? `현재: ${workerUrl}` : '미설정'}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleSave}
        >
          {saved ? (
            <Ionicons name="checkmark-circle" size={18} color={colors.primaryForeground} />
          ) : (
            <Feather name="save" size={16} color={colors.primaryForeground} />
          )}
          <Text style={styles.saveBtnText}>{saved ? '저장됨' : '저장'}</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
