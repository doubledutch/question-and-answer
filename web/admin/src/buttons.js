import React, { Component } from 'react'
import './App.css'
import Modal  from 'react-modal'
import ReactDOM from 'react-dom'
import client, {Color} from '@doubledutch/admin-client'

export class CustomButtons extends Component {
  constructor(props){
    super(props)
  }
  render() {
    const task = this.props.task 
    const header = this.props.header 
    const approve = this.props.approve
    const block = this.props.block 
    const pin = this.props.pin
    
      if (header){
        return(
        <span style={{marginTop: 25}}>
          <span className='cellBoxRight'>
            <img className='button1' onClick={()=>this.sendApprove(task)} src={require('./icons/checkocircle.svg')}/>
            <img className='button1' onClick={()=>this.sendBlock(task)} src={require('./icons/deleteocircle.svg')}/>
          </span>
        </span>
        )
      }
      
      if (approve){
        if (pin){
          return(
          <span style={{marginTop: 25}}>
            <span className='cellBoxRight'>
              <img className='button1' onClick={()=>this.sendAnswer(task)} src={require('./icons/check.svg')}/>
              <img className='button1' onClick={()=>this.sendBlock(task)} src={require('./icons/deleteocircle.svg')}/>
            </span>
          </span>
          )
        }
        else {
          return(
          <span>
            <button className="pinButton" onClick={()=>this.sendPin(task)}>Move to Top</button>
            <span className='cellBoxRight'>
              <img className='button1' onClick={()=>this.sendAnswer(task)} src={require('./icons/check.svg')}/>
              <img className='button1' onClick={()=>this.sendBlock(task)} src={require('./icons/deleteocircle.svg')}/>
            </span>
          </span>
          )
        }
      }

      if (block){
        return(
        <span style={{marginTop: 25}}>
          <span className='cellBoxRight'>
            <img className='button1' onClick={()=>this.sendApprove(task)} src={require('./icons/checkocircle.svg')}/>
            <img className='button1' src={require('./icons/deletecircle.svg')}/>
          </span>
        </span>
        )
      }
    
    }
    sendApprove(task){
      this.props.makeApprove(task)
    }

    sendBlock(task){
      this.props.blockQuestion(task)
    }

    sendAnswer(task){
      this.props.makeAnswer(task)
    }

    sendPin(task){
      this.props.makePin(task)
    }

}

export default CustomButtons