import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import PlaceInput from '@/components/onboarding/PlaceInput';
import PhotoUpload from '@/components/onboarding/PhotoUpload';
import PromptEditor from '@/components/onboarding/PromptEditor';
import { createProfile, uploadPhoto } from '@/services/profileService';
import { Intent, UserPlace, UserPhoto, UserPrompt } from '@/types/user';

type Step = 'basics' | 'location' | 'places' | 'photos' | 'prompts' | 'intent';

const STEPS: Step[] = ['basics', 'location', 'places', 'photos', 'prompts', 'intent'];

const INTENT_OPTIONS: { value: Intent; label: string; description: string }[] = [
  { value: 'casual', label: 'Casual', description: 'Getting to know people' },
  { value: 'serious', label: 'Serious', description: 'Looking for a relationship' },
  { value: 'marriage', label: 'Marriage', description: 'Ready for commitment' },
];

const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
  { value: 'non-binary' as const, label: 'Non-binary' },
];

const CreateProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('basics');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | ''>('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [places, setPlaces] = useState<UserPlace[]>([]);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [intent, setIntent] = useState<Intent | ''>('');

  const currentStepIndex = STEPS.indexOf(step);

  const handlePhotoUpload = async (file: File, order: number): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    setUploading(true);
    try {
      const url = await uploadPhoto(user.uid, file, order);
      return url;
    } finally {
      setUploading(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 'basics':
        return name.trim().length > 0 && 
               parseInt(age) >= 18 && 
               parseInt(age) <= 100 && 
               gender !== '';
      case 'location':
        return city.trim().length > 0;
      case 'places':
        return places.length >= 3;
      case 'photos':
        return photos.length >= 1;
      case 'prompts':
        return prompts.length >= 3 && prompts.every(p => p.answer.trim().length > 0);
      case 'intent':
        return intent !== '';
      default:
        return false;
    }
  };

  const handleNext = async () => {
    setError('');
    
    if (step === 'intent') {
      // Final step - save profile
      if (!user || !gender || !intent) return;
      
      setLoading(true);
      try {
        await createProfile(user.uid, {
          name: name.trim(),
          age: parseInt(age),
          gender,
          intent,
          city: city.trim(),
          neighborhood: neighborhood.trim() || undefined,
          places,
          prompts,
          photoUrls: photos,
        });
        navigate('/discovery');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create profile');
      } finally {
        setLoading(false);
      }
    } else {
      // Move to next step
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) {
        setStep(STEPS[nextIndex]);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'basics':
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1>Let's start with the basics</h1>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">First name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  min={18}
                  max={100}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGender(option.value)}
                      className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-gentle ${
                        gender === option.value
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1>Where are you based?</h1>
              <p className="text-muted-foreground">
                This helps us show you people in your area.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Neighborhood (optional)</Label>
                <Input
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Your neighborhood or area"
                  className="h-12"
                />
              </div>
            </div>
          </div>
        );

      case 'places':
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1>Places you go</h1>
            </div>

            <PlaceInput
              places={places}
              onPlacesChange={setPlaces}
              minRequired={3}
            />
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1>Add your photos</h1>
            </div>

            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              onFileSelect={handlePhotoUpload}
              maxPhotos={3}
              isUploading={uploading}
            />
          </div>
        );

      case 'prompts':
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1>Tell us about yourself</h1>
            </div>

            <PromptEditor
              prompts={prompts}
              onPromptsChange={setPrompts}
              maxPrompts={3}
            />
          </div>
        );

      case 'intent':
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1>What are you looking for?</h1>
              <p className="text-muted-foreground">
                Be honest. You'll only see people with the same intent.
              </p>
            </div>

            <div className="space-y-3">
              {INTENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setIntent(option.value)}
                  className={`w-full rounded-lg border p-4 text-left transition-gentle ${
                    intent === option.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <p className="font-medium">{option.label}</p>
                  <p className={`text-sm ${
                    intent === option.value ? 'text-background/70' : 'text-muted-foreground'
                  }`}>
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <OnboardingLayout step={currentStepIndex + 1} totalSteps={STEPS.length}>
      {renderStep()}

      {error && (
        <div className="mt-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-8 flex gap-3 safe-bottom">
        {currentStepIndex > 0 && (
          <Button variant="ghost" onClick={handleBack} className="flex-1 h-12">
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed() || loading || uploading}
          className={`h-12 ${currentStepIndex === 0 ? 'w-full' : 'flex-1'}`}
        >
          {loading ? 'Saving...' : step === 'intent' ? 'Finish' : 'Continue'}
        </Button>
      </div>
    </OnboardingLayout>
  );
};

export default CreateProfile;
