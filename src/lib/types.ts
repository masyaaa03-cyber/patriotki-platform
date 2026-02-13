export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  telegram: string | null;
  vk: string | null;
  region: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  consent: boolean;
  consent_date: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  city: string | null;
  region: string | null;
  location: string | null;
  max_participants: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registered_at: string;
  attended: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  event_id: string | null;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  awarded_at: string;
  awarded_by: string | null;
  achievement?: Achievement;
}

export interface MapPoint {
  city: string;
  region: string;
  lat: number;
  lng: number;
  cnt: number;
}
