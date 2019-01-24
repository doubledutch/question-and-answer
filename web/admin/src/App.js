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
import client, { translate as t, useStrings } from '@doubledutch/admin-client'
import { provideFirebaseConnectorToReactComponent } from '@doubledutch/firebase-connector'
import i18n from './i18n'
import Admin from './Admin'
import BigScreen from './BigScreen'
import { parseQueryString } from './utils'
import '@doubledutch/react-components/lib/base.css'
import './App.css'

useStrings(i18n)

const { token } = parseQueryString()
if (token) client.longLivedToken = token

class App extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.props.fbc.signinAdmin().then(() => {
      this.setState({ isSignedIn: true })
    })
  }

  render() {
    const { fbc } = this.props
    if (!this.state.isSignedIn) return <div>{t('loading')}</div>
    const qs = parseQueryString()
    switch (qs.page) {
      case 'bigScreen':
        return (
          <BigScreen fbc={fbc} session={qs.session} sessionName={qs.sessionName} client={client} />
        )
      default:
        return <Admin fbc={fbc} client={client} />
    }
  }
}

export default provideFirebaseConnectorToReactComponent(
  client,
  'questionanswer',
  (props, fbc) => <App {...props} fbc={fbc} />,
  PureComponent,
)
