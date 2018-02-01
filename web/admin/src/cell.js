import React, { Component } from 'react'
import './App.css'

export default class CustomCell extends Component {
  render() {
    const task = this.props.task
    const difference = this.props.difference
    const { firstName, lastName } = task.creator
    let title = task.sessionName
    if (title.length > 40){
      var newTitle = task.sessionName.slice(0, 40)
      title = newTitle + "..."
    }
  
    return(
      <span className='cellBoxLeft'>
        <span className='cellBoxTop'>
          <p className='introText'>{title}</p>
          <p className='timeText'>{difference}</p>
          <img src={require('./icons/Inactive.png')} alt="inactive"/>
          <p className='timeText'>{'\xa0'}{task.score}</p>
        </span>
        <p className="questionText">"{task.text}"</p>
        { task.anom
            ? <p className="nameText">
                -Anonymous
              </p>
            : <p className="nameText">
                -{firstName} {lastName}
              </p>
        }
      </span>
    )
  }
}
