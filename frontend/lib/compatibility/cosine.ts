import { UserProfile } from '@/lib/services/auth';
import { buildPreferenceVector } from './vector';

export function calculateCosineCompatibility(currentUser: UserProfile | null, candidate: UserProfile) {
  if (!currentUser) {
    return null;
  }

  const currentVector = buildPreferenceVector(currentUser);
  const candidateVector = buildPreferenceVector(candidate);
  const featureNames = new Set([...Object.keys(currentVector), ...Object.keys(candidateVector)]);

  let dotProduct = 0;
  let currentMagnitude = 0;
  let candidateMagnitude = 0;

  featureNames.forEach((featureName) => {
    const currentValue = currentVector[featureName] || 0;
    const candidateValue = candidateVector[featureName] || 0;
    dotProduct += currentValue * candidateValue;
    currentMagnitude += currentValue * currentValue;
    candidateMagnitude += candidateValue * candidateValue;
  });

  if (!currentMagnitude || !candidateMagnitude) {
    return null;
  }

  return Math.round((dotProduct / (Math.sqrt(currentMagnitude) * Math.sqrt(candidateMagnitude))) * 100);
}

