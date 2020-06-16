import React, {Component} from "react";
import JoditEditor from "jodit-react";

export interface ConcordantWysiwygEditorProps {
  value?: string;
}

export interface ConcordantWysiwygEditorState {
  config?: any;
  value: string;
  spin?: number;
  uid: number;
  timestamp: number;
}

//const SERVER_URL: string = "http://localhost:4567/json";
const SERVER_URL: string = "https://labbook.concordant.io/c-service-notepad/json";

export default class ConcordantWysiwygEditor extends Component<
  ConcordantWysiwygEditorProps,
  ConcordantWysiwygEditorState
> {
  private myRef = React.createRef<HTMLInputElement>();

  private value: string = "Connecting to C-Service...";

  private request = require("request");

  private interval: any;

  constructor(props: ConcordantWysiwygEditorProps) {
    super(props);

    this.state = {
      config: {
        readonly: false,
        allowResizeY: true,
        height: "100%",
      },
      value: this.value,
      spin: 1,
      uid: -1,
      timestamp: 0,
    };

    this.readText();
  }

  private tick() {
    this.readText();
  }

  private writeInterval(url: string, content: string, uid: number, timestamp: number) {
    clearInterval(this.interval);
    this.updateRequest(url, content, uid, timestamp);
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);

    // Perform init membership with the server
    this.initUser();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  private initRequest(url: string, init_uid: number): Promise<any> {
    return new Promise<any>(function(resolve, reject) {
      const request = new XMLHttpRequest();
      request.onload = function() {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject(new Error(this.statusText));
        }
      };
      request.onerror = function() {
        //reject(new Error('XMLHttpRequest Error: ' + this.statusText));
        console.log("XMLHttpRequest Error: " + this.statusText);
      };
      request.open("POST", url + "/init");
      request.setRequestHeader("Content-Type", "application/json");
      const req = {
        uid: init_uid,
      };
      request.send(JSON.stringify(req));
    });
  }

  private getRequest(url: string, uid: number): Promise<any> {
    return new Promise<any>(function(resolve, reject) {
      const request = new XMLHttpRequest();
      request.onload = function() {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject(new Error(this.statusText));
        }
      };
      request.onerror = function() {
        reject(new Error("XMLHttpRequest Error: " + this.statusText));
      };
      request.open("POST", url + "/get");
      request.setRequestHeader("Content-Type", "application/json");
      const req = {
        uid: uid,
      };
      request.send(JSON.stringify(req));
    });
  }

  private updateRequest(url: string, content: string, uid: number, timestamp: number): Promise<any> {
    return new Promise<any>(function(resolve, reject) {
      const request = new XMLHttpRequest();
      request.onload = function() {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          //reject(new Error(this.statusText));
          console.log("[UPDATE][ERROR]" + this.response);
        }
      };
      request.onerror = function() {
        //reject(new Error('XMLHttpRequest Error: ' + this.statusText));
        console.log("XMLHttpRequest Error: " + this.statusText);
      };
      request.open("POST", url + "/update");
      request.setRequestHeader("Content-Type", "application/json");
      const req = {
        value: content,
        uid: uid,
        timestamp: timestamp,
      };
      request.send(JSON.stringify(req));
    });
  }

  private updateText(text: string): void {
    const prevState = this.state;
    const timestamp = prevState.timestamp + 1;
    this.setState({
      config: prevState.config,
      value: text,
      spin: prevState.spin,
      timestamp: timestamp,
    });

    // No read when the user is writing to the interface
    clearInterval(this.interval);
    this.interval = setInterval(() => this.writeInterval(SERVER_URL, text, prevState.uid, timestamp), 5000);
    //this.updateRequest(SERVER_URL, text, prevState.uid, timestamp);
  }

  private readText(): void {
    const prevState = this.state;
    this.getRequest(SERVER_URL, prevState.uid)
      .then(response => {
        console.log(response);
        const jsonResponseParsed = JSON.parse(response);
        if (jsonResponseParsed["last_timestamp"] >= this.state.timestamp) {
          this.setState({
            config: prevState.config,
            value: jsonResponseParsed["value"],
            spin: prevState.spin,
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  private initUser(): void {
    const prevState = this.state;
    this.initRequest(SERVER_URL, this.state.uid)
      .then(response => {
        console.log(response);
        const jsonResponseParsed = JSON.parse(response);
        this.setState({
          config: prevState.config,
          value: jsonResponseParsed["value"],
          spin: prevState.spin,
          uid: jsonResponseParsed["uid"],
          timestamp: prevState.timestamp + 1,
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  public valueChanged(value: string) {
    this.updateText(value);
  }

  render() {
    const editor = (
      <div id="ced">
        <JoditEditor value={this.state.value} config={this.state.config} onChange={this.valueChanged.bind(this)} />
      </div>
    );

    return editor;
  }
}
