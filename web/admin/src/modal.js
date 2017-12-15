import React, { Component } from 'react'
import './App.css'
import Modal  from 'react-modal'
import ReactDOM from 'react-dom'
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
          <button className="closeButton" onClick={this.props.closeModal}>X</button>
          <div style={{paddingTop: 25}}>
            <center style={{textAlign: "center"}}>Please name your new session.</center>
            <center style={{marginTop: 10}}>
            <form onSubmit={this.handleSubmit}>
              <label className="boxTitle">
                Session Name:
                <input name="value" style={{height: 18, fontSize: 14, width:'50%', marginLeft: 5}}type="text" value={this.state.value} onChange={this.handleChange} />
              </label>
              <input className="qaButton" type="submit" value="Submit" />
            </form>
            </center>
          </div>
        </div>
        </Modal>
        )
    }

    handleChange = (event) => {
      this.setState({[event.target.name]: event.target.value});
    }


  handleSubmit = (event) => {
      this.props.newSession(this.state.value)
  }

 
}

export default CustomModal