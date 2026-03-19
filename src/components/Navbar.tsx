"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
  muted?: boolean;
}

const navLinks: NavLink[] = [
  { href: "/deals", label: "דילים" },
  { href: "https://t.me/clickli26", label: "טלגרם", external: true },
  { href: "/admin", label: "אדמין", muted: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeMenu]);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl md:text-2xl font-extrabold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          קליקלי
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-gray-800/50 transition-all font-medium"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800/50 transition-all ${
                  link.muted
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-300 hover:text-emerald-400 font-medium"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden p-2 text-gray-300 hover:text-emerald-400 transition-colors"
          aria-label={isOpen ? "סגור תפריט" : "פתח תפריט"}
          aria-expanded={isOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div
        ref={menuRef}
        className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-60 border-t border-gray-800" : "max-h-0"
        }`}
      >
        <div className="px-4 py-2 space-y-1">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="block text-sm text-gray-300 hover:text-emerald-400 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-all font-medium"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`block text-sm px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-all ${
                  link.muted
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-300 hover:text-emerald-400 font-medium"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
