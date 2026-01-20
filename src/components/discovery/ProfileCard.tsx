import { UserProfile } from '@/types/user';

interface ProfileCardProps {
  profile: UserProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="space-y-8">
      {/* Header: Name, Age, Gender */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-semibold text-foreground">
          {profile.name}, {profile.age}
        </h2>
        <p className="text-muted-foreground capitalize">{profile.gender}</p>
      </div>

      {/* Intent Badge - Always Visible */}
      <div className="flex justify-center">
        <span className="inline-flex items-center rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-soft">
          Looking for: <span className="ml-1 capitalize font-semibold">{profile.intent}</span>
        </span>
      </div>

      {/* Location context - no distance, no tracking */}
      {profile.city && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {profile.neighborhood ? `${profile.neighborhood}, ` : ''}{profile.city}
          </p>
        </div>
      )}

      {/* Photos - feel alive, not boxed */}
      {profile.photos.length > 0 && (
        <div className="space-y-4">
          {profile.photos.slice(0, 3).map((photo) => (
            <div
              key={photo.id}
              className="photo-frame aspect-[4/5] w-full"
              data-photo-id={photo.id}
            >
              <img
                src={photo.url}
                alt={`${profile.name}'s photo`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Prompts - generous spacing */}
      {profile.prompts.length > 0 && (
        <div className="space-y-4">
          {profile.prompts.slice(0, 3).map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-xl border border-border bg-card p-5 shadow-soft"
              data-prompt-id={prompt.id}
            >
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {prompt.question}
              </p>
              <p className="text-foreground leading-relaxed">{prompt.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Places they go - organic, not database */}
      {profile.places && profile.places.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">Places</p>
          <div className="flex flex-wrap justify-center gap-2">
            {profile.places.slice(0, 5).map((place) => (
              <span
                key={place.id}
                className="rounded-full bg-secondary/70 px-3 py-1.5 text-sm text-secondary-foreground"
              >
                {place.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
