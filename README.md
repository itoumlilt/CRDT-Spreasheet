# Spreadsheet Demo

This demo shows a collaborative application developed using a draft implementation
of the ConcoRDanT API. The application uses the the collab2-server API (it will be
moved to the ConcoRDanT API after validation by the team) which currently supports
two eventual consistency backends: revision-based and CRDT-based.
This demo shows that with a revision based approach, the user loses updates, either
if updates are executed concurrently online, or if multiple users edit the 
document offline. To have an adequate semantics, the user needs to provide custom,
non-trivial, code to merge the updates executed by each user.
With the CRDT-based backend, update convergence is available out-of-the-box.

The current demo is implemented on top of PouchDB which offers replication and
offline support. Later we will make an implementation of our backed without any 
third-party dependencies.

#### Limitations:

* Currently the web-client database is a replica of the main database, i.e. it 
replicates all keys.

* It does not keep updates over multiple sessions. There is
some problem with the PouchDB local store adapter that I haven't looked at yet.

### TODO

* Add offline support
* Add CRDT-based conflict resolution rules 



 
 
## How to run this code

* Install Create React App tools

```
    npm install react-scripts@latest
```

* Install the project dependencies

```
    npm i
```

* Start the application

```
    npm start
```

If you want to run with cross-replica synchronization, just run a CouchDB Server:

```
brew install couchdb
brew services start couchdb
// brew tap homebrew/services  (if you don't have brew services)
```

# Requirements
Node: v10.15+
NPM: v6.13+

(Project might work with older Node and NPM versions)

