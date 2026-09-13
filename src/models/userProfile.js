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
