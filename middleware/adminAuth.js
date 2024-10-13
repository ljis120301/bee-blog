import { pb } from '@/lib/pocketbase';

export function adminAuth(handler) {
  return async (req, res) => {
    if (!pb.authStore.isValid) {
      return res.redirect('/auth');
    }

    const user = pb.authStore.model;
    if (user.role !== "admin") {
      return res.redirect('/auth');
    }

    return handler(req, res);
  };
}

