import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Loader2,
  Info,
  Check,
  ScanLine
} from 'lucide-react';

const COMMON_ALLERGENS = [
  'Peanut',
  'Tree nuts',
  'Milk',
  'Soy',
  'Gluten',
  'Wheat',
  'Egg',
  'Sesame',
  'Fish',
  'Shellfish',
];

const NUTRITION_PREFERENCE_OPTIONS = [
  { key: 'LOW_SUGAR', label: 'Low Sugar', description: 'Flag products with high added sugar per 100g' },
  { key: 'LOW_SODIUM', label: 'Low Sodium', description: 'Monitor high salt content (>1.5g per 100g)' },
  { key: 'LOW_SATURATED_FAT', label: 'Low Saturated Fat', description: 'Highlight excessive saturated and trans fats' },
  { key: 'HIGH_PROTEIN', label: 'High Protein', description: 'Prioritize protein-dense food alternatives' },
  { key: 'LOW_CALORIE', label: 'Low Calorie', description: 'Alert when single serving energy exceeds thresholds' },
  { key: 'NO_ARTIFICIAL_SWEETENERS', label: 'No Artificial Sweeteners', description: 'Identify sucralose, aspartame, acesulfame K' },
  { key: 'NO_SPECIFIC_ADDITIVES', label: 'No Specific Additives', description: 'Flag synthetic food colors and chemical preservatives' },
];

export default function Profile() {
  const { profileData, refreshProfile } = useAuth();

  // Personal preferences state
  const [fullName, setFullName] = useState('');
  const [ageGroup, setAgeGroup] = useState('18-25');
  const [dietaryPreference, setDietaryPreference] = useState('VEGETARIAN');
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Allergies state
  const [customAllergen, setCustomAllergen] = useState('');
  const [customSeverity, setCustomSeverity] = useState('Moderate');
  const [addingAllergy, setAddingAllergy] = useState(false);
  const [activeAllergies, setActiveAllergies] = useState([]);

  // Nutrition preferences state
  const [preferences, setPreferences] = useState({});
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profileData) {
      if (profileData.profile) {
        setFullName(profileData.profile.fullName || '');
        setAgeGroup(profileData.profile.ageGroup || '18-25');
        setDietaryPreference(profileData.profile.dietaryPreference || 'VEGETARIAN');
      }

      if (profileData.allergies) {
        setActiveAllergies(profileData.allergies);
      }

      if (profileData.preferences) {
        const prefMap = {};
        profileData.preferences.forEach((p) => {
          prefMap[p.preferenceKey] = p.preferenceValue === 'true';
        });
        setPreferences(prefMap);
      }
    }
  }, [profileData]);

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // 1. Save Personal Details
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      await api.put('/profile', {
        fullName,
        ageGroup,
        dietaryPreference,
      });
      await refreshProfile();
      showNotification('Personal profile updated successfully.');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update personal details.', true);
    } finally {
      setSavingPersonal(false);
    }
  };

  // 2. Add Allergy (Common or Custom)
  const handleAddAllergy = async (allergenName, severity = 'Moderate') => {
    if (!allergenName.trim()) return;

    const exists = activeAllergies.some(
      (a) => a.allergenName.toLowerCase() === allergenName.trim().toLowerCase()
    );

    if (exists) {
      showNotification(`Allergen "${allergenName}" is already in your profile.`, true);
      return;
    }

    setAddingAllergy(true);
    try {
      await api.post('/profile/allergies', {
        allergenName: allergenName.trim(),
        severity,
      });
      await refreshProfile();
      setCustomAllergen('');
      showNotification(`Added "${allergenName}" to your allergy profile.`);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to add allergen.', true);
    } finally {
      setAddingAllergy(false);
    }
  };

  // 3. Remove Allergy
  const handleRemoveAllergy = async (allergyId, allergenName) => {
    try {
      await api.delete(`/profile/allergies/${allergyId}`);
      await refreshProfile();
      showNotification(`Removed "${allergenName}" from your profile.`);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to remove allergen.', true);
    }
  };

  // 4. Toggle Nutrition Preference
  const handleTogglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 5. Save Nutrition Preferences
  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      await api.put('/profile/preferences', {
        preferences,
      });
      await refreshProfile();
      showNotification('Nutrition priorities saved.');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save preferences.', true);
    } finally {
      setSavingPreferences(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-10 border-b border-forest-700/80 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-widest text-gold-500">
            Intelligence Configuration
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ivory-100 mt-1">
            Personalized User Profile
          </h1>
          <p className="text-xs sm:text-sm text-sage-400 mt-1.5 max-w-2xl">
            Configure your dietary restrictions, allergen sensitivities, and nutritional priorities to personalize LabelMitra's safety checks and alternative recommendations.
          </p>
        </div>
        <Link
          to="/scan"
          className="btn-gold text-xs py-2.5 px-5 flex items-center gap-2 font-semibold self-start sm:self-end shrink-0"
        >
          <ScanLine className="w-4 h-4 text-forest-950" />
          <span>Start a New Scan</span>
        </Link>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-950/70 border border-emerald-800 rounded-button text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-950/70 border border-rose-800 rounded-button text-rose-200 text-xs sm:text-sm flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Preferences & Diet */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-forest">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-forest-700/80">
              <div className="w-8 h-8 rounded-button bg-forest-800 border border-gold-500/35 flex items-center justify-center text-gold-500">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-base font-serif font-bold text-ivory-100">Personal Preferences</h2>
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field-forest"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                  Age Group
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="input-field-forest bg-forest-900"
                >
                  <option value="Under 18">Under 18</option>
                  <option value="18-25">18 to 25</option>
                  <option value="26-40">26 to 40</option>
                  <option value="41-60">41 to 60</option>
                  <option value="60+">60 and above</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                  Dietary Preference
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="input-field-forest bg-forest-900"
                >
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="EGGETARIAN">Eggetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="OTHER">Other</option>
                </select>
                <p className="text-[11px] text-sage-400 mt-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                  <span>Used to verify green/brown Veg logos and animal-origin derivatives under FSSAI.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={savingPersonal}
                className="w-full btn-gold mt-2 py-2.5"
              >
                {savingPersonal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-forest-950" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-forest-950" />
                    <span>Save Personal Details</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Allergies & Nutrition Preferences */}
        <div className="lg:col-span-2 space-y-8">
          {/* Allergies Card */}
          <div className="card-forest">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-forest-700/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-button bg-forest-800 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-ivory-100">Food Allergies & Hypersensitivities</h2>
                  <p className="text-xs text-sage-400">
                    Ingredients will be cross-referenced against your allergy profile using synonym resolution.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-forest-800 text-gold-400 border border-gold-500/30 rounded">
                {activeAllergies.length} Registered
              </span>
            </div>

            {/* Currently Active Allergies */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-2.5">
                Active Allergen Watchlist
              </label>

              {activeAllergies.length === 0 ? (
                <div className="p-4 bg-forest-900 border border-forest-700 rounded-button text-xs text-sage-400 text-center">
                  No allergies registered. Select from the statutory list below or add a custom allergen.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {activeAllergies.map((allergy) => (
                    <div
                      key={allergy.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-900 border border-rose-900/80 rounded-button text-xs text-ivory-100 font-medium"
                    >
                      <span>{allergy.allergenName}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-rose-950/80 text-rose-300 rounded border border-rose-900/60">
                        {allergy.severity || 'Moderate'}
                      </span>
                      <button
                        onClick={() => handleRemoveAllergy(allergy.id, allergy.allergenName)}
                        title="Remove allergen"
                        className="text-sage-400 hover:text-rose-400 transition-colors ml-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Standard FSSAI Recognised Allergens Quick-Add */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-2.5">
                Statutory FSSAI Recognized Allergens (Clause 5(3)(b))
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGENS.map((allergen) => {
                  const isSelected = activeAllergies.some(
                    (a) => a.allergenName.toLowerCase() === allergen.toLowerCase()
                  );
                  return (
                    <button
                      key={allergen}
                      onClick={() => {
                        if (!isSelected) {
                          handleAddAllergy(allergen, 'Moderate');
                        }
                      }}
                      disabled={isSelected}
                      className={`text-xs px-3 py-1.5 rounded-button font-medium border transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-forest-950 text-sage-500 border-forest-800 cursor-not-allowed'
                          : 'bg-forest-900 hover:bg-forest-800 text-ivory-100 border-forest-700 hover:border-gold-500/40'
                      }`}
                    >
                      <Plus className="w-3 h-3 text-gold-500" />
                      <span>{allergen}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Allergen */}
            <div className="pt-5 border-t border-forest-700/80">
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-2">
                Add Custom Allergen
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={customAllergen}
                  onChange={(e) => setCustomAllergen(e.target.value)}
                  placeholder="e.g. Mustard, Sulphites, Corn..."
                  className="input-field-forest text-xs sm:flex-1"
                />
                <select
                  value={customSeverity}
                  onChange={(e) => setCustomSeverity(e.target.value)}
                  className="input-field-forest text-xs sm:w-36 bg-forest-900"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
                <button
                  onClick={() => handleAddAllergy(customAllergen, customSeverity)}
                  disabled={addingAllergy || !customAllergen.trim()}
                  className="btn-gold text-xs shrink-0 py-2.5"
                >
                  {addingAllergy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-forest-950" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-forest-950" />
                  )}
                  <span>Add Allergen</span>
                </button>
              </div>
            </div>
          </div>

          {/* Nutrition Preferences Card */}
          <div className="card-forest">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-forest-700/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-button bg-forest-800 border border-gold-500/35 flex items-center justify-center text-gold-500">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-ivory-100">Nutrition & Additive Priorities</h2>
                  <p className="text-xs text-sage-400">
                    Tailor nutritional classification thresholds and recommendation ranking criteria.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSavePreferences}
                disabled={savingPreferences}
                className="btn-gold text-xs py-2 px-4"
              >
                {savingPreferences ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-forest-950" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-forest-950" />
                    <span>Save Priorities</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {NUTRITION_PREFERENCE_OPTIONS.map((item) => {
                const isActive = !!preferences[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleTogglePreference(item.key)}
                    className={`p-4 rounded-button border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-forest-800 border-gold-500/60 text-ivory-100 shadow-sm'
                        : 'bg-forest-900 hover:bg-forest-850 border-forest-700 text-sage-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ivory-100">{item.label}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isActive
                            ? 'bg-gold-500 border-gold-400 text-forest-950'
                            : 'border-forest-600 bg-forest-950'
                        }`}
                      >
                        {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-sage-400 mt-1.5 leading-normal">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
