import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Redirect, Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AdminAuthProvider, useAdminAuth } from "./hooks/useAdminAuth";
import AuthDebug from "./components/debug/AuthDebug";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import ProductsManagement from "./pages/ProductsManagement";
import OrdersManagement from "./pages/OrdersManagement";
import UsersManagement from "./pages/UsersManagement";
import BannersManagement from "./pages/BannersManagement";
import CategoriesManagement from "./pages/CategoriesManagement";
import CollectionsManagement from "./pages/CollectionsManagement";
import SettingsManagement from "./pages/SettingsManagement";
import ContactsManagement from "./pages/ContactsManagement";
import BlogsManagement from "./pages/BlogsManagement";
import AdminLogin from "./pages/AdminLogin";
import Popup from "./pages/Popup";
import StoreManagePage from "./pages/StoreManage";
import PromoTimerPage from "./pages/promotimer";
import PopupManagement from './pages/PopupManagement';
import PromoTimer from './pages/promotimer';
import PromoCoupon from './pages/PromoCoupon';
import GiftCardsManagement from './pages/GiftCardsManagement';
import QRScannerManagement from './pages/QRScannerManagement';
import GiftCardTemplatesManagement from './pages/GiftCardTemplatesManagement';
import TestimonialsManagement from './pages/TestimonialsManagement';
import FreeProductsPage from './pages/FreeProductsPage';
import ReviewManagement from './pages/ReviewManagement';

function AdminContainer() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Redirect to="/admin/login" />;
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {/* Add debug component */}
          <AuthDebug />
          <Switch>
            <Route path="/admin/dashboard" component={Dashboard} />
            <Route path="/admin/products" component={ProductsManagement} />
            <Route path="/admin/reviews" component={ReviewManagement} />
            <Route path="/admin/categories" component={CategoriesManagement} />
            <Route path="/admin/collections" component={CollectionsManagement} />
            <Route path="/admin/orders" component={OrdersManagement} />
            <Route path="/admin/users" component={UsersManagement} />
            <Route path="/admin/banners" component={BannersManagement} />
            <Route path="/admin/popup" component={Popup} />
            <Route path="/admin/promotimer">
              <PromoTimerPage />
            </Route>
            <Route path="/admin/storemanage" component={StoreManagePage} />
            <Route path="/admin/settings" component={SettingsManagement} />
            <Route path="/admin/contacts" component={ContactsManagement} />
            <Route path="/admin/blogs" component={BlogsManagement} />
            <Route path="/admin/promocoupon" component={PromoCoupon} />
            <Route path="/admin/giftcards" component={GiftCardsManagement} />
            <Route path="/admin/giftcard-templates" component={GiftCardTemplatesManagement} />
            <Route path="/admin/qrscanner" component={QRScannerManagement} />
            <Route path="/admin/free-products" component={FreeProductsPage} />
            <Route path="/admin/testimonials" component={TestimonialsManagement} />
            <Route path="/admin" component={Dashboard} />
            <Route>
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h1 className="text-2xl font-heading text-primary mb-4">Page Not Found</h1>
                  <p className="text-neutral-gray">The page you are looking for does not exist.</p>
                </div>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <TooltipProvider>
          <Switch>
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin/:rest*" component={AdminContainer} />
            <Route>
              <Redirect to="/admin/login" />
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
