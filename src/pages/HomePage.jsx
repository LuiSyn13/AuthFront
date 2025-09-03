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
        <Box sx={{ minHeight: '100vh', bgcolor: '#181c1f', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            {/* TopBar */}
            <Box sx={{ width: '100%', bgcolor: '#222', py: 2, px: 0, boxShadow: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: 1, color: '#4caf50', ml: 3 }}>
                    GreenBoard
                </Typography>
                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                        <Avatar sx={{ bgcolor: '#4caf50', color: '#181c1f', width: 40, height: 40, fontWeight: 600, mr: 1 }}>
                            {user.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography fontWeight={600} sx={{ color: '#fff', mr: 2 }}>{user.email}</Typography>
                        <Button variant="outlined" sx={{ color: '#4caf50', borderColor: '#4caf50', fontWeight: 600 }} onClick={handleLogout}>
                            Cerrar Sesión
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, width: '100%', maxWidth: 900, mx: 'auto', py: { xs: 2, md: 6 }, px: { xs: 1, md: 0 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Formulario de nuevo post */}
                <Box sx={{ flex: 1, bgcolor: '#fff', borderRadius: 1, p: { xs: 2, md: 4 }, mb: { xs: 3, md: 0 }, boxShadow: 2, minWidth: 0, color: '#181c1f' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#4caf50' }}>
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
                            InputProps={{ style: { color: '#181c1f' } }}
                            InputLabelProps={{ style: { color: '#888' } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, '& fieldset': { borderColor: '#4caf50' }, '&:hover fieldset': { borderColor: '#81c784' }, '&.Mui-focused fieldset': { borderColor: '#4caf50' } } }}
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
                            InputProps={{ style: { color: '#181c1f' } }}
                            InputLabelProps={{ style: { color: '#888' } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, '& fieldset': { borderColor: '#4caf50' }, '&:hover fieldset': { borderColor: '#81c784' }, '&.Mui-focused fieldset': { borderColor: '#4caf50' } } }}
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 2, borderRadius: 1, fontWeight: 600, bgcolor: '#4caf50', color: '#fff', '&:hover': { bgcolor: '#388e3c' } }} fullWidth disabled={postLoading}>
                            {postLoading ? <CircularProgress size={24} /> : 'Publicar'}
                        </Button>
                    </Box>
                </Box>

                {/* Lista de posts */}
                <Box sx={{ flex: 2, bgcolor: '#fff', borderRadius: 1, p: { xs: 2, md: 4 }, boxShadow: 2, minWidth: 0, color: '#181c1f' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#4caf50' }}>
                        Mis Posts
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {loading ? (
                        <Stack spacing={2}>
                            <Skeleton variant="rectangular" height={80} sx={{ bgcolor: '#f5f5f5' }} />
                            <Skeleton variant="rectangular" height={80} sx={{ bgcolor: '#f5f5f5' }} />
                            <Skeleton variant="rectangular" height={80} sx={{ bgcolor: '#f5f5f5' }} />
                        </Stack>
                    ) : posts.length === 0 ? (
                        <Typography align="center" sx={{ color: '#888' }}>Aún no has creado ningún post.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            {posts.map((post) => (
                                <Box key={post.id} sx={{ border: 1, borderColor: '#4caf50', borderRadius: 1, p: 2, bgcolor: '#f5f5f5', color: '#181c1f' }}>
                                    <Typography variant="subtitle1" fontWeight={600}>{post.title}</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, color: '#333' }}>{post.content}</Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1, color: '#4caf50' }}>
                                        {new Date(post.created_at).toLocaleString()}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default HomePage;