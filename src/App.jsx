import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Timeline from './pages/Timeline'
import Geography from './pages/Geography'
import Defensive from './pages/Defensive'
import Factors from './pages/Factors'
import BeforeAfter from './pages/BeforeAfter'
import Transformation from './pages/Transformation'
import Insights from './pages/Insights'
import DataExplorer from './pages/DataExplorer'
import Methodology from './pages/Methodology'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/geography" element={<Geography />} />
          <Route path="/defensive" element={<Defensive />} />
          <Route path="/factors" element={<Factors />} />
          <Route path="/before-after" element={<BeforeAfter />} />
          <Route path="/transformation" element={<Transformation />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/explorer" element={<DataExplorer />} />
          <Route path="/methodology" element={<Methodology />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
