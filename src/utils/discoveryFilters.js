export const DEFAULT_FILTERS = {
  filterGender: 'Everyone',
  filterMinAge: 18,
  filterMaxAge: 60,
  filterMaxDistance: 50,
  filterAgeStrict: false,
  filterDistanceStrict: false,
  filterRelationshipStatus: 'Any',
  filterReligion: 'Any',
  filterSmoking: 'Any',
  filterDrinking: 'Any',
  filterZodiac: 'Any',
  filterEducationLevel: 'Any',
  filterVerifiedOnly: false,
  filterOnlineOnly: false,
  filterKids: 'Any',
  filterPets: 'Any',
  filterIntrovertExtrovert: 'Any',
  filterLookingFor: 'Any',
  filterMaxPhotos: 9,
  filterHasBio: false,
  filterFamilyPlans: 'Any',
  filterCommunicationStyle: 'Any',
  filterLoveStyle: 'Any',
  filterCountry: 'Any',
};

export function countActiveFilters(profile) {
  if (!profile) return 0;
  let count = 0;
  Object.keys(DEFAULT_FILTERS).forEach((key) => {
    const current = profile[key];
    const defaultValue = DEFAULT_FILTERS[key];
    if (typeof defaultValue === 'boolean') {
      if (current === true) count += 1;
    } else if (current !== undefined && current !== null && current !== defaultValue) {
      count += 1;
    }
  });
  return count;
}