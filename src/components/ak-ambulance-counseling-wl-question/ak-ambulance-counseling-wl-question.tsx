import { Component, Host, Prop, State, EventEmitter, Event, h} from '@stencil/core';
import { AmbulanceCounselingApi, Question, Reply, Configuration} from '../../api/ak-ambulance-counseling-wl';
import { currentUser } from '../../utils/currentUser';

@Component({
  tag: 'ak-ambulance-counseling-wl-question',
  styleUrl: 'ak-ambulance-counseling-wl-question.css',
  shadow: true,
})
export class AkAmbulanceCounselingWlQuestion {

  @Prop() questionId: string;
  @Prop() apiBase: string;

  @Event({eventName: "question-closed"}) questionClosed: EventEmitter<string>;
  @Event({eventName: "question-clicked"}) questionClicked: EventEmitter<string>;
  @Event({eventName: "reply-clicked"}) replyClicked: EventEmitter<[string, string]>;
  @Event({eventName: "question-loaded"}) questionLoaded: EventEmitter<Question>;

  @State() question: Question;
  @State() errorMessage:string;
  @State() isValid: boolean;
  @State() replies: Reply[];
  @State() isAuthenticated: boolean = false;
  @State() currentUserId: string = null;
  @State() isDoctor: boolean = false;

  async componentWillLoad() {
    this.checkAuthentication();
    
    currentUser.addAuthChangeListener(this.handleAuthChange);
    
    await this.getQuestionAsync();
    await this.getReplies();
    
    if (this.question) {
      this.questionLoaded.emit(this.question);
    }
  }
  
  disconnectedCallback() {
    currentUser.removeAuthChangeListener(this.handleAuthChange);
  }
  
  private handleAuthChange = (isAuthenticated: boolean) => {
    
    this.checkAuthentication();
  }

  private checkAuthentication() {
    this.isAuthenticated = currentUser.isLoggedIn;
    this.currentUserId = currentUser.userId;
    this.isDoctor = currentUser.isDoctor;
    
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

    if ( !this.questionId ) {
      this.isValid = false;
      return undefined
    }
    try {
      const token = currentUser.token;
      
      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });

      const waitingListApi = new AmbulanceCounselingApi(configuration);

      if (!this.questionId || this.questionId === undefined) {
        throw new Error("Question ID is required");
      }

      const response = await waitingListApi.getQuestionByIdRaw({id: this.questionId});

      if (response.raw.status < 299) {
          this.question = await response.value();
          this.isValid = true;
          
          this.questionLoaded.emit(this.question);
      } else {
          this.errorMessage = `Cannot retrieve question: ${response.raw.statusText}`
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve question: ${err.message || "unknown"}`
    }
    return undefined;
  }

  private async getReplies(): Promise<Reply[]> {
    if(this.questionId === "@new" || !this.questionId) {
      return this.replies;
    }
    
    try {
      // include auth token
      const token = currentUser.token;
      
      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });

      const counselingApi = new AmbulanceCounselingApi(configuration);

      if (!this.questionId || this.questionId === undefined) {
        throw new Error("Question ID is required for getting replies");
      }

      const response = await counselingApi.getRepliesByQuestionIdRaw({id: this.questionId});
      if (response.raw.status < 299) {
        this.replies = await response.value();
      }
    } catch (err: any) {
      console.error("Error fetching replies:", err);
    }
    
    return this.replies;
  }
  
  private async handleDeleteQuestion(questionId: string) {
    
    try {
      // include auth token
      const token = currentUser.token;
      
      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });
      
      const counselingApi = new AmbulanceCounselingApi(configuration);
      
      const response = await counselingApi.deleteQuestionByIdRaw({id: questionId});
      
      if (response.raw.status < 299) {
        this.questionClosed.emit(questionId);
      } else {
        this.errorMessage = `Cannot delete question: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      console.error("Error deleting question:", err);
      this.errorMessage = `Cannot delete question: ${err.message || "unknown"}`;
    }
  }

  render() {
    return (
      <Host>
        {this.errorMessage ? (
          <div class="error">{this.errorMessage}</div>
        ) : (
          <md-list>
            {this.question && this.isValid && (
              <md-list-item>
                <div slot="headline">{this.question.summary}</div>
                <div slot="supporting-text">{this.question.question}</div>
                <div slot="supporting-text">{new Date(this.question.createdAt).toLocaleString()}</div>
                <div slot="end">
                  {/* simple direct buttons layout - patient can edit their own questions */}
                  {!this.question.repliedTo && this.isAuthenticated && this.currentUserId === this.question.patientId && (
                    <md-outlined-button onClick={() => this.questionClicked.emit(this.question.id)}>
                      Upraviť
                    </md-outlined-button>
                  )}
                  
                  {/* Reply button - shown to doctors and question creators */}
                  {this.isAuthenticated && (this.isDoctor || this.currentUserId === this.question.patientId) && (
                    <md-outlined-button onClick={() => this.replyClicked.emit([this.question.id, "@new"])}>
                      Odpovedať
                    </md-outlined-button>
                  )}
                  
                  {/* Delete button - shown to doctors and question owners */}
                  {this.isAuthenticated && (this.isDoctor || this.currentUserId === this.question.patientId) && (
                    <md-outlined-button onClick={() => this.handleDeleteQuestion(this.question.id)}>
                      Zmazať
                    </md-outlined-button>
                  )}
                </div>
              </md-list-item>
            )}
            
            {this.replies && this.replies.length > 0 ? (
              this.replies.map((reply) => (
                <md-list-item>
                  <div slot="headline">
                    {reply.doctorName ? reply.doctorName : "Anonymous"}
                  </div>
                  <div slot="supporting-text">{reply.text}</div>
                  <div slot="supporting-text">{new Date(reply.createdAt).toLocaleString()}</div>
                  <div slot="end">
                    {/* show edit button only if it's the user's reply */}
                    {!reply.repliedTo && this.isAuthenticated && this.currentUserId === reply.userId && (
                      <md-outlined-button onClick={() => this.replyClicked.emit([this.question.id, reply.id])}>
                        Upraviť
                      </md-outlined-button>
                    )}
                  </div>
                </md-list-item>
              ))
            ) : 
              <md-list-item>
                <div slot="headline">Táto otázka doposiaľ nebola zodpovedaná</div>
              </md-list-item>}
          </md-list>
        )}
      </Host>
    );
  }

}
