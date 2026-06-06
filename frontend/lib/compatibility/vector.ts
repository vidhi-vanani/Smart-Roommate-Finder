import { UserProfile } from '@/lib/services/auth';
import { tokenizeInterests } from './tokenizers';
import { PreferenceVector } from './types';

function addCategoricalFeature(features: PreferenceVector, name: string, value?: string | null) {
  if (value) {
    features[`${name}:${value.toLowerCase()}`] = 1;
  }
}

export function buildPreferenceVector(user: UserProfile) {
  const features: PreferenceVector = {};

  addCategoricalFeature(features, 'diet', user.diet);
  addCategoricalFeature(features, 'occupation', user.occupation);
  addCategoricalFeature(features, 'cleanliness', user.cleanliness);
  addCategoricalFeature(features, 'social_interaction', user.social_interaction);
  addCategoricalFeature(features, 'state', user.state);

  if (typeof user.smoking_preference === 'boolean') {
    features[`smoking:${user.smoking_preference}`] = 1;
  }

  if (typeof user.min_budget === 'number') {
    features.min_budget = user.min_budget / 5000;
  }

  if (typeof user.max_budget === 'number') {
    features.max_budget = user.max_budget / 5000;
  }

  if (typeof user.quiet_hours_from === 'number') {
    features.quiet_hours_from = user.quiet_hours_from / 23;
  }

  if (typeof user.quiet_hours_to === 'number') {
    features.quiet_hours_to = user.quiet_hours_to / 23;
  }

  (user.allergies || []).forEach((allergy) => {
    features[`allergy:${allergy.toLowerCase()}`] = 1;
  });

  tokenizeInterests(user.interests).forEach((interest) => {
    features[`interest:${interest}`] = 1;
  });

  return features;
}
