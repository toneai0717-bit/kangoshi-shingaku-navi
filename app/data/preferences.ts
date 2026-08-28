export type PriorityPreference = 'cost' | 'commute' | 'qualification' | 'content';
export type CareerPreference = 'hospital' | 'community' | 'undecided';

type PreferenceInput = {
  priority: PriorityPreference;
  career: CareerPreference;
};

export const preferenceToFilters = ({ priority }: PreferenceInput) => ({
  tuitionLimit: priority === 'cost' ? '550万円以内' : '650万円以内',
  commuteLimit: priority === 'commute' ? '45分以内' : '60分以内',
});
