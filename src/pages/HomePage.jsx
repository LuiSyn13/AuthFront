import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Typography, 
    Button, 
    Box, 
    TextField, 
    CircularProgress,
    Alert,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Skeleton,
    Stack,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


const backendUrl = process.env.REACT_APP_BASE_URL;

function HomePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [postLoading, setPostLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    // State for editing posts
    const [editingPost, setEditingPost] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    // State for deleting posts
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // State for deleting account
    const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);

    const token = localStorage.getItem('token');

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
            if (response.ok) {
                setNewPost({ title: '', content: '' });
                await fetchData();
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

    // --- Edit Post Handlers ---
    const handleOpenEditDialog = (post) => {
        setEditingPost(post);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditingPost(null);
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        if (!editingPost) return;
        setPostLoading(true);
        try {
            const response = await fetch(`${backendUrl}/posts/${editingPost.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: editingPost.title, content: editingPost.content })
            });
            if (response.ok) {
                handleCloseEditDialog();
                await fetchData();
            } else {
                const data = await response.json();
                setError(data.message || 'Error al actualizar el post.');
            }
        } catch (err) {
            setError('Error de conexión al actualizar el post.');
        } finally {
            setPostLoading(false);
        }
    };

    // --- Delete Post Handlers ---
    const handleOpenDeleteDialog = (postId) => {
        setDeletingPostId(postId);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeletingPostId(null);
    };

    const handleDeletePost = async () => {
        if (!deletingPostId) return;
        try {
            const response = await fetch(`${backendUrl}/posts/${deletingPostId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setPosts(posts.filter(p => p.id !== deletingPostId));
                handleCloseDeleteDialog();
            } else {
                const data = await response.json();
                setError(data.message || 'Error al eliminar el post.');
            }
        } catch (err) {
            setError('Error de conexión al eliminar el post.');
        }
    };

    // --- Delete Account Handlers ---
    const handleOpenDeleteAccountDialog = () => {
        setAnchorEl(null); // Close the menu
        setOpenDeleteAccountDialog(true);
    };

    const handleCloseDeleteAccountDialog = () => {
        setOpenDeleteAccountDialog(false);
    };

    const handleConfirmDeleteAccount = async () => {
        try {
            const response = await fetch(`${backendUrl}/profile`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                handleLogout(); // Log out and redirect to login
            } else {
                const data = await response.json();
                setError(data.message || 'Error al eliminar la cuenta.');
                handleCloseDeleteAccountDialog();
            }
        } catch (err) {
            setError('Error de conexión al eliminar la cuenta.');
            handleCloseDeleteAccountDialog();
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#181c1f', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            {/* TopBar */}
            <Box sx={{
                width: '100%',
                bgcolor: '#222',
                py: 2,
                px: 0,
                boxShadow: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                overflowX: 'auto',
                minWidth: 0
            }}>
                <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                        letterSpacing: 1,
                        color: '#4caf50',
                        ml: { xs: 2, md: 3 },
                        fontSize: { xs: 22, sm: 26 },
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                    }}
                >
                    Auth Plus
                </Typography>
                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 1, md: 3 } }}>
                        <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: '#4caf50', color: '#181c1f', width: 36, height: 36, fontWeight: 600 }}>
                                {user.email.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    minWidth: 180,
                                    bgcolor: '#222',
                                    color: '#fff',
                                    boxShadow: 3,
                                    borderRadius: 2
                                }
                            }}
                        >
                            <MenuItem disabled sx={{ fontWeight: 700, color: '#43ea3a', fontSize: 15, opacity: 1, whiteSpace: 'normal', wordBreak: 'break-all', letterSpacing: 0.2 }}>
                                {user.email}
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: '#fff', fontWeight: 600, mt: 1, '&:hover': { color: '#4caf50', bgcolor: '#181c1f' } }}>
                                Cerrar Sesión
                            </MenuItem>
                            <MenuItem onClick={handleOpenDeleteAccountDialog} sx={{ color: '#ff5252', fontWeight: 600, mt: 1, '&:hover': { color: '#ff1744', bgcolor: '#181c1f' } }}>
                                Eliminar Cuenta
                            </MenuItem>
                        </Menu>
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
                        <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }} fullWidth disabled={postLoading}>
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
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                        </Stack>
                    ) : posts.length === 0 ? (
                        <Typography align="center" sx={{ color: '#888' }}>Aún no has creado ningún post.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            {posts.map((post) => (
                                <Box key={post.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 1, borderColor: 'grey.300', borderRadius: 1, p: 2, bgcolor: '#f9f9f9' }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>{post.title}</Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5, color: '#333' }}>{post.content}</Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'grey.600' }}>
                                            {new Date(post.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <IconButton onClick={() => handleOpenEditDialog(post)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenDeleteDialog(post.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Box>

            {/* Edit Post Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
                <DialogTitle>Editar Post</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleUpdatePost} sx={{ mt: 2 }}>
                        <TextField
                            label="Título"
                            fullWidth
                            margin="normal"
                            value={editingPost?.title || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                            required
                        />
                        <TextField
                            label="Contenido"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            value={editingPost?.content || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancelar</Button>
                    <Button onClick={handleUpdatePost} variant="contained" color="primary" disabled={postLoading}>
                        {postLoading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Post Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirmar Eliminación de Post</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
                    <Button onClick={handleDeletePost} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Account Confirmation Dialog */}
            <Dialog open={openDeleteAccountDialog} onClose={handleCloseDeleteAccountDialog}>
                <DialogTitle>¿Eliminar tu cuenta permanentemente?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Estás a punto de eliminar tu cuenta de forma permanente. Todos tus datos, incluyendo tus posts, serán borrados. 
                        <b>Esta acción es irreversible.</b> ¿Estás seguro de que quieres continuar?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteAccountDialog}>Cancelar</Button>
                    <Button onClick={handleConfirmDeleteAccount} color="error" variant="contained">
                        Sí, eliminar mi cuenta
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default HomePage;