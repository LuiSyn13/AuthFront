import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { 
    Container, 
    Card, 
    CardContent, 
    Typography, 
    TextField, 
    Button, 
    Box, 
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';

const backendUrl = process.env.REACT_APP_BASE_URL;

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                setError(data.message || 'Error al iniciar sesión.');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        console.log('Google response received:', credentialResponse);
        
        try {
            const res = await fetch(`${backendUrl}/auth/social-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: 'google', token: credentialResponse.credential })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                setError(data.message || 'Error en el inicio de sesión con Google.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor durante el login con Google.');
            console.error('Google login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Falló el inicio de sesión con Google. Por favor, intenta de nuevo.');
        console.error('Google Login Failed');
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Card sx={{ width: '100%', p: { xs: 1, sm: 2 }, boxShadow: 6, borderRadius: 4 }}>
                <CardContent>
                    <Typography component="h1" variant="h4" align="center" fontWeight={700} gutterBottom color="primary">
                        Iniciar Sesión
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box component="form" onSubmit={handleEmailLogin} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Correo Electrónico"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, borderRadius: 2, fontWeight: 600 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Ingresar'}
                        </Button>
                    </Box>
                    <Divider sx={{ my: 2 }}>O</Divider>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                        />
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default LoginPage;