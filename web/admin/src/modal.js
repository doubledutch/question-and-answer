import React, { Component } from 'react'
import './App.css'
import Modal  from 'react-modal'
import ReactDOM from 'react-dom'
import CellEdit from './editCell'
import client, {Color} from '@doubledutch/admin-client'

export class CustomModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            value: '',
            color: this.props.modalColor,
            message: this.props.message,
            editMessage: "",
            height: 0
        }
    }

    render() {
      const questions = this.props.questions
      const sessions = this.props.sessions
      return(
      <Modal 
      isOpen={this.props.openVar}
      onAfterOpen={this.makeFocus}
      onRequestClose={this.props.closeModal}
      contentLabel="Modal"
      className="Modal"
      overlayClassName="Overlay"
      >
        <div> 
          <div style={{padding: 25, paddingLeft: 20}}>
            <center className="modalTitle" style={{textAlign: "left"}}>ADD NEW Q&A SESSION</center>
            <form style={{marginTop: 20}}>
              <div className="inputBox">
                <label className="boxTitle">
                  Session Name:
                  <span className="textInputBox">
                    <input className="box" name="value" maxLength="250" type="text" style={{}}value={this.state.value} onKeyPress={this.handleKeyPress} onChange={this.handleChange} ref={(ip) => this.myInp = ip} />
                    <p className="counter">{250 - this.state.value.length} </p>
                  </span>
                  <p style={{color: this.state.color, fontSize: 12, margin: 0, padding: 0, marginTop: 2}}>{this.state.message}</p>
                </label>
              </div>
            </form>
            <label className="boxTitle" style={{marginLeft: 5}}>
                Current Q&A Sessions
            </label>
            <ul className='sessionList'>
                { sessions.map(task => {
                  return (
                    <li className='modalCellBox' key={task.key}>
                      <CellEdit
                      task = {task}
                      confirmDelete = {this.confirmDelete}
                      confirmEdit = {this.confirmEdit}
                      sessions = {sessions}
                      message = {this.state.modalMessage}
                      height = {this.state.height}
                      />
                    </li>
                  )
              })
              }
            </ul>
          </div>
        </div>
        <div className="modalButtonsBox">
          <button className="closeButton" onClick={this.handleClose}>Close</button>
          <span className="spacer"/>
          <button className="modalButton" style={{width: 121, height: 28, marginRight: 20}}onClick={this.handleSubmit} value='true'>Save & Exit</button>
          <button className="modalButton" style={{width: 144}} onClick={this.handleSubmit} value="false">Save & Add Another</button>
        </div>
      </Modal>
      )
    }

    handleChange = (event) => {
      this.setState({[event.target.name]: event.target.value, color: "#FAFAFA"});
    }

    handleKeyPress = (event) => {
      if (event.key === 'Enter'){
        event.preventDefault()
        if (this.state.value) {
          event.value = "true"
          var keyPress = true
          this.handleSubmit(event, keyPress)
        }
      }
    }

    handleClose = () => {
      this.setState({value: "", color: "#FAFAFA"});
      this.props.closeModal()
    }

    makeFocus = () => {
      this.myInp.focus();
   }

    handleSubmit = (event, keyPress) => {
      var status = true
      var sessionName = this.state.value.trim()
      if (sessionName) {
        for (var item of this.props.sessions){
          if (item.sessionName === sessionName){
            status = false
          }
        }
        if (status){
        this.props.newSession(sessionName)
        this.setState({value: "", color: "#FAFAFA"});
        if (event.target.value === "true") {
          this.props.closeModal()
        }
        if (keyPress){
          this.props.closeModal()
        }
      }
      else {
        this.setState({color: "red"});
      }
    }
      else {
        this.setState({color: "red"});
      }
    }



    confirmDelete = (task) => {
      this.props.confirmDelete(task)
    }

    confirmEdit = (task, value) => {
        this.props.confirmEdit(task, value)
    }

 
}

export default CustomModal