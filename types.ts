
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isPremium: boolean;
  termsAccepted: boolean;
}

export interface ServiceProvider {
  id: string;
  ownerId: string;
  name: string;
  serviceType: string;
  description: string;
  optimizedDescription?: string;
  contact: string;
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: number;
  category: string;
  isPremium: boolean;
}

export interface BusinessTip {
  title: string;
  advice: string;
  icon: string;
}
