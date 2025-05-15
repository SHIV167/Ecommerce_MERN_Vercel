import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Grid, User, Download, ShoppingBag } from 'react-feather';
import styled from 'styled-components';

const FooterNav = styled.nav`
  display: none; /* Hidden by default */
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 400px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    z-index: 1000;
    padding: 12px 8px;
    justify-content: space-around;
    align-items: center;
    border-radius: 16px;
    transition: all 0.3s ease;
  }
`;

const NavItem = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: ${props => props.$active ? '#8257F6' : '#666'};
  font-size: 0.75rem;
  gap: 6px;
  padding: 8px 0;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  svg {
    width: 20px;
    height: 20px;
    stroke-width: ${props => props.$active ? 2.5 : 1.5};
    transition: all 0.2s ease;
  }
`;

const CenterButton = styled(NavItem)`
  background-color: #8257F6;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  justify-content: center;
  margin-top: -30px;
  box-shadow: 0 4px 12px rgba(130, 87, 246, 0.4);
  border: 4px solid rgba(255, 255, 255, 0.95);
  padding: 0;
  
  svg {
    stroke-width: 2;
    margin: 0;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(130, 87, 246, 0.5);
  }
`;

const NavLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;
`;

const ActiveIndicator = styled.div`
  position: absolute;
  top: -6px;
  width: 5px;
  height: 5px;
  background-color: #8257F6;
  border-radius: 50%;
  transition: all 0.3s ease;
`;

const MobileFooterNav: React.FC = () => {
  const [location] = useLocation();
  const isActive = (path: string) => location === path;
  
  return (
    <FooterNav>
      <Link href="/">
        <NavItem $active={isActive('/')}>
          {isActive('/') && <ActiveIndicator />}
          <Home />
          <NavLabel>Home</NavLabel>
        </NavItem>
      </Link>
      <Link href="/categories">
        <NavItem $active={isActive('/categories')}>
          {isActive('/categories') && <ActiveIndicator />}
          <Grid />
          <NavLabel>Categories</NavLabel>
        </NavItem>
      </Link>
      
      <Link href="/offers">
        <CenterButton $active={isActive('/offers')}>
          <ShoppingBag />
        </CenterButton>
      </Link>
      
      <Link href="/account">
        <NavItem $active={isActive('/account')}>
          {isActive('/account') && <ActiveIndicator />}
          <User />
          <NavLabel>Account</NavLabel>
        </NavItem>
      </Link>
      <Link href="/downloads">
        <NavItem $active={isActive('/downloads')}>
          {isActive('/downloads') && <ActiveIndicator />}
          <Download />
          <NavLabel>Downloads</NavLabel>
        </NavItem>
      </Link>
    </FooterNav>
  );
};

export default MobileFooterNav;
