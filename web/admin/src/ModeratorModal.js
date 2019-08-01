import React, { useState, useEffect } from 'react'
import './App.css'
import client, { translate as t } from '@doubledutch/admin-client'
import { AttendeeSelector } from '@doubledutch/react-components'
import Modal from 'react-modal'
import SearchBar from './SearchBar'
import checkocircle from './icons/checkocircle.svg'
import deleteocircle from './icons/deleteocircle.svg'

const ModeratorModal = ({
  isOpen,
  closeModal,
  sessions,
  admin,
  onDeselected,
  saveModerator,
  adminData,
  moderators,
}) => {
  const userSessions = returnUserData(admin, adminData)
  const [assignedSessions, setSessions] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedHost, setHost] = useState([])
  const origAdmin = admin.id ? [admin] : selectedHost
  const filteredSessions = filterList()
  const isSessionEdits = (assignedSessions || userSessions).toString() !== userSessions.toString()
  return (
    <Modal isOpen={isOpen} className="Modal" overlayClassName="Overlay" ariaHideApp={false}>
      <div className="modalTop">
        <h1 className="modalTitle">Moderator Assignment</h1>
      </div>
      <div className="modalCenter">
        <div className="attendeeSelector">
          <AttendeeSelector
            client={client}
            searchTitle="Search Moderator"
            selectedTitle="Selected Moderator"
            onSelected={onAdminSelected}
            onDeselected={onAdminDeselected}
            selected={selectedHost.length ? selectedHost : origAdmin}
          />
          <p className="helpTextModal">*Note that moderators are selected individually</p>
        </div>
        <div className="modalRow">
          <p className="modalSessTitle">{t('session')}</p>
          <SearchBar updateList={setSearch} search={search} />
          <div className="cellAssignments" />
          {(assignedSessions || userSessions).length === sessions.length ? (
            <button className="removeAllButton" onClick={() => setSessions([])}>
              {t('remove_all')}
            </button>
          ) : (
            <button className="selectAllButton" onClick={() => setSessions(sessions)}>
              {t('select_all')}
            </button>
          )}
        </div>
        <ul className="modalList">
          {filteredSessions.map(session => (
            <SessionAddCell
              key={session.key}
              session={session}
              setSessions={setSessions}
              assignedSessions={assignedSessions || userSessions}
            />
          ))}
        </ul>
      </div>
      <div className="modalBottom">
        <button
          onClick={() => {
            closeModal()
            setHost([])
            setSessions(null)
            setSearch('')
          }}
          className="formButtonWhite"
        >
          {t('cancel')}
        </button>
        <button
          onClick={() => {
            setHost([])
            setSessions(null)
            saveModerator(origAdmin[0], assignedSessions)
            setSearch('')
          }}
          disabled={
            !(origAdmin || selectedHost).length ||
            !(assignedSessions || userSessions).length ||
            !isSessionEdits
          }
          className="dd-bordered margin-right"
        >
          {t('save')}
        </button>
      </div>
    </Modal>
  )

  function filterList() {
    const queryText = search.toLowerCase()
    if (queryText.length > 0) {
      const queryResult = sessions.filter(
        s => s.sessionName && s.sessionName.toLowerCase().includes(queryText),
      )
      return queryResult
    }

    return sessions
  }

  function onAdminSelected(attendee) {
    const isAdmin = !!moderators.find(search => search.id === attendee.id)
    if (!admin.id && !isAdmin) {
      setHost([attendee])
    }
  }

  function onAdminDeselected(attendee) {
    if (!admin.id) {
      setHost([])
    } else {
      handleDelete(attendee)
    }
  }

  function handleDelete(host) {
    if (window.confirm(t('deleteConfirm'))) {
      onDeselected(host)
    }
    closeModal()
    setHost([])
    setSessions(null)
    setSearch('')
  }
}

export const returnUserData = (admin, adminData) => {
  if (adminData && admin.id) {
    if (adminData[admin.id]) {
      if (adminData[admin.id].adminSessions) {
        return adminData[admin.id].adminSessions
      }
    }
  }
  return []
}

const SessionAddCell = ({ session, setSessions, assignedSessions }) => {
  const isAssigned = assignedSessions.findIndex(
    assignedSession => assignedSession.key === session.key,
  )
  let newArray = assignedSessions.slice()
  if (isAssigned === -1) {
    newArray = assignedSessions.concat([session])
  } else {
    newArray.splice(isAssigned, 1)
  }
  return (
    <li className="modalListCell" key={session.key}>
      <p className="modalCellName">{session.sessionName}</p>&nbsp;
      {isAssigned === -1 ? (
        <img
          className="buttonCell"
          onClick={() => setSessions(newArray)}
          src={checkocircle}
          alt={t('add_session')}
        />
      ) : (
        <img
          className="buttonCell"
          onClick={() => setSessions(newArray)}
          src={deleteocircle}
          alt={t('remove_session')}
        />
      )}
      &nbsp;
    </li>
  )
}

export default ModeratorModal
