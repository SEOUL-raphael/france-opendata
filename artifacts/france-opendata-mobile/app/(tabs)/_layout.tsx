import { Stack } from 'expo-router';
import { WorkerUrlProvider } from '@/context/WorkerUrlContext';

export default function GroupLayout() {
  return (
    <WorkerUrlProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '설정',
            headerBackTitle: '돌아가기',
          }}
        />
      </Stack>
    </WorkerUrlProvider>
  );
}
