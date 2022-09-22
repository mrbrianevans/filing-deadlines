# Recent filings

## Redis storage
To facilitate efficient storage and querying of filing history based on date, this strategy has been devised.

Requirements: 
 - must be able to efficiently insert filing history transaction
 - must be able to efficiently retrieve recent transactions for companies on a client list

Solution:

Use Redis Sorted Set like this:
```
org:{orgId}:clientFilings = { ({companyNumber:transactionId}, {daysSinceEpoch}) }
eg. org:b1754a1b-775e-4fda-814d-104463b17f2b:clientFilings = { (04107822:MzI3NTE2Nzg2NmFkaXF6a2N4, 18466) }
```
This makes it easy to query filings for a client list using `ZRANGE` to filter filings in a certain range of dates.
Because filing date is only precise to the day, timestamps can be divided by `86_400_000` to get the number of days since epoch, rather than milliseconds.
Each element in the set is the company number and transaction ID joined with a colon, 
which can be used to reference the filing data stored else where.
One of these sets exists for each client list, keyed by the organisation ID.

This makes querying easy, but introduces a problem for inserting data. Each filing must know which client lists to update.

To solve this, introduce a new set for each companyNumber to say which clientLists its in.
```
company:{companyNumber}:clientLists = {org1id, org2id}
```
When a new filing transaction comes in, it just needs to do a lookup on its set like this:
```redis
SMEMBERS company:{companyNumber}:clientLists
```
and loop through the `orgId`'s, adding the filing to each `org:{orgId}:clientFilings` sorted set.

Filing history items are stored like this:
```
company:{companyNumber}:filings:{transactionId}
```

## Alternative solution
This problem could also be solved using a SQL database like postgresql:
 - a table for filing history where transactionID is the primary key, and company number is also indexed
 - a table for client lists, which stores orgId and client companyNumber
 - to get the filings for a client list use a query like this:
 - ```sql
    SELECT * 
    FROM clientLists c JOIN filingHistory f ON c.companyNumber = f.companyNumber
    WHERE orgId = $1 AND f.date > $2;
    ```
