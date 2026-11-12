import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors, spacing, typography} from '../theme';
import {Button} from './Button';
import {Icon, IconName} from './Icon';

interface StateProps {
  title: string;
  message?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}

function StateBase({
  title,
  message,
  icon = 'alert',
  actionLabel,
  onAction,
}: StateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRing}>
        <Icon name={icon} size={28} color={colors.black} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.btn}
        />
      ) : null}
    </View>
  );
}

export function LoadingState({label = 'Loading experience...'}: {label?: string}) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.black} />
      <Text style={[styles.message, {marginTop: spacing.md}]}>{label}</Text>
    </View>
  );
}

export function EmptyState(props: StateProps) {
  return <StateBase icon="search" {...props} />;
}

export function ErrorState(props: StateProps) {
  return <StateBase icon="alert" {...props} />;
}

export function OfflineState(props: Omit<StateProps, 'icon'>) {
  return (
    <StateBase
      icon="wifi-off"
      title={props.title || 'No connection'}
      message={
        props.message ||
        'Check your network and try again. Keepers content is temporarily unavailable.'
      }
      actionLabel={props.actionLabel}
      onAction={props.onAction}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.greige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.cream,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    fontSize: 18,
  },
  message: {
    ...typography.subtitle,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  btn: {
    marginTop: spacing.lg,
    minWidth: 180,
  },
});
