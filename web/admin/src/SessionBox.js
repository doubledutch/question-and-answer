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
import CellEdit from './editCell'
import SearchBar from "./SearchBar"

export class SessionBox extends Component {
    constructor(props){
        super(props)
        this.state = {
            value: '',
            isError: false,
            message: this.props.message,
            editMessage: "",
            height: 0,
            showNewSession: false,
            newList: [],
            search: true,
            searchValue: ""
        }
    }

    render() {
      let sessions = this.createList()
      return(   
        <div>
          <div className="cellBoxTop">
            <h2>Sessions</h2>
            { this.props.hideSessions ? null : <button className="addSessionButton" onClick={this.handleNewSession} value="false">{this.state.showNewSession ? "Cancel" : "Add Session"}</button> }
            { this.props.hideSessions ? null : <SearchBar updateList={this.updateList} search={this.state.search}/> }
            <div style={{flex:1}}/>
            <button className="hideButton" onClick={this.handleHideSection}>{this.props.hideSessions ? "Show" : "Hide" } Section</button>
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
            <input className="textBox" name="value" maxLength="250" type="text" autoFocus value={this.state.value} onKeyPress={this.handleKeyPress} onChange={this.handleChange} ref={(ip) => this.myInp = ip }/>
            <p className="grayText">{250-this.state.value.length}</p>
            <div className="rightButtons">
              <button className="borderlessButtonMed" onClick={this.handleSubmit} value="false">Save</button>
              <button className="borderlessButton" onClick={this.handleClose} value="false">Cancel</button>
            </div>
          </span>
          {this.state.isError ? <p className="errorTextMargin">{this.state.message}</p> : null}
        </div>
      )
    }

    handleHideSection = () => {
      this.setState({search: false, value: "", searchValue: ""})
      this.props.hideSection("Sessions")
      this.handleClose()
    }

    handleChange = (event) => {
      this.setState({[event.target.name]: event.target.value});
    }

    handleNewSession = () => {
      const current = this.state.showNewSession
      this.setState({showNewSession: !current, isError: false, search: false, searchValue: ""})
    }

    updateList = (value) => {
      this.setState({search: value.length > 0, searchValue: value})
    }

    createList = () => {
      const queryText = this.state.searchValue.toLowerCase()
      if (queryText.length > 0){
        const queryResult = this.props.sessions.filter(s => s.title && s.title.toLowerCase().includes(queryText))
        return queryResult
      }
      else {
        return this.props.sessions
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
          this.setState({isError: true, message: "*Please enter a session name."});
        }
      }
    }

    handleClose = () => {
      const current = this.state.showNewSession
      this.setState({value: "", isError: false, showNewSession: !current});
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
            this.setState({isError: true, message: "*This session name already exists. Please enter a new session name."});
          }
        }
        if (status){
        this.props.newSession(sessionName)
        const current = this.state.showNewSession
        this.setState({value: "", isError: false, showNewSession: !current});
        if (event.target.value === "true") {
          this.props.closeModal()
        }
        if (keyPress){
          this.props.closeModal()
        }
      }
    }
      else {
        this.setState({isError: true, message: "*Please enter a session name."});
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