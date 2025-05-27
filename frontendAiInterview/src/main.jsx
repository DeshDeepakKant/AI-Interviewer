import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements } from 'react-router-dom'
import HomePage from './components/homepage.jsx'
import Layout from './components/Layout.jsx'
import LoginPage from './components/loginPage.jsx'
import Testing from './components/testing.jsx'
import AIInterview from './components/AIInterview.jsx'
import LayoutWithoutFooter from './components/LayoutWithoutFooter.jsx'
import Features from './components/Features.jsx'
import Pricing from './components/Pricing.jsx'
import ComingSoong from './components/ComingSoong.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <> {/* Add this wrapper */}
      <Route path='/' element={<Layout/>}>
        <Route path="" element={<HomePage/>}/>
        <Route path="login" element={<LoginPage/>}/>
        <Route path="testing" element={<Testing/>}/>
        <Route path="features" element={<Features/>}/>
        <Route path="comingSoon" element={<ComingSoong/>}/>
      </Route>

      <Route path="/interview" element={<LayoutWithoutFooter/>}>
        <Route index element={<AIInterview />} />
      </Route>
      <Route path="/pricing" element={<LayoutWithoutFooter/>}>
        <Route index element={<Pricing />} />
      </Route>
    </> // Close the wrapper
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
    
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
