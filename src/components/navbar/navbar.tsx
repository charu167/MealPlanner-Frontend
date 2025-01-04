import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <>
      <nav className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-2xl">
                NutriCraft
              </Link>
            </div>
            <div>
              <ul className="flex space-x-4">
                <li>
                  <Link
                    href="/macro-calculator"
                    className="text-gray-200 text-base font-semibold hover:text-white px-3 py-2 rounded-md"
                  >
                    MacroCalculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-gray-200 text-base font-semibold hover:text-white px-3 py-2 rounded-md"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="text-gray-200 text-base font-semibold hover:text-white px-3 py-2 rounded-md"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
