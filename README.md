# ⚛️ AuthFront Explorer: Proyecto de Autenticación con React

## 🖼️ Vistas de la Aplicación

<div align="center">
    <img src="public/image01.png" alt="Login Page" width="400"/>
    <br/>
    <b>Pantalla de Login</b>
</div>

<div align="center">
    <img src="public/image02.png" alt="Home Page" width="400"/>
    <br/>
    <b>Pantalla Principal (Home)</b>
</div>

Este proyecto es un laboratorio de aprendizaje enfocado en la implementación de flujos de autenticación modernos en una aplicación, en este caso con React. El objetivo principal es explorar y entender cómo funcionan el registro de usuarios, el inicio de sesión tradicional, la autenticación social con Google y la persistencia de sesiones mediante JSON Web Tokens (JWT).

---

## ✨ Características Principales

-   [x] **Autenticación Dual:**
    -   **Email y Contraseña:** Flujo completo de registro e inicio de sesión.
    -   **Inicio de Sesión con Google:** Integración con OAuth 2.0 para una autenticación rápida y segura.
-   [x] **Sesiones con JWT:** Uso de JSON Web Tokens para mantener la sesión del usuario activa y proteger las rutas.
-   [x] **Rutas Protegidas:** Implementación de rutas privadas que solo son accesibles para usuarios autenticados.
-   [x] **Diseño Moderno:** Interfaz de usuario limpia y responsive construida con Material-UI.
-   [x] **Interacción con Backend:** El frontend está diseñado para comunicarse con un API REST para validar credenciales y obtener datos.

---

## 🚀 Stack de Tecnologías

Este proyecto fue construido utilizando las siguientes tecnologías:

-   **Frontend:**
    -   [**React**](https://reactjs.org/) (v18.2.0)
    -   [**React Router**](https://reactrouter.com/) (v6.22.3) para el enrutamiento del lado del cliente.
    -   [**Material-UI (MUI)**](https://mui.com/) para los componentes de la interfaz de usuario.
    -   [**@react-oauth/google**](https://www.npmjs.com/package/@react-oauth/google) para la integración con Google Sign-In.
-   **Herramientas de Desarrollo:**
    -   [Create React App](https://create-react-app.dev/)
    -   [npm](https://www.npmjs.com/)

---

## 🔐 Flujo de Autenticación

El sistema de autenticación es el núcleo de este proyecto y funciona de la siguiente manera:

1.  **Inicio de Sesión / Registro:**
    -   El usuario puede registrarse o iniciar sesión con su correo y contraseña.
    -   Alternativamente, puede usar su cuenta de Google.

2.  **Generación del Token (JWT):**
    -   Tras una autenticación exitosa (ya sea por email o Google), el servidor backend genera un **JSON Web Token (JWT)**.
    -   Este token se envía al cliente y se almacena de forma segura en `localStorage`.

3.  **Persistencia de Sesión y Rutas Protegidas:**
    -   El token guardado se utiliza para validar la sesión del usuario en futuras visitas.
    -   Un componente `PrivateRoute` verifica la existencia del token. Si no hay token, redirige al usuario a la página de login.
    -   Para cada solicitud a rutas protegidas del backend, el token se adjunta en el encabezado `Authorization` como un `Bearer Token`.

4.  **Cierre de Sesión:**
    -   Al hacer clic en "Cerrar Sesión", el token se elimina de `localStorage`, finalizando la sesión del usuario y redirigiéndolo al login.

---