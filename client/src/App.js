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
    
  }

  textboxHandler = event => {
    event.preventDefault()
    this.ws.sendMessage(JSON.stringify({
      type: 'message',
      payload: {
        message: this.state.textbox,
        shareCode: this.state.shareCode
      }
    }))
  }

  render() {
    return (
      <div className='App'>
        <WebSocket
          url='ws://localhost:9527'
          onMessage={this.dataHandler.bind(this)}
          ref={WebSocket => { this.ws = WebSocket }}
        />
        <form name='sharecodeForm' onSubmit={this.sharecodeHandler}>
          <input 
            name='sharecode'
            type='text'
            value={this.state.shareCode}
            onChange={event => {
              this.setState({ [event.target.name]: event.target.value });
            }}
          />
          <input type='submit'/>
        </form>

        <div id='messages'>
          {this.state.messages.map((msg, index) => 
            <Message 
              key={index} 
              message={msg.message}
              time={msg.time}
            />
          )}
        </div>

        <section id='textbox'>
          <textarea
            value={this.state.textbox}
            onChange={event => {
              this.setState({ textbox: event.target.value });
            }}
          >

          </textarea>
          <form name='textbox' onSubmit={this.textboxHandler}>
            <input type='submit'/>
          </form>
        </section>

      </div>
    );
  }
}

export default App;
