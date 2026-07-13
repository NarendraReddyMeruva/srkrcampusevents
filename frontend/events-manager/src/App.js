import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { LandingPage } from './pages/landing/LandingPage';
import SignUp from './pages/auth/Signup';
import AdminSignUp from './pages/auth/AdminSignUp';
import SignIn from './pages/auth/SignIn';
import AdminSignIn from './pages/auth/AdminSignIn';
import HomePage from './pages/user/HomePage';
import ProfilePage from './pages/user/ProfilePage';
import EventsPage from './pages/admin/Events';
import AdminDashboard from './pages/admin/Admin';
import GalleryPage from './pages/admin/Gallery';
import UserEventsPage from './pages/user/events/eventsDisplay';
import UserGalleryPage from './pages/user/gallery/membersDisplay';
import EventRegister from './pages/user/registration/EventRegister';
import TicketVerification from './pages/admin/ticket';
import AboutPage from './pages/user/about/about';



function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/signin' element={<SignIn/>}/>
      <Route path='/signup' element={<SignUp/>}/>
      <Route path='/adminevents' element={<EventsPage/>}/>
      <Route path='/admin/:id' element={<AdminDashboard/>}/>
      <Route path='/admingallery' element={<GalleryPage/>}/>
      <Route path='/home/:id' element={<HomePage/>}/>
      <Route path='/adminsignin' element={<AdminSignIn/>}/>
      <Route path='/adminsignup' element={<AdminSignUp/>}/>
      <Route path='/profile/:id' element={<ProfilePage/>}/>
      <Route path='/events/:userId' element={<UserEventsPage/>}/>
      <Route path='/gallery' element={<UserGalleryPage/>}/>
      <Route path='/register/:userId/:eventId' element={<EventRegister/>}/>
      <Route path='/ticket/verification' element={<TicketVerification/>}/>
      <Route path='/about' element={<AboutPage/>}/>

      

    </Routes>
    </BrowserRouter>
  );
}

export default App;
