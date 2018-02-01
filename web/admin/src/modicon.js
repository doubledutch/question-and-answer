import React, { Component } from 'react'
import './App.css'

export default class ModIcon extends Component {
  render() {
    const moderator = this.props.moderator
    if (moderator.length > 0) {
      if (moderator[0].approve === true){
        return ( 
          <span className="modIcons">
            <button className="modButton" style={{position:"absolute"}}>Yes</button>
            <button className="modButton2"  style={{marginLeft:"35px", width:"45px"}}onClick={this.props.offApprove}>No</button>
          </span>
        )
      }
      else {
        return (
          <span className="modIcons">
            <button className="modButton2" style={{width:"45px"}} onClick={this.props.onApprove}>Yes</button>
            <button className="modButton" style={{marginLeft:"-5px"}}>No</button>
          </span>
        )
      }
    }
    else {
      return (
        <span className="modIcons">
          <button className="modButton2" style={{width:"45px"}} onClick={this.props.onApprove}>Yes</button>
          <button className="modButton" style={{marginLeft:"-5px"}}>No</button>
        </span>
      )
    } 
  }
}
