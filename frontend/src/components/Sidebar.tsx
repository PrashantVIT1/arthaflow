import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  Database,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Sales",
    path: "/sales",
    icon: DollarSign,
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
  },
  {
    label: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    label: "Data Pipeline",
    path: "/data-pipeline",
    icon: Database,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          top-0
          left-0
          h-screen
          bg-gray-900
          text-white
          border-r
          border-gray-800
          flex
          flex-col
          z-50
          transition-all
          duration-300
          ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Header */}
        <header className="relative h-20 border-b border-gray-800 flex items-center px-4 flex-shrink-0">
          {/* Brand */}
          <div
            className={`
              overflow-hidden
              transition-all
              duration-300
              ease-in-out
              ${
                isCollapsed
                  ? "max-w-0 opacity-0"
                  : "max-w-[170px] opacity-100"
              }
            `}
          >
            <h1 className="text-xl font-bold whitespace-nowrap">
              ArthaFlow
            </h1>

            <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">
              From Data to Destiny
            </p>
          </div>

          {/* Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className={`
              hidden
              lg:flex
              absolute
              top-1/2
              -translate-y-1/2
              w-9
              h-9
              items-center
              justify-center
              rounded-lg
              border
              border-gray-700
              hover:bg-gray-800
              transition-all
              duration-300
              ease-in-out
              ${
                isCollapsed
                  ? "left-1/2 -translate-x-1/2"
                  : "right-4"
              }
            `}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </header>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    onClick={onClose}
                    className={`
                      flex
                      items-center
                      h-12
                      rounded-xl
                      transition-all
                      duration-200
                      ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }
                    `}
                  >
                    {/* Icon */}
                    <div className="w-14 flex justify-center flex-shrink-0">
                      <Icon
                        className={`w-5 h-5 ${
                          active ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>

                    {/* Label */}
                    <div
                      className={`
                        overflow-hidden
                        transition-all
                        duration-300
                        ease-in-out
                        ${
                          isCollapsed
                            ? "max-w-0 opacity-0"
                            : "max-w-[150px] opacity-100"
                        }
                      `}
                    >
                      <span className="font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
                {/* Footer */}
        <footer className="h-20 border-t border-gray-800 flex items-center flex-shrink-0">
          <div className="relative w-full h-full flex items-center">

            {/* Avatar - Always fixed */}
            <div className="absolute left-5 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
                A
              </div>
            </div>

            {/* User Info */}
            <div
              className={`
                absolute
                left-[68px]
                overflow-hidden
                whitespace-nowrap
                transition-all
                duration-300
                ease-in-out
                ${
                  isCollapsed
                    ? "opacity-0 max-w-0"
                    : "opacity-100 max-w-[170px]"
                }
              `}
            >
              <p className="text-sm font-medium">
                Admin User
              </p>

              <p className="text-xs text-gray-400">
                admin@arthaflow.com
              </p>
            </div>

          </div>
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;