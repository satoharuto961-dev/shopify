function Header() {
    return (
        <header className="relative py-16 px-4 text-center border-b border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Background Texture Orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 relative">
                Reddit Readers’ <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 animate-gradient-x">
                    Favorite Books
                </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
                Curated top picks from the community. <br className="hidden md:block" />
                <span className="inline-flex flex-col md:flex-row items-center gap-3 mt-4">
                    <span className="text-gray-400 font-medium decoration-slate-400/50 line-through decoration-2">Value $210</span>
                    <strong className="text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-50/80 dark:bg-indigo-900/40 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800/50 shadow-sm flex items-center gap-2">
                        Pick 7 for $39
                        <span className="text-sm font-normal text-indigo-500 dark:text-indigo-400 border-l border-indigo-200 dark:border-indigo-700 pl-2 ml-1">
                            ($5.50 each)
                        </span>
                    </strong>
                </span>
            </p>
        </header>
    );
}

export default Header;
