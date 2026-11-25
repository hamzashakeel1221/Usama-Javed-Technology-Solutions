import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Seo from './components/Seo.jsx'
import { Link } from './components/L.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Services from './pages/Services.jsx'
import Projects from './pages/Projects.jsx'
import Reviews from './pages/Reviews.jsx'
import Contact from './pages/Contact.jsx'
import ServicePage from './pages/ServicePage.jsx'
import { servicePages, servicePath } from './servicePages.js'
import Login from './admin/Login.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import Dashboard from './admin/Dashboard.jsx'
import AdminProjects from './admin/AdminProjects.jsx'
import AdminReviews from './admin/AdminReviews.jsx'
import AdminInquiries from './admin/AdminInquiries.jsx'
import AdminContent from './admin/AdminContent.jsx'
import AdminAccount from './admin/AdminAccount.jsx'
import { useLang } from './i18n.jsx'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function NotFound() {
  const { t } = useLang()
  return (
    <section className="section container center">
      <h1 className="h1" style={{ fontSize: '6rem', color: 'var(--orange)' }}>404</h1>
      <p className="lead" style={{ marginBottom: 28 }}>{t.common.notFound}</p>
      <Link className="btn btn-orange" to="/">{t.common.back}</Link>
    </section>
  )
}

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}

const pages = [['', Home], ['/about', About], ['/services', Services], ['/projects', Projects], ['/reviews', Reviews], ['/contact', Contact],
  ...servicePages.map(s => [servicePath(s.slug), () => <ServicePage slug={s.slug} />])]

export default function App() {
  return (
    <>
      <ScrollTop />
      <Seo />
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="account" element={<AdminAccount />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        {['', '/ar'].flatMap(prefix => pages.map(([path, Page]) => (
          <Route key={prefix + path} path={(prefix + path) || '/'} element={<PublicLayout><Page /></PublicLayout>} />
        )))}
        <Route path="/ar/*" element={<PublicLayout><NotFound /></PublicLayout>} />
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </>
  )
}
