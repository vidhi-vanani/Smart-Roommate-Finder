'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  getUserById,
  PreferenceUpdateData,
  updateUserPreferences,
  uploadUserPhoto,
} from '@/lib/services/auth';
import API_BASE_URL from '@/lib/services/apiConfig';
import PreferenceForm from '@/components/preferences/PreferenceForm';
import { PreferenceFormData } from '@/components/preferences/types';

const initialFormData: PreferenceFormData = {
  name: '',
  email: '',
  phone_number: '',
  age: '',
  diet: '',
  allergies: [],
  allergy_other: '',
  description: '',
  street_address: '',
  zip_code: '',
  city: '',
  state: '',
  country: '',
  occupation: '',
  min_budget: '500',
  max_budget: '1000',
  quiet_hours_from: '22',
  quiet_hours_to: '8',
  cleanliness: '',
  interests: '',
  social_interaction: '',
  smoking_preference: 'false',
};

function toText(value: string | number | boolean | null | undefined) {
  return value === null || value === undefined ? '' : String(value);
}

function toNullableNumber(value: string) {
  return value.trim() ? Number(value) : null;
}

function getPhotoPreviewStorageKey(userId?: number | null) {
  return userId ? `smart_roommate_photo_preview_${userId}` : 'smart_roommate_photo_preview';
}

export default function PreferencesPage() {
  const [formData, setFormData] = useState<PreferenceFormData>(initialFormData);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isAllergyMenuOpen, setIsAllergyMenuOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const initials = useMemo(() => {
    const source = formData.name || formData.email || 'User';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [formData.email, formData.name]);

  useEffect(() => {
    const storedUserId = window.localStorage.getItem('smart_roommate_user_id');
    const storedEmail = window.localStorage.getItem('smart_roommate_user_email');
    const previewKey = getPhotoPreviewStorageKey(
      storedUserId ? Number(storedUserId) : null
    );

    if (storedUserId) {
      const storedPreview = window.localStorage.getItem(previewKey);
      if (storedPreview) {
        setPhotoPreview(storedPreview);
      }
    }

    if (!storedUserId) {
      Promise.resolve().then(() => {
        setFormData((current) => ({
          ...current,
          email: storedEmail || '',
        }));
        setLoading(false);
      });
      return;
    }

    const numericUserId = Number(storedUserId);

    Promise.resolve()
      .then(() => {
        setUserId(numericUserId);
        return getUserById(numericUserId);
      })
      .then((user) => {
        setFormData({
          name: user.username,
          email: user.email,
          phone_number: toText(user.phone_number),
          age: toText(user.age),
          diet: toText(user.diet),
          allergies: user.allergies || [],
          allergy_other: '',
          description: toText(user.description),
          street_address: toText(user.street_address),
          zip_code: toText(user.zip_code),
          city: toText(user.city),
          state: toText(user.state),
          country: toText(user.country),
          occupation: toText(user.occupation),
          min_budget: toText(user.min_budget) || '500',
          max_budget: toText(user.max_budget) || '1000',
          quiet_hours_from: toText(user.quiet_hours_from) || '22',
          quiet_hours_to: toText(user.quiet_hours_to) || '8',
          cleanliness: toText(user.cleanliness),
          interests: toText(user.interests),
          social_interaction: toText(user.social_interaction),
          smoking_preference: toText(user.smoking_preference) || 'false',
        });

        if (user.profile_photo) {
          const previewUrl = user.profile_photo.startsWith('http')
            ? user.profile_photo
            : `${API_BASE_URL}${user.profile_photo}`;
          setPhotoPreview(previewUrl);
          window.localStorage.setItem(previewKey, previewUrl);
        }
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load preferences'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => {
      if (name === 'min_budget') {
        const nextMinBudget = Math.min(Number(value), 4900);
        const currentMaxBudget = Number(current.max_budget);
        const minimumMaxBudget = nextMinBudget + 100;

        return {
          ...current,
          min_budget: String(nextMinBudget),
          max_budget:
            minimumMaxBudget > currentMaxBudget
              ? String(minimumMaxBudget)
              : current.max_budget,
        };
      }

      if (name === 'max_budget') {
        const nextMaxBudget = Number(value);
        const currentMinBudget = Number(current.min_budget);
        const maximumMinBudget = nextMaxBudget - 100;

        return {
          ...current,
          min_budget:
            maximumMinBudget < currentMinBudget
              ? String(maximumMinBudget)
              : current.min_budget,
          max_budget: value,
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  };

  const handleAllergyToggle = (
    allergy: string,
    checked: boolean
  ) => {
    setFormData((current) => {
      const nextAllergies = new Set(current.allergies);

      if (allergy === 'No allergies') {
        if (checked) {
          return {
            ...current,
            allergies: ['No allergies'],
            allergy_other: current.allergy_other,
          };
        }
        nextAllergies.delete('No allergies');
      } else {
        if (checked) {
          nextAllergies.delete('No allergies');
          nextAllergies.add(allergy);
        } else {
          nextAllergies.delete(allergy);
        }
      }

      return {
        ...current,
        allergies: Array.from(nextAllergies),
        allergy_other:
          allergy === 'Other' && !checked ? '' : current.allergy_other,
      };
    });
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') {
        setPhotoPreview(dataUrl);
        const previewKey = getPhotoPreviewStorageKey(userId);
        window.localStorage.setItem(previewKey, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!userId) {
      setError('Please login before saving preferences.');
      return;
    }

    const selectedAllergies = formData.allergies.filter(
      (value) => value !== 'Other'
    );

    if (
      formData.allergies.includes('Other') &&
      formData.allergy_other.trim()
    ) {
      selectedAllergies.push(`Other: ${formData.allergy_other.trim()}`);
    }

    const payload: PreferenceUpdateData = {
      phone_number: formData.phone_number || null,
      age: toNullableNumber(formData.age),
      diet: formData.diet || null,
      allergies: selectedAllergies.length ? selectedAllergies : null,
      description: formData.description || null,
      street_address: formData.street_address || null,
      zip_code: toNullableNumber(formData.zip_code),
      city: formData.city || null,
      state: formData.state || null,
      country: formData.country || null,
      occupation: formData.occupation || null,
      min_budget: toNullableNumber(formData.min_budget),
      max_budget: toNullableNumber(formData.max_budget),
      quiet_hours_from: toNullableNumber(formData.quiet_hours_from),
      quiet_hours_to: toNullableNumber(formData.quiet_hours_to),
      cleanliness: formData.cleanliness || null,
      interests: formData.interests || null,
      social_interaction: formData.social_interaction || null,
      smoking_preference: formData.smoking_preference === 'true',
    };

    setSaving(true);

    try {
      if (photoFile) {
        try {
          const uploadResult = await uploadUserPhoto(userId, photoFile);
          const profilePath = uploadResult.profile_photo;
          if (profilePath) {
            const fullUrl = profilePath.startsWith('http')
              ? profilePath
              : `${API_BASE_URL}${profilePath}`;
            const previewKey = getPhotoPreviewStorageKey(userId);
            window.localStorage.setItem(previewKey, fullUrl);
            setPhotoPreview(fullUrl);
          }
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : 'Photo upload failed');
          setSaving(false);
          return;
        }
      }
      await updateUserPreferences(userId, payload);
      router.push('/');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save preferences'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-normal">
            Smart Roommate Finder
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Back
          </Link>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Preferences</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Keep your roommate profile accurate and easy to match.
          </p>
        </div>

        <PreferenceForm
          formData={formData}
          loading={loading}
          saving={saving}
          message={message}
          error={error}
          photoPreview={photoPreview}
          photoFile={photoFile}
          isAllergyMenuOpen={isAllergyMenuOpen}
          fileInputRef={fileInputRef}
          initials={initials}
          onInputChange={handleInputChange}
          onAllergyToggle={handleAllergyToggle}
          onPhotoButtonClick={() => fileInputRef.current?.click()}
          onPhotoChange={handlePhotoChange}
          toggleAllergyMenu={() => setIsAllergyMenuOpen((current) => !current)}
          closeAllergyMenu={() => setIsAllergyMenuOpen(false)}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}

