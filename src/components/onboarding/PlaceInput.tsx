import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceType, UserPlace } from '@/types/user';
import { X } from 'lucide-react';

const PLACE_TYPES: { value: PlaceType; label: string }[] = [
  { value: 'cafe', label: 'Café' },
  { value: 'gym', label: 'Gym' },
  { value: 'park', label: 'Park' },
  { value: 'library', label: 'Library' },
  { value: 'campus', label: 'Campus' },
  { value: 'club', label: 'Club' },
  { value: 'other', label: 'Other' },
];

interface PlaceInputProps {
  places: UserPlace[];
  onPlacesChange: (places: UserPlace[]) => void;
  minRequired?: number;
}

const PlaceInput = ({ places, onPlacesChange, minRequired = 3 }: PlaceInputProps) => {
  const [newPlaceName, setNewPlaceName] = useState('');
  const [selectedType, setSelectedType] = useState<PlaceType>('cafe');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPlace = () => {
    if (!newPlaceName.trim()) return;

    const newPlace: UserPlace = {
      id: `place_${Date.now()}`,
      name: newPlaceName.trim(),
      type: selectedType,
      addedAt: new Date(),
    };

    onPlacesChange([...places, newPlace]);
    setNewPlaceName('');
    setSelectedType('cafe');
    setIsAdding(false);
  };

  const handleRemovePlace = (id: string) => {
    onPlacesChange(places.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Helper text */}
      <p className="text-sm text-muted-foreground">
        You don't need to be precise. Just places that feel like part of your routine.
      </p>

      {/* Added places */}
      {places.length > 0 && (
        <div className="space-y-2">
          {places.map((place) => (
            <div
              key={place.id}
              className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{place.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{place.type}</p>
              </div>
              <button
                onClick={() => handleRemovePlace(place.id)}
                className="text-muted-foreground hover:text-foreground transition-gentle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progress indicator */}
      {places.length < minRequired && (
        <p className="text-sm text-muted-foreground">
          {places.length} of {minRequired} places added
        </p>
      )}

      {/* Add place form */}
      {isAdding ? (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <Input
            placeholder="Name this place"
            value={newPlaceName}
            onChange={(e) => setNewPlaceName(e.target.value)}
            autoFocus
          />

          {/* Type selection */}
          <div className="flex flex-wrap gap-2">
            {PLACE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`rounded-full px-3 py-1.5 text-sm transition-gentle ${
                  selectedType === type.value
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewPlaceName('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPlace}
              disabled={!newPlaceName.trim()}
              className="flex-1"
            >
              Add
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full h-12"
        >
          Add a place
        </Button>
      )}
    </div>
  );
};

export default PlaceInput;
