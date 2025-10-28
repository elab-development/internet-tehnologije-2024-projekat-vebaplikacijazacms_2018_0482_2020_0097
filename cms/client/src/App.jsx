import { Routes, Route } from 'react-router-dom'; // React Router komponente za definiciju ruta
import {
  RequireAuth, // guard: dozvoljava pristup samo ulogovanima
  RequireGuest, // guard: dozvoljava pristup samo neulogovanima
  RequireAdmin, // guard: dozvoljava pristup samo adminima
} from './components/RouteGuards';
import Loader from './components/Loader'; // globalni overlay loader
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminLayout from './layouts/AdminLayout'; // zajednički layout za admin sekciju
import Dashboard from './admin/pages/Dashboard';
import SitesList from './admin/pages/Sites/SitesList';
import SiteCreate from './admin/pages/Sites/SiteCreate';
import SiteDetailsLayout from './admin/pages/Sites/SiteDetailsLayout';
import SiteOverviewTab from './admin/pages/Sites/tabs/SiteOverviewTab';
import SitePagesTab from './admin/pages/Sites/tabs/SitePagesTab';
import SiteEditorsTab from './admin/pages/Sites/tabs/SiteEditorsTab';
import SiteThemeTab from './admin/pages/Sites/tabs/SiteThemeTab';
import SitePublishTab from './admin/pages/Sites/tabs/SitePublishTab';
import PageEditor from './admin/pages/Pages/PageEditor';
import PreviewSite from './admin/pages/Sites/PreviewSite';

import EditorLayout from './layouts/EditorLayout'; // zajednički layout za editor workspace
import MySites from './editor/pages/MySites';
import SitePosts from './editor/pages/SitePosts';
import PostEditor from './editor/pages/PostEditor';

import PublicBlog from './public/pages/PublicBlog'; // javne stranice (bez auth)
import PublicPost from './public/pages/PublicPost';
import PreviewPage from './admin/pages/Sites/PreviewPage'; // admin preview pojedinačne stranice
import MyDashboard from './editor/pages/MyDashboard';

export default function App() {
  return (
    <>
      <Routes>
        {/* Zajednički deo za ulogovane korisnike (bilo koja rola) */}
        <Route element={<RequireAuth />}>
          <Route path='/' element={<Home />} /> {/* home nakon logina */}
          <Route path='/pages/:pageId' element={<PageEditor />} />
          {/* admin page editor (guardovan RequireAuth + dalje provera u API-ju) */}
          <Route path='/preview/:id' element={<PreviewSite />} />{' '}
          {/* admin preview sajta (po ID-ju) */}
        </Route>
        {/* Admin sekcija (zahteva auth + admin rolu) */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path='/admin' element={<Dashboard />} />{' '}
              {/* admin dashboard */}
              <Route path='/sites' element={<SitesList />} />{' '}
              {/* lista sajtova */}
              <Route path='/sites/new' element={<SiteCreate />} />
              {/* kreiranje sajta */}
              <Route path='/sites/:id' element={<SiteDetailsLayout />}>
                {/* detalji sajta (tabovi kao ugnježdene rute) */}
                <Route index element={<SiteOverviewTab />} />{' '}
                {/* default tab: overview */}
                <Route path='pages' element={<SitePagesTab />} />{' '}
                {/* tab: pages */}
                <Route path='editors' element={<SiteEditorsTab />} />
                {/* tab: editors */}
                <Route path='theme' element={<SiteThemeTab />} />{' '}
                {/* tab: theme */}
                <Route path='publish' element={<SitePublishTab />} />
                {/* tab: publish */}
              </Route>
            </Route>
          </Route>
        </Route>
        {/* Editor workspace (zahteva auth; rola se proverava u API sloju po sajtovima/postovima) */}
        <Route element={<RequireAuth />}>
          <Route element={<EditorLayout />}>
            <Route path='/me' element={<MyDashboard />} />{' '}
            {/* početna za editor-a */}
            <Route path='/me/sites' element={<MySites />} />{' '}
            {/* sajtovi gde je editor */}
            <Route path='/me/sites/:id/posts' element={<SitePosts />} />
            {/* postovi za određeni sajt */}
            <Route path='/me/posts/:postId' element={<PostEditor />} />{' '}
            {/* uređivanje posta */}
          </Route>
        </Route>
        {/* Rute za goste (neulogovani) */}
        <Route element={<RequireGuest />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Route>
        {/* Javno dostupne rute (publikovane) */}
        <Route path='/pub/:siteSlug/blog' element={<PublicBlog />} />{' '}
        {/* javni listing postova */}
        <Route path='/pub/:siteSlug/blog/:slug' element={<PublicPost />} />{' '}
        {/* javni detalj posta */}
        <Route path='/preview/:id/page' element={<PreviewPage />} />{' '}
        {/* admin preview pojedinačne stranice po path-u */}
        {/* Fallback: bilo šta van definisanih ruta – pošalji na Home (ako je ulogovan) */}
        <Route path='*' element={<Home />} />
      </Routes>

      {/* Globalni loader overlay koji sluša LoadingContext */}
      <Loader />
    </>
  );
}
