import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CITY_CENTER } from '../data';
import { MapUser, UserProfile } from '../types';
import { MapPin } from 'lucide-react';
import { supabase } from '../db';
import 'leaflet/dist/leaflet.css';

interface MapTabProps {
  currentUser: UserProfile | null;
}

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker for anonymous users
const createCustomIcon = (colorClass: string) => {
  let markerColor = '#6366f1'; // indigo-500 default
  if (colorClass.includes('rose')) markerColor = '#f43f5e';
  if (colorClass.includes('emerald')) markerColor = '#10b981';
  if (colorClass.includes('purple')) markerColor = '#a855f7';
  if (colorClass.includes('amber')) markerColor = '#f59e0b';
  if (colorClass.includes('slate')) markerColor = '#334155';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="
      background-color: ${markerColor};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid #171717;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function MapTab({ currentUser }: MapTabProps) {
  const [users, setUsers] = useState<MapUser[]>([]);

  useEffect(() => {
    // We update my location to match a random point around city center
    // Only if I don't have one
    if (currentUser && currentUser.uid) {
      if ((currentUser as MapUser).lat === undefined) {
         const randomizeLoc = () => {
           const latOffset = (Math.random() - 0.5) * 0.02;
           const lngOffset = (Math.random() - 0.5) * 0.02;
           return {
             lat: CITY_CENTER[0] + latOffset,
             lng: CITY_CENTER[1] + lngOffset,
           };
         };
         supabase.from('users').update({ ...randomizeLoc() }).eq('uid', currentUser.uid).then(({error}) => {
           if (error) console.error(error);
         }).catch(console.error);
      }
    }

    supabase.from('users').select('*').then(({ data, error }) => {
      if (error) {
        console.error("fetch users error", error);
      } else if (data) {
         setUsers((data as MapUser[]).filter(u => u.uid !== currentUser?.uid && u.lat && u.lng));
      }
    }).catch(console.error);

    const channel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, _payload => {
        // Simple strategy: refetch all valid users on any change
        supabase.from('users').select('*').then(({ data, error }) => {
          if (!error && data) {
             setUsers((data as MapUser[]).filter(u => u.uid !== currentUser?.uid && u.lat && u.lng));
          }
        }).catch(err => console.error("realtime fetch error", err));
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  return (
    <div className="h-[calc(100vh-64px)] relative w-full bg-neutral-900">
      <div className="absolute top-4 left-4 right-4 z-[400] bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-neutral-800 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Кобеляки</h3>
          <p className="text-xs text-neutral-400 font-medium">{users.length} анонімів поруч</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
          <MapPin size={18} className="text-indigo-400" />
        </div>
      </div>

      <MapContainer 
        center={CITY_CENTER as [number, number]} 
        zoom={14} 
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ background: '#171717' }} // dark background before load
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {users.map((user, idx) => (
          user.lat && user.lng ? (
            <Marker 
              key={user.uid || idx} 
              position={[user.lat, user.lng]}
              icon={createCustomIcon(user.avatarColor)}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <div className="font-bold text-sm mb-1">{user.codename}, {user.age}</div>
                  <div className="text-xs text-neutral-600 mb-2 truncate max-w-[150px]">{user.bio}</div>
                  <button className="w-full bg-indigo-600 text-white text-xs font-semibold py-1.5 rounded-lg">
                    Написати
                  </button>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>

      <style>{`
        .leaflet-container {
          background: #171717;
          font-family: inherit;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #262626;
          color: white;
          border-radius: 12px;
          border: 1px solid #404040;
        }
        .custom-popup .leaflet-popup-tip {
          background: #262626;
        }
        .custom-popup a.leaflet-popup-close-button {
          color: #a3a3a3;
        }
      `}</style>
    </div>
  );
}
