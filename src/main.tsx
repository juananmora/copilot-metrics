import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout, ThemeProvider, ToastProvider } from './components'
import { ConfettiProvider } from './components/Confetti'
import { 
  OverviewPage, 
  PullRequestsPage, 
  AgentsPage, 
  UsersPage,
  ExecutiveDashboard,
  SettingsPage
} from './pages'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode disabled in dev to prevent double WebSocket connections
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <ToastProvider position="top-right">
          <ConfettiProvider>
            <HashRouter>
              <Routes>
                {/* Main layout with navigation */}
                <Route element={<Layout />}>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/pull-requests" element={<PullRequestsPage />} />
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                
                {/* Executive Dashboard (separate layout) */}
                <Route path="/executive" element={<ExecutiveDashboard />} />
              </Routes>
            </HashRouter>
          </ConfettiProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  // </React.StrictMode>,
)
