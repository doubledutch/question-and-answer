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

export default class SearchBar extends Component {
  constructor(props) {
    super()
    this.state = {
      value: ''
    }
  }

  handleChange = (event) => {
    this.setState({value: event.target.value})
    this.props.updateList(event.target.value)
  }


  render() {
    return (
      <div className={"searchBar" + ((this.props.disable) ? '--gray' : '')}>
        <input type="text" id="myInput" disabled={this.props.disable} value={this.state.value} onChange={this.handleChange} placeholder="Search"/>
      </div>
    )
  }
}
