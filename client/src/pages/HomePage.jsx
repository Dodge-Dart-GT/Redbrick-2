import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    AppBar, Toolbar, Button, Typography, Box, Card, CardContent, 
    Chip, Avatar, IconButton 
} from "@mui/material";

// Icons
import { Box as BoxIcon, Layers, LayoutDashboard, Sparkles, Database, ArrowRight } from "lucide-react";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Homepage = ({ currentMode, toggleMode }) => {
	const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // ─── LOGIC: AUTH CHECK ───
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);

    const handleAuthAction = () => {
        if (user) {
            const role = user.role?.toLowerCase()?.trim() || 'user';
            if (role === 'owner') navigate('/owner-dashboard');
            else if (role === 'admin' || role === 'staff') navigate('/admin-dashboard');
            else navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

	return (
		<Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
			<style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
                
                .anim-fade-up   { animation: fadeUp 0.7s ease forwards; }
                .anim-fade-up-2 { animation: fadeUp 0.7s ease 0.15s forwards; opacity: 0; }
                .anim-fade-up-3 { animation: fadeUp 0.7s ease 0.3s  forwards; opacity: 0; }
                .anim-fade-up-4 { animation: fadeUp 0.7s ease 0.45s forwards; opacity: 0; }
                .anim-fade-in   { animation: fadeIn 1s ease 0.2s forwards; opacity: 0; }
                .anim-slide-left  { animation: slideInLeft  0.7s ease 0.3s forwards; opacity: 0; }
                .anim-slide-right { animation: slideInRight 0.7s ease 0.5s forwards; opacity: 0; }
                .feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.2); }
            `}</style>

            {/* ─── LAYER 1: LIGHT MODE BACKGROUND ─── */}
            <Box sx={{ 
                position: 'fixed', inset: 0, zIndex: -2,
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url("https://res.cloudinary.com/duvwsjsuz/image/upload/v1773919344/screenshot_2026-03-19_19-17-08_nlngfh.png")`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                transition: 'opacity 0.8s ease-in-out',
                opacity: currentMode === 'light' ? 1 : 0 
            }} />

            {/* ─── LAYER 2: DARK MODE BACKGROUND ─── */}
            <Box sx={{ 
                position: 'fixed', inset: 0, zIndex: -1,
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://res.cloudinary.com/duvwsjsuz/image/upload/v1773921024/screenshot_2026-03-19_19-49-47_xiighh.png")`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                transition: 'opacity 0.8s ease-in-out',
                opacity: currentMode === 'dark' ? 1 : 0 
            }} />

            {/* ─── CONTENT WRAPPER ─── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'transparent', color: 'text.primary', position: 'relative', zIndex: 1 }}>
                
                {/* NAVBAR */}
                <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: currentMode === 'light' ? '#590016' : '#B22222' }}>
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate("/")}>
                            <Avatar src="/RedBrickLogo.png" sx={{ width: 45, height: 45, bgcolor: 'white', p: 0.5 }} />
                            <Typography variant="h5" fontWeight="900" sx={{ color: '#ffffff', letterSpacing: 1, display: { xs: 'none', sm: 'block' } }}>RED BRICK</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={toggleMode} sx={{ color: 'white' }}>
                                {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                            <Button variant="contained" onClick={handleAuthAction} sx={{ bgcolor: '#ffffff', color: currentMode === 'light' ? '#590016' : '#B22222', fontWeight: 900, borderRadius: '8px', px: 3 }}>
                                {user ? 'Dashboard' : 'Log In'}
                            </Button>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* MAIN CONTENT AREA */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    {/* HERO SECTION */}
                    <Box component="section" sx={{ width: '100%', textAlign: 'center', px: 3, pt: 10, pb: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div className="anim-fade-up">
                            <Chip 
                                icon={<Sparkles size={14} color="#B22222" />} label="The Ultimate Collection" variant="outlined" 
                                sx={{ color: '#B22222', borderColor: 'rgba(178, 34, 34, 0.5)', fontWeight: 600, py: 2.5, px: 1, bgcolor: currentMode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)' }} 
                            />
                        </div>
                        <Typography variant="h2" fontWeight="900" className="anim-fade-up-2" sx={{ mt: 2, textShadow: currentMode === 'dark' ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(255,255,255,0.3)' }}>
                            Discover and share <Box component="span" sx={{ color: '#B22222' }}>incredible models</Box> in one place
                        </Typography>
                        <Typography variant="h6" className="anim-fade-up-3" sx={{ maxWidth: '32rem', color: 'text.secondary' }}>
                            Browse through our extensive database. Find exactly what you need, simple, fast, and reliable.
                        </Typography>
                        <div className="anim-fade-up-4">
                            <Button variant="contained" size="large" onClick={() => navigate("/models")} endIcon={<ArrowRight size={18} />} sx={{ bgcolor: '#B22222', color: '#ffffff', borderRadius: '50px', px: 4, py: 1.5, mt: 4, boxShadow: currentMode === 'dark' ? '0 4px 14px 0 rgba(178, 34, 34, 0.39)' : '0 4px 14px 0 rgba(89, 0, 22, 0.25)' }}>
                                Start Browsing
                            </Button>
                        </div>
                    </Box>

                    {/* FEATURES SECTION */}
                    <Box component="section" sx={{ width: '100%', maxWidth: '900px', px: 3, pb: 12, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
                        {[
                            { icon: <BoxIcon size={28} color="#B22222" />, title: "Vast Library", desc: "Explore a wide variety of models carefully categorized.", delay: "anim-slide-left" },
                            { icon: <Layers size={28} color="#B22222" />, title: "High Quality", desc: "Access detailed specs and view assets in a clean interface.", delay: "anim-fade-up-3" },
                            { icon: <Database size={28} color="#B22222" />, title: "Secure Storage", desc: "Create an account to save your favorites and collection.", delay: "anim-slide-right" },
                        ].map((f) => (
                            <Card key={f.title} className={`feature-card ${f.delay}`} variant="outlined" sx={{ borderRadius: 3, bgcolor: currentMode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderColor: 'divider', height: '100%' }}>
                                <CardContent sx={{ p: 3 }}>
                                    {f.icon}
                                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 1.5 }}>{f.title}</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>{f.desc}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* CTA BANNER SECTION */}
                    <Box component="section" className="anim-fade-up-4" sx={{ width: '100%', maxWidth: '900px', px: 3, pb: 12 }}>
                        <Card sx={{ bgcolor: '#B22222', color: '#ffffff', borderRadius: 4, textAlign: 'center', py: 6, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <LayoutDashboard size={36} style={{ opacity: 0.8, marginBottom: '16px' }} />
                                <Typography variant="h4" fontWeight="900">Ready to join?</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: '24rem', mx: 'auto', mb: 3 }}>
                                    Create your account to unlock full access, save your favorites, and contribute.
                                </Typography>
                                <Button
                                    variant="contained" onClick={() => navigate("/signup")}
                                    sx={{ bgcolor: '#ffffff', color: currentMode === 'light' ? '#590016' : '#B22222', borderRadius: '50px', px: 4, py: 1.5, fontWeight: 'bold' }}
                                >
                                    Create Free Account
                                </Button>
                            </Box>
                        </Card>
                    </Box>

                </Box> {/* End of Main Content Flex Box */}
            </Box> {/* End of Content Wrapper */}
        </Box> // End of Root Container
	);
};

export default Homepage;