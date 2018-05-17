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

import React, { PureComponent } from 'react'
import './Avatar.css'

const defaultSize = 25
const defaultUnits = 'em'
export default class Avatar extends PureComponent {
  constructor() {
    super()
    this.state = {}
    this.s = null
  }

  render() {
    const {size, user} = this.props
    return (
      <div className="dd-avatar" style={this.getRootStyle()}>
        { !!user && user.image
          ? <img src={user.image} alt="" className="dd-avatar_image" />
          : <span className="dd-avatar_initials" style={{fontSize: this.fontSize()}}>
              {user.firstName ? user.firstName.substring(0,1) : ''}{user.lastName ? user.lastName.substring(0,1) : ''}
            </span>
        }
      </div>
    )
  }

  size = () => this.props.size || defaultSize
  units = () => this.props.units || defaultUnits

  fontSize = () => {
    const units = this.units()
    return `${this.size()*0.55}${units}`
    return units === 'em' ? '0.55em' : '100%'
  }

  getRootStyle() {
    const size = this.size()
    const units = this.units()
    return {
      borderRadius: `${size/2}${units}`,
      height: `${size}${units}`,
      width: `${size}${units}`,
    }
  }
}