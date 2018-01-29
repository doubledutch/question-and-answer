import React, { Component } from 'react'
import './App.css'
import ReactDOM from 'react-dom'
import client, {Color} from '@doubledutch/admin-client'

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
            <input className="sessionTitle" name="value" maxLength="250" type="text" ref={(ip) => this.myInp = ip} onKeyPress={this.handleKeyPress} onFocus={this.handleEdit} onBlur={this.handleBlur} value={this.state.value} onChange={this.handleChange} />
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
                <img style={{height: 16, width: 16, marginTop: 12, marginRight: 10}} value="edit"  onClick={this.handleEdit} src={require('./icons/Pencil.png')}/>
                <img style={{height: 16, width: 12, marginTop: 12}} value="delete" onClick={this.handleDelete} src={require('./icons/trashcan.svg')}/>
            </div>
            )
        }

        if (this.state.action === "delete") {
            return (
              <div className="rightButtons">
                  <button className="smallCloseButton" value="delete" onClick={this.confirmDelete}>Confirm</button>
              </div>
            )
        }

        if (this.state.action === "edit") {
            return (
              <div className="rightButtons">
                  <button className="smallCloseButton" ref={(ip) => this.myInp1 = ip }value="edit" onClick={this.confirmEdit}>Done</button>
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
      var currentButton = event.relatedTarget.value
      if (currentButton === "edit"){
        this.confirmEdit()
      }
      else {
        this.setState({action: "state", value: this.props.task.sessionName, modalMessage: "", height: 0});
      }
    }


    handleEdit = () => {
        this.myInp.focus();
        var length = this.state.value.length
        this.myInp.setSelectionRange(length, length)
        this.setState({action: "edit"});
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
                status = false
                if (item.sessionName === this.props.task.sessionName){
                  status = true
                }
              }
            }
            if (status){
                this.setState({modalMessage: "", height: 0, action: "state"})
                this.myInp.blur()
                this.props.confirmEdit(this.props.task, named)
            }
            if (status === false) {
                this.handleEdit()
                this.setState({modalMessage: "* Please enter a valid session name", height: 20});
            }   
        }
        else {
            this.handleEdit()
            this.setState({modalMessage: "* Please enter a valid session name", height: 20});
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