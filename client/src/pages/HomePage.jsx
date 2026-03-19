import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    AppBar, 
    Toolbar, 
    Button, 
    Typography, 
    Box, 
    Card, 
    CardContent, 
    Chip,
    Avatar,
    IconButton,
    useTheme
} from "@mui/material";

// ───────────────────────────────✦. CUSTOM ICONS .✦───────────────────────────────
import {
	Box as BoxIcon,
	Layers,
	LayoutDashboard,
	Sparkles,
	Database,
	ArrowRight
} from "lucide-react";
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun

const Homepage = ({ currentMode, toggleMode }) => {
	const navigate = useNavigate();
    const theme = useTheme();
    const [user, setUser] = useState(null);

    // Check if the user is already logged in
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);

    // Smart routing for the top right button
    const handleAuthAction = () => {
        if (user) {
            const role = user.role?.toLowerCase()?.trim() || 'user';
            if (role === 'owner') navigate('/owner-dashboard');
            else if (role === 'admin' || role === 'staff') navigate('/admin-dashboard');
            else navigate('/dashboard');
        } else {
            navigate('/auth');
        }
    };

	// ───────────────────────────────✦. AESTHETIC STUFF .✦───────────────────────────────
	return (
    <Box 
    sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'all 0.3s ease',
        position: 'relative',
        // ─── ADJUSTED OPACITY FOR BETTER VISIBILITY ───
        backgroundImage: currentMode === 'dark' 
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://res.cloudinary.com/duvwsjsuz/image/upload/v1773919344/screenshot_2026-03-19_19-17-08_nlngfh.png")` 
            : `linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url("https://res.cloudinary.com/duvwsjsuz/image/upload/v1773919344/screenshot_2026-03-19_19-17-08_nlngfh.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        bgcolor: 'background.default', 
        color: 'text.primary', 
    }}
>
			<style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-40px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(40px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                /* ── Blob drift animations ── */
                @keyframes drift1 {
                    0%   { transform: translate(0px, 0px) scale(1); }
                    25%  { transform: translate(40px, -30px) scale(1.05); }
                    50%  { transform: translate(20px, 40px) scale(0.97); }
                    75%  { transform: translate(-30px, 20px) scale(1.03); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes drift2 {
                    0%   { transform: translate(0px, 0px) scale(1); }
                    25%  { transform: translate(-50px, 30px) scale(1.04); }
                    50%  { transform: translate(-20px, -40px) scale(0.96); }
                    75%  { transform: translate(40px, -20px) scale(1.06); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }

                .blob-1 { animation: drift1 12s ease-in-out infinite; }
                .blob-2 { animation: drift2 16s ease-in-out infinite; }

                .anim-fade-up   { animation: fadeUp 0.7s ease forwards; }
                .anim-fade-up-2 { animation: fadeUp 0.7s ease 0.15s forwards; opacity: 0; }
                .anim-fade-up-3 { animation: fadeUp 0.7s ease 0.3s  forwards; opacity: 0; }
                .anim-fade-up-4 { animation: fadeUp 0.7s ease 0.45s forwards; opacity: 0; }
                .anim-fade-in   { animation: fadeIn 1s ease 0.2s forwards; opacity: 0; }
                .anim-slide-left  { animation: slideInLeft  0.7s ease 0.3s forwards; opacity: 0; }
                .anim-slide-right { animation: slideInRight 0.7s ease 0.5s forwards; opacity: 0; }
                .feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); }
            `}</style>

 {/* ───────────────────────────────✦. NAVBAR .✦─────────────────────────────── */}
            <AppBar 
                position="sticky" 
                elevation={0} 
                sx={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.1)', 
                    // Dynamic background: Maroon for Light, Firebrick for Dark
                    bgcolor: currentMode === 'light' ? '#590016' : '#B22222',
                    transition: 'background-color 0.3s ease' 
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 1 }}>
                    
                    {/* Brand / Logo Area */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate("/")}>
                        <Avatar src="/RedBrickLogo.png" sx={{ width: 45, height: 45, bgcolor: 'white', p: 0.5 }} />
                        <Typography 
                            variant="h5" 
                            component="div" 
                            sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: 1, display: { xs: 'none', sm: 'block' } }} 
                        >
                            RED BRICK
                        </Typography>
                    </Box>

                    {/* Navbar Links & Theme Toggle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        
                        {/* THEME TOGGLE BUTTON */}
                        <IconButton onClick={toggleMode} sx={{ color: 'white' }}>
                            {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>

                        <Button 
                            variant="contained" 
                            onClick={handleAuthAction}
                            sx={{ 
                                bgcolor: '#ffffff', 
                                // Text color matches the current Navbar background
                                color: currentMode === 'light' ? '#590016' : '#B22222', 
                                textTransform: 'none', 
                                fontWeight: 900, 
                                borderRadius: '8px', 
                                px: 3,
                                '&:hover': { bgcolor: '#e0e0e0' }
                            }}
                        >
                            {user ? 'Dashboard' : 'Log In'}
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

			<Box className="flex flex-col items-center gap-0" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

				{/* ───────────────────────────────✦. HERO .✦─────────────────────────────── */}
				<Box component="section" sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', px: 3, pt: 10, pb: 12, gap: 3, position: 'relative', overflow: 'hidden' }}>

					<div className="anim-fade-in absolute inset-0 pointer-events-none">
						<div className="blob-1 absolute top-16 left-1/4 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: currentMode === 'dark' ? 'rgba(178, 34, 34, 0.15)' : 'rgba(178, 34, 34, 0.08)' }} />
						<div className="blob-2 absolute bottom-10 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: currentMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }} />
					</div>

					<div className="anim-fade-up relative z-10">
						<Chip 
                            icon={<Sparkles size={14} color="#B22222" />} 
                            label="The Ultimate Collection" 
                            variant="outlined" 
                            sx={{ color: '#B22222', borderColor: 'rgba(178, 34, 34, 0.5)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', py: 2.5, px: 1, bgcolor: currentMode === 'light' ? 'rgba(178, 34, 34, 0.05)' : 'transparent' }}
                        />
					</div>

					<Typography 
                            variant="h2" 
                            sx={{ 
                                fontWeight: 900, 
                                textShadow: currentMode === 'dark' ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(255,255,255,0.5)' 
                            }}
                        >
                            Discover and share...
                        </Typography>

					<Typography 
                        variant="h6" 
                        className="anim-fade-up-3 relative z-10"
                        sx={{ maxWidth: '32rem', lineHeight: 1.6, mt: 1, color: 'text.secondary' }}
                    >
						Browse through our extensive database. Find exactly what you need, simple, fast, and reliable.
					</Typography>

					<Box className="anim-fade-up-4 relative z-10" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 4 }}>
						<Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/models")}
                            endIcon={<ArrowRight size={18} />}
                            sx={{ 
                                bgcolor: '#B22222', 
                                color: '#ffffff', 
                                borderRadius: '50px', 
                                px: 4, 
                                py: 1.5, 
                                textTransform: 'none', 
                                fontSize: '1.1rem', 
                                boxShadow: currentMode === 'dark' 
                                 ? '0 4px 14px 0 rgba(178, 34, 34, 0.39)' 
                                : '0 4px 14px 0 rgba(89, 0, 22, 0.25)', // Maroon-tinted shadow for light mode
                                '&:hover': { bgcolor: '#8b1a1a', transform: 'scale(1.05)' }, 
                                transition: 'transform 0.2s, background-color 0.2s' 
                            }}
						>
							Start Browsing
						</Button>
					</Box>
				</Box>

				{/* ───────────────────────────────✦. FEATURES .✦─────────────────────────────── */}
				<Box component="section" sx={{ width: '100%', maxWidth: '900px', px: 3, pb: 12, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
					{[
						{
							icon: <BoxIcon size={28} color="#B22222" />,
							title: "Vast Library",
							desc: "Explore a wide variety of models carefully categorized for your convenience.",
							delay: "anim-slide-left"
						},
						{
							icon: <Layers size={28} color="#B22222" />,
							title: "High Quality",
							desc: "Access detailed specs and view assets in a clean, organized interface.",
							delay: "anim-fade-up-3"
						},
						{
							icon: <Database size={28} color="#B22222" />,
							title: "Secure Storage",
							desc: "Create an account to save your favorites and build your personal collection.",
							delay: "anim-slide-right"
						},
					].map((f) => (
						<Card 
                            key={f.title} 
                            className={`feature-card ${f.delay}`} 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: 3, 
                                // 🟢 Frosted glass effect
                                bgcolor: currentMode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)', 
                                backdropFilter: 'blur(10px)', 
                                borderColor: 'divider', 
                                height: '100%',
                                transition: 'transform 0.2s ease',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}
>
							<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start', p: 3 }}>
								{f.icon}
								<Typography variant="h6" component="h3" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                    {f.title}
                                </Typography>
								<Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                                    {f.desc}
                                </Typography>
							</CardContent>
						</Card>
					))}
				</Box>

				{/* ───────────────────────────────✦. CTA BANNER .✦─────────────────────────────── */}
				<Box component="section" className="anim-fade-up-4" sx={{ width: '100%', maxWidth: '900px', px: 3, pb: 12 }}>
					<Card sx={{ bgcolor: '#B22222', color: '#ffffff', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
						<CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, py: 6 }}>
							<div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
							<div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
							
                            <LayoutDashboard size={36} className="opacity-80 relative z-10" />
							<Typography variant="h4" component="h2" fontWeight="900" className="relative z-10">
                                Ready to join?
                            </Typography>
							<Typography variant="body1" sx={{ opacity: 0.9, maxWidth: '24rem', mb: 2 }} className="relative z-10">
								Create your account to unlock full access, save your favorite models, and contribute to the community.
							</Typography>
							
                            <Button
                                variant="contained"
                                // 🟢 MAKE SURE THIS SAYS /signup, NOT /auth
                                onClick={() => navigate("/signup")} 
                                endIcon={<ArrowRight size={16} />}
                            
                            >
                                Create Free Account
                            </Button>
						</CardContent>
					</Card>
				</Box>

			</Box>
		</Box>
	);
};

export default Homepage;