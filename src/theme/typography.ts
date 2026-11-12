import {TextStyle} from 'react-native';
import {colors} from './colors';

export const typography = {
  display: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '200',
    letterSpacing: 2,
    color: colors.text,
    textTransform: 'uppercase',
  } as TextStyle,
  hero: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '200',
    letterSpacing: 1.6,
    color: colors.text,
    textTransform: 'uppercase',
  } as TextStyle,
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.3,
    color: colors.text,
  } as TextStyle,
  section: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 3,
    color: colors.stone,
    textTransform: 'uppercase',
  } as TextStyle,
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.15,
    color: colors.stone,
  } as TextStyle,
  body: {
    fontSize: 15,
    lineHeight: 25,
    fontWeight: '400',
    color: colors.text,
  } as TextStyle,
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: colors.stone,
  } as TextStyle,
  label: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '500',
    letterSpacing: 2.2,
    color: colors.stone,
    textTransform: 'uppercase',
  } as TextStyle,
  button: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  } as TextStyle,
};
