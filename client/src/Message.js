import React from 'react';
import './Message.css';

class Message extends React.Component {

  copyToClipboard = event => {
    const text = event.target.textContent;
    navigator.clipboard.writeText(text).then(() => {
      console.log('text copied');
    });
  }

  render = () => {
    const timeToDisplay = this.props.time.split(' ').slice(0, 5).join(' ');
    return <div className='message-box'>
      <div className='message-time'>On {timeToDisplay}</div>
      <div
        className='message-body'
        onClick={this.copyToClipboard.bind(this)}
      >
        {this.props.message}
      </div>
    </div>
  }
}


export default Message;
