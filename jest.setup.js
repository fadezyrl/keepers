/* eslint-env jest */

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    GestureHandlerRootView: ({children, ...props}) =>
      React.createElement(View, props, children),
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    Directions: {},
  };
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-video', () => 'Video');

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: 'Screen',
  ScreenContainer: 'ScreenContainer',
  NativeScreen: 'NativeScreen',
  NativeScreenContainer: 'NativeScreenContainer',
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    NavigationContainer: ({children}) => children,
    useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn()}),
    useRoute: () => ({params: {}}),
  };
});

jest.mock('react-native-calendar-events', () => ({
  __esModule: true,
  default: {
    checkPermissions: jest.fn(async () => 'authorized'),
    requestPermissions: jest.fn(async () => 'authorized'),
    saveEvent: jest.fn(async () => 'event-id'),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    setItem: jest.fn(async (k, v) => {
      store.set(k, v);
    }),
    getItem: jest.fn(async k => (store.has(k) ? store.get(k) : null)),
    removeItem: jest.fn(async k => {
      store.delete(k);
    }),
    clear: jest.fn(async () => {
      store.clear();
    }),
    getAllKeys: jest.fn(async () => [...store.keys()]),
    multiGet: jest.fn(async keys => keys.map(k => [k, store.has(k) ? store.get(k) : null])),
    multiSet: jest.fn(async pairs => {
      pairs.forEach(([k, v]) => store.set(k, v));
    }),
    multiRemove: jest.fn(async keys => {
      keys.forEach(k => store.delete(k));
    }),
  };
});

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(async () => ({isConnected: true, isInternetReachable: true})),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: props => React.createElement(View, props),
  };
});
