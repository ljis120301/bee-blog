"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState, createContext, useContext } from "react";
import { motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Image from "next/image";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, className, ...props }) => {
  const { open, setOpen } = useSidebar();

  return (
    <motion.div
      className={cn(
        "fixed top-24 left-0 z-40 h-[calc(100vh-6rem)] bg-cat-frappe-yellow dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text transition-all duration-100 ease-in-out overflow-hidden",
        open ? "w-64" : "w-20",
        className
      )}
      animate={{ width: open ? "16rem" : "5rem" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex flex-col items-center mb-8">
          <button onClick={() => setOpen(!open)} className="p-2 mb-4">
            {open ? <IconX size={28} /> : <IconMenu2 size={28} />}
          </button>
          <Link href="/" className="mt-4">
            <Image
              src="/bee-icon.ico"
              width={48}
              height={48}
              alt="Bee Logo"
              className="rounded-full cursor-pointer"
            />
          </Link>
        </div>
        <div className="overflow-y-auto overflow-x-hidden flex-grow">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export const SidebarLink = ({ link, className, ...props }) => {
  const { open } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-center xl:justify-start gap-3 py-3 px-4 rounded-md hover:bg-cat-frappe-surface1 dark:hover:bg-cat-frappe-surface2 transition-colors whitespace-nowrap",
        className
      )}
      onClick={link.onClick}
      {...props}
    >
      {React.cloneElement(link.icon, { size: open ? 24 : 28 })}
      {open && (
        <span className="hidden xl:inline overflow-hidden transition-opacity duration-100">
          {link.label}
        </span>
      )}
    </Link>
  );
};

export const SidebarBody = ({ className, children, ...props }) => {
  return (
    <div className={cn("flex flex-col h-full", className)} {...props}>
      {children}
    </div>
  );
};
