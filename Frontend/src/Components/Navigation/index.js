import React from "react";
import { useNavigate } from "react-router-dom";
import { withAuthContext } from "../../context/Auth";
import { FaUserCircle, FaHistory, FaCog, FaHeart, FaKey, FaSignOutAlt } from "react-icons/fa";
import swal from "sweetalert";

const links = [
    { key: "Dashboard", label: "Dashboard", path: "/Profile", icon: FaUserCircle },
    { key: "OrderHistory", label: "Order History", path: "/OrderHistory", icon: FaHistory },
    { key: "Setting", label: "Account Setting", path: "/AccountSetting", icon: FaCog },
    { key: "Wishlist", label: "Wishlist", path: "/Wishlist", icon: FaHeart },
    { key: "Change Password", label: "Change Password", path: "/ChangePassword", icon: FaKey },
];

function Navigation({ active, setToken }) {
    const navigate = useNavigate();

    const logout = () => {
        swal({
            text: "Are you sure you want to log out?",
            buttons: ["Cancel", "Log Out"],
            icon: "warning",
        }).then((confirmed) => {
            if (confirmed) {
                localStorage.removeItem("token");
                setToken && setToken("");
                navigate("/SignIn");
            }
        });
    };

    return (
        <nav className="md:w-[20%] w-full h-fit rounded-2xl bg-white border border-[#d2d2d7] overflow-hidden mb-6 md:mb-0">
            <div className="p-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = active === link.key;
                    return (
                        <div
                            key={link.key}
                            onClick={() => navigate(link.path)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 cursor-pointer transition-colors duration-200 ${isActive
                                ? "bg-[#f97316] text-white"
                                : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{link.label}</span>
                        </div>
                    );
                })}
                <div
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-red-500 hover:bg-red-50 transition-colors duration-200 mt-4 border-t border-[#d2d2d7] pt-4"
                >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span className="font-medium text-sm">Log Out</span>
                </div>
            </div>
        </nav>
    );
}

export default withAuthContext(Navigation);
