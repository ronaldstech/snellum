import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Calendar,
  MapPin,
  Heart,
  BookOpen,
  Cigarette,
  Wine,
  Star,
  GraduationCap,
  Baby,
  Dog,
  Brain,
  Image,
  MessagesSquare,
  HeartHandshake,
  Globe,
  Crown,
  X,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/filters.css';

const GENDER_OPTIONS = ['Men', 'Women', 'Everyone'];

const LOOKING_FOR_OPTIONS = [
  'Any',
  'Marriage',
  'Long Term Relationship',
  'Short Term Relationship',
  'Casual',
  'Short Term Fun',
  'New Friends',
  'Coffee Date',
  'Learn Cultures',
  'Travel the World',
  'Figuring Out',
];

const COUNTRY_OPTIONS = [
  'Any',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Sweden',
  'Switzerland',
  'Malawi',
  'South Africa',
  'Kenya',
  'Nigeria',
  'Ghana',
  'Brazil',
  'Japan',
  'India',
  'China',
  'Mexico',
];

const FAMILY_PLANS_OPTIONS = ['Any', "Want some day", "Don't want", 'Have and want more', "Have and don't want more", 'Not sure yet'];
const COMMUNICATION_STYLE_OPTIONS = ['Any', 'Big text in person', 'Phone caller', 'Video chatter', 'Bad texter', 'Better in person'];
const LOVE_STYLE_OPTIONS = ['Any', 'Thoughtful gestures', 'Presents', 'Touch', 'Deep talks', 'Time together'];
const RELATIONSHIP_STATUS_OPTIONS = [
  'Any',
  'Single',
  'In a relationship',
  'In an open relationship',
  'Engaged',
  'Married',
  'Divorced',
  'Widowed',
  "It's complicated",
];
const RELIGION_OPTIONS = ['Any', 'Christian', 'Muslim', 'Jewish', 'Orthodox', 'Hindu', 'Buddhist', 'Atheist', 'Spiritual', 'Other'];
const HABIT_OPTIONS = ['Any', 'No', 'Yes', 'Socially'];
const ZODIAC_OPTIONS = [
  'Any',
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const EDUCATION_OPTIONS = ['Any', 'High School', 'College', 'University', 'Post Graduate'];
const KIDS_OPTIONS = ['Any', 'Yes', 'No', 'Maybe', 'Already have'];
const PETS_OPTIONS = ['Any', 'Dog person', 'Cat person', 'Both', 'No pets', 'Other'];
const INTROVERT_EXTROVERT_OPTIONS = ['Any', 'Introvert', 'Extrovert', 'Ambivert'];

const PRIMARY = '#FF4D85';
const SECONDARY = '#4FC3F7';

const DEFAULT_VALUES = {
  minAge: 18,
  maxAge: 60,
  maxDistance: 50,
  gender: 'Everyone',
  ageStrict: false,
  distanceStrict: false,
  relationshipStatus: 'Any',
  religion: 'Any',
  smoking: 'Any',
  drinking: 'Any',
  zodiac: 'Any',
  educationLevel: 'Any',
  onlineOnly: false,
  kids: 'Any',
  pets: 'Any',
  introvertExtrovert: 'Any',
  lookingFor: 'Any',
  maxPhotos: 9,
  hasBio: false,
  familyPlans: 'Any',
  communicationStyle: 'Any',
  loveStyle: 'Any',
  verifiedOnly: false,
  country: 'Any',
};

const LOCAL_TO_FILTER = {
  minAge: 'filterMinAge',
  maxAge: 'filterMaxAge',
  maxDistance: 'filterMaxDistance',
  gender: 'filterGender',
  ageStrict: 'filterAgeStrict',
  distanceStrict: 'filterDistanceStrict',
  relationshipStatus: 'filterRelationshipStatus',
  religion: 'filterReligion',
  smoking: 'filterSmoking',
  drinking: 'filterDrinking',
  zodiac: 'filterZodiac',
  educationLevel: 'filterEducationLevel',
  onlineOnly: 'filterOnlineOnly',
  kids: 'filterKids',
  pets: 'filterPets',
  introvertExtrovert: 'filterIntrovertExtrovert',
  lookingFor: 'filterLookingFor',
  maxPhotos: 'filterMaxPhotos',
  hasBio: 'filterHasBio',
  familyPlans: 'filterFamilyPlans',
  communicationStyle: 'filterCommunicationStyle',
  loveStyle: 'filterLoveStyle',
  verifiedOnly: 'filterVerifiedOnly',
  country: 'filterCountry',
};

function initialValues(profile) {
  const minAge = profile?.filterMinAge ?? 18;
  const maxAge = Math.max(profile?.filterMaxAge ?? 60, minAge);
  return {
    ...DEFAULT_VALUES,
    minAge,
    maxAge,
    maxDistance: profile?.filterMaxDistance ?? DEFAULT_VALUES.maxDistance,
    gender: profile?.filterGender || DEFAULT_VALUES.gender,
    ageStrict: profile?.filterAgeStrict === true,
    distanceStrict: profile?.filterDistanceStrict === true,
    relationshipStatus: profile?.filterRelationshipStatus || 'Any',
    religion: profile?.filterReligion || 'Any',
    smoking: profile?.filterSmoking || 'Any',
    drinking: profile?.filterDrinking || 'Any',
    zodiac: profile?.filterZodiac || 'Any',
    educationLevel: profile?.filterEducationLevel || 'Any',
    onlineOnly: profile?.filterOnlineOnly === true,
    kids: profile?.filterKids || 'Any',
    pets: profile?.filterPets || 'Any',
    introvertExtrovert: profile?.filterIntrovertExtrovert || 'Any',
    lookingFor: profile?.filterLookingFor || 'Any',
    maxPhotos: profile?.filterMaxPhotos ?? DEFAULT_VALUES.maxPhotos,
    hasBio: profile?.filterHasBio === true,
    familyPlans: profile?.filterFamilyPlans || 'Any',
    communicationStyle: profile?.filterCommunicationStyle || 'Any',
    loveStyle: profile?.filterLoveStyle || 'Any',
    verifiedOnly: profile?.filterVerifiedOnly === true,
    country: profile?.filterCountry || 'Any',
  };
}

export default function DiscoveryFiltersPanel({ onClose, onOpenPremium, mode = 'modal' }) {
  const { userProfile, showToast, saveDiscoveryFilters } = useAuth();
  const [filters, setFilters] = useState(() => initialValues(userProfile));
  const [isSaving, setIsSaving] = useState(false);

  const isSidebar = mode === 'sidebar';

  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setFilters(DEFAULT_VALUES);
    showToast('Filters reset to defaults.', 'info');
  };

  const activeCount = useMemo(
    () => Object.keys(DEFAULT_VALUES).filter((key) => filters[key] !== DEFAULT_VALUES[key]).length,
    [filters],
  );

  const isPremium = userProfile?.isPremium === true;
  const isElite = isPremium && (userProfile?.isElite === true || userProfile?.subscriptionPlan === 'elite');

  const requestUpgrade = (tierName = 'Premium') => {
    if (onOpenPremium) {
      onOpenPremium(tierName);
      return;
    }
    showToast(`${tierName} is required for advanced filters.`, 'info');
  };

  const handleApply = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(LOCAL_TO_FILTER).map(([key, field]) => [field, filters[key]]),
      );
      await saveDiscoveryFilters(payload);
      showToast('Discovery filters applied.', 'success');
      if (onClose) onClose();
    } catch (e) {
      console.error('Error applying filters:', e);
      showToast('Could not save filters. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {mode === 'modal' && <div className="filters-pull-tab" />}

      {/* Header */}
      <header className={`filters-header ${isSidebar ? 'filters-header-sidebar' : ''}`}>
        <h2>Discovery Filters</h2>
        {isSidebar ? (
          <div className="filters-header-actions">
            <button type="button" className="filters-reset-btn" onClick={reset} title="Reset to defaults">
              <RotateCcw size={13} /> Reset
            </button>
            <span className={`filters-active-count ${activeCount > 0 ? 'has-filters' : ''}`}>
              {activeCount} active
            </span>
          </div>
        ) : (
          <button type="button" className="filters-close" onClick={onClose} aria-label="Close filters"><X size={16} /></button>
        )}
      </header>

      {/* Scrollable sections */}
      <div className="filters-scroll">
        <FilterSectionTitle>Basic Demographics</FilterSectionTitle>

        {/* Show me gender */}
        <FilterGroupCard>
          <FilterRowTitle icon={Users} color={PRIMARY}>Show me</FilterRowTitle>
          <div className="filter-segmented" role="group" aria-label="Show me">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`filter-seg-option ${filters.gender === option ? 'active' : ''}`}
                onClick={() => update('gender', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </FilterGroupCard>

        {/* Looking For */}
        <FilterSelectCard
          icon={Search}
          title="Looking For"
          value={filters.lookingFor}
          options={LOOKING_FOR_OPTIONS}
          color={PRIMARY}
          onChange={(val) => update('lookingFor', val)}
        />

        {/* Age Range */}
        <FilterGroupCard>
          <FilterRowTitle icon={Calendar} color={PRIMARY} trailing={`${filters.minAge} - ${filters.maxAge}`} trailingColor={PRIMARY}>Age Range</FilterRowTitle>
          <DualRangeSlider
            min={18}
            max={99}
            minValue={filters.minAge}
            maxValue={filters.maxAge}
            color={PRIMARY}
            onChange={({ start, end }) => {
              update('minAge', start);
              update('maxAge', end);
            }}
          />
          <div className="filter-divider" />
          <ToggleRow
            title="Strict Age Match"
            subtitle="We'll slip in a few outliers if you run out."
            value={filters.ageStrict}
            activeColor={PRIMARY}
            onChange={(val) => update('ageStrict', val)}
          />
        </FilterGroupCard>

        {/* Maximum Distance */}
        <FilterGroupCard>
          <FilterRowTitle icon={MapPin} color={SECONDARY} trailing={`${Math.round(filters.maxDistance)} km`} trailingColor={SECONDARY}>Maximum Distance</FilterRowTitle>
          <SingleSlider
            min={1}
            max={150}
            value={filters.maxDistance}
            color={SECONDARY}
            onChange={(val) => update('maxDistance', val)}
          />
          <div className="filter-divider" />
          <ToggleRow
            title="Strict Distance Match"
            subtitle="We'll suggest folks further away if you run out."
            value={filters.distanceStrict}
            activeColor={SECONDARY}
            onChange={(val) => update('distanceStrict', val)}
          />
        </FilterGroupCard>

        <FilterSectionTitle>Premium Advanced Filters</FilterSectionTitle>

        <FilterSelectCard icon={Heart} title="Relationship Status" value={filters.relationshipStatus} options={RELATIONSHIP_STATUS_OPTIONS} color="#EF4444" onChange={(val) => update('relationshipStatus', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />
        <FilterSelectCard icon={BookOpen} title="Religion / Beliefs" value={filters.religion} options={RELIGION_OPTIONS} color="#F59E0B" onChange={(val) => update('religion', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />
        <FilterSelectCard icon={Cigarette} title="Smoking Habits" value={filters.smoking} options={HABIT_OPTIONS} color="#FB923C" onChange={(val) => update('smoking', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />
        <FilterSelectCard icon={Wine} title="Drinking Habits" value={filters.drinking} options={HABIT_OPTIONS} color="#A855F7" onChange={(val) => update('drinking', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />
        <FilterSelectCard icon={Star} title="Zodiac Sign" value={filters.zodiac} options={ZODIAC_OPTIONS} color="#22D3EE" onChange={(val) => update('zodiac', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />
        <FilterSelectCard icon={GraduationCap} title="Education level" value={filters.educationLevel} options={EDUCATION_OPTIONS} color="#A3E635" onChange={(val) => update('educationLevel', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />

        <FilterGroupCard>
          <ToggleRow
            title="Online Now Only"
            subtitle="Only show users who are currently active."
            value={filters.onlineOnly}
            activeColor="#22C55E"
            onChange={(val) => update('onlineOnly', val)}
            locked={!isPremium}
            onLockedClick={() => requestUpgrade('Premium')}
          />
        </FilterGroupCard>

        <FilterSelectCard icon={Baby} title="Kids / Children" value={filters.kids} options={KIDS_OPTIONS} color="#EC4899" onChange={(val) => update('kids', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />
        <FilterSelectCard icon={Dog} title="Pets" value={filters.pets} options={PETS_OPTIONS} color="#8B5E3C" onChange={(val) => update('pets', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />
        <FilterSelectCard icon={Brain} title="Personality Type" value={filters.introvertExtrovert} options={INTROVERT_EXTROVERT_OPTIONS} color="#2DD4BF" onChange={(val) => update('introvertExtrovert', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />

        <FilterGroupCard>
          <FilterRowTitle icon={Image} color="#3B82F6" trailing={filters.maxPhotos >= 9 ? 'Any' : `${filters.maxPhotos} photos`} trailingColor="#3B82F6" locked={!isPremium}>Max Photos Needed</FilterRowTitle>
          <SingleSlider
            min={1}
            max={9}
            value={filters.maxPhotos}
            step={1}
            color="#3B82F6"
            onChange={(val) => update('maxPhotos', val)}
            disabled={!isPremium}
            onLockedClick={() => requestUpgrade('Premium')}
          />
        </FilterGroupCard>

        <FilterGroupCard>
          <ToggleRow
            title="Must Have a Bio"
            subtitle="Only show users who have written a bio."
            value={filters.hasBio}
            activeColor={PRIMARY}
            onChange={(val) => update('hasBio', val)}
            locked={!isPremium}
            onLockedClick={() => requestUpgrade('Premium')}
          />
        </FilterGroupCard>

        <FilterSelectCard icon={Users} title="Family Plans" value={filters.familyPlans} options={FAMILY_PLANS_OPTIONS} color="#6366F1" onChange={(val) => update('familyPlans', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />
        <FilterSelectCard icon={MessagesSquare} title="Communication Style" value={filters.communicationStyle} options={COMMUNICATION_STYLE_OPTIONS} color="#7C3AED" onChange={(val) => update('communicationStyle', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />
        <FilterSelectCard icon={HeartHandshake} title="Love Style" value={filters.loveStyle} options={LOVE_STYLE_OPTIONS} color="#F43F5E" onChange={(val) => update('loveStyle', val)} locked={!isPremium} onLockedClick={() => requestUpgrade('Premium')} />

        <FilterSectionTitle>Elite Advanced Filters</FilterSectionTitle>

        <FilterGroupCard>
          <ToggleRow
            title="Verified Profiles Only"
            subtitle="Only show users who have verified their identity."
            value={filters.verifiedOnly}
            activeColor={PRIMARY}
            onChange={(val) => update('verifiedOnly', val)}
            locked={!isElite}
            tierName="Elite"
            onLockedClick={() => requestUpgrade('Elite')}
          />
        </FilterGroupCard>

        <FilterSelectCard icon={Globe} title="Partner Country (Green Card)" value={filters.country} options={COUNTRY_OPTIONS} color="#22C55E" onChange={(val) => update('country', val)} locked={!isElite} tierName="Elite" onLockedClick={() => requestUpgrade('Elite')} />

        <div style={{ height: 8 }} />
      </div>

      {/* Apply bar */}
      <footer className="filters-apply-bar">
        <button type="button" className="btn-primary filters-apply-btn" onClick={handleApply} disabled={isSaving}>
          {isSaving ? 'Applying…' : `Apply Filters${activeCount > 0 ? ` (${activeCount})` : ''}`}
        </button>
      </footer>
    </>
  );
}

function FilterSectionTitle({ children }) {
  return <div className="filter-section-label">{children}</div>;
}

function FilterGroupCard({ children }) {
  return <div className="filter-group-card">{children}</div>;
}

function FilterRowTitle({ icon: Icon, color, trailing, trailingColor, locked, children }) {
  return (
    <div className="filter-row-title">
      <span className="filter-row-title-main">
        <Icon size={18} color={color} />
        <strong>{children}</strong>
        {locked && <Crown size={13} color="#F59E0B" aria-label="Premium only" />}
      </span>
      {trailing != null && <span className="filter-value-pill" style={{ color: trailingColor }}>{trailing}</span>}
    </div>
  );
}

function ToggleRow({ title, subtitle, value, activeColor, onChange, locked, tierName = 'Premium', onLockedClick }) {
  const handlePress = locked ? onLockedClick : () => onChange(!value);
  return (
    <div className={`filter-toggle-row ${locked ? 'locked' : ''}`} onClick={handlePress} role="switch" aria-checked={value} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePress(); } }}>
      <span className="filter-toggle-label">
        <strong>{title}</strong>
        {locked && <Crown size={12} color="#F59E0B" />}
        {locked && <span className="filter-tier-badge">{tierName.toUpperCase()}</span>}
        {(!value || locked) && <small>{subtitle}</small>}
      </span>
      <button
        type="button"
        className={`filter-switch ${value && !locked ? 'on' : ''}`}
        style={value && !locked ? { '--switch-color': activeColor } : {}}
        onClick={(e) => { e.stopPropagation(); handlePress(); }}
        disabled={locked}
        aria-label={title}
      >
        <span className="filter-switch-knob" />
      </button>
    </div>
  );
}

function FilterSelectCard({ icon: Icon, title, value, options, color, onChange, locked, tierName = 'Premium', onLockedClick }) {
  return (
    <div className={`filter-group-card filter-select-card ${locked ? 'locked' : ''}`} onClick={locked ? onLockedClick : undefined}>
      <span className="filter-row-title-main">
        <Icon size={18} color={locked ? '#F59E0B' : color} />
        <strong>{title}</strong>
        {locked && (
          <>
            <Crown size={13} color="#F59E0B" />
            <span className="filter-tier-badge">{tierName.toUpperCase()}</span>
          </>
        )}
      </span>
      <select
        className="filter-select"
        value={value}
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
        aria-label={title}
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function DualRangeSlider({ min, max, minValue, maxValue, color, onChange }) {
  return (
    <div className="range-slider-wrap" style={{ '--slider-color': color }}>
      <input
        type="range"
        className="range-slider-input range-min"
        min={min}
        max={max}
        value={minValue}
        aria-label="Minimum age"
        onChange={(e) => {
          const next = Math.min(Number(e.target.value), maxValue - 1);
          onChange({ start: next, end: Math.max(next, maxValue) });
        }}
      />
      <input
        type="range"
        className="range-slider-input range-max"
        min={min}
        max={max}
        value={maxValue}
        aria-label="Maximum age"
        onChange={(e) => {
          const next = Math.max(Number(e.target.value), minValue + 1);
          onChange({ start: Math.min(next, minValue), end: next });
        }}
      />
    </div>
  );
}

function SingleSlider({ min, max, value, color, onChange, step = 1, disabled = false, onLockedClick }) {
  return (
    <div
      className="range-slider-wrap single"
      style={{ '--slider-color': color, opacity: disabled ? 0.55 : 1, cursor: disabled ? 'not-allowed' : 'default' }}
      onClick={disabled ? onLockedClick : undefined}
    >
      <input
        type="range"
        className="range-slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label="Slider"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}