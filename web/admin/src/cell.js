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
          <img src={require('./icons/Inactive.png')} alt={t('inactive')}/>
          <p className='timeText'>{'\xa0'}{task.score}</p>
        </span>
        <p className="questionText">"{task.text}"</p>
        { task.anom
            ? <p className="nameText">
                -{t('anonymous')}
              </p>
            : <p className="nameText">
                -{t('full_name', {firstName, lastName})}
              </p>
        }
      </span>
    )
  }
}
