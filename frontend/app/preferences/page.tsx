'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
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

const dietOptions = [
  'Vegetarian',
  'Non-veg',
  'Vegan',
  'Pescatarian',
  'No preference',
];

const allergyOptions = [
  'Nuts',
  'Gluten free',
  'Soy',
  'Wheat',
  'Egg',
  'Dairy',
  'Shellfish',
  'No allergies',
  'Other',
];

const occupationOptions = [
  'Student',
  'Worker',
  'Remote worker',
  'Freelancer',
  'Other',
];

const cleanlinessOptions = [
  'Clean room once a week',
  'Clean room twice a week',
  'Clean shared spaces daily',
  'Deep clean monthly',
  'Flexible',
];

const socialInteractionOptions = [
  'No interaction',
  'Medium interaction',
  'A lot of interaction',
];

const hourOptions = [
  { value: 0, label: '12 AM' },
  { value: 1, label: '1 AM' },
  { value: 2, label: '2 AM' },
  { value: 3, label: '3 AM' },
  { value: 4, label: '4 AM' },
  { value: 5, label: '5 AM' },
  { value: 6, label: '6 AM' },
  { value: 7, label: '7 AM' },
  { value: 8, label: '8 AM' },
  { value: 9, label: '9 AM' },
  { value: 10, label: '10 AM' },
  { value: 11, label: '11 AM' },
  { value: 12, label: '12 PM' },
  { value: 13, label: '1 PM' },
  { value: 14, label: '2 PM' },
  { value: 15, label: '3 PM' },
  { value: 16, label: '4 PM' },
  { value: 17, label: '5 PM' },
  { value: 18, label: '6 PM' },
  { value: 19, label: '7 PM' },
  { value: 20, label: '8 PM' },
  { value: 21, label: '9 PM' },
  { value: 22, label: '10 PM' },
  { value: 23, label: '11 PM' },
];

interface PreferenceFormData {
  name: string;
  email: string;
  phone_number: string;
  age: string;
  diet: string;
  allergies: string[];
  allergy_other: string;
  description: string;
  street_address: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  occupation: string;
  min_budget: string;
  max_budget: string;
  quiet_hours_from: string;
  quiet_hours_to: string;
  cleanliness: string;
  interests: string;
  social_interaction: string;
  smoking_preference: string;
}

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

export default function PreferencesPage() {
  const [formData, setFormData] = useState<PreferenceFormData>(initialFormData);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isAllergyMenuOpen, setIsAllergyMenuOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('smart_roommate_photo_preview');
  });
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
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
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
        window.localStorage.setItem('smart_roommate_photo_preview', dataUrl);
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
            window.localStorage.setItem('smart_roommate_photo_preview', fullUrl);
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

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[280px_1fr]"
        >
          <aside className="border-b border-gray-200 pb-8 dark:border-gray-800 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            <div className="sticky top-8 flex flex-col items-center gap-4">
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-blue-50 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Selected photo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-semibold text-blue-700 dark:text-blue-300">
                    {initials || 'U'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {photoFile ? 'Change Photo' : 'Add Photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </aside>

          <section className="space-y-8">
            {loading && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                Loading preferences...
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name">
                <input
                  name="name"
                  value={formData.name}
                  readOnly
                  className={readOnlyInputClass}
                />
              </Field>

              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className={readOnlyInputClass}
                />
              </Field>

              <Field label="Phone Number">
                <input
                  name="phone_number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Age">
                <input
                  name="age"
                  type="number"
                  min="18"
                  placeholder="24"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Diet">
                <select
                  name="diet"
                  value={formData.diet}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="">Select diet</option>
                  {dietOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Allergies">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAllergyMenuOpen((current) => !current)}
                    className={`${inputClass} flex items-center justify-between text-left`}
                  >
                    <span className="truncate">
                      {formData.allergies.length > 0
                        ? formData.allergies
                            .map((value) =>
                              value === 'Other' && formData.allergy_other
                                ? `Other: ${formData.allergy_other}`
                                : value
                            )
                            .join(', ')
                        : 'Select allergies'}
                    </span>
                    <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                      {isAllergyMenuOpen ? 'Close' : 'Open'}
                    </span>
                  </button>

                  {isAllergyMenuOpen && (
                    <div className="absolute left-0 right-0 z-10 mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-300 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      {allergyOptions.map((option) => (
                        <label
                          key={option}
                          className="mb-2 flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-200"
                        >
                          <input
                            type="checkbox"
                            name="allergies"
                            value={option}
                            checked={formData.allergies.includes(option)}
                            onChange={(event) =>
                              handleAllergyToggle(option, event.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                      <button
                        type="button"
                        onClick={() => setIsAllergyMenuOpen(false)}
                        className="mt-3 w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
                {formData.allergies.includes('Other') && (
                  <input
                    name="allergy_other"
                    placeholder="Describe other allergy"
                    value={formData.allergy_other}
                    onChange={handleInputChange}
                    className={`${inputClass} mt-3`}
                  />
                )}
              </Field>
            </div>

            <Field label="Description">
              <textarea
                name="description"
                placeholder="If you have any extra things to write..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={inputClass}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Street Address">
                <input
                  name="street_address"
                  placeholder="123 Main Street"
                  value={formData.street_address}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Zip Code">
                <input
                  name="zip_code"
                  type="number"
                  placeholder="10001"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </Field>

              <Field label="City">
                <input
                  name="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </Field>

              <Field label="State">
                <input
                  name="state"
                  placeholder="NY"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Country">
                <input
                  name="country"
                  placeholder="USA"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Occupation">
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="">Select occupation</option>
                  {occupationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="border-t border-gray-200 pt-8 dark:border-gray-800">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Minimum Budget">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      name="min_budget"
                      type="number"
                      min="0"
                      value={formData.min_budget}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </Field>

                <Field label="Maximum Budget">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      name="max_budget"
                      type="number"
                      min="0"
                      value={formData.max_budget}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </Field>

                <Field label="Quiet Hours From">
                  <select
                    name="quiet_hours_from"
                    value={formData.quiet_hours_from}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    {hourOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Quiet Hours To">
                  <select
                    name="quiet_hours_to"
                    value={formData.quiet_hours_to}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    {hourOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Cleanliness Preference">
                  <select
                    name="cleanliness"
                    value={formData.cleanliness}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Select preference</option>
                    {cleanlinessOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Social Interaction">
                  <select
                    name="social_interaction"
                    value={formData.social_interaction}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Select interaction level</option>
                    {socialInteractionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Interests">
                  <input
                    name="interests"
                    placeholder="Movies, cooking, gym"
                    value={formData.interests}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="Smoking Preference">
                  <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
                    <label className={radioLabelClass}>
                      <input
                        type="radio"
                        name="smoking_preference"
                        value="true"
                        checked={formData.smoking_preference === 'true'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span
                        className={
                          formData.smoking_preference === 'true'
                            ? activeRadioClass
                            : inactiveRadioClass
                        }
                      >
                        Yes
                      </span>
                    </label>
                    <label className={radioLabelClass}>
                      <input
                        type="radio"
                        name="smoking_preference"
                        value="false"
                        checked={formData.smoking_preference === 'false'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span
                        className={
                          formData.smoking_preference === 'false'
                            ? activeRadioClass
                            : inactiveRadioClass
                        }
                      >
                        No
                      </span>
                    </label>
                  </div>
                </Field>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-800">
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

const readOnlyInputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-600 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400';

const radioLabelClass = 'cursor-pointer';

const activeRadioClass =
  'block bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white';

const inactiveRadioClass =
  'block bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800';
