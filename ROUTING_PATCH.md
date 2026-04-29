// ── ADD THIS ROUTE to app-routing.module.ts ──────────────────────────────────
// Insert BEFORE the protected MainLayout block (no canActivate — it is public).
//
// { path: 'auth/login', component: LoginComponent },  ← existing
// { path: 'register',   loadChildren: ... },          ← ADD THIS
// { path: '', component: MainLayoutComponent, canActivate: [AuthGuard], ... }  ← existing

{
  path: 'register',
  loadChildren: () =>
    import('./features/public-registration/public-registration/public-registration.module')
      .then(m => m.PublicRegistrationModule)
},

// ── AND add REGISTER endpoint to api.constants.ts ────────────────────────────
// Inside the AUTH block:
AUTH: {
  LOGIN   : `${API_BASE_URL}/auth/login`,
  LOGOUT  : `${API_BASE_URL}/auth/logout`,
  PROFILE : `${API_BASE_URL}/auth/profile`,
  REGISTER: `${API_BASE_URL}/public/register`,   // ← ADD THIS
},

// ── AND add "Register" link to login.component.html ─────────────────────────
// Below the demo-section, add:
// <p class="reg-link-bottom">
//   New taxpayer? <a routerLink="/register">Create your free account</a>
// </p>
