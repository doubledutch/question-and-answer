import React, { useEffect, useState, PureComponent } from 'react'
import './App.css'
import { translate as t } from '@doubledutch/admin-client'
import { returnUserData } from './ModeratorModal'

const Moderator = ({ moderators, openModal, selectMod, adminData, onDeselected }) => {
  const [hideAdmins, setHide] = useState()
  return (
    <div className="containerSmall">
      <div className="cellBoxTop">
        <h2 className="margin-right">{t('moderators')}</h2>
        {!hideAdmins && (
          <button className="dd-bordered" onClick={openModal}>
            {t('add_moderator')}
          </button>
        )}
        <div className="cellAssignments" />
        <button className="hideButton" onClick={() => setHide(!hideAdmins)}>
          {hideAdmins ? t('show_section') : t('hide_section')}
        </button>
      </div>
      {!hideAdmins && (
        <div>
          <p className="modSectionDes">{t('moderator_desc')}</p>
          <div className="row">
            <p className="modTitle">{t('name')}</p>
            <p className="modDes">{t('assigned_sessions')}</p>
          </div>
          <ul className="sessionListBox">
            {moderators.map(mod => (
              <ModeratorCell
                admin={mod}
                key={mod.id}
                selectMod={selectMod}
                adminData={adminData}
                onDeselected={onDeselected}
              />
            ))}
            {!moderators.length && <p className="modsHelpText">{t('mods_help')}</p>}
          </ul>
        </div>
      )}
    </div>
  )
}

const ModeratorCell = ({ admin, selectMod, adminData, onDeselected }) => {
  const userData = returnUserData(admin, adminData)
  return (
    <div className="adminCell">
      <p className="cellTitle">{`${admin.firstName} ${admin.lastName}`}</p>
      <p className="cellAssignments">
        {userData.map((item, i) => `${i ? ', ' : ''}${item.sessionName}`)}
      </p>
      <button className="borderlessButtonSmall" onClick={() => selectMod(admin)}>
        {t('edit_verb')}
      </button>
      <button className="borderlessButtonSmall" onClick={() => handleDelete(admin)}>
        {t('delete_verb')}
      </button>
    </div>
  )

  function handleDelete(admin) {
    if (window.confirm(t('deleteConfirm'))) {
      onDeselected(admin)
    }
  }
}

export default Moderator
