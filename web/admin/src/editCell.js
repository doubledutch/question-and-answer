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
import {translate as t} from '@doubledutch/admin-client'

export class CellEdit extends Component {
    constructor(props){
        super(props)
        this.state = {
            action : "state",
            value : this.props.task.sessionName,
            focusBool: false,
            modalMessage: "",
            height: 0
        }
    }

    render() {
        const task = this.props.task
        return(
        <div className="sessionCell">    
            <div className="sessionCellTop">
              <input className="sessionTitle" rows="1" name="value" maxLength="250" type="text" ref={(ip) => this.myInp = ip} onKeyPress={this.handleKeyPress} onBlur={this.handleBlur} value={this.state.value} onChange={this.handleChange} />
              {(this.state.action === "edit") ? <p className="grayText">{250-this.state.value.length}</p> : null}
              {this.renderIcons(task)}
            </div>
            <p className="errorText" style={{height: this.state.height}}>{this.state.modalMessage}</p>
        </div>
        )
    }


    renderIcons = (task) => {
        if (this.state.action === "state") {
          return (
          <div className="rightButtons">
            <button className="borderlessButtonSmall" onClick={this.handleEdit} value="false">{t('edit_verb')}</button>
            <button className="borderlessButton" onClick={this.handleDelete} value="false">{task.archive ? t('diplay_in_app') : t('hide_in_app')}</button>
          </div>
          )
        }

        if (this.state.action === "delete") {
          return (
            <div className="rightButtons">
              <button className="borderlessButton" value="cancel" onClick={this.handleBlur}>{t('cancel')}</button>
              <button className="borderlessButton" value="delete" onClick={this.confirmDelete}>{t('confirm')}</button>
            </div>
          )
        }

        if (this.state.action === "edit") {
            return (
              <div className="rightButtons">
                <button className="borderlessButton" value="edit" onClick={this.confirmEdit}>{t('done')}</button>
              </div>
            )
        }
    }

    handleKeyPress = (event) => {
      if (event.key === 'Enter'){
          event.preventDefault()
          this.confirmEdit()    
      }
    }

    handleBlur = (event) => {
      const currentButton = event.relatedTarget ? event.relatedTarget.value : ''
      if (currentButton === "edit"){
        this.confirmEdit()
      }
      else {
        this.setState({action: "state", value: this.props.task.sessionName, modalMessage: "", height: 0});
      }
    }


    handleEdit = () => {
        this.setState({action: "edit"});
        this.myInp.focus();
        var length = this.state.value.length
        this.myInp.setSelectionRange(length, length)
     }

     handleDelete = () => {
        this.setState({action: "delete"});
     }

     confirmDelete = () => {
        this.props.confirmDelete(this.props.task)
        this.setState({action: "state"});
     }

     confirmEdit = () => {
        var named = this.state.value.trim()
        var status = true
        if (named) {
            for (var item of this.props.sessions){
              if (item.sessionName.toUpperCase() === named.toUpperCase()){
                status = (item.sessionName.toUpperCase() === this.props.task.sessionName.toUpperCase())
              }
            }
            if (status){
                this.setState({modalMessage: "", height: 0, action: "state", value: named})
                this.props.confirmEdit(this.props.task, named)
                this.myInp.blur()
            }
            if (status === false) {
                this.handleEdit()
                this.setState({modalMessage: '*' + t('session_name_taken'), height: 20});
            }   
        }
        else {
            this.handleEdit()
            this.setState({modalMessage: '*' + t('session_name_invalid'), height: 20});
        }
     }

     handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
        if (this.myInp) {
            this.setState({action: "edit"})
        }
    }
}

export default CellEdit
