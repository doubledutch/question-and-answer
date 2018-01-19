# Question & Answer

This project provides event organizers the ability to run multiple question and answer sessions during an event.

There are 4 JSON objects being used in this project and stored via the DoubleDutch Firebase Connector: Moderators, Sessions, Questions and Votes.

* Moderators are autocreated on the first action within the admin portal. It is stored as :
```json
{"approve": {"approve": true}}
```

Only one moderator object will exist at any given time and the bool can be updated accordingly. It acts universally for all sessions and should only be readable for users so it is stored in `public/admin`

* Sessions are created within the admin portal and activate the user functionality on the mobile side. They are stored as:
```json
{"-L0LcTeJ3AiahF2eiLZm": {"sessionName": "Test"}
```

Similar to moderator objects they should only be readable by users and are stored under `public/admin`

* Questions are created via the mobile app to track each question, the time it was created, the associated session, total votes and the user it was created by. They are stored via a unique key and a data object similar to:
```json
{"-L0Pq9I2_1mJXlZwcmbt": {
  "anom": false,
  "answered": true,
  "approve": true,
  "block": false,
  "creator": {
    "company": "Les Misérables",
    "email": "jean@valjean.com",
    "firstName": "Jean",
    "id": "24601",
    "identifier": "jvj24601",
    "image": "https://example.com/image.jpg",
    "lastName": "Valjean",
    "title": "Character",
    "username": "jean@valjean.com"
  },
  "dateCreate":1513352635626,
  "event":{
    "appId": "sample-bundle-id",
    "description": "Happy New Year","endDate": "2017-01-02T00:00:00.000Z",
    "id": "sample-event-id",
    "name": "New Year Kickoff",
    "startDate": "2017-01-01T00:00:00.000Z"
  },
  "lastEdit": 1513353401000,
  "new": false,
  "pin": false,
  "score": 0,
  "session": "Session 1",
  "text": "New Question"
}
```

The question object tracks much of the important data points that can be updated/filtered via the app/admin portal. Since they are created by users and can be edited by the admin, they are stored under `public/all`

* Votes are the last relevant object. They are stored via the same key as their associated question. Within the JSON object each vote can be tracked simply by a numeral and the associated userID:
```json
{"-L0Pq9I2_1mJXlZwcmbt":{"24601":1}
```

This allows us to attach it to the associated question and track votes by any given user. It is also stored under `public/all`

