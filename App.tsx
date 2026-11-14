import React from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AlertProvider} from './src/alerts';
import {CacheProvider} from './src/cache';
import {OfflineBanner} from './src/components';
import {AppProvider, useApp} from './src/context/AppContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {PushBootstrap} from './src/notifications/PushBootstrap';
import {colors} from './src/theme';

function AppStatusBar() {
  const {displayMode} = useApp();
  return (
    <StatusBar
      barStyle={displayMode === 'dark' ? 'light-content' : 'dark-content'}
    />
  );
}

function AppShell() {
  return (
    <>
      <AppStatusBar />
      <OfflineBanner />
      <PushBootstrap />
      <RootNavigator />
    </>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: colors.ivory}}>
      <SafeAreaProvider>
        <CacheProvider>
          <AppProvider>
            <AlertProvider>
              <AppShell />
            </AlertProvider>
          </AppProvider>
        </CacheProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
