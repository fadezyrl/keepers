import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showAlert, showToast} from '../../alerts';
import {
  Avatar,
  BackHeader,
  BusyOverlay,
  Button,
  Icon,
  ImagePickerSheet,
  Input,
  RemoteImage,
  Screen,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {uploadProfileImage} from '../../utils/mediaUpload';
import {FieldErrors, validateProfile} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export function EditProfileScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {user, updateProfile} = useApp();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    nationality: user.nationality,
    gender: user.gender,
    emergencyContact: user.emergencyContact,
    manufacturer: user.vehicle.manufacturer,
    model: user.vehicle.model,
    year: user.vehicle.year,
    vin: user.vehicle.vin,
    instagram: user.social.instagram,
    facebook: user.social.facebook,
    tiktok: user.social.tiktok,
  });
  const [avatar, setAvatar] = useState(user.avatar);
  const [vehicleImage, setVehicleImage] = useState(user.vehicle.image);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingVehicle, setUploadingVehicle] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm(prev => ({...prev, [key]: value}));

  const onPickAvatar = async (file: {
    uri: string;
    name: string;
    type: string;
  }) => {
    setUploadingAvatar(true);
    setAvatarOpen(false);
    try {
      const url = await uploadProfileImage(file, 'avatar');
      setAvatar(url);
      // Persist immediately so refresh / leaving the screen does not drop the photo
      await updateProfile({
        ...user,
        avatar: url,
      });
      showToast({type: 'success', message: 'Profile photo updated'});
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Upload failed',
        message:
          error instanceof Error
            ? error.message
            : 'Could not upload profile photo.',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onPickVehicle = async (file: {
    uri: string;
    name: string;
    type: string;
  }) => {
    setUploadingVehicle(true);
    setVehicleOpen(false);
    try {
      const url = await uploadProfileImage(file, 'vehicle');
      setVehicleImage(url);
      await updateProfile({
        ...user,
        avatar,
        vehicle: {
          ...user.vehicle,
          image: url,
        },
      });
      showToast({type: 'success', message: 'Vehicle photo updated'});
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Upload failed',
        message:
          error instanceof Error
            ? error.message
            : 'Could not upload vehicle photo.',
      });
    } finally {
      setUploadingVehicle(false);
    }
  };

  const busyMessage = uploadingAvatar
    ? 'Uploading profile photo…'
    : uploadingVehicle
      ? 'Uploading car image…'
      : saving
        ? 'Saving profile…'
        : 'Please wait…';
  const isBusy = uploadingAvatar || uploadingVehicle || saving;

  const onSave = async () => {
    const nextErrors = validateProfile({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
    });
    if (!form.username.trim()) {
      nextErrors.username = 'Username is required';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        ...user,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim().replace(/^@/, ''),
        email: form.email.trim(),
        phone: form.phone.trim(),
        nationality: form.nationality.trim(),
        gender: form.gender.trim(),
        emergencyContact: form.emergencyContact.trim(),
        avatar,
        vehicle: {
          ...user.vehicle,
          manufacturer: form.manufacturer.trim(),
          model: form.model.trim(),
          year: form.year.trim(),
          vin: form.vin.trim(),
          image: vehicleImage,
        },
        social: {
          instagram: form.instagram.trim(),
          facebook: form.facebook.trim(),
          tiktok: form.tiktok.trim(),
        },
      });
      showToast({
        type: 'success',
        message: 'Profile saved',
      });
      navigation.goBack();
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Could not save profile',
        message:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Profile</Text>
      <Text style={[styles.title, {color: theme.text}]}>Edit profile</Text>

      <Pressable
        onPress={() => !isBusy && setAvatarOpen(true)}
        style={styles.avatarBlock}
        disabled={isBusy}
        accessibilityRole="button"
        accessibilityLabel="Change profile photo">
        <View style={styles.avatarWrap}>
          <Avatar uri={avatar} size={96} />
          <View style={[styles.cameraBadge, {backgroundColor: theme.inverse}]}>
            <Icon name="camera" size={14} color={theme.onInverse} />
          </View>
        </View>
        <Text style={[styles.changePhoto, {color: theme.text}]}>
          {uploadingAvatar ? 'Uploading photo…' : 'Change profile photo'}
        </Text>
      </Pressable>

      <Text style={[styles.section, {color: theme.textMuted}]}>Personal</Text>
      <Input
        label="First name"
        value={form.firstName}
        onChangeText={v => set('firstName', v)}
        error={errors.firstName}
      />
      <Input
        label="Last name"
        value={form.lastName}
        onChangeText={v => set('lastName', v)}
        error={errors.lastName}
      />
      <Input
        label="Username"
        autoCapitalize="none"
        value={form.username}
        onChangeText={v => set('username', v)}
        error={errors.username}
      />
      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={v => set('email', v)}
        error={errors.email}
      />
      <Input
        label="Phone"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={v => set('phone', v)}
        error={errors.phone}
      />
      <Input
        label="Nationality"
        value={form.nationality}
        onChangeText={v => set('nationality', v)}
      />
      <Input
        label="Gender"
        value={form.gender}
        onChangeText={v => set('gender', v)}
      />
      <Input
        label="Emergency contact"
        value={form.emergencyContact}
        onChangeText={v => set('emergencyContact', v)}
      />

      <Text style={[styles.section, {color: theme.textMuted}]}>Security</Text>
      <Pressable
        onPress={() => navigation.navigate('ForgotPasswordModal')}
        style={[styles.linkRow, {borderColor: theme.border}]}>
        <View style={styles.linkLeft}>
          <Icon name="lock" size={16} color={theme.text} />
          <Text style={[styles.linkLabel, {color: theme.text}]}>
            Change password
          </Text>
        </View>
        <Icon name="chevron-right" size={16} color={theme.textMuted} />
      </Pressable>

      <Text style={[styles.section, {color: theme.textMuted}]}>Vehicle</Text>
      <Pressable
        onPress={() => !isBusy && setVehicleOpen(true)}
        disabled={isBusy}
        accessibilityRole="button"
        accessibilityLabel="Change car image">
        <RemoteImage uri={vehicleImage} style={styles.vehicleImage} />
        <Text style={[styles.changePhoto, {color: theme.text, marginBottom: spacing.md}]}>
          {uploadingVehicle ? 'Uploading car image…' : 'Change car image'}
        </Text>
      </Pressable>
      <Input
        label="Manufacturer"
        value={form.manufacturer}
        onChangeText={v => set('manufacturer', v)}
      />
      <Input
        label="Model"
        value={form.model}
        onChangeText={v => set('model', v)}
      />
      <Input
        label="Year"
        value={form.year}
        onChangeText={v => set('year', v)}
      />
      <Input label="VIN" value={form.vin} onChangeText={v => set('vin', v)} />

      <Text style={[styles.section, {color: theme.textMuted}]}>Social</Text>
      <Input
        label="Facebook"
        value={form.facebook}
        onChangeText={v => set('facebook', v)}
        icon="facebook"
      />
      <Input
        label="Instagram"
        value={form.instagram}
        onChangeText={v => set('instagram', v)}
        icon="instagram"
      />
      <Input
        label="TikTok"
        value={form.tiktok}
        onChangeText={v => set('tiktok', v)}
        icon="tiktok"
      />

      <View style={styles.actions}>
        <Button label="Save changes" onPress={onSave} loading={saving} />
        <Button
          label="Cancel"
          onPress={() => navigation.goBack()}
          variant="ghost"
          style={{marginTop: spacing.sm}}
        />
      </View>

      <ImagePickerSheet
        visible={avatarOpen}
        title="Profile photo"
        onSelect={onPickAvatar}
        onClose={() => setAvatarOpen(false)}
        uploading={uploadingAvatar}
      />
      <ImagePickerSheet
        visible={vehicleOpen}
        title="Car image"
        onSelect={onPickVehicle}
        onClose={() => setVehicleOpen(false)}
        uploading={uploadingVehicle}
      />
      <BusyOverlay visible={isBusy} message={busyMessage} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {...typography.hero, marginTop: spacing.xs, marginBottom: spacing.md},
  avatarBlock: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    width: 96,
    height: 96,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: {
    ...typography.label,
    marginTop: spacing.sm,
  },
  section: {
    ...typography.section,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  linkLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  linkLabel: {...typography.body},
  vehicleImage: {
    width: '100%',
    height: 160,
    marginBottom: spacing.xs,
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
});
