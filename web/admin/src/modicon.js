import React, { Component } from 'react'
import './App.css'
import Modal  from 'react-modal'
import ReactDOM from 'react-dom'
import client, {Color} from '@doubledutch/admin-client'

export class ModIcon extends Component {
    constructor(props){
        super(props)
    }

    render(){
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

    export default ModIcon