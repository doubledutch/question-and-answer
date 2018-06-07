/*
 * Copyright 2018 DoubleDutch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react'
import './App.css'
import Modal  from 'react-modal'
import CellEdit from './editCell'
import SearchBar from "./SearchBar"

export class SessionBox extends Component {
    constructor(props){
        super(props)
        this.state = {
            value: '',
            color: this.props.modalColor,
            message: this.props.message,
            editMessage: "",
            height: 0,
            showNewSession: false,
            newList: []
        }
    }

    render() {
      var sessions = this.props.sessions
      if (this.state.search) sessions = this.state.newList
      return(   
        <div>
          <div className="cellBoxTop">
            <h2>Sessions</h2>
            <button className="addSessionButton" onClick={this.handleNewSession} value="false">{this.state.showNewSession ? "Cancel" : "Add Session"}</button>
            <SearchBar updateList={this.updateList}/>
            <div style={{flex:1}}/>
            <button className="hideButton" onClick={() => this.props.hideSection("Sessions")}>{this.props.hideSessions ? "Show" : "Hide" } Section</button>
          </div>
          {this.props.hideSessions ? null : <div>
            <label className="boxTitleBold" style={{marginLeft: 10}}>Name</label>
            <div className="sessionListBox">
              {this.state.showNewSession ? this.renderNewSession(): null}
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
          </div>}
        </div>    
      )
    }

    renderNewSession = () => {
      return (
        <div>
          <span className="textInputBox">
            <input className="textBox" name="value" maxLength="250" type="text" autoFocus style={{}}value={this.state.value} onKeyPress={this.handleKeyPress} onChange={this.handleChange} ref={(ip) => this.myInp = ip }/>
            <div className="rightButtons">
              <button className="borderlessButtonMed" onClick={this.handleSubmit} value="false">Save</button>
              <button className="borderlessButton" onClick={this.handleClose} value="false">Cancel</button>
            </div>
          </span>
          {(this.state.color !== this.props.modalColor) ? <p style={{color: this.state.color, fontSize: 12, margin: 0, padding: 0, marginTop: 2}}>{this.state.message}</p> : null}
        </div>
      )
    }

    handleChange = (event) => {
      this.setState({[event.target.name]: event.target.value, color: "#FAFAFA"});
    }

    handleNewSession = () => {
      const current = this.state.showNewSession
      this.setState({showNewSession: !current})
    }

    updateList = (value) => {
      var queryText = value.toLowerCase()
      if (queryText.length > 0){
        var queryResult=[];
        this.props.sessions.forEach(function(content){
          var title = content.sessionName
          if (title) {
            if (title.toLowerCase().indexOf(queryText)!== -1){
              queryResult.push(content);
            }
          }
        });
        this.setState({search: true, newList: queryResult})
      }
      else {
        this.setState({search: false})
      }
    }

    handleKeyPress = (event) => {
      if (event.key === 'Enter'){
        event.preventDefault()
        if (this.state.value) {
          event.value = "true"
          var keyPress = true
          this.handleSubmit(event, keyPress)
        }
        else {
          this.setState({color: "red", message: "*Please enter a session name."});
        }
      }
    }

    handleClose = () => {
      const current = this.state.showNewSession
      this.setState({value: "", color: "#FAFAFA", showNewSession: !current});
    }

    makeFocus = () => {
      this.myInp.focus();
   }

    handleSubmit = (event, keyPress) => {
      var status = true
      var sessionName = this.state.value.trim()
      if (sessionName) {
        for (var item of this.props.sessions){
          if (item.sessionName.toUpperCase() === sessionName.toUpperCase()){
            status = false
            this.setState({color: "red", message: "*This session name already exists. Please enter a new session name."});
          }
        }
        if (status){
        this.props.newSession(sessionName)
        const current = this.state.showNewSession
        this.setState({value: "", color: "#FAFAFA", showNewSession: !current});
        if (event.target.value === "true") {
          this.props.closeModal()
        }
        if (keyPress){
          this.props.closeModal()
        }
      }
    }
      else {
        this.setState({color: "red", message: "*Please enter a session name."});
      }
    }

    confirmDelete = (task) => {
      this.props.confirmDelete(task)
    }

    confirmEdit = (task, value) => {
        this.props.confirmEdit(task, value)
    }

 
}

export default SessionBox