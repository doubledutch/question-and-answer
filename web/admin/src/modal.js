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
            value: ''
        }
    }

    render() {
      const questions = this.props.questions
      const sessions = this.props.sessions
      return(
      <Modal 
      isOpen={this.props.openVar}
      onAfterOpen={this.props.afterOpenModal}
      onRequestClose={this.props.closeModal}
      contentLabel="Modal"
      className="Modal"
      overlayClassName="Overlay"
      >
        <div> 
          <div style={{padding: 25, paddingLeft: 20}}>
            <center className="modalTitle" style={{textAlign: "left"}}>ADD NEW QA SESSION</center>
           
            <form style={{marginTop: 20, marginBottom: 10}}>
              <div className="inputBox">
                <label className="boxTitle">
                  Session Name:
                  <input className="box" name="value" maxLength="250" type="text" value={this.state.value} onChange={this.handleChange} />
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
                      />
                    </li>
                  )
              })
              }
            </ul>
          </div>
        </div>
        <div className="modalButtonsBox">
          <button className="closeButton" onClick={this.props.closeModal}>Close</button>
          <span className="spacer"/>
          <button className="modalButton" style={{width: 200, height: 28, marginRight: 20}}onClick={this.handleSubmit} value='true'>Save & Exit</button>
          <button className="modalButton" style={{width: 350}} onClick={this.handleSubmit} value="false">Save & Add Another</button>
        </div>
      </Modal>
      )
    }

    handleChange = (event) => {
      this.setState({[event.target.name]: event.target.value});
    }


    handleSubmit = (event) => {
      this.props.newSession(this.state.value)
      this.setState({value: ""});
      if (event.target.value === "true") {
        this.props.closeModal()
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