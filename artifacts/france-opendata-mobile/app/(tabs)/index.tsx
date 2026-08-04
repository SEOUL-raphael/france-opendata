import React, {
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
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
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useWorkerUrl } from '@/context/WorkerUrlContext';
import { useColors } from '@/hooks/useColors';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MappedToolCall {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
  callCount: number;
}

interface DatasetCard {
  id: string;
  title: string;
  organization?: string;
  url: string;
}

interface SearchState {
  status: 'idle' | 'loading' | 'done' | 'error';
  query: string;
  content: string;
  toolCalls: MappedToolCall[];
  datasets: DatasetCard[];
  errorMessage: string | null;
}

interface WorkerResponse {
  message: { role: string; content: string };
  toolCalls: Array<{ name: string; arguments: Record<string, unknown>; result: string }>;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EXAMPLE_QUERIES = [
  '파리 인구 관련 데이터셋을 찾아주고, 바로 조회 가능한 리소스가 있으면 추천해줘.',
  '프랑스 부동산 가격 데이터를 찾고, 어떤 데이터셋부터 살펴보면 좋은지 요약해줘.',
  '파리의 최근 인구 데이터를 얻으려면 어떤 dataset을 봐야 하는지 알려줘.',
  '프랑스 신재생에너지 관련 공공 API 서비스가 있나요?',
];

const TOOL_LABELS: Record<string, string> = {
  search_datasets: '데이터셋 검색',
  get_dataset_info: '데이터셋 상세',
  list_dataset_resources: '리소스 목록',
  get_resource_info: '리소스 상세',
  search_dataservices: 'API 서비스 검색',
  get_dataservice_info: 'API 서비스 상세',
  search_organizations: '기관 검색',
  query_resource_data: '데이터 쿼리',
  get_metrics: '통계 조회',
};

const INITIAL_STATE: SearchState = {
  status: 'idle',
  query: '',
  content: '',
  toolCalls: [],
  datasets: [],
  errorMessage: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractDatasets(toolName: string, result: unknown): DatasetCard[] {
  if (!['search_datasets', 'get_dataset_info', 'list_dataset_resources'].includes(toolName)) {
    return [];
  }
  const buildUrl = (d: Record<string, unknown>): string => {
    if (d.page && typeof d.page === 'string' && d.page.startsWith('http')) return d.page;
    if (d.slug) return `https://www.data.gouv.fr/fr/datasets/${d.slug}/`;
    return `https://www.data.gouv.fr/fr/datasets/${d.id}/`;
  };
  try {
    if (Array.isArray(result)) {
      return (result as Array<Record<string, unknown>>)
        .filter((d) => d.id && d.title)
        .map((d) => ({
          id: String(d.id),
          title: String(d.title),
          organization: d.organization ? String(d.organization) : undefined,
          url: buildUrl(d),
        }));
    }
    if (result && typeof result === 'object') {
      const d = result as Record<string, unknown>;
      if (d.id && d.title) {
        return [{ id: String(d.id), title: String(d.title), organization: d.organization ? String(d.organization) : undefined, url: buildUrl(d) }];
      }
    }
  } catch { /* ignore */ }
  return [];
}

function deduplicateDatasets(datasets: DatasetCard[]): DatasetCard[] {
  const seen = new Set<string>();
  return datasets.filter((d) => { if (seen.has(d.id)) return false; seen.add(d.id); return true; });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToolCallBadge({ toolCall, colors }: { toolCall: MappedToolCall; colors: ReturnType<typeof useColors> }) {
  const label = TOOL_LABELS[toolCall.name] ?? toolCall.name;
  const styles = StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
      marginRight: 6,
      marginBottom: 6,
    },
    text: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' },
    count: {
      fontSize: 10,
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      backgroundColor: colors.secondary,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 8,
    },
  });
  return (
    <View style={styles.badge}>
      <Feather name="tool" size={11} color={colors.mutedForeground} />
      <Text style={styles.text}>{label}</Text>
      <Text style={styles.count}>{toolCall.callCount}</Text>
    </View>
  );
}

function DatasetCardItem({ dataset, colors }: { dataset: DatasetCard; colors: ReturnType<typeof useColors> }) {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 8,
    },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    textArea: { flex: 1 },
    title: { fontSize: 13, fontWeight: '600' as const, color: colors.foreground, lineHeight: 18, fontFamily: 'Inter_600SemiBold' },
    org: { fontSize: 11, color: colors.mutedForeground, marginTop: 3, fontFamily: 'Inter_400Regular' },
    iconWrapper: { paddingTop: 1 },
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(dataset.url);
  };

  return (
    <Pressable style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]} onPress={handlePress}>
      <View style={styles.row}>
        <View style={styles.textArea}>
          <Text style={styles.title} numberOfLines={2}>{dataset.title}</Text>
          {dataset.organization && <Text style={styles.org}>{dataset.organization}</Text>}
        </View>
        <View style={styles.iconWrapper}>
          <Feather name="external-link" size={14} color={colors.mutedForeground} />
        </View>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { workerUrl, loaded } = useWorkerUrl();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>(INITIAL_STATE);
  const [showAllTools, setShowAllTools] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isLoading = state.status === 'loading';
  const isConfigured = loaded && workerUrl.length > 0;

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === 'web' ? Math.max(insets.bottom, 34) : insets.bottom;

  // ── Search handler ──────────────────────────────────────────────────────────
  const handleSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || isLoading) return;
    if (!workerUrl) {
      router.push('/settings');
      return;
    }

    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setState({ ...INITIAL_STATE, status: 'loading', query: trimmed });
    scrollRef.current?.scrollTo({ y: 0, animated: true });

    try {
      const res = await fetch(`${workerUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = (await res.json()) as WorkerResponse;

      if (!res.ok || data.error) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: data.error ?? `서버 오류 (${res.status})`,
        }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      let allDatasets: DatasetCard[] = [];
      const toolCalls: MappedToolCall[] = (data.toolCalls ?? []).map((tc, i) => {
        let parsed: unknown = tc.result;
        try { parsed = JSON.parse(tc.result); } catch { /* keep string */ }
        allDatasets = deduplicateDatasets([...allDatasets, ...extractDatasets(tc.name, parsed)]);
        return { name: tc.name, args: tc.arguments, result: parsed, callCount: i + 1 };
      });

      setState({
        status: 'done',
        query: trimmed,
        content: data.message?.content ?? '',
        toolCalls,
        datasets: allDatasets,
        errorMessage: null,
      });
      setShowAllTools(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: `요청 오류: ${(err as Error).message}`,
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isLoading, workerUrl]);

  const handleSubmit = () => handleSearch(query);

  // ── Render ────────────────────────────────────────────────────────────────

  const s = makeStyles(colors, insets, topPad, bottomPad);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <View style={s.headerLeft}>
          <View style={s.logoBox}>
            <Text style={s.flagText}>🇫🇷</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>공공데이터 탐색기</Text>
            <Text style={s.headerSubtitle}>data.gouv.fr · AI 분석</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [s.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
          hitSlop={8}
          testID="settings-button"
        >
          <Feather
            name="settings"
            size={20}
            color={isConfigured ? colors.mutedForeground : colors.destructive}
          />
          {!isConfigured && loaded && <View style={s.badge} />}
        </Pressable>
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Content */}
      <KeyboardAvoidingView style={s.flex} behavior="padding" keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Not configured */}
          {loaded && !isConfigured && (
            <Pressable
              style={({ pressed }) => [s.setupBanner, { opacity: pressed ? 0.9 : 1 }]}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="cloud-offline-outline" size={22} color={colors.destructive} />
              <View style={s.flex}>
                <Text style={s.setupTitle}>Worker URL 설정 필요</Text>
                <Text style={s.setupDesc}>Cloudflare Worker URL을 설정해야 분석을 시작할 수 있습니다.</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.destructive} />
            </Pressable>
          )}

          {/* Idle / Welcome */}
          {state.status === 'idle' && (
            <View style={s.welcomeSection}>
              <View style={s.heroIcon}>
                <MaterialCommunityIcons name="database-search" size={40} color={colors.primary} />
              </View>
              <Text style={s.welcomeTitle}>무엇을 찾고 계신가요?</Text>
              <Text style={s.welcomeSub}>
                프랑스 공공데이터(data.gouv.fr)를 자연어로 질문하면 AI가 관련 데이터셋과 API를 분석해 드립니다.
              </Text>

              {/* Example queries */}
              <Text style={s.exampleLabel}>예시 질문</Text>
              {EXAMPLE_QUERIES.map((ex, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [s.exampleChip, { opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => {
                    setQuery(ex);
                    Haptics.selectionAsync();
                  }}
                >
                  <Feather name="search" size={13} color={colors.primary} style={{ marginTop: 1 }} />
                  <Text style={s.exampleText}>{ex}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Loading */}
          {state.status === 'loading' && (
            <View style={s.loadingSection}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={s.loadingTitle}>분석 중...</Text>
              <Text style={s.loadingDesc}>
                "{state.query}"
              </Text>
              <Text style={s.loadingHint}>Cloudflare Worker가 data.gouv.fr에서 데이터를 수집하고 있습니다. 최대 수십 초가 소요될 수 있습니다.</Text>
            </View>
          )}

          {/* Error */}
          {state.status === 'error' && (
            <View style={s.errorSection}>
              <Ionicons name="warning-outline" size={40} color={colors.destructive} />
              <Text style={s.errorTitle}>오류가 발생했습니다</Text>
              <Text style={s.errorMsg}>{state.errorMessage}</Text>
              <Pressable
                style={({ pressed }) => [s.retryBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => handleSearch(state.query)}
              >
                <Feather name="refresh-cw" size={15} color={colors.primaryForeground} />
                <Text style={s.retryText}>다시 시도</Text>
              </Pressable>
            </View>
          )}

          {/* Results */}
          {state.status === 'done' && (
            <View style={s.resultsSection}>
              {/* Query pill */}
              <View style={s.queryPill}>
                <Feather name="search" size={13} color={colors.primary} />
                <Text style={s.queryPillText} numberOfLines={2}>{state.query}</Text>
              </View>

              {/* Tool calls */}
              {state.toolCalls.length > 0 && (
                <View style={s.toolsCard}>
                  <Pressable
                    style={s.toolsHeader}
                    onPress={() => setShowAllTools((v) => !v)}
                  >
                    <Feather name="tool" size={14} color={colors.mutedForeground} />
                    <Text style={s.toolsTitle}>도구 호출 내역 ({state.toolCalls.length}회)</Text>
                    <View style={s.flex} />
                    <Feather
                      name={showAllTools ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </Pressable>
                  {showAllTools && (
                    <View style={s.toolsBody}>
                      <View style={s.toolBadges}>
                        {state.toolCalls.map((tc) => (
                          <ToolCallBadge key={tc.callCount} toolCall={tc} colors={colors} />
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Dataset cards */}
              {state.datasets.length > 0 && (
                <View style={s.datasetsSection}>
                  <View style={s.sectionHeaderRow}>
                    <Ionicons name="layers-outline" size={15} color={colors.primary} />
                    <Text style={s.sectionHeader}>관련 데이터셋 ({state.datasets.length})</Text>
                  </View>
                  {state.datasets.map((ds) => (
                    <DatasetCardItem key={ds.id} dataset={ds} colors={colors} />
                  ))}
                </View>
              )}

              {/* AI Response */}
              {state.content.length > 0 && (
                <View style={s.responseSection}>
                  <View style={s.sectionHeaderRow}>
                    <Ionicons name="sparkles" size={15} color={colors.primary} />
                    <Text style={s.sectionHeader}>AI 분석</Text>
                  </View>
                  <View style={s.responseCard}>
                    <Text style={s.responseText} selectable>{state.content}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Search input bar */}
        <View style={[s.inputBar, { paddingBottom: bottomPad + 10 }]}>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={query}
              onChangeText={setQuery}
              placeholder={isConfigured ? '데이터에 대해 질문하세요...' : 'Worker URL을 먼저 설정하세요'}
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="search"
              onSubmitEditing={handleSubmit}
              editable={!isLoading}
              multiline={false}
              testID="search-input"
            />
            <Pressable
              style={({ pressed }) => [
                s.sendBtn,
                { opacity: (isLoading || query.trim().length === 0) ? 0.5 : pressed ? 0.85 : 1 },
              ]}
              onPress={handleSubmit}
              disabled={isLoading || query.trim().length === 0}
              testID="send-button"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Feather name="send" size={17} color={colors.primaryForeground} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles factory ───────────────────────────────────────────────────────────

function makeStyles(
  colors: ReturnType<typeof useColors>,
  insets: { top: number; bottom: number; left: number; right: number },
  topPad: number,
  bottomPad: number,
) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: colors.background,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flagText: { fontSize: 20 },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
    },
    headerSubtitle: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    iconBtn: { position: 'relative', padding: 4 },
    badge: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.destructive,
    },
    divider: { height: 1, backgroundColor: colors.border },

    // Scroll
    scrollContent: { padding: 16, paddingBottom: 16 },

    // Setup banner
    setupBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      borderColor: colors.destructive,
      backgroundColor: `${colors.destructive}12`,
      marginBottom: 20,
    },
    setupTitle: { fontSize: 14, fontWeight: '600' as const, color: colors.destructive, fontFamily: 'Inter_600SemiBold' },
    setupDesc: { fontSize: 12, color: colors.mutedForeground, marginTop: 2, fontFamily: 'Inter_400Regular' },

    // Welcome
    welcomeSection: { paddingTop: 16 },
    heroIcon: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: `${colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    welcomeTitle: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: colors.foreground,
      marginBottom: 8,
      fontFamily: 'Inter_700Bold',
    },
    welcomeSub: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 22,
      marginBottom: 24,
      fontFamily: 'Inter_400Regular',
    },
    exampleLabel: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.mutedForeground,
      letterSpacing: 0.6,
      textTransform: 'uppercase' as const,
      marginBottom: 10,
      fontFamily: 'Inter_600SemiBold',
    },
    exampleChip: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      padding: 12,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginBottom: 8,
    },
    exampleText: {
      flex: 1,
      fontSize: 13,
      color: colors.foreground,
      lineHeight: 19,
      fontFamily: 'Inter_400Regular',
    },

    // Loading
    loadingSection: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
    },
    loadingTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.foreground,
      marginTop: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    loadingDesc: {
      fontSize: 13,
      color: colors.primary,
      marginTop: 6,
      textAlign: 'center',
      paddingHorizontal: 24,
      fontFamily: 'Inter_500Medium',
    },
    loadingHint: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 12,
      textAlign: 'center',
      paddingHorizontal: 24,
      lineHeight: 18,
      fontFamily: 'Inter_400Regular',
    },

    // Error
    errorSection: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.foreground,
      marginTop: 12,
      fontFamily: 'Inter_600SemiBold',
    },
    errorMsg: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 8,
      textAlign: 'center',
      paddingHorizontal: 24,
      lineHeight: 19,
      fontFamily: 'Inter_400Regular',
    },
    retryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 20,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: colors.radius,
    },
    retryText: {
      color: colors.primaryForeground,
      fontSize: 14,
      fontWeight: '600' as const,
      fontFamily: 'Inter_600SemiBold',
    },

    // Results
    resultsSection: {},
    queryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: `${colors.primary}12`,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 16,
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    queryPillText: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: 'Inter_500Medium',
      flexShrink: 1,
    },
    toolsCard: {
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginBottom: 16,
      overflow: 'hidden',
    },
    toolsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
    },
    toolsTitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
    },
    toolsBody: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 12,
    },
    toolBadges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    datasetsSection: { marginBottom: 16 },
    responseSection: { marginBottom: 20 },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    sectionHeader: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    responseCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    responseText: {
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 23,
      fontFamily: 'Inter_400Regular',
    },

    // Input bar
    inputBar: {
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 12,
      paddingTop: 10,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.input,
      borderRadius: 24,
      paddingLeft: 14,
      paddingRight: 6,
      paddingVertical: 6,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      paddingVertical: Platform.OS === 'ios' ? 6 : 4,
    },
    sendBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
