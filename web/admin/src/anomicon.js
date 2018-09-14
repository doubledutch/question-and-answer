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

export default class AnomIcon extends Component {
  render() {
    const anom = this.props.anom
    if (anom.length > 0) {
      return (
        <form style={{marginTop: 20}}>
          <label className="radioContainer">
              <input type="radio" name="radio" value="anom" checked={anom[0].allow} onChange={this.props.onApprove}/>
              Yes
              <span className="checkmark"/>
            </label>        
            <label className="radioContainer">
              <input type="radio" name="radio" value="anom" checked={!anom[0].allow} onChange={this.props.offApprove}/>
              No
              <span className="checkmark"/>
            </label>
        </form>
      )
    }
    else {
      return (
        <form style={{marginTop: 20}}>
          <label className="radioContainer">
              <input type="radio" value="anom" checked={true} onChange={this.props.onApprove}/>
              Yes
              <span className="checkmark"/>
            </label>
            <label className="radioContainer">
              <input type="radio" value="anom" checked={false} onChange={this.props.offApprove}/>
              No
              <span className="checkmark"/>
            </label>
        </form>
      )
    } 
  }
}
