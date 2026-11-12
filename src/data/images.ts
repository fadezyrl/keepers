/**
 * Central image registry for Keepers visual content.
 * Client photography + brand marks live under assets/.
 */

import {Image} from 'react-native';

const localUri = (asset: number) => {
  const resolved = Image.resolveAssetSource(asset);
  return resolved?.uri ?? '';
};

export const images = {
  brand: {
    logoLight: localUri(require('../../assets/brand/logo-light.png')),
    logoDark: localUri(require('../../assets/brand/logo-dark.png')),
  },
  hero: {
    home: localUri(require('../../assets/images/heroes/home.jpg')),
    about: localUri(require('../../assets/images/heroes/about.jpg')),
    splash: localUri(require('../../assets/images/heroes/splash.jpg')),
    auth: localUri(require('../../assets/images/heroes/auth.jpg')),
  },
  trips: {
    liwa: localUri(require('../../assets/images/trips/liwa.jpg')),
    hatta: localUri(require('../../assets/images/trips/hatta.jpg')),
    fossil: localUri(require('../../assets/images/trips/fossil.jpg')),
    jebel: localUri(require('../../assets/images/trips/jebel.jpg')),
    emptyQuarter: localUri(require('../../assets/images/trips/empty-quarter.jpg')),
    nightDrive: localUri(require('../../assets/images/trips/night-drive.jpg')),
  },
  events: {
    meetup: localUri(require('../../assets/images/events/meetup.jpg')),
    workshop: localUri(require('../../assets/images/events/workshop.jpg')),
    gala: localUri(require('../../assets/images/events/gala.jpg')),
  },
  gallery: [
    localUri(require('../../assets/images/gallery/01-home.jpg')),
    localUri(require('../../assets/images/gallery/02-auth.jpg')),
    localUri(require('../../assets/images/gallery/03-hatta.jpg')),
    localUri(require('../../assets/images/gallery/04-liwa.jpg')),
    localUri(require('../../assets/images/gallery/05-night.jpg')),
    localUri(require('../../assets/images/gallery/06-jebel.jpg')),
    localUri(require('../../assets/images/gallery/07-fossil.jpg')),
    localUri(require('../../assets/images/gallery/08-empty.jpg')),
    localUri(require('../../assets/images/gallery/09-brand.jpg')),
  ],
  team: {
    // Prefer varied adventure stills over repeating a single personal portrait.
    lead: localUri(require('../../assets/images/gallery/03-hatta.jpg')),
    ops: localUri(require('../../assets/images/gallery/04-liwa.jpg')),
    guide: localUri(require('../../assets/images/gallery/05-night.jpg')),
    media: localUri(require('../../assets/images/gallery/06-jebel.jpg')),
  },
  avatars: {
    user: localUri(require('../../assets/images/gallery/09-brand.jpg')),
    a: localUri(require('../../assets/images/gallery/03-hatta.jpg')),
    b: localUri(require('../../assets/images/gallery/04-liwa.jpg')),
    c: localUri(require('../../assets/images/gallery/07-fossil.jpg')),
    d: localUri(require('../../assets/images/gallery/08-empty.jpg')),
  },
  // Prefer diverse trip photography; avoid repeating one personal vehicle across screens.
  vehicle: localUri(require('../../assets/images/trips/hatta.jpg')),
  sponsors: {
    jeep: 'jeep',
    toyota: 'toyota',
    ford: 'ford',
    nissan: 'nissan',
    hyundai: 'hyundai',
    kia: 'kia',
  },
} as const;
