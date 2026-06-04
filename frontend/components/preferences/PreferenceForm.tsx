'use client';

import React, { ChangeEvent, FormEvent, ReactNode } from 'react';
import { PreferenceFormData } from './types';

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

interface PreferenceFormProps {
  formData: PreferenceFormData;
  loading: boolean;
  saving: boolean;
  message: string;
  error: string;
  photoPreview: string | null;
  photoFile: File | null;
  isAllergyMenuOpen: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  initials: string;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onAllergyToggle: (allergy: string, checked: boolean) => void;
  onPhotoButtonClick: () => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  toggleAllergyMenu: () => void;
  closeAllergyMenu: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function PreferenceForm({
  formData,
  loading,
  saving,
  message,
  error,
  photoPreview,
  photoFile,
  isAllergyMenuOpen,
  fileInputRef,
  initials,
  onInputChange,
  onAllergyToggle,
  onPhotoButtonClick,
  onPhotoChange,
  toggleAllergyMenu,
  closeAllergyMenu,
  onSubmit,
}: PreferenceFormProps) {

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[280px_1fr]">
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
            onClick={onPhotoButtonClick}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {photoFile ? 'Change Photo' : 'Add Photo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
              className={inputClass}
            />
          </Field>

          <Field label="Diet">
            <select
              name="diet"
              value={formData.diet}
              onChange={onInputChange}
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
                onClick={toggleAllergyMenu}
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
                          onAllergyToggle(option, event.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={closeAllergyMenu}
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
                onChange={onInputChange}
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
            onChange={onInputChange}
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
              onChange={onInputChange}
              className={inputClass}
            />
          </Field>

          <Field label="Zip Code">
            <input
              name="zip_code"
              type="number"
              placeholder="10001"
              value={formData.zip_code}
              onChange={onInputChange}
              className={inputClass}
            />
          </Field>

          <Field label="City">
            <input
              name="city"
              placeholder="New York"
              value={formData.city}
              onChange={onInputChange}
              className={inputClass}
            />
          </Field>

          <Field label="State">
            <input
              name="state"
              placeholder="NY"
              value={formData.state}
              onChange={onInputChange}
              className={inputClass}
            />
          </Field>

          <Field label="Country">
            <input
              name="country"
              placeholder="USA"
              value={formData.country}
              onChange={onInputChange}
              className={inputClass}
            />
          </Field>

          <Field label="Occupation">
            <select
              name="occupation"
              value={formData.occupation}
              onChange={onInputChange}
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
            <Field label={`Minimum Budget: $${formData.min_budget}`}>
              <input
                name="min_budget"
                type="range"
                min="0"
                max="5000"
                step="50"
                value={formData.min_budget}
                onChange={onInputChange}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg border-0 bg-gray-200 outline-none transition dark:bg-gray-700"
              />
              <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>$0</span>
                <span>$5,000</span>
              </div>
            </Field>

            <Field label={`Maximum Budget: $${formData.max_budget}`}>
              <input
                name="max_budget"
                type="range"
                min="0"
                max="5000"
                step="50"
                value={formData.max_budget}
                onChange={onInputChange}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg border-0 bg-gray-200 outline-none transition dark:bg-gray-700"
              />
              <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>$0</span>
                <span>$5,000</span>
              </div>
            </Field>

            <Field label="Quiet Hours From">
              <select
                name="quiet_hours_from"
                value={formData.quiet_hours_from}
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                    onChange={onInputChange}
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
                    onChange={onInputChange}
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
