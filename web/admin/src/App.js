import React, { PureComponent } from 'react'
import client from '@doubledutch/admin-client'
import FirebaseConnector from '@doubledutch/firebase-connector'
import Admin from './Admin'
import BigScreen from './BigScreen'
import {parseQueryString} from './utils'
import '@doubledutch/react-components/lib/base.css'

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
    fbc.signinAdmin().then(() => {
      client.getUsers().then(users => {
        this.setState({allUsers: users, isSignedIn: true})
      })
    })
  }

  render() {
    if (!this.state.isSignedIn) return <div>Loading...</div>
    const qs = parseQueryString()
    switch (qs.page) {
      case 'bigScreen':
        return <BigScreen fbc={fbc} session={qs.session} sessionName={qs.sessionName} client={client} users={this.state.allUsers}/>
      default:
        return <Admin fbc={fbc} attendees={this.state.allUsers}/>
    }
  }
}