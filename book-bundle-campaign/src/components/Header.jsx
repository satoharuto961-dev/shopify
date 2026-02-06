function Header() {
    return (
        <header className="relative py-16 px-4 text-center border-b border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Background Texture Orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 animate-gradient-x">
                    Book Bundle
                </span>
            </h1>
        </header>
    );
}

export default Header;
