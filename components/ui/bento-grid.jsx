import { cn } from "@/lib/utils";
import Link from "next/link";

// The main grid container for all BentoGridItems
export const BentoGrid = ({
  className,
  children
}) => {
  return (
    <div
      className={cn(
        // Adjust these values to change the overall grid layout
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto",
        className
      )}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  href
}) => {
  return (
    <Link href={href} className={cn(
      // Base styles for the item
      "row-span-1 rounded-2xl group/bento transition duration-300",
      // Background and border styles - adjust colors here
      "bg-[#fffbe6] dark:bg-[#2e3440]", // Light and dark mode background colors
      "border-2 border-[#f9e2af] dark:border-[#e5c890]", // Border colors
      // Layout styles
      "p-6 flex flex-col space-y-4",
      // Interactive styles
      "cursor-pointer overflow-hidden relative",
      "hover:shadow-md shadow-sm dark:shadow-none", // Adjust shadow intensity here
      // Hover animation - modify or remove these for different effects
      "hover:scale-[1.02] hover:-translate-y-1",
      className
    )}>
      {/* Decorative background element - adjust size, color, and position here */}
      <div className="absolute top-2 right-2 w-16 h-16 bg-[#f9e2af] dark:bg-[#e5c890] rounded-full opacity-30 dark:opacity-20"></div>

      {/* Header content */}
      <div className="flex-1 relative z-10">
        {header}
      </div>

      {/* Main content area */}
      <div className="group-hover/bento:translate-x-1 transition duration-300 relative z-10">
        {/* Icon - adjust color and size here */}
        <div className="text-[#df8e1d] dark:text-[#e5c890] mb-2">
          {icon}
        </div>

        {/* Title - adjust font, color, and size here */}
        <div className="font-sans font-bold text-[#45403d] dark:text-[#e5c890] mb-2 mt-2 text-lg">
          {title}
        </div>

        {/* Description - adjust font, color, and size here */}
        <div className="font-sans font-normal text-[#575279] dark:text-[#c6d0f5] text-sm">
          {description}
        </div>
      </div>

      {/* Bottom gradient bar - adjust colors and opacity here */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#f9e2af] via-[#e6c384] to-[#df8e1d] opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300"></div>
    </Link>
  );
};

// Usage example in your Home component:
// 
// import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
// 
// export default function Home() {
//   return (
//     <BentoGrid className="md:auto-rows-[20rem]">
//       {blogPosts.map((post, i) => (
//         <BentoGridItem
//           key={i}
//           title={post.title}
//           description={post.description}
//           header={<Skeleton />} // Replace with your header component
//           className={i === 0 || i === 3 ? "md:col-span-2" : "md:col-span-1"}
//           icon={post.icon}
//           href={post.id}
//         />
//       ))}
//     </BentoGrid>
//   );
// }
