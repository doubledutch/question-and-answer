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

export default class ModIcon extends Component {
  render() {
    const moderator = this.props.moderator
    if (moderator.length > 0) {
      if (moderator[0].approve === true){
        return ( 
          <span className="modIcons">
            <button className="modButton" style={{position:"absolute"}}>ON</button>
            <button className="modButton2"  style={{marginLeft:"30px", width:"50px"}}onClick={this.props.offApprove}>OFF</button>
          </span>
        )
      }
      else {
        return (
          <span className="modIcons">
            <button className="modButton2" style={{width:"50px"}} onClick={this.props.onApprove}>ON</button>
            <button className="modButton" style={{marginLeft:"-10px"}}>OFF</button>
          </span>
        )
      }
    }
    else {
      return (
        <span className="modIcons">
          <button className="modButton2" style={{width:"50px"}} onClick={this.props.onApprove}>ON</button>
          <button className="modButton" style={{marginLeft:"-10px"}}>OFF</button>
        </span>
      )
    } 
  }
}
