import React from 'react';
import WebSocket from 'react-websocket';
import './App.css';
import Message from './Message';

class App extends React.Component {

  state = {
    messages: [],
    textbox: '',
    shareCode: ''
  }

  dataHandler = data => {
    let res = JSON.parse(data);
    switch (res.type) {
      case 'shareCode':
        this.setState({ shareCode: res.payload.code });
        const input = document.getElementById('sharecode');
        input.value = res.payload.code;
        break;
      case 'message':
        let messages = [...this.state.messages];
        messages.unshift(res.payload);
        this.setState({ messages: messages });
        break;
      default:
        console.log('Got unexpected response: ', res);
        break;
    }
  }

  sharecodeHandler = event => {
    event.preventDefault();
    if (this.state.shareCode === '') { return; }
    this.ws.sendMessage(JSON.stringify({
      type: 'shareCode',
      payload: {
        code: this.state.shareCode
      }
    }));
  }

  textboxHandler = event => {
    event.preventDefault();
    if (this.state.textbox === '') { return; }
    this.ws.sendMessage(JSON.stringify({
      type: 'message',
      payload: {
        message: this.state.textbox
      }
    }));
  }

  clipboardHandler = () => {
    navigator.clipboard.readText().then(text => {
      if (text === '') { return; }
      this.ws.sendMessage(JSON.stringify({
        type: 'message',
        payload: {
          message: text
        }
      }));
    });
  }

  render() {
    return <div className='App'>
      <WebSocket
        url='ws://zhehao-lu.me/live-clipboard-ws/'
        onMessage={this.dataHandler.bind(this)}
        ref={WebSocket => { this.ws = WebSocket }}
      />
      <form id='sharecodeform' name='sharecodeForm' onSubmit={this.sharecodeHandler}>
        <input 
          id='sharecode'
          name='sharecode'
          type='text'
          onChange={event => {
            console.log(event.target.value);
            this.setState({ shareCode: event.target.value });
          }}
        />
        <input type='submit'/>
      </form>

      <div id='messages' className='column'>
        {this.state.messages.map((msg, index) => 
          <Message 
            key={index} 
            message={msg.message}
            time={msg.time}
          />
        )}
      </div>

      <section id='textbox' className='column'>
        <form id='textsubmitform' name='textbox' onSubmit={this.textboxHandler}>
          <input value='share' type='submit'/>
          <button onClick={this.clipboardHandler.bind(this)}>share clipboard</button>
        </form>

        <textarea
          value={this.state.textbox}
          onChange={event => {
            this.setState({ textbox: event.target.value });
          }}
          id='shareText'
        ></textarea>
      </section>
      
    </div>;
  }
}

export default App;
