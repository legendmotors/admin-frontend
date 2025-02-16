import IconSettings from "@/components/icon/icon-settings";
import IconSquareRotated from "@/components/icon/icon-square-rotated";
import IconMenuDashboard from "@/components/icon/menu/icon-menu-dashboard";

// menuConfig.ts
export const menuConfig = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: IconMenuDashboard,
      path: "/",
      roles: ["admin", "editor", "viewer"], // Roles allowed to view this menu
      children: [
        {
          key: "analytics",
          label: "Analytics",
          path: "/",
          roles: ["admin", "editor"],
        },
      ],
    },
    {
      key: "manageCarDetails",
      label: "Manage Car Details",
      icon: IconSettings,
      roles: ["admin", "editor"],
      children: [
        { key: "allBrands", label: "All Brands", path: "/brand/list", roles: ["admin"] },
        { key: "allModels", label: "All Models", path: "/model/list", roles: ["admin", "editor"] },
        { key: "allTrims", label: "All Trims", path: "/trim/list", roles: ["admin", "editor"] },
      ],
    },
    {
      key: "manageCarFeatures",
      label: "Manage Car Features",
      icon: IconSquareRotated,
      roles: ["admin", "editor"],
      children: [
        { key: "features", label: "Features", path: "/feature/list", roles: ["admin", "editor"] },
        { key: "featuresWithValues", label: "Features with Values", path: "/feature/list-value", roles: ["admin"] },
      ],
    },
  ];
  