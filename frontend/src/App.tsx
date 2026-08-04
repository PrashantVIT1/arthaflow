import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import DataPipeline from './pages/DataPipeline';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DeveloperProfile from './pages/DeveloperProfile';
import { ETLProvider } from './context/ETLContext';

function App() {
  return (
    <ETLProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="data-pipeline" element={<DataPipeline />} />
            <Route path="reports" element={<Reports />} />
            <Route path="developer-profile" element={<DeveloperProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ETLProvider>
  );
}

export default App;
