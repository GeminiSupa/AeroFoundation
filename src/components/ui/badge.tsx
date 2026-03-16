import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Role-based variants
        admin:
          "border-transparent bg-role-admin text-white [a&]:hover:bg-role-admin/90",
        teacher:
          "border-transparent bg-role-teacher text-white [a&]:hover:bg-role-teacher/90",
        student:
          "border-transparent bg-role-student text-white [a&]:hover:bg-role-student/90",
        parent:
          "border-transparent bg-role-parent text-white [a&]:hover:bg-role-parent/90",
        // Semantic variants
        positive:
          "border-transparent bg-sap-positive text-white [a&]:hover:bg-sap-positive/90",
        negative:
          "border-transparent bg-sap-negative text-white [a&]:hover:bg-sap-negative/90",
        critical:
          "border-transparent bg-sap-critical text-white [a&]:hover:bg-sap-critical/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
