// ============================================================================
// Mahfaza — Authentication Helpers
// Handles signup, login, logout, session checks, single-session enforcement
// ============================================================================

const MahfazaAuth = {

  // ==========================================================================
  // SIGN UP — creates auth user + trigger creates user_profile with Order ID
  // ==========================================================================
  async signUp({ fullName, email, password }) {
    const client = window.supabaseClient || initSupabase();
    if (!client) throw new Error('Supabase not initialized');

    const { data, error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() }
      }
    });

    if (error) throw error;
    return data;
  },

  // ==========================================================================
  // LOGIN — authenticates + creates session record + enforces single-session
  // ==========================================================================
  async login({ email, password }) {
    const client = window.supabaseClient || initSupabase();
    if (!client) throw new Error('Supabase not initialized');

    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) throw error;

    // Create new session record + invalidate other active sessions
    await this.createSession(data.user.id);

    return data;
  },

  // ==========================================================================
  // LOGOUT
  // ==========================================================================
  async logout() {
    const client = window.supabaseClient || initSupabase();
    if (!client) return;

    // Invalidate our session record
    const sessionId = localStorage.getItem('mahfaza_session_id');
    if (sessionId) {
      await client.from('user_sessions')
        .update({ is_active: false, invalidated_at: new Date().toISOString() })
        .eq('id', sessionId);
      localStorage.removeItem('mahfaza_session_id');
    }

    await client.auth.signOut();
    window.location.href = '/login.html';
  },

  // ==========================================================================
  // CREATE SESSION + invalidate other active sessions for this user
  // ==========================================================================
  async createSession(userId) {
    const client = window.supabaseClient;
    const token = this.generateToken();
    const deviceFp = this.getDeviceFingerprint();

    // Mark all other active sessions as inactive
    await client.from('user_sessions')
      .update({ is_active: false, invalidated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Create new active session
    const { data, error } = await client.from('user_sessions')
      .insert({
        user_id: userId,
        session_token: token,
        device_fingerprint: deviceFp,
        user_agent: navigator.userAgent.substring(0, 200),
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create session:', error);
      return;
    }

    localStorage.setItem('mahfaza_session_id', data.id);
    localStorage.setItem('mahfaza_session_token', token);
  },

  // ==========================================================================
  // CHECK IF AUTHENTICATED (use on protected pages)
  // ==========================================================================
  async requireAuth() {
    const client = window.supabaseClient || initSupabase();
    if (!client) {
      window.location.href = '/login.html';
      return null;
    }

    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) {
      window.location.href = '/login.html';
      return null;
    }

    return user;
  },

  // ==========================================================================
  // CHECK USER PROFILE & SUBSCRIPTION STATUS
  // ==========================================================================
  async getProfile(userId) {
    const client = window.supabaseClient;
    const { data, error } = await client.from('user_profile')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
    return data;
  },

  // ==========================================================================
  // SINGLE-SESSION ENFORCEMENT — subscribe to session changes
  // Call this on every protected page to auto-logout if session invalidated
  // ==========================================================================
  enforceSingleSession() {
    const client = window.supabaseClient;
    const sessionId = localStorage.getItem('mahfaza_session_id');
    if (!sessionId) return;

    const channel = client.channel('session-watcher')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        if (payload.new && payload.new.is_active === false) {
          this.handleForceLogout();
        }
      })
      .subscribe();

    return channel;
  },

  // ==========================================================================
  // HANDLE FORCED LOGOUT (when session invalidated remotely)
  // ==========================================================================
  async handleForceLogout() {
    const client = window.supabaseClient;
    await client.auth.signOut();
    localStorage.removeItem('mahfaza_session_id');
    localStorage.removeItem('mahfaza_session_token');

    const lang = localStorage.getItem('mahfaza_lang') || 'ar';
    const msg = lang === 'ar'
      ? 'تم تسجيل الدخول من جهاز آخر. تم تسجيل خروجك من هذا الجهاز.'
      : 'You signed in from another device. This session has been logged out.';

    alert(msg);
    window.location.href = '/login.html';
  },

  // ==========================================================================
  // REQUEST PASSWORD RESET
  // ==========================================================================
  async requestPasswordReset(email) {
    const client = window.supabaseClient || initSupabase();
    if (!client) throw new Error('Supabase not initialized');

    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password.html`
    });
    if (error) throw error;
  },

  // ==========================================================================
  // UPDATE PASSWORD (after reset)
  // ==========================================================================
  async updatePassword(newPassword) {
    const client = window.supabaseClient || initSupabase();
    if (!client) throw new Error('Supabase not initialized');

    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  // ==========================================================================
  // REDEEM ACTIVATION CODE
  // ==========================================================================
  async redeemActivationCode(code) {
    const client = window.supabaseClient;
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const cleanCode = code.trim().toUpperCase().replace(/\s/g, '');

    const { data, error } = await client.rpc('redeem_activation_code', {
      p_user_id: user.id,
      p_code: cleanCode
    });

    if (error) throw error;
    return data;
  },

  // ==========================================================================
  // ROUTE BASED ON SUBSCRIPTION STATUS
  // Call after auth check to determine where the user should be
  // ==========================================================================
  async routeByStatus(user) {
    const profile = await this.getProfile(user.id);
    if (!profile) return '/login.html';

    switch (profile.subscription_status) {
      case 'pending_activation':
        return '/pending.html';
      case 'active':
        return profile.onboarding_completed ? '/dashboard.html' : '/onboarding.html';
      case 'suspended':
        return '/suspended.html';
      case 'refunded':
        return '/refunded.html';
      default:
        return '/login.html';
    }
  },

  // ==========================================================================
  // UTILITIES
  // ==========================================================================
  generateToken() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  },

  getDeviceFingerprint() {
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';
    const screenSize = `${screen.width}x${screen.height}`;
    return btoa(`${ua}|${platform}|${screenSize}`).substring(0, 64);
  }
};

window.MahfazaAuth = MahfazaAuth;
