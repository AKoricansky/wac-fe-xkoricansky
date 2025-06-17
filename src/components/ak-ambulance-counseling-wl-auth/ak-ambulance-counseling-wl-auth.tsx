import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import { AmbulanceCounselingAuthApi, UserLoginRequest, UserRegisterRequest } from '../../api/ak-ambulance-counseling-wl/apis/AmbulanceCounselingAuthApi';
import { Configuration } from '../../api/ak-ambulance-counseling-wl/runtime';
import { LoginForm, RegistrationForm } from '../../api/ak-ambulance-counseling-wl/models';
import { currentUser } from '../../utils/currentUser';

@Component({
  tag: 'ak-ambulance-counseling-wl-auth',
  styleUrl: 'ak-ambulance-counseling-wl-auth.css',
  shadow: true,
})
export class AkAmbulanceCounselingWlAuth {
  @Prop() apiBase: string;
  @Prop() currentScreen: string = '';

  @State() isLoggedIn: boolean = false;
  @State() isDoctor: boolean = false;
  @State() currentQuestion: any = null;
  @State() showLoginModal: boolean = false;
  @State() showRegisterModal: boolean = false;
  @State() loginEmail: string = '';
  @State() loginPassword: string = '';
  @State() registerName: string = '';
  @State() registerEmail: string = '';
  @State() registerPassword: string = '';
  @State() errorMessage: string = '';

  @Event({ eventName: "auth-change" }) authChange: EventEmitter<boolean>;
  @Event({ eventName: "new-question-clicked"}) newQuestionClicked: EventEmitter<string>;
  @Event({ eventName: "question-closed"}) questionClosed: EventEmitter<string>;
  @Event({ eventName: "reply-clicked"}) replyClicked: EventEmitter<string>;
  

  private authApi: AmbulanceCounselingAuthApi;

  componentWillLoad() {
    this.isLoggedIn = currentUser.isLoggedIn;
    this.isDoctor = currentUser.isDoctor;
    
    currentUser.addAuthChangeListener(this.handleAuthChangeFromCurrentUser);
    
    const configuration = new Configuration({
      basePath: this.apiBase,
      accessToken: currentUser.token || undefined
    });
    
    this.authApi = new AmbulanceCounselingAuthApi(configuration);
  }
  
  disconnectedCallback() {
    currentUser.removeAuthChangeListener(this.handleAuthChangeFromCurrentUser);
  }
  
  private handleAuthChangeFromCurrentUser = (isAuthenticated: boolean) => {
    this.isLoggedIn = isAuthenticated;
    this.isDoctor = currentUser.isDoctor;
    this.authChange.emit(isAuthenticated);
  }

  private async handleLogin(e: Event) {
    e.preventDefault();
    this.errorMessage = '';
    
    try {
      const loginForm: LoginForm = {
        email: this.loginEmail,
        password: this.loginPassword
      };
      
      const request: UserLoginRequest = {
        loginForm: loginForm
      };
      
      const response = await this.authApi.userLogin(request);
      
      if (response.token) {
        currentUser.setUserFromToken(response.token);
        this.resetLoginForm();
        this.closeModals();
      } else {
        this.errorMessage = 'Login failed: No token received';
      }
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Login failed: ' + (error.message || 'Unknown error');
    }
  }

  private async handleRegister(e: Event) {
    e.preventDefault();
    this.errorMessage = '';
    
    try {
      const registrationForm: RegistrationForm = {
        name: this.registerName,
        email: this.registerEmail,
        password: this.registerPassword
      };
      
      const request: UserRegisterRequest = {
        registrationForm: registrationForm
      };
      
      await this.authApi.userRegister(request);
      
      this.showRegisterModal = false;
      this.showLoginModal = true;
      this.resetRegisterForm();
      this.errorMessage = 'Registration successful! Please login.';
    } catch (error) {
      console.error('Registration error:', error);
      this.errorMessage = 'Registration failed: ' + (error.message || 'Unknown error');
    }
  }

  private handleLogout() {
    currentUser.logout();
  }

  private resetLoginForm() {
    this.loginEmail = '';
    this.loginPassword = '';
  }

  private resetRegisterForm() {
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
  }

  private closeModals() {
    this.showLoginModal = false;
    this.showRegisterModal = false;
    this.errorMessage = '';
  }

  private openLoginModal(e: Event) {
    e.preventDefault();
    this.showLoginModal = true;
    this.showRegisterModal = false;
    this.errorMessage = '';
  }

  private openRegisterModal(e: Event) {
    e.preventDefault();
    this.showRegisterModal = true;
    this.showLoginModal = false;
    this.errorMessage = '';
  }

  private handleReturn() {
    window.history.back();
  }

  private handleNewQuestion() {
    this.newQuestionClicked.emit('@new');
  }

  public setCurrentQuestion(question: any) {
    this.currentQuestion = question;
  }
  
  private handleReply() {
    if (this.currentQuestion && this.currentScreen === 'question') {
      if (currentUser.canReplyToQuestion(this.currentQuestion.patientId)) {
        this.replyClicked.emit(this.currentScreen);
      } else {
        console.log('User does not have permission to reply to this question');
      }
    }
  }

  render() {
    return (
      <Host>
        <div class="auth-header">
          <div class="navigation-buttons">
            {this.currentScreen !== 'list' && (
              <md-outlined-button class="return-btn" onClick={() => this.handleReturn()}>Späť</md-outlined-button>
            )}
            {this.currentScreen === 'list' && this.isLoggedIn && (
              // User can only create new questions if logged in
              <md-outlined-button class="new-question-btn" onClick={() => this.handleNewQuestion()}>Položiť otázku</md-outlined-button>
            )}
            {this.currentScreen === 'question' && this.isLoggedIn && this.currentQuestion && (
              // User can reply if they own the question or are a doctor
              // This button is always shown, but the handler checks permissions
              <md-outlined-button 
                class="reply-btn" 
                onClick={() => this.handleReply()}
                disabled={!currentUser.canReplyToQuestion(this.currentQuestion?.patientId)}
              >
                Odpovedať
              </md-outlined-button>
            )}
          </div>
          
          <div class="auth-buttons">
            {!this.isLoggedIn ? (
              <>
                <md-outlined-button class="login-btn" onClick={(e) => this.openLoginModal(e)}>Prihlásenie</md-outlined-button>
                <md-outlined-button class="register-btn" onClick={(e) => this.openRegisterModal(e)}>Registrácia</md-outlined-button>
              </>
            ) : (
              <md-outlined-button class="logout-btn" onClick={() => this.handleLogout()}>Odhlásiť sa</md-outlined-button>
            )}
          </div>
        </div>

        {this.showLoginModal && (
          <div class="modal-overlay">
            <div class="modal-content">
              <md-outlined-button class="close-btn" onClick={() => this.closeModals()}>×</md-outlined-button>
              <h2>Prihlásenie</h2>
              
              {this.errorMessage && (
                <div class="error-message">{this.errorMessage}</div>
              )}
              
              <form onSubmit={(e) => this.handleLogin(e)}>
                <div class="form-group">
                  <label htmlFor="login-email">Email</label>
                  <input
                    type="email"
                    id="login-email"
                    value={this.loginEmail}
                    onInput={(e) => this.loginEmail = (e.target as HTMLInputElement).value}
                    required
                  />
                </div>
                <div class="form-group">
                  <label htmlFor="login-password">Heslo</label>
                  <input
                    type="password"
                    id="login-password"
                    value={this.loginPassword}
                    onInput={(e) => this.loginPassword = (e.target as HTMLInputElement).value}
                    required
                  />
                </div>
                <div class="form-actions">
                  <md-outlined-button type="submit" class="submit-btn">Prihlásiť sa</md-outlined-button>
                  <md-outlined-button type="md-outlined-button" class="toggle-btn" onClick={(e) => this.openRegisterModal(e)}>
                    Ak ešte nemáte účet, zaregistrujte sa
                  </md-outlined-button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Register Modal */}
        {this.showRegisterModal && (
          <div class="modal-overlay">
            <div class="modal-content">
              <md-outlined-button class="close-btn" onClick={() => this.closeModals()}>×</md-outlined-button>
              <h2>Registrovať</h2>
              
              {this.errorMessage && (
                <div class="error-message">{this.errorMessage}</div>
              )}
              
              <form onSubmit={(e) => this.handleRegister(e)}>
                <div class="form-group">
                  <label htmlFor="register-name">Meno</label>
                  <input
                    type="text"
                    id="register-name"
                    value={this.registerName}
                    onInput={(e) => this.registerName = (e.target as HTMLInputElement).value}
                    required
                  />
                </div>
                <div class="form-group">
                  <label htmlFor="register-email">Email</label>
                  <input
                    type="email"
                    id="register-email"
                    value={this.registerEmail}
                    onInput={(e) => this.registerEmail = (e.target as HTMLInputElement).value}
                    required
                  />
                </div>
                <div class="form-group">
                  <label htmlFor="register-password">Heslo</label>
                  <input
                    type="password"
                    id="register-password"
                    value={this.registerPassword}
                    onInput={(e) => this.registerPassword = (e.target as HTMLInputElement).value}
                    required
                  />
                </div>
                <div class="form-actions">
                  <md-outlined-button type="submit" class="submit-btn">Registrovať</md-outlined-button>
                  <md-outlined-button type="md-outlined-button" class="toggle-btn" onClick={(e) => this.openLoginModal(e)}>
                    Ak už máte účet, prihláste sa
                  </md-outlined-button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <slot></slot>
      </Host>
    );
  }
}