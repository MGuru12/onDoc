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
          {/* Global Custom Scrollbar Styles */}
          <style jsx>{`
            /* Width */
            ::-webkit-scrollbar {
              width: 12px;
              height: 12px;
            }

            /* Track (background of scrollbar) */
            ::-webkit-scrollbar-track {
              background: linear-gradient(to bottom, #f7f5ff, #fdf9ff);
              border-radius: 20px;
              border: 4px solid transparent;
              background-clip: content-box;
            }

            /* Thumb (draggable part) */
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, #c4b5fd, #ddd6fe);
              background-clip: content-box;
              border-radius: 20px;
              border: 4px solid transparent;
              box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.4),
                          inset -1px -1px 2px rgba(120, 80, 150, 0.1);
            }

            /* Thumb Hover */
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(135deg, #a78bfa, #c4b5fd);
              box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.5),
                          inset -1px -1px 2px rgba(100, 60, 130, 0.15);
            }

            /* Corner (bottom right when both horizontal & vertical) */
            ::-webkit-scrollbar-corner {
              background: #f5f3ff;
            }

            /* Optional: Firefox Support */
            * {
              scrollbar-width: thin;
              scrollbar-color: #c4b5fd #f7f5ff;
              scrollbar-gutter: stable;
            }

            /* For Edge / Chromium-based browsers */
            @supports (-webkit-appearance: none) {
              body {
                scrollbar-color: #c4b5fd #f7f5ff;
                scrollbar-width: thin;
              }
            }
          `}</style>

          <AppBar />
          <main className="flex-grow pt-16 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />

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
                <Route path="doc/:projId" element={<DocEditor />} />
                <Route path="KnowledgeBase/:projId" element={<KnowledgeBase />} />
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