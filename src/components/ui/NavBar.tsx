import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaCrown } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/supabase_hooks/useAuth";

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLElement | null>(null);
	const isMobile = window.innerWidth < 640;
	const { user } = useAuth();

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false);
			}
		};

		const handleScroll = () => setIsMenuOpen(false);

		document.addEventListener("mousedown", handleOutsideClick);
		window.addEventListener("scroll", handleScroll);

		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const routes = [
		{ path: "/login", label: "Login", showWhenLoggedIn: false },
		{ path: "/signup", label: "Register", showWhenLoggedIn: false },
		{ path: "/about", label: "How to Earn", showWhenLoggedIn: true },
		{ path: "/overview", label: "Account", showWhenLoggedIn: true },
	];

	const filteredRoutes = routes.filter(route => 
		!user ? !route.showWhenLoggedIn : route.showWhenLoggedIn
	);

	return (
		<header className='fixed top-0 w-full bg-[#1e1f2e10] backdrop-blur-md z-50'>
			<div className='flex items-center justify-between flex-wrap w-full px-4 md:px-12 py-2.5'>
				<div className='flex items-center mr-auto'>
					<Link
						to='/'
						className='w-[100px] sm:w-[150px]'>
						<div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center">
							<img src="/images/cashhub.jpg" alt="logo" className="w-8 h-8 mr-2 rounded-full" />
							<span className="hidden md:inline">CashHub</span>
						</div>
					</Link>
				</div>

				{!isMobile && (
					<nav className='flex flex-row gap-5 items-center'>
						{filteredRoutes.map((route, index) => (
							<NavLink
								key={index}
								to={route.path}
								className={({ isActive }) => `
									text-white no-underline text-sm md:text-base hover:text-gray-300 transition-colors 
									flex items-center gap-2 ${isActive ? 'text-yellow-400' : ''}
								`}>
								{route.label}
							</NavLink>
						))}
						
					</nav>
				)}

				{isMobile && (
					<>
						<div className="flex items-center gap-3 mr-4">
							{user?.isVip && (
								<div className="flex items-center gap-1">
									<FaCrown className="text-yellow-400 animate-pulse" size={16} title="VIP Member" />
								</div>
							)}
						</div>
						<nav
							ref={menuRef}
							className={`fixed top-0 right-0 w-full h-screen bg-[#1e1f2e] backdrop-blur-lg p-24 flex items-center justify-center z-50 transform transition-transform duration-300 ${
								isMenuOpen ? "translate-x-0" : "translate-x-full"
							}`}>
							<div className='flex flex-col gap-4 text-center'>
								{filteredRoutes.map((route, index) => (
									<NavLink
										key={index}
										to={route.path}
										onClick={() => setIsMenuOpen(false)}
										className={({ isActive }) => `
											text-white no-underline text-sm p-1 border border-dotted border-white rounded 
											hover:bg-white/10 transition-colors flex items-center gap-2 justify-center
											${isActive ? 'bg-white/20' : ''}
										`}>
										{route.label}
									</NavLink>
								))}
							</div>
						</nav>
					</>
				)}

				<button
					className={`sm:hidden flex items-center justify-center bg-transparent border-none p-0.5 cursor-pointer mr-8 z-[100] ${
						isMobile ? "flex" : "hidden"
					}`}
					onClick={() => setIsMenuOpen((prev) => !prev)}>
					{isMenuOpen ? (
						<FaTimes
							size={24}
							className='text-white'
						/>
					) : (
						<FaBars
							size={24}
							className='text-white'
						/>
					)}
				</button>
			</div>
		</header>
	);
}

export default Header;
