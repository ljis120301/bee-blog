import { pb } from '@/lib/pocketbase';

export function adminAuth(handler) {
  return async (req, res) => {
    if (!pb.authStore.isValid) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = pb.authStore.model;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    return handler(req, res);
  };
}

