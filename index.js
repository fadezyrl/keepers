/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Background/killed-state data messages (optional). Failures must never block boot.
try {
  // eslint-disable-next-line global-require
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async () => {
    // In-app list refreshes on next foreground via PushBootstrap.
  });
} catch {
  // Firebase not linked yet (e.g. fresh clone before pods/gradle).
}

AppRegistry.registerComponent(appName, () => App);
