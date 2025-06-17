export class CurrentUser {
  private static instance: CurrentUser;
  
  private _isLoggedIn: boolean = false;
  private _userId: string = '';
  private _userType: string = '';
  private _token: string = '';
  
  private authChangeListeners: ((isAuthenticated: boolean) => void)[] = [];
  
  private constructor() {
    // Initialize from localStorage if available
    this.loadFromStorage();
  }
  
  /**
   * Get the singleton instance of CurrentUser
   */
  public static getInstance(): CurrentUser {
    if (!CurrentUser.instance) {
      CurrentUser.instance = new CurrentUser();
    }
    return CurrentUser.instance;
  }
  
  /**
   * Load user data from localStorage
   */
  private loadFromStorage(): void {
    const token = localStorage.getItem('ak_ambulance_counseling_jwt_token');
    
    if (token) {
      this._token = token;
      this._isLoggedIn = true;
      
      try {
        // Decode JWT token to get user information
        const payload = JSON.parse(atob(token.split('.')[1]));
        this._userId = payload.sub || payload.id || payload.userId || '';
        this._userType = payload.userType || payload.role || '';
        
        // Store in localStorage for persistence
        localStorage.setItem('ak_ambulance_counseling_user_id', this._userId);
        localStorage.setItem('ak_ambulance_counseling_user_type', this._userType);
      } catch (err) {
        console.error('Error decoding JWT token:', err);
        
        // Fall back to stored values if token decode fails
        this._userId = localStorage.getItem('ak_ambulance_counseling_user_id') || '';
        this._userType = localStorage.getItem('ak_ambulance_counseling_user_type') || '';
      }
    } else {
      this._isLoggedIn = false;
      this._userId = '';
      this._userType = '';
      this._token = '';
    }
  }
  
  /**
   * Set user data from login response
   */
  public setUserFromToken(token: string): void {
    if (!token) {
      this.logout();
      return;
    }
    
    this._token = token;
    this._isLoggedIn = true;
    localStorage.setItem('ak_ambulance_counseling_jwt_token', token);
    
    try {
      // Decode JWT token to get user information
      const payload = JSON.parse(atob(token.split('.')[1]));
      this._userId = payload.sub || payload.id || payload.userId || '';
      this._userType = payload.userType || payload.role || '';
      
      // Store in localStorage for persistence
      localStorage.setItem('ak_ambulance_counseling_user_id', this._userId);
      localStorage.setItem('ak_ambulance_counseling_user_type', this._userType);
    } catch (err) {
      console.error('Error decoding JWT token:', err);
    }
    
    // Notify listeners of authentication change
    this.notifyAuthChangeListeners(true);
  }
  
  /**
   * Log out the current user
   */
  public logout(): void {
    localStorage.removeItem('ak_ambulance_counseling_jwt_token');
    localStorage.removeItem('ak_ambulance_counseling_user_id');
    localStorage.removeItem('ak_ambulance_counseling_user_type');
    
    this._isLoggedIn = false;
    this._userId = '';
    this._userType = '';
    this._token = '';
    
    // Notify listeners of authentication change
    this.notifyAuthChangeListeners(false);
  }
  
  /**
   * Add an authentication change listener
   */
  public addAuthChangeListener(listener: (isAuthenticated: boolean) => void): void {
    this.authChangeListeners.push(listener);
  }
  
  /**
   * Remove an authentication change listener
   */
  public removeAuthChangeListener(listener: (isAuthenticated: boolean) => void): void {
    const index = this.authChangeListeners.indexOf(listener);
    if (index !== -1) {
      this.authChangeListeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all authentication change listeners
   */
  private notifyAuthChangeListeners(isAuthenticated: boolean): void {
    this.authChangeListeners.forEach(listener => listener(isAuthenticated));
  }
  
  /**
   * Check if the user is logged in
   */
  public get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }
  
  /**
   * Get the user ID
   */
  public get userId(): string {
    return this._userId;
  }
  
  /**
   * Check if the user is a doctor
   */
  public get isDoctor(): boolean {
    return this._userType === 'doctor';
  }
  
  /**
   * Get the user's type (patient or doctor)
   */
  public get userType(): string {
    return this._userType;
  }
  
  /**
   * Get the JWT token
   */
  public get token(): string {
    return this._token;
  }
  
  /**
   * Check if the user can create a new question
   * (User must be authenticated)
   */
  public canCreateQuestion(): boolean {
    return this._isLoggedIn;
  }
  
  /**
   * Check if the user can reply to a question
   * (User must be the owner of the question or a doctor)
   */
  public canReplyToQuestion(questionPatientId: string): boolean {
    return this._isLoggedIn && (this._userId === questionPatientId || this._userType === 'doctor');
  }
  
  /**
   * Check if the user can edit a reply
   * (User must be the owner of the reply)
   */
  public canEditReply(replyUserId: string): boolean {
    return this._isLoggedIn && this._userId === replyUserId;
  }
  
  /**
   * Check if the user can delete a question
   * (User must be a doctor)
   */
  public canDeleteQuestion(): boolean {
    return this._isLoggedIn && this._userType === 'doctor';
  }
}

// Export a default instance
export const currentUser = CurrentUser.getInstance();