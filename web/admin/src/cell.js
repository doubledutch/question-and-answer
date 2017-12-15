import React, { Component } from 'react'
import './App.css'
import ReactDOM from 'react-dom'
import client, {Color} from '@doubledutch/admin-client'

export class CustomCell extends Component {
    constructor(props){
        super(props)
    }

    render() {
        const task = this.props.task
        const difference = this.props.difference
        const { firstName, lastName } = task.creator
        return(
        <span className='cellBoxLeft'>
          <span className='cellBoxTop'>
            <p className='introText'>{task.session}</p>
            <p className='timeText'>{difference}</p>
            <img src={require('./icons/Inactive.png')}/>
            <p className='timeText'>{'\xa0'}{task.score}</p>
          </span>      
          <p className="questionText">{task.text}</p>
          {task.anom === false &&
            <p className="nameText">
            -{firstName} {lastName}
            </p>
          }
          {task.anom === true &&
            <p className="nameText">
            -Anonymous
            </p>
          }
        </span>
        )
    }
}

export default CustomCell