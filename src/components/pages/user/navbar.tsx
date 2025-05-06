'use client';



import { MenuIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '../../../components/icons/logo';
import { AccountDropdown } from './account-dropdown';
import { buttonVariants } from '~/components/ui/button';
import { ThemeToggle } from '~/components/shared/theme-toggle';

interface NavbarProps {
    user: boolean;
}

export const Navbar = ({user}:NavbarProps) => {
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Reusable products',
      href: '/products',
    },
    {
      name: 'Contact Us',
      href: '/contact',
    },
  ];

  return (
    <nav className="flex flex-row items-center justify-between px-4 py-4 w-full backdrop-blur-xl bg-background top-0 z-10 sticky">
      {/* Logo and Name */}
      <div className="flex items-center">
        <Link href="/" prefetch>
          <Logo
            size="30px"
            className="text-foreground fill-foreground"
          />
        </Link>
        <h1 className="text-4xl font-bold font-italiana ml-2 hidden md:inline-block">
          Reuse
        </h1>
      </div>

      {/* Hamburguer menu for mobile */}
      <div className='md:hidden flex z-30'>
        <button onClick={() => setDrawerOpen(true)}>
          {!drawerOpen && <MenuIcon className="h-6 w-6" />}
        </button>

        {/* Overlay */}
        <div  
          className={`${
            drawerOpen ? 'block animate-fade animate-duration-100' : 'hidden'
          } absolute top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-xl z-20 rotate-in`}
        />

        <div
          className={`${
            drawerOpen ? 'block animate-fade-down animate-duration-100 animate-delay-100' : 'hidden'
          } bg-background rounded-b-lg w-full top-0 left-0 h-72 z-40 absolute`}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            className="absolute top-4 right-4"
          >
            <XIcon />
          </button>
          <h1 className="text-lg mt-4 ml-4">Menu</h1>
          <ul className="flex flex-col gap-y-4">
            {links.map((link) => {
              return (
                <li
                  key={link.name}
                  className="text-lg ml-4 mt-2"
                >
                  <Link href={link.href}>{link.name}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Menu */}
      <ul className="flex-row gap-x-8 items-center hidden md:flex">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <li
              key={link.name}
              className="relative text-lg"
            >
              <Link href={link.href}>{link.name}</Link>
              <span
                className={`absolute bottom-0 left-0  h-0.5 rounded-full bg-foreground transition-all duration-100 ${
                  isActive ? 'w-full' : 'w-0'
                }`}
              />
            </li>
          );
        })}
      </ul>

      {/* */}
      <div className="hidden md:flex flex-row items-center gap-x-4">
        {/* Here we place a dashboard button if the user has the label of admin */}
        {user ? (
          user ? (
            <Link
              className={buttonVariants({ variant: 'default' })}
              href={'/dashboard'}
            >
              Dashboard
            </Link>
          ) : (
            <AccountDropdown />
          )
        ) : (
          <Link
            className={buttonVariants({
              variant: 'default',
              size: 'lg',
              className: 'cursor-pointer text-base',
            })}
            href="/login"
          >
            Login
          </Link>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
};