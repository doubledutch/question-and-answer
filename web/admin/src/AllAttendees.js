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
import debounce from 'lodash.debounce'

export default class AllAttendees extends PureComponent {
  constructor() {
    super()
    this.state = {
      search: '',
      id: "",
      content: {},
      attendees: []
    }
    
  }

  componentDidMount() {
    this.searchAttendees(this.state.search)
  }

  searchAttendees = debounce(query => {
    this.lastSearch = query
    //The purpose of this line of code is to prevent queries with any special characters which will in any case return no results but also cause the search results to error out
    if (!/[~`!#$%\^&*+=\-()\[\]\\';,/{}|\\":<>\?]/g.test(query)) {
      this.props.getAttendees(query).then(attendees => {
        if (this.lastSearch === query) {
          this.setState({attendees: attendees.sort(sortUsers)})
        }
      })
    }
  }, 300)

  onSearchChange = event => {
    const search = event.target.value
    this.setState({search})
    this.searchAttendees(search)
  }

  render() {
    const {search} = this.state
      return (
        <div style={{marginRight: 20}}>
          { this.props.hidden ? <div className="cellBoxTop">
            <h2>Settings</h2>
            <div className="searchBar">
              <input type="text" placeholder="Search" value={search} onChange={this.onSearchChange}/>
            </div>
            <div style={{flex:1}}/>
            <button className="hideButton" onClick={() => this.props.hideSection("Admins")}>Show Section</button>
          </div> : <div>
            <div className="cellBoxTop">
              <h2>Settings</h2>
              <div className="searchBar">
                <input type="text" placeholder="Search" value={search} onChange={this.onSearchChange}/>
              </div>
              <div style={{flex:1}}/>
              <button className="hideButton" onClick={() => this.props.hideSection("Admins")}>Hide Section</button>
            </div>
            <div className="attendee-selector">
              <table className="attendee-selector__table">
                <tbody>
                  { [this.renderTableRows()] }
                </tbody>
              </table>
            </div>
          </div>
          }
        </div>
      )
  }

  renderTableRows = () => {
    if (!this.state.attendees.length){
      if (this.state.search) {
        return (
          <div className="current-content__list-text">
            <h1>Please try another search</h1>
            <h2>No user matches that description</h2>
          </div>
        )
      }
      else {
        if (this.props.allUsers)
          return <tr key={0}><td></td><td></td></tr>
      }
    }
    return this.state.attendees.map(a => {
      return <tr key={a.id} className={'attendee-selector__attendee' + ((this.state.id === a.id) ? '--gray' : '')}> 
        <td><p className={'attendee-selector__button' + ((this.state.id === a.id) ? '--gray' : '')} >{a.firstName} {a.lastName}</p></td> 
        <td> { this.isAdmin(a.id)
          ? <button className="remove" onClick={()=>this.props.setAdmin(a.id, false, this.props.fbc)}>Remove admin</button>
          : <button className="add" onClick={()=>this.props.setAdmin(a.id, true, this.props.fbc)}>Make admin</button>
        }</td>      
      </tr>
    })
  }


  setId = (event) => {
    this.props.setAdmin(event.target.value)
  }

  isAdmin(id) {
    return this.props.admins.includes(id)
  }

}

function sortUsers(a,b) {
  const aFirst = a.firstName.toLowerCase()
  const bFirst = b.firstName.toLowerCase()
  const aLast = a.lastName.toLowerCase()
  const bLast = b.firstName.toLowerCase()
  if (aFirst !== bFirst) return aFirst < bFirst ? -1 : 1
  return aLast < bLast ? -1 : 1
}

const doArraysIntersect = (a, b) => !!a.find(aItem => b.includes(aItem))
