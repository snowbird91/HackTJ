(function () {

    window.auth = null;

    console.log("Initializing Auth module");

    class Auth {
        constructor() {
            this.isLoggedIn = false;
            this.user = null;
            this.authChangeCallbacks = [];
            console.log("Auth class initialized");
        }


        async register(email, username, password) {
            console.log("Register method called with:", { email, username });
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, username, password }),
                    credentials: 'include'
                });

                console.log("Register response status:", response.status);
                const data = await response.json();
                console.log("Register response data:", data);

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                this.isLoggedIn = true;
                this.user = data.user;
                this.notifyAuthChange();

                return data;
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        }


        async login(email, password) {
            console.log("Login method called with email:", email);
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });

                console.log("Login response status:", response.status);
                const data = await response.json();
                console.log("Login response data:", data);

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                this.isLoggedIn = true;
                this.user = data.user;
                this.notifyAuthChange();

                return data;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        }


        async logout() {
            console.log("Logout method called");
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                console.log("Logout response status:", response.status);
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Logout failed');
                }

                this.isLoggedIn = false;
                this.user = null;
                this.notifyAuthChange();

                return true;
            } catch (error) {
                console.error('Logout error:', error);
                throw error;
            }
        }


        async checkAuthStatus() {
            console.log("CheckAuthStatus method called");
            try {
                const response = await fetch('/api/user', {
                    method: 'GET',
                    credentials: 'include'
                });

                console.log("CheckAuthStatus response status:", response.status);
                if (!response.ok) {
                    this.isLoggedIn = false;
                    this.user = null;
                    this.notifyAuthChange();
                    return false;
                }

                const data = await response.json();
                console.log("CheckAuthStatus response data:", data);
                this.isLoggedIn = true;
                this.user = data.user;
                this.notifyAuthChange();

                return data;
            } catch (error) {
                console.error('Auth check error:', error);
                this.isLoggedIn = false;
                this.user = null;
                this.notifyAuthChange();
                return false;
            }
        }


        async saveUserData(userData) {
            console.log("SaveUserData method called");
            try {
                const response = await fetch('/api/user/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData),
                    credentials: 'include'
                });

                console.log("SaveUserData response status:", response.status);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to save data');
                }

                return data;
            } catch (error) {
                console.error('Save data error:', error);
                throw error;
            }
        }


        onAuthChange(callback) {
            if (typeof callback !== 'function') {
                console.error("onAuthChange called with non-function:", callback);
                return () => { };
            }

            console.log("Adding auth change callback");
            this.authChangeCallbacks.push(callback);


            callback(this.isLoggedIn, this.user);


            return () => {
                this.authChangeCallbacks = this.authChangeCallbacks.filter(cb => cb !== callback);
            };
        }


        notifyAuthChange() {
            console.log("Notifying auth changes to", this.authChangeCallbacks.length, "subscribers");
            this.authChangeCallbacks.forEach(callback => {
                if (typeof callback === 'function') {
                    callback(this.isLoggedIn, this.user);
                }
            });
        }
    }


    const auth = new Auth();


    window.auth = auth;


    console.log("Auth module initialized. Methods available:", {
        register: typeof auth.register === 'function',
        login: typeof auth.login === 'function',
        logout: typeof auth.logout === 'function',
        checkAuthStatus: typeof auth.checkAuthStatus === 'function',
        saveUserData: typeof auth.saveUserData === 'function',
        onAuthChange: typeof auth.onAuthChange === 'function'
    });
})();
