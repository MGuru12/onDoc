import Home from './pages/Home';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import NotFound from './pages/NotFound';
import Registration from './pages/auth/Registration';
import Login from './pages/auth/Login';
import Projects from './pages/protectedRoutes/Projects';
import ProtectedRoute from './pages/ProtectedRoute';
import DocEditor from './pages/protectedRoutes/DocEditor';
import KnowledgeBase from './pages/protectedRoutes/KnowledgeBase';
import KbSettings from './pages/protectedRoutes/KbSettings';
import AppBar from './pages/AppBar';
import VerifyInvite from './pages/auth/VerifyInvite';
import CustomCursor from './utils/CustomCursor';
import UsrProfile from './pages/protectedRoutes/UsrProfile';
import Knowledgebase from './pages/Knowledgebase';
import Pricing from './pages/protectedRoutes/Pricing';
import Loader from './components/Loader';

function AuthLayout() {
  return <Outlet />;
}

function ProjectLayout() {
  return <Outlet />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col relative cursor-none">
          <CustomCursor/>
          <Loader />

          <AppBar />
          <main className="flex-grow pt-16 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/kb/:orgId/:projId/*" element={<Knowledgebase />} />
              <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<Navigate to="login" replace />} />
                <Route path="registration" element={<Registration />} />
                <Route path="login" element={<Login />} />
              </Route>

              <Route path="/:_id/register/:inviteToken" element={<VerifyInvite />} />

              <Route path="/project" element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="list" replace />} />
                <Route path="me" element={<UsrProfile />} />
                <Route path="list" element={<Projects />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="doc/:projId" element={<DocEditor />} />
                <Route path="KnowledgeBase/:projId/*" element={<KnowledgeBase />} />
                <Route path="KnowledgeBase/:projId/settings" element={<KbSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;