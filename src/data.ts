import { MapUser } from './types';

// Coordinates for Kobelyaky, Poltava Oblast, Ukraine
export const CITY_CENTER = [49.1444, 34.1969]; 

export const MOCK_USERS: MapUser[] = [
  {
    uid: 'u1',
    codename: 'Лиса',
    age: 22,
    bio: 'Люблю гулять возле Ворсклы и пить кофе. Ищу кого-то для вечерних прогулок.',
    interests: ['кофе', 'прогулки', 'музыка'],
    avatarColor: 'bg-rose-500',
    lat: 49.1460,
    lng: 34.1980,
    isOnline: true,
  },
  {
    uid: 'u2',
    codename: 'Неизвестный',
    age: 25,
    bio: 'Только вернулся в город, ищу компанию. Увлекаюсь машинами и видеоиграми.',
    interests: ['авто', 'игры', 'пиво'],
    avatarColor: 'bg-blue-500',
    lat: 49.1432,
    lng: 34.1950,
    isOnline: false,
  },
  {
    uid: 'u3',
    codename: 'Сова',
    age: 20,
    bio: 'Не сплю по ночам. Рисую, слушаю эмбиент. Хочу найти соулмейта.',
    interests: ['искусство', 'ночь', 'эмбиент'],
    avatarColor: 'bg-purple-500',
    lat: 49.1480,
    lng: 34.1920,
    isOnline: true,
  },
  {
    uid: 'u4',
    codename: 'Волк',
    age: 28,
    bio: 'Занимаюсь спортом, бегаю по утрам. Буду рад компании на пробежку.',
    interests: ['спорт', 'зож', 'бег'],
    avatarColor: 'bg-slate-700',
    lat: 49.1415,
    lng: 34.2001,
    isOnline: true,
  },
  {
    uid: 'u5',
    codename: 'Кот',
    age: 24,
    bio: 'Просто ищу интересное общение без лишних вопросов. Люблю мемы и кино.',
    interests: ['кино', 'общение', 'мемы'],
    avatarColor: 'bg-amber-500',
    lat: 49.1455,
    lng: 34.1900,
    isOnline: false,
  },
];
