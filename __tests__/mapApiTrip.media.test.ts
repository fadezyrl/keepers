import {mapApiTrip} from '../src/api/keepersApi';

describe('mapApiTrip media + registration fields', () => {
  it('maps media items and participant registration metadata', () => {
    const trip = mapApiTrip({
      id: 't1',
      title: 'Desert Dawn',
      destination: 'Liwa',
      date: '2026-12-01',
      coverImage: 'https://cdn.example/cover.jpg',
      gallery: ['https://cdn.example/g1.jpg'],
      media: [
        {
          id: 'm1',
          media_type: 'image',
          public_url: 'https://cdn.example/g1.jpg',
        },
        {
          id: 'm2',
          media_type: 'video',
          public_url: 'https://cdn.example/v1.mp4',
        },
      ],
      maxParticipants: 10,
      registeredCount: 1,
      pendingCount: 2,
      participants: [
        {
          id: 'u1',
          name: 'Alex Rider',
          avatar: '',
          vehicle: 'Land Cruiser',
          registrationId: 'r1',
          registrationStatus: 'pending',
          registeredAt: '2026-11-01T10:00:00.000Z',
          readinessChecklist: [
            {
              id: 'req1',
              code: 'fluids_optimum',
              label: 'All car fluids are at optimum level',
              selected: true,
              submittedAt: '2026-11-01T10:00:00.000Z',
            },
            {
              id: 'req2',
              code: 'drinking_water',
              label: 'Drinking water',
              selected: false,
            },
          ],
        },
      ],
      status: 'upcoming',
      organizer: {name: 'Marshall', role: 'Marshall', avatar: ''},
      location: {label: 'Liwa', latitude: 0, longitude: 0},
    });

    expect(trip.category).toBe('Trips & Events');
    expect(trip.videos).toEqual(['https://cdn.example/v1.mp4']);
    expect(trip.mediaItems).toEqual([
      {
        id: 'm1',
        mediaType: 'image',
        url: 'https://cdn.example/g1.jpg',
        caption: null,
      },
      {
        id: 'm2',
        mediaType: 'video',
        url: 'https://cdn.example/v1.mp4',
        caption: null,
      },
    ]);
    expect(trip.pendingCount).toBe(2);
    expect(trip.participants[0]).toMatchObject({
      id: 'u1',
      registrationId: 'r1',
      registrationStatus: 'pending',
      registeredAt: '2026-11-01T10:00:00.000Z',
    });
    expect(trip.participants[0].readinessChecklist).toEqual([
      {
        id: 'req1',
        code: 'fluids_optimum',
        label: 'All car fluids are at optimum level',
        selected: true,
        submittedAt: '2026-11-01T10:00:00.000Z',
      },
      {
        id: 'req2',
        code: 'drinking_water',
        label: 'Drinking water',
        selected: false,
        submittedAt: undefined,
      },
    ]);
  });
});
