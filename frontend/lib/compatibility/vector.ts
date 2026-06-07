import { UserProfile } from '@/lib/services/auth';
import { tokenizeInterests } from './tokenizers';
import { PreferenceVector } from './types';
import { COMPATIBILITY_WEIGHTS } from './weights';

function addCategoricalFeature(features: PreferenceVector, name: string, value: string | null | undefined, weight: number) {
  if (value) {
    features[`${name}:${value.trim().toLowerCase()}`] = weight;
  }
}

export function buildPreferenceVector(user: UserProfile) {
  const features: PreferenceVector = {};

  addCategoricalFeature(features, 'diet', user.diet, COMPATIBILITY_WEIGHTS.diet);
  addCategoricalFeature(features, 'occupation', user.occupation, COMPATIBILITY_WEIGHTS.occupation);
  addCategoricalFeature(features, 'cleanliness', user.cleanliness, COMPATIBILITY_WEIGHTS.cleanliness);
  addCategoricalFeature(features, 'social_interaction', user.social_interaction, COMPATIBILITY_WEIGHTS.socialInteraction);
  addCategoricalFeature(features, 'city', user.city, COMPATIBILITY_WEIGHTS.city);
  addCategoricalFeature(features, 'state', user.state, COMPATIBILITY_WEIGHTS.state);

  if (typeof user.smoking_preference === 'boolean') {
    features[`smoking:${user.smoking_preference}`] = COMPATIBILITY_WEIGHTS.smokingPreference;
  }

  if (typeof user.min_budget === 'number') {
    features.min_budget = (user.min_budget / 5000) * COMPATIBILITY_WEIGHTS.budget;
  }

  if (typeof user.max_budget === 'number') {
    features.max_budget = (user.max_budget / 5000) * COMPATIBILITY_WEIGHTS.budget;
  }

  if (typeof user.quiet_hours_from === 'number') {
    features.quiet_hours_from = (user.quiet_hours_from / 23) * COMPATIBILITY_WEIGHTS.quietHours;
  }

  if (typeof user.quiet_hours_to === 'number') {
    features.quiet_hours_to = (user.quiet_hours_to / 23) * COMPATIBILITY_WEIGHTS.quietHours;
  }

  (user.allergies || []).forEach((allergy) => {
    features[`allergy:${allergy.trim().toLowerCase()}`] = COMPATIBILITY_WEIGHTS.allergies;
  });

  tokenizeInterests(user.interests).forEach((interest) => {
    features[`interest:${interest}`] = COMPATIBILITY_WEIGHTS.interests;
  });

  return features;
}
