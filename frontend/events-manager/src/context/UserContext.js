import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load from sessionStorage if available
    const savedUser = sessionStorage.getItem('auth');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Global Caches to prevent refetching
  const [eventsCache, setEventsCache] = useState(null);
  const [galleryCache, setGalleryCache] = useState(null);
  const [registeredEventsCache, setRegisteredEventsCache] = useState({});
  const [eventDetailsCache, setEventDetailsCache] = useState({});
  const [profileCache, setProfileCache] = useState({});
  const [adminProfileCache, setAdminProfileCache] = useState({});

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('auth', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('auth');
    }
  }, [user]);

  const clearCache = (type) => {
    if (type === 'events') {
      setEventsCache(null);
      setEventDetailsCache({});
    } else if (type === 'gallery') {
      setGalleryCache(null);
    } else if (type === 'registeredEvents') {
      setRegisteredEventsCache({});
    } else if (type === 'profile') {
      setProfileCache({});
      setAdminProfileCache({});
    } else if (type === 'all') {
      setEventsCache(null);
      setGalleryCache(null);
      setRegisteredEventsCache({});
      setEventDetailsCache({});
      setProfileCache({});
      setAdminProfileCache({});
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      eventsCache,
      setEventsCache,
      galleryCache,
      setGalleryCache,
      registeredEventsCache,
      setRegisteredEventsCache,
      eventDetailsCache,
      setEventDetailsCache,
      profileCache,
      setProfileCache,
      adminProfileCache,
      setAdminProfileCache,
      clearCache
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

