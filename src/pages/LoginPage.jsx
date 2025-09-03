import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Divider,
    InputAdornment,
    IconButton
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const backendUrl = process.env.REACT_APP_BASE_URL;


function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Login
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

    // Registro
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${backendUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                setError(data.message || 'Error al registrar usuario.');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
            console.error('Register error:', err);
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
        <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#181c20', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>
            <Box sx={{
                width: { xs: '100%', sm: 400 },
                minHeight: { xs: '100vh', sm: 520 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fff',
                borderRadius: 0,
                boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)',
                border: '1px solid #e0e0e0',
                px: { xs: 2, sm: 4 },
                py: { xs: 4, sm: 6 },
                m: 0,
                maxWidth: 400,
            }}>
                <Typography variant="h4" fontWeight={800} color="#181c20" gutterBottom letterSpacing={1} align="center" sx={{ mb: 1 }}>
                    {isRegister ? 'REGISTRO' : 'LOGIN'}
                </Typography>
                <Typography align="center" sx={{ color: '#4caf50', fontWeight: 600, mb: 2, fontSize: 17 }}>
                    {isRegister ? 'Crea tu cuenta para empezar' : 'Bienvenido de nuevo'}
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
                <Box component="form" onSubmit={isRegister ? handleRegister : handleEmailLogin} noValidate sx={{ width: '100%', maxWidth: 340, mx: 'auto' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailOutlinedIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 0,
                                bgcolor: '#f7f7f7',
                                border: '1px solid #e0e0e0',
                                fontWeight: 500
                            }
                        }}
                        InputLabelProps={{ sx: { color: '#888' } }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlinedIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword((show) => !show)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 0,
                                bgcolor: '#f7f7f7',
                                border: '1px solid #e0e0e0',
                                fontWeight: 500
                            }
                        }}
                        InputLabelProps={{ sx: { color: '#888' } }}
                    />
                    {isRegister && (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword((show) => !show)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    )}
                    {!isRegister && (
                        <Box sx={{ textAlign: 'right', mt: 1 }}>
                            <Button variant="text" size="small" sx={{ color: '#ff5e62', fontWeight: 600, textTransform: 'none' }}>
                                Forgot Password?
                            </Button>
                        </Box>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, borderRadius: 0, fontWeight: 700, fontSize: 17, py: 1.5, bgcolor: '#4caf50', color: '#fff', boxShadow: 'none', textTransform: 'none', '&:hover': { bgcolor: '#388e3c', color: '#fff' } }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : (isRegister ? 'REGISTRARSE' : 'LOGIN')}
                    </Button>
                    <Button
                        fullWidth
                        variant="text"
                        sx={{ mb: 2, fontWeight: 700, color: '#4caf50', textTransform: 'none', borderRadius: 0 }}
                        onClick={() => { setIsRegister(!isRegister); setError(''); setConfirmPassword(''); }}
                    >
                        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </Button>
                    <Divider sx={{ my: 2, color: '#bbb', fontWeight: 500, borderRadius: 0 }}>O</Divider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 1, width: '100%' }}>
                        <Box sx={{ width: '100%', maxWidth: 340, display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                width="100%"
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default LoginPage;