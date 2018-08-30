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
import {translate as t} from '@doubledutch/admin-client'
import './PresentationDriver.css'

export default class PresentationDriver extends PureComponent {
  
  publicSessionRef = props => (props || this.props).fbc.database.public.adminRef('sessions').child((props || this.props).session)

  state = {}

  componentWillReceiveProps(newProps) {
    if (this.props.session !== newProps.session) {
      this.unwireHandlers()
      this.wireHandlers(newProps)
    }
  }

  componentDidUpdate() {
    const {publicSession} = this.state
  }

  componentDidMount() {
    this.wireHandlers(this.props)
  }
  componentWillUnmount() {
    this.unwireHandlers()
  }

  wireHandlers(props) {
    this.publicSessionHandler = this.publicSessionRef(props).on('value', data => this.setState({publicSession: data.val()}))
  }

  unwireHandlers() {
    this.publicSessionRef().off('value', this.publicSessionHandler)
  }

  render() {
    const {session} = this.props
    const {publicSession} = this.state

    if (!session || !publicSession) return <div className="presentation-driver"><button onClick={this.initializeSession}>{t('initialize')}</button></div>

    switch (publicSession.state) {
      case 'LIVE': return <div className="presentation-driver">{this.renderClose()}</div>
      default: return <div className="presentation-driver">{this.renderStart()}</div>
    }
  }

  renderStart = () => <button className="tertiary" onClick={this.startSession}>{t('session_start')}</button>

  renderClose= () => <button className="tertiary" onClick={this.endSession}>{t('session_close')}</button>

  startSession = () => this.publicSessionRef().update({state: 'LIVE'})

  endSession = () => this.publicSessionRef().update({state: 'ENDED'})
}
