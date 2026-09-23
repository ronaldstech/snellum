/**
 * UserProfile class and mapper matching Flutter user_profile_model.dart
 */
export class UserProfile {
  constructor(data = {}) {
    this.uid = data.uid || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.email = data.email || '';
    this.bio = data.bio || '';
    this.gender = data.gender || '';
    this.interestedIn = data.interestedIn || '';
    this.location = data.location || '';
    this.photos = Array.isArray(data.photos) ? data.photos : [];
    this.dob = data.dob || null;
    this.age = data.age || this.calculateAge(data.dob);
    this.isVerified = data.isVerified === true || data.verificationStatus === 'verified';
    this.verificationStatus = data.verificationStatus || 'unverified';
    this.isEmailVerified = data.isEmailVerified === true;
    this.sparks = Number(data.credits ?? data.sparks ?? 100);
    this.isPremium = data.isPremium === true;
    this.subscriptionPlan = data.subscriptionPlan || '';
    this.isElite = data.isElite === true || data.subscriptionPlan === 'elite';
    this.isOnline = data.isOnline === true;
    this.isBoosted = data.isBoosted === true;
    this.hideProfile = data.hideProfile === true;
    this.premiumExpiry = data.premiumExpiry || null;
    this.premiumPurchasedAt = data.premiumPurchasedAt || null;
    this.isPlanMonthly = data.isPlanMonthly != null ? data.isPlanMonthly === true : null;
    this.queuedSubscriptions = Array.isArray(data.queuedSubscriptions) ? data.queuedSubscriptions : [];
    this.boostExpiry = data.boostExpiry || null;
    this.latitude = data.latitude != null && !isNaN(Number(data.latitude)) ? Number(data.latitude) : null;
    this.longitude = data.longitude != null && !isNaN(Number(data.longitude)) ? Number(data.longitude) : null;
    this.countryCode = data.countryCode || '';
    this.filterMinAge = data.filterMinAge != null ? Number(data.filterMinAge) : 18;
    this.filterMaxAge = data.filterMaxAge != null ? Number(data.filterMaxAge) : 60;
    this.filterMaxDistance = data.filterMaxDistance != null ? Number(data.filterMaxDistance) : 50;
    this.filterGender = data.filterGender || 'Everyone';
    this.filterAgeStrict = data.filterAgeStrict === true;
    this.filterDistanceStrict = data.filterDistanceStrict === true;
    this.filterRelationshipStatus = data.filterRelationshipStatus || 'Any';
    this.filterReligion = data.filterReligion || 'Any';
    this.filterSmoking = data.filterSmoking || 'Any';
    this.filterDrinking = data.filterDrinking || 'Any';
    this.filterZodiac = data.filterZodiac || 'Any';
    this.filterEducationLevel = data.filterEducationLevel || 'Any';
    this.filterVerifiedOnly = data.filterVerifiedOnly === true;
    this.filterOnlineOnly = data.filterOnlineOnly === true;
    this.filterKids = data.filterKids || 'Any';
    this.filterPets = data.filterPets || 'Any';
    this.filterIntrovertExtrovert = data.filterIntrovertExtrovert || 'Any';
    this.filterLookingFor = data.filterLookingFor || 'Any';
    this.filterMaxPhotos = data.filterMaxPhotos != null ? Number(data.filterMaxPhotos) : 9;
    this.filterHasBio = data.filterHasBio === true;
    this.filterFamilyPlans = data.filterFamilyPlans || 'Any';
    this.filterCommunicationStyle = data.filterCommunicationStyle || 'Any';
    this.filterLoveStyle = data.filterLoveStyle || 'Any';
    this.filterCountry = data.filterCountry || 'Any';
    this.occupation = data.occupation || '';
    this.industry = data.industry || '';
    this.educationLevel = data.educationLevel || '';
    this.school = data.school || '';
    this.height = data.height || '';
    this.bodyType = data.bodyType || '';
    this.relationshipStatus = data.relationshipStatus || '';
    this.religion = data.religion || '';
    this.languages = Array.isArray(data.languages) ? data.languages : [];
    this.smoking = data.smoking || '';
    this.drinking = data.drinking || '';
    this.fitness = data.fitness || '';
    this.diet = data.diet || '';
    this.sleepingHabits = data.sleepingHabits || '';
    this.pets = data.pets || '';
    this.zodiac = data.zodiac || '';
    this.datingIntent = data.datingIntent || data.category || data.intent || '';
    this.lookingFor = Array.isArray(data.lookingFor)
      ? data.lookingFor
      : (data.lookingFor ? [data.lookingFor] : []);
    this.hobbies = Array.isArray(data.hobbies) ? data.hobbies : [];
    this.musicGenres = Array.isArray(data.musicGenres) ? data.musicGenres : [];
    this.moviesShows = Array.isArray(data.moviesShows) ? data.moviesShows : [];
    this.weekendActivities = Array.isArray(data.weekendActivities) ? data.weekendActivities : [];
    this.introvertExtrovert = data.introvertExtrovert || '';
    this.loveLanguage = data.loveLanguage || '';
    this.communicationStyle = data.communicationStyle || '';
    this.loveStyle = data.loveStyle || '';
    this.mbti = data.mbti || '';
    this.politicalViews = data.politicalViews || '';
    this.coreValues = data.coreValues || '';
    this.wantKids = data.wantKids || '';
    this.familyPlans = data.familyPlans || '';
    this.openToLongDistance = typeof data.openToLongDistance === 'boolean' ? data.openToLongDistance : null;
    this.promptPerfectDate = data.promptPerfectDate || '';
    this.promptFallForYou = data.promptFallForYou || '';
    this.promptGreenFlag = data.promptGreenFlag || '';
    this.promptTwoTruths = data.promptTwoTruths || '';
    this.tags = data.tags || (this.hobbies.length ? this.hobbies : ['Dating', 'Music', 'Travel']);
    this.matchRate = data.matchRate || '96%';
    this.lastSeen = data.lastSeen || null;
  }

  get displayName() {
    return this.firstName || this.email?.split('@')[0] || 'Snellum Member';
  }

  get avatar() {
    if (this.photos && this.photos.length > 0 && this.photos[0]) {
      return this.photos[0];
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
  }

  calculateAge(dob) {
    if (!dob) return 23;
    try {
      const birthDate = dob?.toDate ? dob.toDate() : new Date(dob);
      if (isNaN(birthDate.getTime())) return 23;
      const diff = Date.now() - birthDate.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch {
      return 23;
    }
  }

  toMap() {
    return {
      uid: this.uid,
      firstName: this.firstName,
      phoneNumber: this.phoneNumber,
      email: this.email,
      bio: this.bio,
      gender: this.gender,
      interestedIn: this.interestedIn,
      location: this.location,
      photos: this.photos,
      dob: this.dob,
      isVerified: this.isVerified,
      verificationStatus: this.verificationStatus,
      isEmailVerified: this.isEmailVerified,
      credits: this.sparks,
      isPremium: this.isPremium,
      subscriptionPlan: this.subscriptionPlan,
      isElite: this.isElite,
      isOnline: this.isOnline,
      isBoosted: this.isBoosted,
      hideProfile: this.hideProfile,
      premiumExpiry: this.premiumExpiry,
      premiumPurchasedAt: this.premiumPurchasedAt,
      isPlanMonthly: this.isPlanMonthly,
      queuedSubscriptions: this.queuedSubscriptions,
      boostExpiry: this.boostExpiry,
      latitude: this.latitude,
      longitude: this.longitude,
      countryCode: this.countryCode,
      filterMinAge: this.filterMinAge,
      filterMaxAge: this.filterMaxAge,
      filterMaxDistance: this.filterMaxDistance,
      filterGender: this.filterGender,
      filterAgeStrict: this.filterAgeStrict,
      filterDistanceStrict: this.filterDistanceStrict,
      filterRelationshipStatus: this.filterRelationshipStatus,
      filterReligion: this.filterReligion,
      filterSmoking: this.filterSmoking,
      filterDrinking: this.filterDrinking,
      filterZodiac: this.filterZodiac,
      filterEducationLevel: this.filterEducationLevel,
      filterVerifiedOnly: this.filterVerifiedOnly,
      filterOnlineOnly: this.filterOnlineOnly,
      filterKids: this.filterKids,
      filterPets: this.filterPets,
      filterIntrovertExtrovert: this.filterIntrovertExtrovert,
      filterLookingFor: this.filterLookingFor,
      filterMaxPhotos: this.filterMaxPhotos,
      filterHasBio: this.filterHasBio,
      filterFamilyPlans: this.filterFamilyPlans,
      filterCommunicationStyle: this.filterCommunicationStyle,
      filterLoveStyle: this.filterLoveStyle,
      filterCountry: this.filterCountry,
      occupation: this.occupation,
      industry: this.industry,
      educationLevel: this.educationLevel,
      school: this.school,
      height: this.height,
      bodyType: this.bodyType,
      relationshipStatus: this.relationshipStatus,
      religion: this.religion,
      languages: this.languages,
      smoking: this.smoking,
      drinking: this.drinking,
      fitness: this.fitness,
      diet: this.diet,
      sleepingHabits: this.sleepingHabits,
      pets: this.pets,
      zodiac: this.zodiac,
      datingIntent: this.datingIntent,
      lookingFor: this.lookingFor,
      hobbies: this.hobbies,
      musicGenres: this.musicGenres,
      moviesShows: this.moviesShows,
      weekendActivities: this.weekendActivities,
      introvertExtrovert: this.introvertExtrovert,
      loveLanguage: this.loveLanguage,
      communicationStyle: this.communicationStyle,
      loveStyle: this.loveStyle,
      mbti: this.mbti,
      politicalViews: this.politicalViews,
      coreValues: this.coreValues,
      wantKids: this.wantKids,
      familyPlans: this.familyPlans,
      openToLongDistance: this.openToLongDistance,
      promptPerfectDate: this.promptPerfectDate,
      promptFallForYou: this.promptFallForYou,
      promptGreenFlag: this.promptGreenFlag,
      promptTwoTruths: this.promptTwoTruths,
    };
  }

  static fromFirestore(doc) {
    const data = doc.data() || {};
    return new UserProfile({
      ...data,
      uid: doc.id,
    });
  }
}
