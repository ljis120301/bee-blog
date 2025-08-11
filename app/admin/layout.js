export const metadata = {
  title: 'Admin Dashboard | BeeBlog',
  description: 'BeeBlog administrative dashboard for managing content, users, and analyzing behavioral metrics.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

// Ensure this segment is dynamic via client page. No revalidate export here.

export default function AdminLayout({ children }) {
  return children;
}
