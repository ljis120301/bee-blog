'use client';

/**
 * Verify Page - Placeholder
 * ==========================
 * Email verification not yet implemented with Prisma.
 */
import Header from '@/components/app/layout/Header';
import Footer from '@/components/app/layout/Footer';
import Link from 'next/link';

const VerifyPage = () => {
  return (
    <>
      <Header />
      <main className="pt-[calc(64px+8px)] min-h-screen bg-[#E9D4BA] dark:bg-cat-frappe-base">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
              <div className="rounded-lg p-8 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                <h1 className="text-2xl font-bold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">
                  Email Verification
                </h1>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mb-4">
                  Email verification is not currently required for this site.
                </p>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mb-4">
                  Your account is already active. You can proceed to login.
                </p>
                <Link
                  href="/auth"
                  className="inline-block mt-4 px-4 py-2 bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust rounded-md hover:opacity-90 transition-opacity"
                >
                  Go to Login →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VerifyPage;
