import { Component, Host, Prop, State, EventEmitter, Event, h } from '@stencil/core';
import { AmbulanceCounselingApi, Question, Reply, Configuration } from '../../api/ak-ambulance-counseling-wl';
import { currentUser } from '../../utils/currentUser';

@Component({
  tag: 'ak-ambulance-counseling-wl-editor',
  styleUrl: 'ak-ambulance-counseling-wl-editor.css',
  shadow: true,
})
export class AkAmbulanceCounselingWlEditor {
  @Prop() entryId: string;
  @Prop() apiBase: string;
  @Prop() mode: 'question' | 'reply' = 'question';
  @Prop() replyId: string;

  @Event({eventName: "editor-closed"}) editorClosed: EventEmitter<string>;

  @State() question: Question;
  @State() reply: Reply;
  @State() errorMessage: string;
  @State() isValid: boolean = false;
  @State() questionId: string; 

  private formElement: HTMLFormElement;

  async componentWillLoad() {
    this.questionId = this.entryId;

    if (this.mode === 'reply' && this.replyId === '@new') {
      this.reply = {
        id: "@new",
        userId: currentUser.userId,
        text: "",
        createdAt: new Date(),
        repliedTo: false,
        doctorName: currentUser.isDoctor ? "doctor" : "Anonymous"
      };
    }

    currentUser.addAuthChangeListener(this.handleAuthChange);

    if (this.mode === 'question') {
      await this.getQuestionAsync();
    } else {
      await this.getQuestionAsync();
      
      if (!this.reply) {
        await this.getReplyAsync();
      }
    }
  }

  disconnectedCallback() {
    currentUser.removeAuthChangeListener(this.handleAuthChange);
  }

  private handleAuthChange = (isAuthenticated: boolean) => {
    
    if (isAuthenticated && this.mode === 'question' && this.question && this.question.id === '@new') {
      this.question.patientId = currentUser.userId;
    }
    
    this.validateForm();
  }

  private async getQuestionAsync(): Promise<Question> {
    if(this.questionId === "@new") {
      this.isValid = false;
      this.question = {
        id: "@new",
        patientId: "", 
        summary: "",
        question: "",
        createdAt: new Date(),
        lastUpdated: new Date(),
        repliedTo: false,
        replies: []
      };
      return this.question;
    }

    if (!this.questionId) {
      this.isValid = false;
      return undefined;
    }
    
    try {
      // include auth token
      const token = currentUser.token;
      
      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });

      const api = new AmbulanceCounselingApi(configuration);
      const response = await api.getQuestionByIdRaw({id: this.questionId});

      if (response.raw.status < 299) {
        this.question = await response.value();
        if (this.mode === 'question') {
          this.validateForm();
        }
      } else {
        this.errorMessage = `Cannot retrieve question: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve question: ${err.message || "unknown"}`;
    }
    
    return this.question;
  }

  private async getReplyAsync(): Promise<Reply> {
    if (this.replyId === "@new") {
      this.reply = {
        id: "@new",
        userId: "",
        text: "",
        createdAt: new Date(),
        repliedTo: false,
        doctorName: ""
      };
      this.validateForm();
      return this.reply;
    }

    if (!this.replyId || !this.questionId) {
      return undefined;
    }

    try {
      // include auth token
      const token = currentUser.token;

      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });

      const api = new AmbulanceCounselingApi(configuration);
      const response = await api.getReplyByIdRaw({id: this.questionId, replyId: this.replyId});

      if (response.raw.status < 299) {
        this.reply = await response.value();
        if (this.mode === 'reply') {
          this.validateForm();
        }
      } else {
        this.errorMessage = `Cannot retrieve reply: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve reply: ${err.message || "unknown"}`;
    }

    return this.reply;
  }

  private handleInputEvent(ev: Event): string {
    const input = ev.target as HTMLInputElement;
    this.validateForm();
    return input.value;
  }

  private validateForm() {
    if (this.mode === 'question' && this.question) {
      const hasPatientId = !!(this.question.patientId && this.question.patientId.trim() !== '');
      const hasSummary = !!(this.question.summary && this.question.summary.trim() !== '');
      const hasQuestion = !!(this.question.question && this.question.question.trim() !== '');
      
      this.isValid = hasPatientId && hasSummary && hasQuestion;
    } else if (this.mode === 'reply' && this.reply) {
      const hasText = !!(this.reply.text && this.reply.text.trim() !== '');
      
      this.isValid = hasText;
    } else {
      this.isValid = false;
    }
  }

  private async updateQuestion() {
    if (!this.question) return;
    
    if (this.question.id === "@new" && !currentUser.canCreateQuestion()) {
      this.errorMessage = "You must be logged in to create a question";
      return;
    }
    
    if (this.question.id !== "@new" && this.question.patientId !== currentUser.userId) {
      this.errorMessage = "You can only edit your own questions";
      return;
    }
    
    if (!this.question.summary || this.question.summary.trim() === '') {
      this.errorMessage = "Please enter a summary";
      return;
    }
    
    if (!this.question.question || this.question.question.trim() === '') {
      this.errorMessage = "Please enter your question";
      return;
    }
    
    try {
      const token = currentUser.token;
      
      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });

      const api = new AmbulanceCounselingApi(configuration);
      
      if (this.question.id === "@new") {
        this.question.patientId = currentUser.userId;
        
        await api.createQuestion({ question: this.question });
      } else {
        await api.updateQuestionById({ 
          id: this.question.id, 
          question: this.question 
        });
      }
      
      this.editorClosed.emit("save");
    } catch (err: any) {
      console.error("Error saving question:", err);
      this.errorMessage = `Error saving question: ${err.message || "unknown"}`;
    }
  }

  private async updateReply() {
    
    if (!this.reply) {
      this.reply = {
        id: "@new",
        userId: currentUser.userId,
        text: "",
        createdAt: new Date(),
        repliedTo: false,
        doctorName: currentUser.isDoctor ? "Doctor" : "Anonymous"
      };
    }
    
    if (!this.questionId) {
      console.error("Missing questionId:", {
        hasReply: !!this.reply,
        replyId: this.reply?.id,
        questionId: this.questionId,
        mode: this.mode
      });
      this.errorMessage = "Cannot create reply: Missing question ID";
      return;
    }
    
    // user can only edit their own replies
    if (this.reply.id !== "@new" && !currentUser.canEditReply(this.reply.userId)) {
      this.errorMessage = "You can only edit your own replies";
      return;
    }
    
    if (!this.reply.text || this.reply.text.trim() === '') {
      this.errorMessage = "Please enter your reply";
      return;
    }
    
    try {
      const token = currentUser.token;
      
      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });

      const api = new AmbulanceCounselingApi(configuration);
      
      if (this.reply.id === "@new") {
        this.reply.userId = currentUser.userId;
        
        // Set the proper name for both doctors and non-doctors
        this.reply.doctorName = currentUser.isDoctor ? "Doctor" : "Anonymous";
        
      
      try {
        const response = await this.request({
          path: `ak-ambulance-counseling-api/questions/${this.questionId}/reply`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify(this.reply)
        });
        
        if (response.ok) {
          this.editorClosed.emit("save");
          return;
        } else {
          console.error("Error response from API:", response.status, response.statusText);
          this.errorMessage = `Error creating reply: ${response.statusText}`;
        }
      } catch (err) {
        console.error("Exception during reply creation:", err);
        this.errorMessage = `Error creating reply: ${err.message || "unknown"}`;
      }
      } else {
        await api.updateReplyById({ 
          id: this.reply.id, 
          reply: this.reply 
        });
      }
      
      this.editorClosed.emit("save");
    } catch (err: any) {
      console.error("Error saving reply:", err);
      this.errorMessage = `Error saving reply: ${err.message || "unknown"}`;
    }
  }

  private deleteEntry() {
    // check permissions before deleting
    if (this.mode === 'question' && this.question && this.question.id !== '@new') {
      // only doctors can delete questions
      if (!currentUser.canDeleteQuestion()) {
        this.errorMessage = "Only doctors can delete questions";
        return;
      }
      
      const token = currentUser.token;
      
      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });

      const api = new AmbulanceCounselingApi(configuration);
      api.deleteQuestionById({ id: this.question.id })
        .then(() => this.editorClosed.emit("delete"))
        .catch(err => this.errorMessage = `Error deleting question: ${err.message || "unknown"}`);
    } else if (this.mode === 'reply' && this.reply && this.reply.id !== '@new') {
      // owner can delete their reply
      if (!currentUser.canEditReply(this.reply.userId)) {
        this.errorMessage = "You can only delete your own replies";
        return;
      }
      
      const token = currentUser.token;
      
      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });

      const api = new AmbulanceCounselingApi(configuration);
    
      api.deleteReplyById({ id: this.replyId })
        .then(() => this.editorClosed.emit("delete"))
        .catch(err => this.errorMessage = `Error deleting reply: ${err.message || "unknown"}`);
    }
  }

  private async request(options: {
    path: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<Response> {
    const url = new URL(options.path, this.apiBase).toString();
    
    return fetch(url, {
      method: options.method,
      headers: options.headers,
      body: options.body
    });
  }

  render() {
    const actualMode = this.replyId ? 'reply' : this.mode;
    
    if (this.errorMessage) {
      return (
        <Host>
          <div class="error">{this.errorMessage}</div>
        </Host>
      );
    }
    return (
      <Host>
        <form ref={el => this.formElement = el}>
          {actualMode === 'reply' ? this.renderReplyEditor() : this.renderQuestionEditor()}
        </form>

        <md-divider></md-divider>
        <div class="actions">
          {/* Show delete button only for doctors */}
          {currentUser.isDoctor && (
            <md-filled-tonal-button id="delete" 
              disabled={this.mode === 'question' ? 
                (!this.question || this.question.id === "@new") : 
                (!this.reply || this.reply.id === "@new")}
              onClick={() => this.deleteEntry()}>
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-filled-tonal-button>
          )}
          <span class="stretch-fill"></span>
          <md-outlined-button id="cancel"
            onClick={() => this.editorClosed.emit("cancel")}>
            Zrušiť
          </md-outlined-button>
          <md-filled-button id="confirm" 
            disabled={false} 
            onClick={() => {
              actualMode === 'reply' ? this.updateReply() : this.updateQuestion();
            }}>
            <md-icon slot="icon">save</md-icon>
            Uložiť
          </md-filled-button>
        </div>
      </Host>
    );
  }

  private renderQuestionEditor() {
    if (!this.question) return null;
    
    return (
      <div class="question-editor">
        <h2>{this.question.id === "@new" ? "Nová otázka" : "Upraviť otázku"}</h2>

        <md-outlined-text-field label="Zhrnutie" 
          required value={this.question.summary}
          oninput={(ev: Event) => {
            this.question.summary = this.handleInputEvent(ev);
          }}>
          <md-icon slot="leading-icon">summarize</md-icon>
        </md-outlined-text-field>

        <md-outlined-text-field label="Otázka"
          required value={this.question.question}
          oninput={(ev: Event) => {
            this.question.question = this.handleInputEvent(ev);
          }}>
          <md-icon slot="leading-icon">help</md-icon>
        </md-outlined-text-field>

        <md-filled-text-field label="Vytvorené" disabled
          value={this.question.createdAt.toLocaleString()}>
          <md-icon slot="leading-icon">event</md-icon>
        </md-filled-text-field>
      </div>
    );
  }

  private renderReplyEditor() {
    if (!this.reply) {
      console.warn("Reply object missing in renderReplyEditor - creating default");
      this.reply = {
        id: "@new",
        userId: currentUser.userId,
        text: "",
        createdAt: new Date(),
        repliedTo: false,
        doctorName: currentUser.isDoctor ? "Doctor" : "Anonymous"
      };
    }
    
    if (!this.question) {
      console.warn("Question object missing in renderReplyEditor");
      return (
        <div class="reply-editor">
          <h2>Odpovedať</h2>
          <p>Načítavam otázku...</p>
          
          <md-outlined-text-field label="Odpoveď" 
            required value={this.reply.text}
            rows={5}
            oninput={(ev: Event) => {
              this.reply.text = this.handleInputEvent(ev);
            }}>
            <md-icon slot="leading-icon">comment</md-icon>
          </md-outlined-text-field>
        </div>
      );
    }
    
    return (
      <div class="reply-editor">
        <h2>{this.reply.id === "@new" ? "Odpovedať" : "Upraviť odpoveď"}</h2>
        
        <div class="question-preview">
          <h3>Otázka od pacienta</h3>
          <p class="question-summary"><strong>{this.question.summary}</strong></p>
          <p class="question-text">{this.question.question}</p>
          <p class="question-date">Vytvorené: {this.question.createdAt.toLocaleString()}</p>
        </div>

        <md-filled-text-field label="Meno lekára" 
          value={this.reply.doctorName || ""}
          disabled
          oninput={(ev: Event) => {
            this.reply.doctorName = this.handleInputEvent(ev);
          }}>
          <md-icon slot="leading-icon">health_and_safety</md-icon>
        </md-filled-text-field>

        <md-outlined-text-field label="Odpoveď" 
          required value={this.reply.text}
          rows={5}
          oninput={(ev: Event) => {
            this.reply.text = this.handleInputEvent(ev);
          }}>
          <md-icon slot="leading-icon">comment</md-icon>
        </md-outlined-text-field>
      </div>
    );
  }
}