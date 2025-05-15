import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { Gift, MessageSquare, Star } from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ href, icon, label, isCollapsed }: SidebarLinkProps) => {
  const [location] = useLocation();
  const isActive = location === href || 
    (href !== "/admin/dashboard" && location.startsWith(href));
  
  return (
    <Link href={href} className={cn(
      "sidebar-link",
      isActive ? "active" : "",
      isCollapsed ? "justify-center" : ""
    )}>
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { admin } = useAdminAuth();
  
  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "flex items-center p-4 border-b border-border",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed ? (
          <div className="flex flex-col items-center">
            <h1 className="text-primary font-heading text-xl font-bold">KAMA</h1>
            <p className="text-primary font-accent text-xs tracking-wider">ADMIN</p>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="text-primary font-heading text-xl font-bold">K</span>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md"
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          )}
        </button>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          <li>
            <SidebarLink
              href="/admin/dashboard"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9"></rect>
                  <rect x="14" y="3" width="7" height="5"></rect>
                  <rect x="14" y="12" width="7" height="9"></rect>
                  <rect x="3" y="16" width="7" height="5"></rect>
                </svg>
              }
              label="Dashboard"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/storemanage"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M16 3v4M8 3v4" />
                  <path d="M5 10h14" />
                </svg>
              }
              label="StoreManage"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/products"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              }
              label="Products"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/reviews"
              icon={<Star size={20} />}
              label="Reviews"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/orders"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              }
              label="Orders"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/users"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              }
              label="Users"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/categories"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              }
              label="Categories"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/collections"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              }
              label="Collections"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/banners"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              }
              label="Banners"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/promocoupon"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
                  <rect x="9" y="9" width="6" height="7" rx="1" />
                  <path d="M14 4.5V2L17 5L14 8V5.5" />
                  <path d="M18 10l-4 4-2-2" />
                </svg>
              }
              label="PromoCode/Coupon"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/settings"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              }
              label="Settings"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/popup"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              }
              label="Popup"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/contacts"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-4.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9 8.5 8.5 0 0 1 8.5 8.5 8.38 8.38 0 0 1-.9 3.8z" />
                </svg>
              }
              label="Contact Us"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/blogs"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19H20V5H4v14zm0-16h16c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" />
                  <path d="M22 7H2" />
                </svg>
              }
              label="Blogs"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/promotimer"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <polyline points="16 3 12 7 8 3"/>
                  <text x="12" y="16" textAnchor="middle" fontSize="8" fill="#22c55e">⏰</text>
                </svg>
              }
              label="PromoTimer"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/giftcards"
              icon={<Gift size={20} />}
              label="Gift Cards"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/giftcard-templates"
              icon={<Gift size={20} />}
              label="Gift Card Templates"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/qrscanner"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              }
              label="QR Scanner"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/free-products"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path>
                  <path d="M12 12V4"></path>
                  <path d="M8 8l4-4 4 4"></path>
                  <line x1="18" y1="16" x2="6" y2="16"></line>
                </svg>
              }
              label="Free Products"
              isCollapsed={isCollapsed}
            />
          </li>
          <li>
            <SidebarLink
              href="/admin/testimonials"
              icon={<MessageSquare />}
              label="Testimonials"
              isCollapsed={isCollapsed}
            />
          </li>
        </ul>
      </nav>
      
      <div className={cn(
        "p-4 border-t border-border",
        isCollapsed ? "text-center" : ""
      )}>
        {!isCollapsed && admin && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center uppercase font-medium text-sm">
              {admin.name ? admin.name.charAt(0) : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
            </div>
          </div>
        )}
        {isCollapsed && admin && (
          <div className="h-8 w-8 mx-auto rounded-full bg-primary text-white flex items-center justify-center uppercase font-medium text-sm">
            {admin.name ? admin.name.charAt(0) : "A"}
          </div>
        )}
      </div>
    </aside>
  );
}
