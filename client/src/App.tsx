import React from "react";
import { Route, Switch, useLocation } from "wouter";
import Header from "./components/layout/Header";
import CheckoutHeader from "./components/layout/CheckoutHeader";
import NewsletterPopup from "./components/layout/NewsletterPopup";
import Footer from "./components/layout/Footer";
import { Toaster } from "./components/ui/toaster";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import GiftCardsPage from "./pages/GiftCardsPage";
import CheckoutPage from "./pages/CheckoutPage";
import ThankYouPage from "./pages/ThankYouPage";
import CollectionPage from "./pages/CollectionPage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import Popup from "./pages/Popup";
import ContactUsPage from "./pages/ContactUsPage";
import BlogsPage from "./pages/BlogsPage";
import BlogPostPage from "./pages/BlogPostPage";
import NotFoundPage from "./pages/not-found";
import StoreLocator from "./pages/StoreLocator";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import TrackingPage from "./pages/TrackingPage";

export default function App() {
  const [location] = useLocation();
  const isCheckout = location === "/checkout";
  return (
    <div className="app">
      {isCheckout ? <CheckoutHeader /> : <Header />}
      {!isCheckout && <NewsletterPopup />}
      <Toaster />
      <main className={isCheckout ? "pt-[60px]" : "pt-[180px] mt-2"}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/giftcards" component={GiftCardsPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/thank-you/:orderId" component={ThankYouPage} />
          <Route path="/collections/:slug" component={CollectionPage} />
          <Route path="/categories/:slug" component={CategoryPage} />
          <Route path="/products/:slug" component={ProductPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/account" component={AccountPage} />
          <Route path="/popup" component={Popup} />
          <Route path="/contact" component={ContactUsPage} />
          <Route path="/blogs/:slug" component={BlogPostPage} />
          <Route path="/blogs" component={BlogsPage} />
          <Route path="/storelocator" component={StoreLocator} />
          <Route path="/orders/:orderId" component={OrderDetailsPage} />
          <Route path="/track-order" component={TrackingPage} />
          <Route path="/orders/:orderId/track" component={TrackOrderPage} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </main>
      {!isCheckout && <Footer />}
    </div>
  );
}
