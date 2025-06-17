import { Component, Host, Prop, State, Element, h } from '@stencil/core';
import { currentUser } from '../../utils/currentUser';

declare global {
  interface Window { navigation: any; }
}

@Component({
  tag: 'ak-ambulance-counseling-wl-app',
  styleUrl: 'ak-ambulance-counseling-wl-app.css',
  shadow: true,
})
export class AkAmbulanceCounselingWlApp {
  @Element() el!: HTMLElement;
  
  @State() private relativePath = "";
  @State() isAuthenticated = false;

  @Prop() basePath: string="";

  @Prop() apiBase: string;
  @Prop() ambulanceId: string;

  @State() currentQuestion: any = null;
  private authComponent: any;

  componentWillLoad() {
    const baseUri = new URL(this.basePath, document.baseURI || "/").pathname;

    const toRelative = (path: string) => {
      if (path.startsWith( baseUri)) {
        this.relativePath = path.slice(baseUri.length)
      } else {
        this.relativePath = ""
      }
    }

    window.navigation?.addEventListener("navigate", (ev: Event) => {
      if ((ev as any).canIntercept) { (ev as any).intercept(); }
      let path = new URL((ev as any).destination.url).pathname;
      toRelative(path);
    });

    toRelative(location.pathname);
    
    this.isAuthenticated = currentUser.isLoggedIn;
  }
  
  private handleAuthChange = (event: CustomEvent<boolean>) => {
    this.isAuthenticated = event.detail;
  }
  
  private handleQuestionLoaded = (event: CustomEvent<any>) => {
    this.currentQuestion = event.detail;
    const authComponent = this.el.shadowRoot.querySelector('ak-ambulance-counseling-wl-auth');
    if (authComponent && typeof (authComponent as any).setCurrentQuestion === 'function') {
      (authComponent as any).setCurrentQuestion(this.currentQuestion);
    }
  }

  render() {
    let element = "list"
    let entryId = "@new"
  
    let replyId = "";
    let mode: 'question' | 'reply' = 'question';
    
    if (this.relativePath.startsWith("new")) {
      element = "editor";
      entryId = this.relativePath.split("/")[1];
      mode = "question";
    } else if (this.relativePath.startsWith("questions/")) {
      const pathParts = this.relativePath.split("/").filter(p => p);
      
      if (this.relativePath.endsWith("questions/new")) {
        element = "editor";
        mode = "question"; 
      } else if (this.relativePath.includes("/reply/")) {
        element = "editor";
        mode = "reply"; 
        
        if (pathParts.length >= 2) {
          entryId = pathParts[1];
        }
        
        if (pathParts.length >= 4 && pathParts[3] === "new") {
          replyId = "@new";
        } else if (pathParts.length >= 4) {
          replyId = pathParts[3];
        }
        
      } else if (this.relativePath.endsWith("/edit")) {
        element = "editor";
        entryId = this.relativePath.split("/")[1];
      } else {
        element = "question";
        entryId = this.relativePath.split("/")[1];
      }
    }
  
    const navigate = (path:string) => {
      const absolute = new URL(path, new URL(this.basePath, document.baseURI)).pathname;
      window.navigation.navigate(absolute)
    }
  
    return (
      <Host>
        <div class="app-header">
          <ak-ambulance-counseling-wl-auth 
            api-base={this.apiBase}
            onauth-change={this.handleAuthChange}
            onnew-question-clicked={() => navigate("questions/new")}
            onquestion-closed={() => navigate("./questions")}
            onreply-clicked={(ev: CustomEvent<string>) => {
              if (ev.detail === 'question' && entryId) {
                const replyPath = "./questions/" + entryId + "/reply/new";
                navigate(replyPath);
              }
            }}
            currentScreen={element}
            ref={(el) => this.authComponent = el}
          ></ak-ambulance-counseling-wl-auth>
        </div>
        
        <div class="app-content">
          {element === "editor" ? (
            <ak-ambulance-counseling-wl-editor
              entryId={entryId}
              api-base={this.apiBase}
              mode={mode}
              replyId={replyId}
              oneditor-closed={() => navigate("./questions")}
            ></ak-ambulance-counseling-wl-editor>
          ) : element === "question" ? (
            <ak-ambulance-counseling-wl-question 
              questionId={entryId}
              api-base={this.apiBase}
              onquestion-clicked={() => navigate("./questions/" + entryId + "/edit")}
  onreply-clicked={(ev: CustomEvent<[string, string]>) => {
    const [questionId, replyId] = ev.detail;
    if (replyId === "@new") {
      navigate("./questions/" + questionId + "/reply/new");
    } else {
      navigate("./questions/" + questionId + "/reply/" + replyId + "/edit");
    }
  }}
              onquestion-closed={() => navigate("./questions")}
              onquestion-loaded={this.handleQuestionLoaded}
            ></ak-ambulance-counseling-wl-question>
          ) : (
            <ak-ambulance-counseling-wl-list 
              api-base={this.apiBase} 
              onentry-clicked={(ev: CustomEvent<string>) => navigate("./questions/" + ev.detail)}
            ></ak-ambulance-counseling-wl-list>
          )}
        </div>
      </Host>
    );
  }
}
