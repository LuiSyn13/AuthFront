import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Container, 
    Button, 
    Box, 
    TextField, 
    Grid, 
    CircularProgress,
    Alert,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Skeleton,
    Stack
} from '@mui/material';


const backendUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

function HomePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [postLoading, setPostLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const token = localStorage.getItem('token');


    // Definir fetchData con useCallback para evitar advertencias y poder usarlo en handleCreatePost
    const fetchData = useCallback(async () => {
        try {
            const [profileRes, postsRes] = await Promise.all([
                fetch(`${backendUrl}/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${backendUrl}/posts/me`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!profileRes.ok) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const profileData = await profileRes.json();
            setUser(profileData);
            if (postsRes.ok) {
                const postsData = await postsRes.json();
                setPosts(postsData);
            } else {
                setError('No se pudieron cargar los posts.');
            }
        } catch (err) {
            setError('Error de conexión. No se pudieron cargar los datos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [token, navigate, fetchData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    const handleCreatePost = async (e) => {
        e.preventDefault();
        setPostLoading(true);
        setError('');
        try {
            const response = await fetch(`${backendUrl}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newPost)
            });
            // const data = await response.json(); // Ya no se usa
            if (response.ok) {
                setNewPost({ title: '', content: '' });
                await fetchData(); // Recargar posts desde el backend
            } else {
                const data = await response.json();
                setError(data.message || 'Error al crear el post.');
            }
        } catch (err) {
            setError('Error de conexión al crear el post.');
        } finally {
            setPostLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Sidebar */}
            <Box sx={{ width: { xs: 0, md: 240 }, bgcolor: 'grey.900', color: 'grey.100', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 4, boxShadow: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64, mb: 2, fontSize: 32, fontWeight: 700 }}>
                    {user ? user.email.charAt(0).toUpperCase() : '?'}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, textAlign: 'center', wordBreak: 'break-all' }}>
                    {user ? user.email : ''}
                </Typography>
                <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ mt: 2, borderRadius: 1, fontWeight: 600 }}>
                    Cerrar Sesión
                </Button>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* TopBar */}
                <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Toolbar sx={{ minHeight: 64 }}>
                        <Typography variant="h5" fontWeight={700} color="primary" sx={{ flexGrow: 1, letterSpacing: 1 }}>
                            Dashboard
                        </Typography>
                        {/* Mobile user menu */}
                        {user && (
                            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                                <IconButton
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleMenu}
                                    color="primary"
                                >
                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40, fontWeight: 600 }}>
                                        {user.email.charAt(0).toUpperCase()}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorEl}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    keepMounted
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem disabled>{user.email}</MenuItem>
                                    <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </Toolbar>
                </AppBar>

                {/* Main Dashboard Content */}
                <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={3}>
                        {/* Create Post Form */}
                        <Grid item xs={12} md={5}>
                            <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 2, p: 3, boxShadow: 0 }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Nuevo Post
                                </Typography>
                                <Box component="form" onSubmit={handleCreatePost}>
                                    <TextField
                                        label="Título"
                                        fullWidth
                                        margin="normal"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        required
                                    />
                                    <TextField
                                        label="¿Qué estás pensando?"
                                        fullWidth
                                        margin="normal"
                                        multiline
                                        rows={4}
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        required
                                    />
                                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, borderRadius: 1, fontWeight: 600 }} fullWidth disabled={postLoading}>
                                        {postLoading ? <CircularProgress size={24} /> : 'Publicar'}
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Posts List */}
                        <Grid item xs={12} md={7}>
                            <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 2, p: 3, boxShadow: 0, minHeight: 320 }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Mis Posts
                                </Typography>
                                {loading ? (
                                    <Stack spacing={2}>
                                        <Skeleton variant="rectangular" height={80} />
                                        <Skeleton variant="rectangular" height={80} />
                                        <Skeleton variant="rectangular" height={80} />
                                    </Stack>
                                ) : posts.length === 0 ? (
                                    <Typography align="center">Aún no has creado ningún post.</Typography>
                                ) : (
                                    <Stack spacing={2}>
                                        {posts.map((post) => (
                                            <Box key={post.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'grey.50' }}>
                                                <Typography variant="subtitle1" fontWeight={600}>{post.title}</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{post.content}</Typography>
                                                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.disabled' }}>
                                                    {new Date(post.created_at).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

export default HomePage;