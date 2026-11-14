import {mapMemberDetail} from '../src/api/keepersApi';

describe('mapMemberDetail profile enrichment', () => {
  it('maps ratings, attendance, progression and vehicle fields', () => {
    const member = mapMemberDetail({
      id: 'u1',
      name: 'Alex Rider',
      username: 'alex',
      avatar: 'https://cdn.example/a.jpg',
      membership: 'Intermediate',
      membershipCode: 'intermediate',
      gender: 'male',
      nationality: 'UAE',
      bio: 'Desert weekends',
      createdAt: '2025-01-10T00:00:00.000Z',
      vehicle: {
        manufacturer: 'Jeep',
        model: 'Wrangler',
        year: '2022',
        vin: 'VINONLYSELF',
        image: 'https://cdn.example/v.jpg',
      },
      social: {instagram: '@alex'},
      ratings: {
        ratingsReceived: 3,
        overallAverage: 4.2,
        categoryAverages: [
          {
            criterionId: 'c1',
            code: 'driving',
            name: 'Driving',
            average: 4.5,
            sampleSize: 3,
          },
        ],
      },
      attendance: {total: 7, completedTrips: 5},
      progressionHistory: {
        junior: 1,
        intermediate: 1,
        advanced: 0,
        preMarshall: 0,
        marshall: 0,
      },
    });

    expect(member.gender).toBe('male');
    expect(member.vehicle).toBe('Jeep Wrangler');
    expect(member.vehicleYear).toBe('2022');
    expect(member.vehicleVin).toBe('VINONLYSELF');
    expect(member.vehicleImage).toBe('https://cdn.example/v.jpg');
    expect(member.ratings?.overallAverage).toBe(4.2);
    expect(member.ratings?.categoryAverages[0].name).toBe('Driving');
    expect(member.attendance?.total).toBe(7);
    expect(member.progressionHistory?.junior).toBe(1);
    expect(member.social?.instagram).toBe('@alex');
  });

  it('keeps rating averages null when no ratings exist', () => {
    const member = mapMemberDetail({
      id: 'u2',
      firstName: 'Sam',
      lastName: 'Lee',
      username: 'sam',
      membershipCode: 'junior',
      ratings: {
        ratingsReceived: 0,
        overallAverage: null,
        categoryAverages: [],
      },
      attendance: {total: 0, completedTrips: 0},
      progressionHistory: {
        junior: 0,
        intermediate: 0,
        advanced: 0,
        preMarshall: 0,
        marshall: 0,
      },
    });

    expect(member.ratings?.ratingsReceived).toBe(0);
    expect(member.ratings?.overallAverage).toBeNull();
    expect(member.vehicleVin).toBeUndefined();
  });

  it('omits VIN when backend did not include it', () => {
    const member = mapMemberDetail({
      id: 'u3',
      name: 'Other Member',
      username: 'other',
      membership: 'Junior',
      vehicle: {
        manufacturer: 'Toyota',
        model: 'Prado',
        year: '2019',
        image: 'https://cdn.example/p.jpg',
      },
    });

    expect(member.vehicle).toBe('Toyota Prado');
    expect(member.vehicleVin).toBeUndefined();
  });
});
