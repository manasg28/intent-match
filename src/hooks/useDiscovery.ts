import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/user';
import {
  getDiscoveryProfiles,
  getCurrentUserProfile,
  getRemainingLikes,
  sendLike,
  canSendLike
} from '@/services/discoveryService';

interface UseDiscoveryReturn {
  currentProfile: UserProfile | null;
  remainingLikes: number;
  isLoading: boolean;
  error: string | null;
  canLike: boolean;
  noMoreProfiles: boolean;
  sendProfileLike: (targetType: 'prompt' | 'photo', targetId: string, comment?: string) => Promise<boolean>;
  passProfile: () => void;
  refreshProfiles: () => Promise<void>;
}

export const useDiscovery = (): UseDiscoveryReturn => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingLikes, setRemainingLikes] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const currentProfile = profiles[currentIndex] || null;
  const noMoreProfiles = !isLoading && profiles.length === 0;
  const canLike = remainingLikes > 0;

  const loadProfiles = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const profile = await getCurrentUserProfile(user.uid);
      if (!profile) {
        setError('Please complete your profile first');
        setIsLoading(false);
        return;
      }

      setUserProfile(profile);
      
      const [discoveryProfiles, likes] = await Promise.all([
        getDiscoveryProfiles(user.uid, profile.intent),
        getRemainingLikes(user.uid)
      ]);

      setProfiles(discoveryProfiles);
      setRemainingLikes(likes);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const advanceToNext = useCallback(() => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // No more profiles in current batch
      setProfiles([]);
    }
  }, [currentIndex, profiles.length]);

  const passProfile = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  const sendProfileLike = useCallback(async (
    targetType: 'prompt' | 'photo',
    targetId: string,
    comment?: string
  ): Promise<boolean> => {
    if (!user || !currentProfile) return false;

    const canStillLike = await canSendLike(user.uid);
    if (!canStillLike) {
      setRemainingLikes(0);
      return false;
    }

    try {
      const success = await sendLike({
        fromUid: user.uid,
        toUid: currentProfile.uid,
        targetType,
        targetId,
        comment
      });

      if (success) {
        setRemainingLikes(prev => Math.max(0, prev - 1));
        advanceToNext();
      }

      return success;
    } catch (err) {
      console.error('Error sending like:', err);
      return false;
    }
  }, [user, currentProfile, advanceToNext]);

  const refreshProfiles = useCallback(async () => {
    await loadProfiles();
  }, [loadProfiles]);

  return {
    currentProfile,
    remainingLikes,
    isLoading,
    error,
    canLike,
    noMoreProfiles,
    sendProfileLike,
    passProfile,
    refreshProfiles
  };
};
