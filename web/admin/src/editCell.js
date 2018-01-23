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
            focusBool: false
        }
    }

    render() {
        const task = this.props.task
        return(
        <div className="sessionCell">
            <input className="sessionTitle" name="value" maxLength="250" type="text" ref={(ip) => this.myInp = ip} onKeyPress={this.handleKeyPress} onFocus={this.handleEdit} onBlur={this.handleBlur} value={this.state.value} onChange={this.handleChange} />
            {this.renderIcons(task)}
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
                    <button className="smallCloseButton" value="edit" onClick={this.confirmEdit}>Done</button>
                </div>
            )
        }
    }

    handleBlur = () => {
        this.setState({action: "state"});
    }

    handleKeyPress = (event) => {
        if (event.key === 'Enter'){
            event.preventDefault()
            var sessionName = this.state.value.trim()
            if (sessionName) {
              this.confirmEdit()
            }
        }
      }


    handleEdit = () => {
        this.myInp.focus()
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
        this.props.confirmEdit(this.props.task, this.state.value)
        this.setState({action: "state"});
        this.myInp.blur()
     }

     handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
        if (this.myInp) {
            this.setState({action: "edit"})
        }
    }


}

export default CellEdit