import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    
    if (!privacyConsent) {
      toast({
        title: "Error",
        description: "Please accept our Privacy Policy and Terms of Use.",
        variant: "destructive"
      });
      return;
    }
    
    // Here we would typically submit to an API
    toast({
      title: "Success!",
      description: "You've been subscribed to our newsletter."
    });
    
    setEmail("");
    setPrivacyConsent(false);
  };

  function ScrollToTopButton() {
    const [show, setShow] = useState(false);
    useEffect(() => {
      const onScroll = () => setShow(window.scrollY > 100);
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }, []);
    if (!show) return null;
    return (
      <button
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        className="fixed left-6 bottom-6 z-50 bg-black text-white p-2 rounded-full shadow-lg hover:bg-accent transition-all"
        aria-label="Scroll to top"
        style={{opacity: 0.85}}
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    );
  }

  return (
    <div>
      <footer className="bg-black text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Shop Links */}
            <div>
              <h3 className="text-lg font-medium mb-4">SHOP</h3>
              <ul className="space-y-2">
                <li><Link href="/collections/all" className="text-white/70 hover:text-white text-sm">All Products</Link></li>
                <li><Link href="/collections/skincare" className="text-white/70 hover:text-white text-sm">Skin Care</Link></li>
                <li><Link href="/collections/haircare" className="text-white/70 hover:text-white text-sm">Hair Care</Link></li>
                <li><Link href="/collections/bath-body" className="text-white/70 hover:text-white text-sm">Bath & Body</Link></li>
                <li><Link href="/collections/men" className="text-white/70 hover:text-white text-sm">Men</Link></li>
                <li><Link href="/collections/bestsellers" className="text-white/70 hover:text-white text-sm">Best Sellers</Link></li>
                <li><Link href="/collections/gifting" className="text-white/70 hover:text-white text-sm">Gifting</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">E-Gift Card</Link></li>
              </ul>
            </div>
            
            {/* Customer Care Links */}
            <div>
              <h3 className="text-lg font-medium mb-4">CUSTOMER CARE</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Contact Us</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">News & Media</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Delivery and Returns</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">FAQs</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Privacy Policy</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Terms of Use</Link></li>
              </ul>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-medium mb-4">QUICK LINKS</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">About Us</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Ingredients</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Loyalty Program</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Kama Experiences</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Store Locator</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Promotions</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Blog</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">N42 Helpline</Link></li>
              </ul>
            </div>
            
            {/* Account & Newsletter */}
            <div>
              <h3 className="text-lg font-medium mb-4">MY ACCOUNT</h3>
              <ul className="space-y-2">
                <li><Link href="/account" className="text-white/70 hover:text-white text-sm">My Profile</Link></li>
                <li><Link href="/account" className="text-white/70 hover:text-white text-sm">My Orders</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Track My Order</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white text-sm">Delivery & Returns</Link></li>
              </ul>
              
              <h3 className="text-lg font-medium mt-6 mb-4">SIGN UP FOR OUR NEWSLETTER!</h3>
              <form onSubmit={handleSubscribe} className="flex">
                <input 
                  type="email" 
                  placeholder="Your Email*" 
                  className="flex-grow px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="bg-accent hover:bg-accent-light text-white py-2 px-4 text-sm"
                >
                  SUBSCRIBE
                </button>
              </form>
              
              <div className="mt-4 flex items-center">
                <input 
                  type="checkbox" 
                  id="privacy-consent" 
                  className="mr-2"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                />
                <label htmlFor="privacy-consent" className="text-white/70 text-xs">
                  By Checking This Box, You Consent To Our{" "}
                  <Link href="#" className="underline">Privacy Policy</Link>{" "}
                  And{" "}
                  <Link href="#" className="underline">Terms of Use</Link>.
                </label>
              </div>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="border-t border-white/20 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/70 text-sm mb-4 md:mb-0">Follow us on</p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent" aria-label="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
  );
}

function ScrollToTopButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 100);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
      className="fixed left-6 bottom-6 z-50 bg-black text-white p-2 rounded-full shadow-lg hover:bg-accent transition-all"
      aria-label="Scroll to top"
      style={{opacity: 0.85}}
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
}
