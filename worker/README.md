# Background worker

This service is a background worker that serves 2 purposes: listening for updates on the Companies House streaming API, 
and executing jobs dispatched to BullMQ.

## BullMQ jobs
BullMQ Workers are registered in this process to listen for jobs on the queues and process them when they come in.

QueueSchedulers are also registered to allow delayed/repeated jobs. 
QueueEvents are registered for the purpose of logging.

## Stream listeners
Connect to the Companies House streaming API to listen for filing or company profile updates. 
When a company makes a filing, there is an event generated on this API. 
The API is a long-running HTTP connection in new-line deliminated JSON format. More info can be found on 
[ch-guide](https://chguide.co.uk/streams/).

### Filing stream
When a filing event comes in, this is what happens:
 - check if the event is actually new, or skip if it's a duplicate
 - check `company:{companyNumber}:clientLists` to get a list of client lists which have this company
 - if there are any client lists containing this company:
   - add this filing event to the `notifications:filing` Redis Stream 
   - for each client list that has this company
     - add it to the `org:{orgId}:clientFilings` sorted set of client filings
   - add it to the company filing history at `company:{companyNumber}:filingHistory`

### Company profile stream
When a company profile event comes in, this is what happens:
- check `company:{companyNumber}:clientLists` to get a list of client lists which have this company
- if there are any client lists containing this company:
  - save the company profile in `company:{companyNumber}:clientLists`
  - add this company profile event to the `notifications:companyProfile` Redis Stream


# Notifications
Use cases:
 - users must be able to get web/email notifications when a company in their org's client list makes a filing
 - (nice to have) users get a notification on company profile event, describing the change (using JSON diffing)
 - users view recent notifications

## Design
Have a central notifications Stream which is shared by all orgs, and when a new filing event comes in, its gets added
to this central stream.

Have a background worker listening on this stream and when there is an event, it adds the event to the notification
stream of every organisation which has this client on their client list. 
It could also send any notifications that are necessary such as web notifications or emails.

For a user to view their recent notifications, they can query their organisations notification stream. (this could
be added at a later stage, not required for MVP).

There can be a BullMQ job that runs every night and trims the stream to 10,000 elements or something like that, or
maybe removes any that are older than 30 days. This should prevent the Stream from growing too big.
