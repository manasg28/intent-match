import { UserProfile } from '@/types/user';

interface ProfileCardProps {
  profile: UserProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="space-y-6">
      {/* Header: Name, Age, Gender */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          {profile.name}, {profile.age}
        </h2>
        <p className="text-muted-foreground capitalize">{profile.gender}</p>
      </div>

      {/* Intent Badge - Always Visible */}
      <div className="flex justify-center">
        <span className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
          Looking for: <span className="ml-1 capitalize font-semibold">{profile.intent}</span>
        </span>
      </div>

      {/* Photos */}
      {profile.photos.length > 0 && (
        <div className="space-y-3">
          {profile.photos.slice(0, 3).map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-muted"
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

      {/* Prompts */}
      {profile.prompts.length > 0 && (
        <div className="space-y-4">
          {profile.prompts.slice(0, 3).map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-lg border border-border bg-card p-4"
              data-prompt-id={prompt.id}
            >
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {prompt.question}
              </p>
              <p className="text-foreground">{prompt.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
