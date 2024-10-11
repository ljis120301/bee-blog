import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#f5e3db] to-[#f4d7c5] text-[#4b3c44] py-8 mt-10 dark:bg-gradient-to-r dark:from-[#414559] dark:to-[#51576d] dark:text-[#e5c890]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-bold mb-4">bee blog 🐝</h3>
            <p className="text-lg mb-2">Buzzing with ideas and honey-sweet content!</p>
            <p className="text-sm">© {new Date().getFullYear()} bee blog. some rights reserved i think idk but it looks professional.</p>
          </div>
          <div className="text-center md:text-right">
            <h4 className="text-xl font-semibold mb-4">Connect with Us</h4>
            <div className="flex justify-center md:justify-end space-x-4 mb-6">
              <a href="https://github.com/ljis120301/" target="_blank" rel="noopener noreferrer" className="hover:text-cat-frappe-peach transition-colors">
                <Github className="w-8 h-8" />
              </a>
              <a href="https://x.com/ljis120301" target="_blank" rel="noopener noreferrer" className="hover:text-cat-frappe-peach transition-colors">
                <Twitter className="w-8 h-8" />
              </a>
              <a href="mailto:nations_pendant_0o@icloud.com" className="hover:text-cat-frappe-peach transition-colors">
                <Mail className="w-8 h-8" />
              </a>
            </div>
            <div className="bg-[#f8e8e0] dark:bg-[#3a3e4e] p-4 rounded-lg shadow-md">
              <h5 className="text-xl font-bold mb-2">support the hive? 🐝</h5>
              <p className="text-sm mb-2">Your support helps us keep buzzing! Donate XMR:</p>
              <p className="text-xs font-mono bg-[#fff] dark:bg-[#2b2e3b] p-2 rounded break-all">
                48xWV6Ej4qRPZdKVEX7xQgLyWvxrSmCVXZS5pLXGpuPbMH6GhtiBjXBcHqHLxMMmEW474dkWTdLEsR6nARhhgKGRBou6nSk
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
