import React from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppProvider, useApp} from './src/context/AppContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {colors} from './src/theme';

function AppStatusBar() {
  const {displayMode} = useApp();
  return (
    <StatusBar
      barStyle={displayMode === 'dark' ? 'light-content' : 'dark-content'}
    />
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: colors.ivory}}>
      <SafeAreaProvider>
        <AppProvider>
          <AppStatusBar />
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
