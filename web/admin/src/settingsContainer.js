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

import React, { memo } from 'react'
import { translate as t } from '@doubledutch/admin-client'
import AnomIcon from './anomicon'

const SettingsContainer = props => {
  const {
    hideSettings,
    hideSection,
    anom,
    offApprove,
    onApprove,
    backgroundUrl,
    onBackgroundUrlChange,
  } = props

  return (
    <div>
      {hideSettings ? (
        <div className="containerSmallRow">
          <div className="buttonSpan">
            <h2>{t('settings')}</h2>
            <div style={{ flex: 1 }} />
            <button className="hideButton" onClick={() => hideSection('Settings')}>
              {t('show_section')}
            </button>
          </div>
        </div>
      ) : (
        <div className="containerSmallRow">
          <div className="cellBoxTop">
            <h2>{t('settings')}</h2>
            <div style={{ flex: 1 }} />
            <button className="hideButton" onClick={() => hideSection('Settings')}>
              {t('hide_section')}
            </button>
          </div>
          <div className="topBox">
            <p className="boxTitleBold">{t('allow_anon_title')}</p>
            <AnomIcon anom={anom} offApprove={offApprove} onApprove={onApprove} />
          </div>
          <div className="topBox">
            <p className="boxTitleBold">{t('background_image_title')}</p>
            <input
              type="text"
              value={backgroundUrl}
              onChange={onBackgroundUrlChange}
              placeholder={t('background_image_placeholder')}
              className="background-url"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(SettingsContainer)
