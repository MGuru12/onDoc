import Home from './pages/Home';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import NotFound from './pages/NotFound';
import Registration from './pages/auth/Registration';
import Login from './pages/auth/Login';
import Projects from './pages/protectedRoutes/Projects';
import ProtectedRoute from './pages/ProtectedRoute';
import DocEditor from './pages/protectedRoutes/DocEditor';
import KnowledgeBase from './pages/protectedRoutes/KnowledgeBase';
import KbSettings from './pages/protectedRoutes/KbSettings';
import AppBar from './pages/AppBar';

function AuthLayout() {
  return <Outlet />;
}

function ProjectLayout() {
  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
  <div className="min-h-screen flex flex-col">
    <AppBar />
    <main className="flex-grow">
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/auth' element={<AuthLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path='registration' element={<Registration />} />
          <Route path='login' element={<Login />} />
        </Route>

        <Route path='/project' element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="list" replace />} />
          <Route path='list' element={<Projects />} />
          <Route path='doc/:projId' element={<DocEditor />} />
          <Route path='KnowledgeBase/:projId' element={<KnowledgeBase />} />
          <Route path='KnowledgeBase/:projId/settings' element={<KbSettings />} />
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </main>
  </div>
</BrowserRouter>


  );
}

export default App;
