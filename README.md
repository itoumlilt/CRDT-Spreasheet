# Concordant Labbook

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This demo shows a collaborative application developed using a draft implementation
of the Concordant API. The application uses the C-Server API (it will be
moved to the C-Service API after validation by the team) which currently supports
two eventual consistency backends: revision-based and CRDT-based.
This demo shows that with a revision based approach, the user loses updates, either
if updates are executed concurrently online, or if multiple users edit the
document offline. To have an adequate semantics, the user needs to provide custom,
non-trivial, code to merge the updates executed by each user.
With the CRDT-based backend, update convergence is available out-of-the-box.

The current demo is implemented on top of PouchDB which offers replication and
offline support. Later we will implement our backed without any
third-party dependencies.

## Setup guide

0.**Requirements**

For the next steps, you will need the following software:

- Make sure you have the latest version of Node.js: [see official installation guide](https://nodejs.org/en/download/);
- The project uses Git to download some required dependencies: [follow the official install guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

  1.**Install Project dependencies**

Go to project root directory and:

```shell
npm install react-scripts@latest
npm install
```

2.**Run the application**

```shell
npm start
```

## Replication support

If you want to run with cross-replica synchronization, just run a CouchDB Server, [see CouchDB's installation guide](https://docs.couchdb.org/en/stable/install/index.html)

## Requirements (versions)

Node: v10.15+
NPM: v6.13+

(Project might work with older Node and NPM versions)
