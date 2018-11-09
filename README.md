# Bot Guildy

## API
All commands are prefixed with an exclamation mark.

`whois` - Returns the real name of a user

Examples
```
!whois @Harold
!whois Harold
```
`insert_user` - Inserts a new user into the user catalogue.

Examples
```
!insert_user @covfefe, Donald Trump
!insert_user covfefe, Donald Trump
```
`list_users` - Lists all registered users

`delete_user` - Deletes a user from the user catalogue.

Examples
```
!delete_user @covfefe, Donald Trump
!delete_user covfefe, Donald Trump

```

## Configuration file
Stored in `config.json`

Example:
```
{
  "App" : {
    "UserSaveLoc" : "./users.json"
  },

  "Discord" : {
    "APIKey" : "The bot's secret token",
    "GuildId" : "The guild's id",
    "AdminRole" : "Committee",
    "MemberRole" : "ICAS Members"
  },

  "Verification": [
    "Your driving licence"
  ],

  "Facebook" : {
    "AppID" : "",
    "AppSecret" : "",
    "GroupId" : ""
  },

  "Web" : {
    "Address" : "http://localhost",
    "Port" : 8080
  },

  "GamesList" : [
    
  ]
}

```
