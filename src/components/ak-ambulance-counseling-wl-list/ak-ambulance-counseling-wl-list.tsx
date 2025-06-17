import { Component, Event, EventEmitter, Host, Prop, State, h} from '@stencil/core';
import { AmbulanceCounselingApi, Question, User, Configuration } from '../../api/ak-ambulance-counseling-wl';
import { currentUser } from '../../utils/currentUser';

@Component({
  tag: 'ak-ambulance-counseling-wl-list',
  styleUrl: 'ak-ambulance-counseling-wl-list.css',
  shadow: true,
})
export class AkAmbulanceCounselingWlList {
  @Event({ eventName: "entry-clicked"}) entryClicked: EventEmitter<string>;

  @Prop() apiBase: string;
  @State() errorMessage: string;

  @State() questionList: Question[] = [];
  @State() isAuthenticated: boolean = false;

  private checkAuthentication() {
    this.isAuthenticated = currentUser.isLoggedIn;
  }

  private async getQuestionListAsync(): Promise<Question[]> {
    try {
      const token = currentUser.token;
      
      const configuration = new Configuration({
        basePath: this.apiBase,
        accessToken: token || undefined
      });

      const counselingApi = new AmbulanceCounselingApi(configuration);
      const response = await counselingApi.getQuestionsRaw();
      if (response.raw.status < 299) {
        const data = await response.value();
        if (Array.isArray(data)) {
          return data;
        } else {
          return [];
        }
      } else {
      }
    } catch (err: any) {
    }
    return [];
  }

  async componentWillLoad() {
    this.questionList = await this.getQuestionListAsync();
    this.checkAuthentication();
  }

  render() {
    return (
      <Host>
        {this.errorMessage
        ? <div class="error">{this.errorMessage}</div>
        :
        <md-list>
          {this.questionList && this.questionList.length > 0 ? 
            this.questionList.map((question) =>
              <md-list-item onClick={ () => this.entryClicked.emit(question.id)}>
                <div slot="headline">{question.summary}</div>
                <div slot="supporting-text">{new Date(question.createdAt).toLocaleString()}</div>
              </md-list-item>
            ) : 
            <md-list-item>
              <div slot="headline">Doposiaľ sa nikto nespýtal otázku</div>
            </md-list-item>
          }
        </md-list>
        }
      </Host>
    );
  }
}
