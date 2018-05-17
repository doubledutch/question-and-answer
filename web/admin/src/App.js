import React, { PureComponent } from 'react'
import client from '@doubledutch/admin-client'
import FirebaseConnector from '@doubledutch/firebase-connector'
import Admin from './Admin'
import BigScreen from './BigScreen'
import {parseQueryString} from './utils'
const fbc = FirebaseConnector(client, 'questionanswer')

fbc.initializeAppWithSimpleBackend()

export default class App extends PureComponent {
  constructor() {
    super()
    this.state = {}
    const { token } = parseQueryString()
    if (token) client.longLivedToken = token
  }

  componentDidMount() {
    fbc.signinAdmin().then(() => this.setState({isSignedIn: true}))
  }

  render() {
    if (!this.state.isSignedIn) return <div>Loading...</div>
    const qs = parseQueryString()
    switch (qs.page) {
      case 'bigScreen':
        return <BigScreen fbc={fbc} session={qs.session} sessionName={qs.sessionName}client={client}/>
      default:
        return <Admin fbc={fbc} />
    }
  }
}